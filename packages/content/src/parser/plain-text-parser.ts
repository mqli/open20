// @open20/content/parser/plain-text-parser
// Parses plain text spell data copied from 5e tools, D&D Beyond, and Roll20.
// Auto-detects source format and outputs ParsedSpell for use with transformSpell().

import type { ParsedSpell } from './spell-parser';
import { parseParentheticalCommaList } from './helpers';

// ── Constants ────────────────────────────────────────────────

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
] as const;

// ── Format Detection ─────────────────────────────────────────

type Format = '5etools' | 'dndbeyond' | 'roll20' | '5ewiki';

function detectFormat(lines: string[]): Format {
  // D&D Beyond: standalone label lines (labels on their own line, values on next)
  const hasStandaloneLevel = lines.some((l) => l.trim() === 'Level');
  const hasRangeArea = lines.some((l) => l.trim() === 'Range/Area');
  const hasAvailableFor = lines.some((l) => /^Available\s+For:/i.test(l.trim()));
  const hasMaterialFootnote = lines.some((l) => /^\*\s*-\s*\(/.test(l.trim()));

  if (hasStandaloneLevel || hasRangeArea || (hasAvailableFor && hasMaterialFootnote)) {
    return 'dndbeyond';
  }

  // 5e wiki: "Source:" line + ordinal or cantrip level line + "Spell Lists." trailer
  const hasSourceLine = lines.some((l) => /^Source:/i.test(l.trim()));
  const hasWikiLevelLine = lines.some((l) => {
    const t = l.trim();
    // Ordinal: "1st-level Enchantment" or Cantrip: "Evocation Cantrip"
    return (
      /^\d+(?:st|nd|rd|th)-level/i.test(t) ||
      new RegExp(`^(${SCHOOLS.join('|')})\\s+Cantrip`, 'i').test(t)
    );
  });
  const hasSpellLists = lines.some((l) => /^Spell\s+Lists\./i.test(l.trim()));
  if (hasSourceLine && hasWikiLevelLine && hasSpellLists) {
    return '5ewiki';
  }

  // Roll20: line 2 has "X School" without "Level " prefix (for leveled spells)
  if (lines.length >= 2) {
    const line2 = lines[1]?.trim() ?? '';
    const roll20LevelSchool = new RegExp(`^\\d+\\s+(${SCHOOLS.join('|')})`, 'i');
    if (roll20LevelSchool.test(line2)) {
      return 'roll20';
    }
  }

  // Roll20: uses "At Higher Levels:" prefix (5e tools uses "Using a Higher-Level Spell Slot" directly)
  const hasAtHigherLevels = lines.some((l) => /^At\s+Higher\s+Levels:/i.test(l.trim()));
  const hasUsingHigherLevel = lines.some((l) =>
    /^Using\s+a\s+Higher-Level\s+Spell\s+Slot/i.test(l.trim()),
  );
  if (hasAtHigherLevels && !hasUsingHigherLevel) {
    return 'roll20';
  }

  return '5etools';
}

// ── Common Helpers ───────────────────────────────────────────

/** Check if a line looks like a source book abbreviation or page number (5e tools metadata) */
function isMetadataLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Page numbers: "p297", "p. 297"
  if (/^p\.?\s*\d+$/i.test(trimmed)) return true;
  // Source book abbreviations: "PHB'24", "XGE", "TCE", "EGW"
  if (/^[A-Z]{2,6}'?\d*$/i.test(trimmed)) return true;
  return false;
}

/**
 * Parse a level/school line in various formats:
 * - "Level 2 Evocation" → { level: 2, school: "Evocation" }
 * - "Evocation Cantrip"  → { level: 0, school: "Evocation" }
 * - "Cantrip"            → { level: 0, school: "Unknown" }
 * - "2 Evocation"        → { level: 2, school: "Evocation" } (Roll20, no "Level" prefix)
 */
function parseLevelSchoolLine(line: string): { level: number; school: string } | null {
  const trimmed = line.trim();

  // "Evocation Cantrip" or "School Cantrip"
  const cantripMatch = trimmed.match(new RegExp(`^(${SCHOOLS.join('|')})\\s+Cantrip`, 'i'));
  if (cantripMatch) {
    return { level: 0, school: normalizeSchool(cantripMatch[1]!) };
  }

  // "Cantrip" alone
  if (/^Cantrip$/i.test(trimmed)) {
    return { level: 0, school: 'Unknown' };
  }

  // "Level 2 Evocation" (5e tools)
  const levelMatch = trimmed.match(/^Level\s*(\d+)\s+(\w+)/i);
  if (levelMatch) {
    return { level: parseInt(levelMatch[1]!), school: normalizeSchool(levelMatch[2]!) };
  }

  // "2 Evocation" (Roll20, no "Level" prefix)
  const roll20Match = trimmed.match(/^(\d+)\s+(\w+)/i);
  if (roll20Match) {
    return { level: parseInt(roll20Match[1]!), school: normalizeSchool(roll20Match[2]!) };
  }

  return null;
}

/** Parse "Label: Value" line into { label, value } */
function parseLabelValueLine(line: string): { label: string; value: string } | null {
  const match = line.match(/^([^:]+):\s*(.*)/);
  if (!match) return null;
  return { label: match[1]!.trim(), value: match[2]!.trim() };
}

/** Extract material component from a components string like "V, S, M (powdered rhubarb leaf)" */
function extractMaterial(componentsStr: string): string | undefined {
  const match = componentsStr.match(/M\s*\(([^)]+)\)/i);
  return match?.[1] || undefined;
}

/** Capitalize first letter, lowercase rest */
function normalizeSchool(school: string): string {
  return school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
}

/** Check if a line starts an upcast/upgrade section */
function isUpcastStart(line: string): boolean {
  return /^(Using\s+a\s+Higher-Level\s+Spell\s+Slot|At\s+Higher\s+Levels|Cantrip\s+Upgrade)[.:]?\s/i.test(
    line.trim(),
  );
}

/** Check if a line is a metadata/trailer stop line */
function isStopLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^(Classes|Subclasses|Source|Spell\s+Tags):/i.test(trimmed) ||
    /^(Spell\s+Lists\.)/i.test(trimmed) ||
    /^Available\s+For:/i.test(trimmed)
  );
}

/** Strip component abbreviation prefix from wiki spell name line like "V`Silvery Barbs" or "V, S`Fireball" */
function stripComponentPrefix(line: string): string {
  // Find the backtick delimiter (U+0060) that separates the component prefix from the name.
  // Using charCodeAt to avoid escaping issues with backtick in regex/string literals.
  for (let i = 0; i < line.length; i++) {
    if (line.charCodeAt(i) === 0x60) {
      return line.slice(i + 1).trim();
    }
  }
  return line.trim();
}

/**
 * Parse an ordinal level/school line from 5e wiki format:
 * - "1st-level Enchantment" → { level: 1, school: "Enchantment" }
 * - "2nd-level Evocation"   → { level: 2, school: "Evocation" }
 * - "3rd-level Transmutation" → { level: 3, school: "Transmutation" }
 * - "Evocation Cantrip"     → { level: 0, school: "Evocation" }
 * - "Cantrip"               → { level: 0, school: "Unknown" }
 */
function parseOrdinalLevelLine(line: string): { level: number; school: string } | null {
  const trimmed = line.trim();

  // "Evocation Cantrip" or "School Cantrip"
  const cantripMatch = trimmed.match(new RegExp(`^(${SCHOOLS.join('|')})\\s+Cantrip`, 'i'));
  if (cantripMatch) {
    return { level: 0, school: normalizeSchool(cantripMatch[1]!) };
  }

  // "Cantrip" alone
  if (/^Cantrip$/i.test(trimmed)) {
    return { level: 0, school: 'Unknown' };
  }

  // "1st-level Enchantment", "2nd-level Evocation", etc.
  const ordinalMatch = trimmed.match(/^(\d+)(?:st|nd|rd|th)-level\s+(\w+)/i);
  if (ordinalMatch) {
    return { level: parseInt(ordinalMatch[1]!), school: normalizeSchool(ordinalMatch[2]!) };
  }

  return null;
}

/** Strip the upcast/upgrade section prefix from a line */
function stripUpcastPrefix(line: string): { kind: 'upcast' | 'cantrip'; text: string } {
  const trimmed = line.trim();
  const isCantrip = /^Cantrip\s+Upgrade/i.test(trimmed);
  const text = trimmed
    .replace(
      /^(Using\s+a\s+Higher-Level\s+Spell\s+Slot|At\s+Higher\s+Levels|Cantrip\s+Upgrade)[.:]?\s*/i,
      '',
    )
    .trim();
  return { kind: isCantrip ? 'cantrip' : 'upcast', text };
}

// ── 5e Tools Parser ──────────────────────────────────────────

function parse5eTools(lines: string[]): Partial<ParsedSpell> {
  const result: Partial<ParsedSpell> = {
    classes: [],
    descriptionLines: [],
  };

  let i: number;

  // Line 0: Spell name
  result.name = lines[0]?.trim() ?? '';
  i = 1;

  // Skip source book and page number lines
  while (i < lines.length && isMetadataLine(lines[i] ?? '')) {
    i++;
  }

  // Parse level/school line (e.g., "Level 2 Evocation" or "Evocation Cantrip")
  if (i < lines.length) {
    const levelSchool = parseLevelSchoolLine(lines[i] ?? '');
    if (levelSchool) {
      result.level = levelSchool.level;
      result.school = levelSchool.school;
      i++;
    }
  }

  // Parse labeled fields: Casting Time:, Range:, Components:, Duration:
  // Stop on any unrecognized label (e.g., "Classes:" — handled later as a stop line)
  const SPELL_FIELD_LABELS = new Set(['casting time', 'range', 'components', 'duration']);
  result.castingTime = '';
  result.range = '';
  result.components = '';
  result.duration = '';
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const lv = parseLabelValueLine(line);
    if (!lv) break;

    const label = lv.label.toLowerCase();
    if (!SPELL_FIELD_LABELS.has(label)) break; // Don't consume unknown labels

    switch (label) {
      case 'casting time':
        result.castingTime = lv.value;
        // Ritual can be indicated in casting time (e.g., "Action or Ritual")
        if (/ritual/i.test(lv.value)) result.ritual = true;
        break;
      case 'range':
        result.range = lv.value;
        break;
      case 'components':
        result.components = lv.value;
        result.material = extractMaterial(lv.value);
        break;
      case 'duration':
        result.duration = lv.value;
        if (/ritual/i.test(lv.value)) result.ritual = true;
        break;
    }
    i++;
  }

  // Skip blank lines before description
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;

  // Collect description, upcast section, and classes
  const descLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Upcast section
    if (isUpcastStart(trimmed)) {
      const { kind, text } = stripUpcastPrefix(trimmed);
      if (kind === 'cantrip') {
        result.cantripUpgradeText = text;
      } else {
        result.usingAHigherLevelSpellSlotText = text;
      }
      i++;
      continue;
    }

    // Stop at Classes, Subclasses, Source
    if (isStopLine(trimmed)) {
      if (/^Classes:/i.test(trimmed)) {
        const classStr = trimmed.replace(/^Classes:\s*/i, '').trim();
        result.classes = parseParentheticalCommaList(`(${classStr})`);
      }
      i++;
      continue;
    }

    // Skip blank lines (paragraph separators — don't include in description)
    if (!trimmed) {
      i++;
      continue;
    }

    descLines.push(trimmed);
    i++;
  }
  result.descriptionLines = descLines;

  return result;
}

// ── D&D Beyond Parser ────────────────────────────────────────

/** Known D&D Beyond field labels (appear on their own line, value on next line) */
const DDB_LABELS = new Set([
  'level',
  'casting time',
  'range/area',
  'range',
  'components',
  'duration',
  'school',
  'attack/save',
  'damage/effect',
]);

function parseDndBeyond(lines: string[]): Partial<ParsedSpell> {
  const result: Partial<ParsedSpell> = {
    classes: [],
    descriptionLines: [],
  };

  let i: number;

  // Line 0: Spell name (may have trailing spaces)
  result.name = lines[0]?.trim() ?? '';
  i = 1;

  // Parse alternating label-value pairs (label on own line, value on next)
  const fields: Record<string, string> = {};
  while (i < lines.length - 1) {
    const label = (lines[i] ?? '').trim().toLowerCase();
    const value = (lines[i + 1] ?? '').trim();

    if (DDB_LABELS.has(label) && value.length > 0) {
      fields[label] = value;
      i += 2;
    } else {
      break;
    }
  }

  // Extract parsed fields

  // Level
  if (fields['level']) {
    const levelStr = fields['level'];
    if (/cantrip/i.test(levelStr)) {
      result.level = 0;
    } else {
      const m = levelStr.match(/(\d+)/);
      result.level = m ? parseInt(m[1]!) : 0;
    }
  }

  // School
  result.school = fields['school'] ? normalizeSchool(fields['school']) : 'Unknown';

  // Casting Time
  result.castingTime = fields['casting time'] ?? '';

  // Range — strip "/Area" suffix on the label side
  result.range = (fields['range/area'] ?? fields['range'] ?? '').trim();

  // Components — strip trailing "*" marker (DDB uses "*" to indicate material footnote)
  result.components = (fields['components'] ?? '').replace(/\s*\*\s*$/, '').trim();

  // Duration — also check casting time for ritual indicator
  result.duration = fields['duration'] ?? '';
  result.ritual = /ritual/i.test(result.duration) || /ritual/i.test(result.castingTime ?? '');

  // Skip blank lines after label-value section
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;

  // Collect description and upcast sections
  const descLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Upcast section
    if (isUpcastStart(trimmed)) {
      const { kind, text } = stripUpcastPrefix(trimmed);
      if (kind === 'cantrip') {
        result.cantripUpgradeText = text;
      } else {
        result.usingAHigherLevelSpellSlotText = text;
      }
      i++;
      continue;
    }

    // Material footnote: "* - (powdered rhubarb leaf)"
    if (/^\*\s*-\s*\(/.test(trimmed)) {
      const matMatch = trimmed.match(/^\*\s*-\s*\(([^)]+)\)/);
      if (matMatch) result.material = matMatch[1];
      i++;
      continue;
    }

    // Spell Tags, Available For, book citations (trailer lines)
    if (
      /^(Spell\s+Tags|Available\s+For|Player'?s?\s+Handbook|Xanathar'?s|Tasha'?s|Source)/i.test(
        trimmed,
      )
    ) {
      if (/^Available\s+For:/i.test(trimmed)) {
        const classStr = trimmed.replace(/^Available\s+For:\s*/i, '').trim();
        // D&D Beyond format: "Wizard (Legacy) Wizard" → deduplicate
        const dedupe = new Set<string>();
        for (const part of classStr.split(/\s+/)) {
          const cleaned = part.replace(/\(Legacy\)/i, '').trim();
          if (cleaned && /^[A-Z]/.test(cleaned)) dedupe.add(cleaned);
        }
        result.classes = Array.from(dedupe);
      }
      i++;
      continue;
    }

    // Skip repeated spell name at the end
    if (trimmed === result.name) {
      i++;
      continue;
    }

    // Guard against unexpected stop lines
    if (isStopLine(trimmed)) {
      i++;
      continue;
    }

    if (!trimmed) {
      i++;
      continue;
    }

    descLines.push(trimmed);
    i++;
  }
  result.descriptionLines = descLines;

  return result;
}

// ── Roll20 Parser ─────────────────────────────────────────────

function parseRoll20(lines: string[]): Partial<ParsedSpell> {
  const result: Partial<ParsedSpell> = {
    classes: [],
    descriptionLines: [],
  };

  let i: number;

  // Line 0: Spell name
  result.name = lines[0]?.trim() ?? '';
  i = 1;

  // Line 1: Level and school ("2 Evocation" — no "Level" prefix)
  if (i < lines.length) {
    const levelSchool = parseLevelSchoolLine(lines[i] ?? '');
    if (levelSchool) {
      result.level = levelSchool.level;
      result.school = levelSchool.school;
      i++;
    }
  }

  // Parse labeled fields: Casting Time:, Range:, Components:, Duration:
  // Stop before "Classes:" (handled separately below since it appears before description in Roll20)
  result.castingTime = '';
  result.range = '';
  result.components = '';
  result.duration = '';
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const lv = parseLabelValueLine(line);
    if (!lv) break;

    const label = lv.label.toLowerCase();
    if (label === 'classes') break; // Handled separately below

    switch (label) {
      case 'casting time':
        result.castingTime = lv.value;
        if (/ritual/i.test(lv.value)) result.ritual = true;
        break;
      case 'range':
        result.range = lv.value;
        break;
      case 'components':
        result.components = lv.value;
        result.material = extractMaterial(lv.value);
        break;
      case 'duration':
        result.duration = lv.value;
        if (/ritual/i.test(lv.value)) result.ritual = true;
        break;
    }
    i++;
  }

  // Skip blank lines between fields and classes/description
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;

  // "Classes:" line (in Roll20, this appears BEFORE the description)
  if (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();
    if (/^Classes:/i.test(trimmed)) {
      const classStr = trimmed.replace(/^Classes:\s*/i, '').trim();
      result.classes = parseParentheticalCommaList(`(${classStr})`);
      i++;
    }
  }

  // Skip blank lines between Classes and description
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;

  // Collect description and "At Higher Levels:" section
  const descLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Upcast / Cantrip Upgrade section
    if (isUpcastStart(trimmed)) {
      const { kind, text } = stripUpcastPrefix(trimmed);
      if (kind === 'cantrip') {
        result.cantripUpgradeText = text;
      } else {
        result.usingAHigherLevelSpellSlotText = text;
      }
      i++;
      continue;
    }

    // Skip other stop lines (shouldn't normally appear in Roll20, but guard anyway)
    if (isStopLine(trimmed)) {
      i++;
      continue;
    }

    if (!trimmed) {
      i++;
      continue;
    }

    descLines.push(trimmed);
    i++;
  }
  result.descriptionLines = descLines;

  return result;
}

// ── 5e Wiki Parser ────────────────────────────────────────────

function parse5eWiki(lines: string[]): Partial<ParsedSpell> {
  const result: Partial<ParsedSpell> = {
    classes: [],
    descriptionLines: [],
  };

  let i: number;

  // Line 0: Spell name — strip component prefix like "V`Silvery Barbs" → "Silvery Barbs"
  result.name = stripComponentPrefix(lines[0] ?? '');
  i = 1;

  // Skip blank lines and "Source:" metadata line
  while (i < lines.length) {
    const trimmed = (lines[i] ?? '').trim();
    if (!trimmed) {
      i++;
      continue;
    }
    if (/^Source:/i.test(trimmed)) {
      i++;
      // Skip blank lines after source too
      while (i < lines.length && !(lines[i] ?? '').trim()) i++;
      continue;
    }
    break;
  }

  // Parse ordinal level/school line (e.g., "1st-level Enchantment")
  if (i < lines.length) {
    const levelSchool = parseOrdinalLevelLine(lines[i] ?? '');
    if (levelSchool) {
      result.level = levelSchool.level;
      result.school = levelSchool.school;
      i++;
    }
  }

  // Skip blank lines before fields
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;

  // Parse labeled fields: Casting Time:, Range:, Components:, Duration:
  const SPELL_FIELD_LABELS = new Set(['casting time', 'range', 'components', 'duration']);
  result.castingTime = '';
  result.range = '';
  result.components = '';
  result.duration = '';
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const lv = parseLabelValueLine(line);
    if (!lv) break;

    const label = lv.label.toLowerCase();
    if (!SPELL_FIELD_LABELS.has(label)) break;

    switch (label) {
      case 'casting time':
        result.castingTime = lv.value;
        if (/ritual/i.test(lv.value)) result.ritual = true;
        break;
      case 'range':
        result.range = lv.value;
        break;
      case 'components':
        result.components = lv.value;
        result.material = extractMaterial(lv.value);
        break;
      case 'duration':
        result.duration = lv.value;
        if (/ritual/i.test(lv.value)) result.ritual = true;
        break;
    }
    i++;
  }

  // Skip blank lines before description
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;

  // Collect description and "Spell Lists." trailer
  const descLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // "Spell Lists." trailer — extract classes
    if (/^Spell\s+Lists\./i.test(trimmed)) {
      const classStr = trimmed.replace(/^Spell\s+Lists\s*\.?\s*/i, '').trim();
      if (classStr) {
        result.classes = parseParentheticalCommaList(`(${classStr})`);
      }
      i++;
      continue;
    }

    // Skip blank lines
    if (!trimmed) {
      i++;
      continue;
    }

    descLines.push(trimmed);
    i++;
  }
  result.descriptionLines = descLines;

  return result;
}

// ── Main Entry Point ─────────────────────────────────────────

/**
 * Parse a plain text spell description into a `ParsedSpell` object.
 * Auto-detects source format (5e tools, D&D Beyond, Roll20, or 5e wiki).
 *
 * The returned `ParsedSpell` can be passed directly to `transformSpell()`
 * to produce a full `Spell` object.
 */
export function parsePlainText(text: string): ParsedSpell {
  // Split into lines, preserving content but trimming trailing whitespace
  const lines = text.split('\n').map((l) => l.trimEnd());
  const format = detectFormat(lines);

  let partial: Partial<ParsedSpell>;
  switch (format) {
    case '5etools':
      partial = parse5eTools(lines);
      break;
    case 'dndbeyond':
      partial = parseDndBeyond(lines);
      break;
    case 'roll20':
      partial = parseRoll20(lines);
      break;
    case '5ewiki':
      partial = parse5eWiki(lines);
      break;
  }

  // Ensure all required fields have defaults
  return {
    name: '',
    level: 1,
    school: 'Unknown',
    classes: [],
    castingTime: 'Action',
    range: 'Self',
    components: '',
    duration: 'Instantaneous',
    ritual: false,
    descriptionLines: [],
    ...partial,
  };
}
