// @open20/content/parser/plain-text/detect
// Format detection: determines which source format a plain-text spell block comes from.

export type Format = '5etools' | 'dndbeyond' | 'roll20' | '5ewiki';

export const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
] as const;

export function detectFormat(lines: string[]): Format {
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
