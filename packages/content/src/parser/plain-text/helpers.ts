// @open20/content/parser/plain-text/helpers
// Shared helpers used by all plain-text spell parsers.

import type { ParsedSpell } from '../spell-parser';
import { SCHOOLS } from './detect';

// ── Result / Line Helpers ────────────────────────────────────

/** Create a minimally initialized Partial<ParsedSpell> for parser use */
export function createSpellResult(): Partial<ParsedSpell> {
  return { classes: [], descriptionLines: [] };
}

/** Advance `i` past consecutive blank lines; returns the new index */
export function skipBlankLines(lines: string[], i: number): number {
  while (i < lines.length && !(lines[i] ?? '').trim()) i++;
  return i;
}

// ── Label / Material / School ────────────────────────────────

/** Parse "Label: Value" line into { label, value } */
export function parseLabelValueLine(line: string): { label: string; value: string } | null {
  const match = line.match(/^([^:]+):\s*(.*)/);
  if (!match) return null;
  return { label: match[1]!.trim(), value: match[2]!.trim() };
}

/** Extract material component from a components string like "V, S, M (powdered rhubarb leaf)" */
export function extractMaterial(componentsStr: string): string | undefined {
  const match = componentsStr.match(/M\s*\(([^)]+)\)/i);
  return match?.[1] || undefined;
}

/** Capitalize first letter, lowercase rest */
export function normalizeSchool(school: string): string {
  return school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
}

// ── Level/School Parsing ─────────────────────────────────────

/**
 * Parse a level/school line in various formats:
 * - "Level 2 Evocation" → { level: 2, school: "Evocation" }
 * - "Evocation Cantrip"  → { level: 0, school: "Evocation" }
 * - "Cantrip"            → { level: 0, school: "Unknown" }
 * - "2 Evocation"        → { level: 2, school: "Evocation" } (Roll20, no "Level" prefix)
 */
export function parseLevelSchoolLine(line: string): { level: number; school: string } | null {
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

/**
 * Parse an ordinal level/school line from 5e wiki format:
 * - "1st-level Enchantment" → { level: 1, school: "Enchantment" }
 * - "Evocation Cantrip"     → { level: 0, school: "Evocation" }
 * - "Cantrip"               → { level: 0, school: "Unknown" }
 */
export function parseOrdinalLevelLine(line: string): { level: number; school: string } | null {
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

// ── Upcast / Stop Lines ──────────────────────────────────────

/** Check if a line starts an upcast/upgrade section */
export function isUpcastStart(line: string): boolean {
  return /^(Using\s+a\s+Higher-Level\s+Spell\s+Slot|At\s+Higher\s+Levels|Cantrip\s+Upgrade)[.:]?\s/i.test(
    line.trim(),
  );
}

/** Check if a line is a metadata/trailer stop line */
export function isStopLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^(Classes|Subclasses|Source|Spell\s+Tags):/i.test(trimmed) ||
    /^(Spell\s+Lists\.)/i.test(trimmed) ||
    /^Available\s+For:/i.test(trimmed)
  );
}

/** Strip the upcast/upgrade section prefix from a line */
export function stripUpcastPrefix(line: string): { kind: 'upcast' | 'cantrip'; text: string } {
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

// ── Shared Field Parsing ─────────────────────────────────────

/**
 * Parse the common spell field block (Casting Time, Range, Components, Duration).
 * Used by 5eTools, Roll20, and 5eWiki parsers.
 *
 * @param lines      all text lines
 * @param startIdx   index to start parsing from
 * @param result     Partial<ParsedSpell> to populate
 * @param stopBefore optional set of lowercase labels to stop *before* parsing
 *                   (e.g. `['classes']` for Roll20 where Classes comes before description)
 * @returns the next line index to continue from
 */
export function parseSpellFields(
  lines: string[],
  startIdx: number,
  result: Partial<ParsedSpell>,
  stopBefore?: ReadonlySet<string>,
): number {
  const SPELL_FIELD_LABELS = new Set(['casting time', 'range', 'components', 'duration']);

  result.castingTime = '';
  result.range = '';
  result.components = '';
  result.duration = '';

  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const lv = parseLabelValueLine(line);
    if (!lv) break;

    const label = lv.label.toLowerCase();
    if (stopBefore?.has(label)) break;
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

  return i;
}

/**
 * Collect description paragraphs until a stop condition is met.
 * Handles upcast sections, stop lines, and blank lines.
 *
 * @returns the populated descriptionLines array
 */
export function collectDescription(
  lines: string[],
  startIdx: number,
  result: Partial<ParsedSpell>,
  name: string | undefined,
): string[] {
  const descLines: string[] = [];
  let i = startIdx;

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

    // Stop at metadata/trailer lines
    if (isStopLine(trimmed)) {
      i++;
      continue;
    }

    // Skip repeated spell name
    if (name && trimmed === name) {
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

  return descLines;
}
