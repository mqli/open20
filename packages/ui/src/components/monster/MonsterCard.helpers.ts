// MonsterCard.helpers.ts
// Helper functions for formatting monster data

import type { Monster, AbilityName, AbilityScores } from 'open20-core';

// ── Ability Score Helpers ─────────────────────────────────────────

/**
 * Calculate ability modifier from score
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Format ability modifier with sign (+ or -)
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Get ability score abbreviation from full name
 */
export function getAbilityAbbreviation(abilityName: AbilityName): string {
  const abbreviations: Record<AbilityName, string> = {
    Strength: 'STR',
    Dexterity: 'DEX',
    Constitution: 'CON',
    Intelligence: 'INT',
    Wisdom: 'WIS',
    Charisma: 'CHA',
  };
  return abbreviations[abilityName];
}

/**
 * Calculate total ability score (base + all bonuses)
 */
export function getTotalAbilityScore(abilities: AbilityScores, ability: AbilityName): number {
  const base = abilities.base[ability] || 0;
  const racial = abilities.racialBonuses?.[ability] || 0;
  const background = abilities.backgroundBonuses?.[ability] || 0;
  const feat = (abilities.featBonuses?.[ability] || 0) + (abilities.featGrants?.[ability] || 0);
  const temporary = abilities.temporaryBonuses?.[ability] || 0;

  return base + racial + background + feat + temporary;
}

/**
 * Get all ability scores with their totals and modifiers
 */
export function getAllAbilityScores(
  abilities: AbilityScores,
): Array<{ name: string; score: number; modifier: number }> {
  const abilityNames: AbilityName[] = [
    'Strength',
    'Dexterity',
    'Constitution',
    'Intelligence',
    'Wisdom',
    'Charisma',
  ];

  return abilityNames.map((abilityName) => {
    const score = getTotalAbilityScore(abilities, abilityName);
    const modifier = getAbilityModifier(score);
    const abbreviation = getAbilityAbbreviation(abilityName);

    return {
      name: abbreviation,
      score,
      modifier,
    };
  });
}

// ── Speed Formatting ─────────────────────────────────────────────

/**
 * Format speed info object to string
 * e.g., "30 ft., burrow 20 ft., fly 60 ft. (hover)"
 */
export function formatSpeed(speed: {
  walk?: number;
  burrow?: number;
  climb?: number;
  fly?: number;
  swim?: number;
  hover?: boolean;
}): string {
  const parts: string[] = [];

  if (speed.walk !== undefined) {
    parts.push(`${speed.walk} ft.`);
  }

  if (speed.burrow !== undefined) {
    parts.push(`burrow ${speed.burrow} ft.`);
  }

  if (speed.climb !== undefined) {
    parts.push(`climb ${speed.climb} ft.`);
  }

  if (speed.fly !== undefined) {
    const flyText = `fly ${speed.fly} ft.`;
    parts.push(speed.hover ? `${flyText} (hover)` : flyText);
  }

  if (speed.swim !== undefined) {
    parts.push(`swim ${speed.swim} ft.`);
  }

  return parts.join(', ');
}

// ── Armor Class Formatting ──────────────────────────────────────

/**
 * Format armor class entries
 * e.g., "15 (natural armor)" or "12, 15 with shield"
 */
export function formatAC(
  acEntries: ReadonlyArray<{ value: number; type: string; condition?: string }>,
): string {
  if (acEntries.length === 0) return '—';

  return acEntries
    .map((entry) => {
      let text = `${entry.value}`;
      if (entry.type) {
        text += ` (${entry.type})`;
      }
      if (entry.condition) {
        text += `, ${entry.condition}`;
      }
      return text;
    })
    .join(', ');
}

// ── HP Formatting ───────────────────────────────────────────────

/**
 * Format HP info
 * e.g., "45 (6d8 + 18)"
 */
export function formatHP(hp: { value: number; formula?: string }): string {
  if (hp.formula) {
    return `${hp.value} (${hp.formula})`;
  }
  return `${hp.value}`;
}

// ── Challenge Rating Formatting ─────────────────────────────────

/**
 * Format challenge rating for display
 * e.g., "2" or "1/2"
 */
export function formatCR(cr: number | string): string {
  return String(cr);
}

/**
 * Calculate proficiency bonus from CR
 */
export function getProficiencyBonus(cr: number | string): number {
  const crValue = typeof cr === 'string' ? parseCR(cr) : cr;
  return Math.floor((crValue + 3) / 4) + 2;
}

/**
 * Parse CR string to number
 */
function parseCR(cr: string): number {
  switch (cr) {
    case '1/8':
      return 0.125;
    case '1/4':
      return 0.25;
    case '1/2':
      return 0.5;
    default:
      return parseFloat(cr) || 0;
  }
}

/**
 * Format challenge rating info with XP
 * e.g., "2 (450 XP)" or "1/2 (100 XP)"
 */
export function formatChallengeRating(crInfo: {
  rating: number | string;
  xp: number;
  lairXp?: number;
}): string {
  const crText = formatCR(crInfo.rating);
  let text = `${crText} (${crInfo.xp} XP)`;

  if (crInfo.lairXp) {
    text += ` (${crInfo.lairXp} XP in lair)`;
  }

  return text;
}

// ── Initiative Formatting ────────────────────────────────────────

/**
 * Format initiative info
 * e.g., "+4 (14)" or "+2"
 */
export function formatInitiative(initiative?: { modifier: number; score?: number }): string {
  if (!initiative) return '—';
  let text = formatModifier(initiative.modifier);
  if (initiative.score !== undefined) {
    text += ` (${initiative.score})`;
  }
  return text;
}

// ── Senses Formatting ───────────────────────────────────────────

/**
 * Format senses info
 * e.g., "darkvision 60 ft., passive Perception 13"
 */
export function formatSenses(senses?: {
  darkvision?: number;
  blindsight?: number;
  tremorsense?: number;
  truesight?: number;
  passivePerception: number;
}): string {
  if (!senses) return '—';

  const parts: string[] = [];

  if (senses.darkvision) {
    parts.push(`darkvision ${senses.darkvision} ft.`);
  }

  if (senses.blindsight) {
    parts.push(`blindsight ${senses.blindsight} ft.`);
  }

  if (senses.tremorsense) {
    parts.push(`tremorsense ${senses.tremorsense} ft.`);
  }

  if (senses.truesight) {
    parts.push(`truesight ${senses.truesight} ft.`);
  }

  parts.push(`passive Perception ${senses.passivePerception}`);

  return parts.join(', ');
}

// ── Size & Type Formatting ──────────────────────────────────────

/**
 * Format size and type
 * e.g., "Medium Humanoid" or "Large Dragon (Chromatic)"
 */
export function formatSizeType(monster: Monster): string {
  let text = `${monster.size} ${monster.type}`;

  if (monster.descriptiveTags && monster.descriptiveTags.length > 0) {
    text += ` (${monster.descriptiveTags.join(', ')})`;
  }

  return text;
}

// ── Saving Throws & Skills ──────────────────────────────────────

/**
 * Format saving throw bonuses
 * e.g., "Dex +6, Con +3"
 */
export function formatSavingThrows(savingThrows?: Record<string, number>): string {
  if (!savingThrows) return '';

  const entries = Object.entries(savingThrows);
  if (entries.length === 0) return '';

  return entries
    .map(([ability, bonus]) => {
      // Convert ability name to abbreviation
      const abbrev = getAbilityAbbreviation(ability as AbilityName) || ability;
      return `${abbrev} ${formatModifier(bonus)}`;
    })
    .join(', ');
}

/**
 * Format skill bonuses
 * e.g., "Perception +4, Stealth +6"
 */
export function formatSkills(skills?: Record<string, number>): string {
  if (!skills) return '';

  const entries = Object.entries(skills);
  if (entries.length === 0) return '';

  return entries.map(([skill, bonus]) => `${skill} ${formatModifier(bonus)}`).join(', ');
}

// ── Damage Defenses Formatting ─────────────────────────────────

/**
 * Format damage types array
 */
export function formatDamageTypes(types?: readonly string[]): string {
  if (!types || types.length === 0) return '';
  return types.join(', ');
}

// ── Limited Usage Formatting ────────────────────────────────────

/**
 * Format limited usage text
 */
export function formatLimitedUsage(usage: {
  type: string;
  uses?: number;
  rechargeRange?: readonly [number, number];
  rechargeOn?: string;
}): string {
  switch (usage.type) {
    case 'x_per_day':
      return `${usage.uses}/Day`;
    case 'recharge':
      return `Recharge ${usage.rechargeRange?.[0]}–${usage.rechargeRange?.[1]}`;
    case 'recharge_after_rest':
      return `Recharge after ${usage.rechargeOn}`;
    default:
      return '';
  }
}
