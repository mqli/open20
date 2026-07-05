// @open20/content/parser/plain-text/parse-dndbeyond
// Parser for the D&D Beyond plain-text spell format.

import type { ParsedSpell } from '../spell-parser';
import {
  createSpellResult,
  skipBlankLines,
  normalizeSchool,
  isUpcastStart,
  isStopLine,
  stripUpcastPrefix,
} from './helpers';

// ── Constants ────────────────────────────────────────────────

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

// ── Parser ───────────────────────────────────────────────────

export function parseDndBeyond(lines: string[]): Partial<ParsedSpell> {
  const result = createSpellResult();

  // Line 0: Spell name (may have trailing spaces)
  result.name = lines[0]?.trim() ?? '';
  let i = 1;

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
  i = skipBlankLines(lines, i);

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
