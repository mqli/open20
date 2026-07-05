// @open20/content/parser/plain-text/parse-5etools
// Parser for the 5e tools plain-text spell format.

import type { ParsedSpell } from '../spell-parser';
import { parseParentheticalCommaList } from '../helpers';
import {
  createSpellResult,
  skipBlankLines,
  parseLevelSchoolLine,
  parseSpellFields,
  isUpcastStart,
  isStopLine,
  stripUpcastPrefix,
} from './helpers';

// ── Metadata ─────────────────────────────────────────────────

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

// ── Parser ───────────────────────────────────────────────────

export function parse5eTools(lines: string[]): Partial<ParsedSpell> {
  const result = createSpellResult();

  // Line 0: Spell name
  result.name = lines[0]?.trim() ?? '';
  let i = 1;

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
  i = parseSpellFields(lines, i, result);

  // Skip blank lines before description
  i = skipBlankLines(lines, i);

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
