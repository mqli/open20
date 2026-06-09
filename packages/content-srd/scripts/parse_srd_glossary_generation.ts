import {
  collapseParagraphLines,
  parseMarkdownTable,
  slugify,
  stripBold,
  stripItalic,
} from './srd_markdown_helpers.ts';

import type {
  GlossaryAbbreviation,
  GlossaryEntry,
  GlossaryEntryTag,
  GlossaryReference,
  GlossarySubsection,
  GlossaryTable,
  RulesGlossary,
} from 'open20-core/types';
import { CONDITION_NAMES, type ConditionName } from 'open20-core/types';

const SOURCE = 'SRD 5.2';

const ENTRY_TAGS: readonly GlossaryEntryTag[] = [
  'Action',
  'Area of Effect',
  'Attitude',
  'Condition',
  'Hazard',
];

const ENTRY_HEADING_RE =
  /^####\s+(.+?)(?:\s+\[(Action|Area of Effect|Attitude|Condition|Hazard)\])?\s*$/;
const BOLD_SUBHEADING_RE = /^####\s+\*\*(.+)\*\*\s*$/;
const SUBSECTION_MARKER_RE = /\*\*_([^_]+)\._\*\*/;
const SEE_ALSO_RE = /\*See also\*\s+(.+?)\.?(?:\s*$)/i;
const TABLE_CAPTION_RE = /^Table:\s+(.+)$/i;

const DATA_TABLE_HEADER_RE =
  /^(AC|Type|Size|Skill|Substance|Examples|Fragile|Resilient|Interaction|Areas|Ability Check|Creature Size|Carry|Drag\/Lift\/Push|Water Needs)/i;

export interface ParsedGlossaryEntryDraft {
  name: string;
  tag?: GlossaryEntryTag;
  lines: string[];
}

export function parseEntryHeading(line: string): { name: string; tag?: GlossaryEntryTag } | null {
  const boldMatch = BOLD_SUBHEADING_RE.exec(line.trim());
  if (boldMatch) return null;

  const match = ENTRY_HEADING_RE.exec(line.trim());
  if (!match) return null;

  const name = stripBold(stripItalic(match[1]!.trim()));
  const tag = match[2] as GlossaryEntryTag | undefined;
  return { name, tag };
}

export function parseAbbreviations(lines: string[]): GlossaryAbbreviation[] {
  const abbrevStart = lines.findIndex((line) => /\*\*Abbreviations\.\*\*/.test(line));
  if (abbrevStart < 0) return [];

  for (let i = abbrevStart + 1; i < lines.length; i += 1) {
    if (!lines[i]!.trim().startsWith('|')) continue;
    const parsed = parseMarkdownTable(lines, i);
    if (!parsed) continue;

    const abbreviations: GlossaryAbbreviation[] = [];
    for (const row of parsed.rows) {
      const abbr = row[0]?.trim();
      const expansion = row[1]?.trim();
      if (!abbr || !expansion) continue;
      abbreviations.push({ abbr, expansion });
    }
    return abbreviations;
  }

  return [];
}

export function parseSeeAlso(text: string): GlossaryReference[] {
  const refs: GlossaryReference[] = [];
  const consumedSpans: string[] = [];

  const docWithSectionsRe = /"([^"]+)"\s*\(([^)]+)\)/g;
  for (const match of text.matchAll(docWithSectionsRe)) {
    const document = match[1]!.trim();
    const sections = match[2]!
      .split(/\s+and\s+/)
      .map((section) => section.replace(/^"|"$/g, '').trim())
      .filter(Boolean);
    refs.push({ type: 'document', document, sections });
    consumedSpans.push(match[0]);
  }

  for (const match of text.matchAll(/"([^"]+)"/g)) {
    const quoted = match[0];
    if (consumedSpans.some((span) => span.includes(quoted))) continue;

    const term = match[1]!.replace(/\.$/, '').trim();
    if (!term || term.includes('(')) continue;
    refs.push({ type: 'entry', id: slugify(term) });
  }

  return refs;
}

export function stripSeeAlso(text: string): string {
  return text.replace(SEE_ALSO_RE, '').trim();
}

function isIndexGridTable(rows: string[][]): boolean {
  const flat = rows
    .flat()
    .map((cell) => cell.trim())
    .filter(Boolean);
  if (flat.length < 2) return false;
  if (flat.some((cell) => cell.length > 80)) return false;
  if (rows[0]?.some((cell) => DATA_TABLE_HEADER_RE.test(cell.trim()))) return false;
  return flat.every((cell) => cell.length <= 40);
}

function parseTableRows(rows: string[][]): GlossaryTable {
  const [header, ...body] = rows;
  return {
    headers: header ?? [],
    rows: body,
  };
}

function splitSubsectionBlocks(text: string): {
  preamble: string;
  subsections: GlossarySubsection[];
} {
  const subsections: GlossarySubsection[] = [];
  const parts = text.split(SUBSECTION_MARKER_RE);
  if (parts.length === 1) {
    return { preamble: text.trim(), subsections };
  }

  const preamble = parts[0]?.trim() ?? '';
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim();
    const body = parts[i + 1]?.trim() ?? '';
    if (!title) continue;
    subsections.push({
      title: title.endsWith('.') ? title : `${title}.`,
      content: body ? [body] : [],
    });
  }

  return { preamble, subsections };
}

function parseEntryBody(lines: string[]): {
  content: string[];
  subsections: GlossarySubsection[];
  tables: GlossaryTable[];
  relatedEntryIds: string[];
  seeAlso: GlossaryReference[];
} {
  const content: string[] = [];
  const subsections: GlossarySubsection[] = [];
  const tables: GlossaryTable[] = [];
  const relatedEntryIds: string[] = [];
  const seeAlso: GlossaryReference[] = [];

  let pendingTableTitle: string | undefined;
  let paragraphBuffer: string[] = [];

  const flushParagraph = (): void => {
    if (paragraphBuffer.length === 0) return;
    const paragraph = collapseParagraphLines(paragraphBuffer);
    paragraphBuffer = [];
    if (!paragraph) return;

    const seeAlsoMatch = SEE_ALSO_RE.exec(paragraph);
    if (seeAlsoMatch) {
      seeAlso.push(...parseSeeAlso(seeAlsoMatch[1]!));
    }

    const cleaned = stripSeeAlso(paragraph);
    if (!cleaned) return;

    if (SUBSECTION_MARKER_RE.test(cleaned)) {
      const split = splitSubsectionBlocks(cleaned);
      if (split.preamble) content.push(split.preamble);
      subsections.push(...split.subsections);
      return;
    }

    content.push(cleaned);
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const tableCaption = TABLE_CAPTION_RE.exec(trimmed);
    if (tableCaption) {
      flushParagraph();
      pendingTableTitle = tableCaption[1]!.trim();
      continue;
    }

    if (trimmed.startsWith('|')) {
      flushParagraph();
      const parsed = parseMarkdownTable(lines, i);
      if (!parsed) continue;
      i = parsed.nextIndex - 1;

      if (pendingTableTitle || !isIndexGridTable(parsed.rows)) {
        tables.push({
          ...(pendingTableTitle ? { title: pendingTableTitle } : {}),
          ...parseTableRows(parsed.rows),
        });
        pendingTableTitle = undefined;
        continue;
      }

      for (const row of parsed.rows) {
        for (const cell of row) {
          const term = cell.trim();
          if (!term) continue;
          relatedEntryIds.push(slugify(term));
        }
      }
      pendingTableTitle = undefined;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      content.push(trimmed.slice(2).trim());
      continue;
    }

    if (trimmed.startsWith('**_') && trimmed.includes('_**')) {
      flushParagraph();
      const split = splitSubsectionBlocks(trimmed);
      if (split.preamble) content.push(split.preamble);
      subsections.push(...split.subsections);
      continue;
    }

    const boldSubheading = BOLD_SUBHEADING_RE.exec(trimmed);
    if (boldSubheading) {
      flushParagraph();
      pendingTableTitle = boldSubheading[1]!.trim();
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  return { content, subsections, tables, relatedEntryIds, seeAlso };
}

function conditionForEntry(name: string, tag?: GlossaryEntryTag): ConditionName | undefined {
  if (tag !== 'Condition') return undefined;
  return CONDITION_NAMES.find((condition) => condition === name);
}

function buildEntry(
  draft: ParsedGlossaryEntryDraft,
  abbreviations: readonly GlossaryAbbreviation[],
): GlossaryEntry {
  const { content, subsections, tables, relatedEntryIds, seeAlso } = parseEntryBody(draft.lines);
  const id = slugify(draft.name);

  const aliases = abbreviations
    .filter((abbr) => abbr.expansion.toLowerCase() === draft.name.toLowerCase())
    .map((abbr) => abbr.abbr);

  const entry: GlossaryEntry = {
    id,
    source: SOURCE,
    name: draft.name,
    content,
    ...(draft.tag ? { tag: draft.tag } : {}),
    ...(subsections.length > 0 ? { subsections } : {}),
    ...(tables.length > 0 ? { tables } : {}),
    ...(seeAlso.length > 0 ? { seeAlso } : {}),
    ...(relatedEntryIds.length > 0 ? { relatedEntryIds } : {}),
    ...(aliases.length > 0 ? { aliases } : {}),
  };

  const condition = conditionForEntry(draft.name, draft.tag);
  if (condition) {
    return { ...entry, condition };
  }

  return entry;
}

export function parseGlossaryMarkdown(content: string): RulesGlossary {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const abbreviations = parseAbbreviations(lines);

  const definitionsStart = lines.findIndex((line) => line.trim() === '## Rules Definitions');
  const bodyLines = definitionsStart >= 0 ? lines.slice(definitionsStart + 1) : lines;

  const drafts: ParsedGlossaryEntryDraft[] = [];
  let current: ParsedGlossaryEntryDraft | null = null;

  for (const line of bodyLines) {
    const heading = parseEntryHeading(line);
    if (heading) {
      if (current) drafts.push(current);
      current = { name: heading.name, tag: heading.tag, lines: [] };
      continue;
    }

    if (current) current.lines.push(line);
  }
  if (current) drafts.push(current);

  const entries = drafts.map((draft) => buildEntry(draft, abbreviations));

  return {
    source: SOURCE,
    abbreviations,
    entries,
  };
}
