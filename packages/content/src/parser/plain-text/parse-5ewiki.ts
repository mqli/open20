// @open20/content/parser/plain-text/parse-5ewiki
// Parser for the 5e wiki plain-text spell format.

import type { ParsedSpell } from '../spell-parser';
import { parseParentheticalCommaList } from '../helpers';
import {
  createSpellResult,
  skipBlankLines,
  parseOrdinalLevelLine,
  parseSpellFields,
} from './helpers';

// ── Helpers ──────────────────────────────────────────────────

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

// ── Parser ───────────────────────────────────────────────────

export function parse5eWiki(lines: string[]): Partial<ParsedSpell> {
  const result = createSpellResult();

  // Line 0: Spell name — strip component prefix like "V`Silvery Barbs" → "Silvery Barbs"
  result.name = stripComponentPrefix(lines[0] ?? '');
  let i = 1;

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
      i = skipBlankLines(lines, i);
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
  i = skipBlankLines(lines, i);

  // Parse labeled fields: Casting Time:, Range:, Components:, Duration:
  i = parseSpellFields(lines, i, result);

  // Skip blank lines before description
  i = skipBlankLines(lines, i);

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
