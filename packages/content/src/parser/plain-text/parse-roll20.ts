// @open20/content/parser/plain-text/parse-roll20
// Parser for the Roll20 plain-text spell format.

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

// ── Parser ───────────────────────────────────────────────────

export function parseRoll20(lines: string[]): Partial<ParsedSpell> {
  const result = createSpellResult();

  // Line 0: Spell name
  result.name = lines[0]?.trim() ?? '';
  let i = 1;

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
  // Stop *before* "Classes:" (handled separately since it appears before description in Roll20)
  i = parseSpellFields(lines, i, result, new Set(['classes']));

  // Skip blank lines between fields and classes/description
  i = skipBlankLines(lines, i);

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
  i = skipBlankLines(lines, i);

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
