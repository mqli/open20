// spells/capabilities.ts
// Focused pure functions for spell capability calculations.
// These functions are framework-agnostic and belong in core,
// not in the React-specific spellbook package.

import type { Character, Spell, SpellLevel } from '@/types';
import type { Class } from '@/types/class';
import type { RecomputeDerivedStatsDeps } from '@/types/deps';

import { isSpellbookCaster, canChangeSpellsOnLongRest, canChangeSpellsOnLevelUp } from './query';
import { canCastSpell } from './query';

// ── Types ──────────────────────────────────────────────────

/** What kind of spellcaster a character is. */
export interface CasterType {
  /** Character has at least one spellbook caster class (Wizard). */
  isSpellbookCaster: boolean;
  /** Character can learn spells (same as isSpellbookCaster in D&D 2024). */
  canLearn: boolean;
  /** Character can prepare spells (Cleric, Druid, Wizard, etc.). */
  canPrepare: boolean;
}

/** Per-class state of a spell for a character. */
export interface SpellClassState {
  classId: string;
  isKnown: boolean;
  isPrepared: boolean;
  isAlwaysPrepared: boolean;
  isCantripKnown: boolean;
}

/** Slot availability for a given spell level. */
export interface SlotAvailability {
  hasRegularSlot: boolean;
  hasPactSlot: boolean;
}

// ── Caster Type ───────────────────────────────────────────

/**
 * Get the caster type for a character.
 * Indicates what kind of spellcasting the character can do.
 */
export function getCasterType(char: Character, deps: RecomputeDerivedStatsDeps): CasterType {
  const classes = (char.classes ?? [])
    .map((c) => deps.classes?.[c.classId])
    .filter((c): c is Class => c != null);

  const canPrepare = classes.some(
    (c) => canChangeSpellsOnLongRest(c) || canChangeSpellsOnLevelUp(c),
  );
  const isSpellbook = classes.some(isSpellbookCaster);

  return {
    isSpellbookCaster: isSpellbook,
    canLearn: isSpellbook,
    canPrepare,
  };
}

/**
 * Get the caster type for a single class.
 */
export function getCasterTypeForClass(
  classId: string,
  deps: RecomputeDerivedStatsDeps,
): CasterType {
  const classDef = deps.classes?.[classId];
  if (!classDef) {
    return { isSpellbookCaster: false, canLearn: false, canPrepare: false };
  }

  return {
    isSpellbookCaster: isSpellbookCaster(classDef),
    canLearn: isSpellbookCaster(classDef),
    canPrepare: canChangeSpellsOnLongRest(classDef) || canChangeSpellsOnLevelUp(classDef),
  };
}

// ── Class Matching ────────────────────────────────────────

/**
 * Get the character's class IDs that can cast a given spell.
 * Case-insensitive match between character class IDs and spell class list.
 */
export function getMatchingClassIds(char: Character, spell: Spell): string[] {
  const classIdMap = new Map((char.classes ?? []).map((c) => [c.classId.toLowerCase(), c.classId]));
  return (spell.classes ?? [])
    .filter((c) => classIdMap.has(c.toLowerCase()))
    .map((c) => classIdMap.get(c.toLowerCase())!);
}

// ── Per-Class Spell State ────────────────────────────────

/**
 * Get per-class state of a spell for a character.
 * Only returns entries for classes that have spell data.
 */
export function getSpellClassStates(char: Character, spellId: string): SpellClassState[] {
  const result: SpellClassState[] = [];

  for (const [classId, classData] of Object.entries(char.spells.classSpellcasting)) {
    const isCantripKnown = (classData.knownCantrips ?? []).includes(spellId);
    const isKnown = isCantripKnown || classData.knownSpells.includes(spellId);
    const isPrepared = classData.preparedSpells.includes(spellId);
    const isAlwaysPrepared = (classData.alwaysPreparedSpells ?? []).includes(spellId);

    result.push({ classId, isKnown, isPrepared, isAlwaysPrepared, isCantripKnown });
  }

  return result;
}

// ── Slot Availability ────────────────────────────────────

/**
 * Check slot availability for a given spell level.
 * Warlock pact slots are only usable for spells at or below the pact magic level.
 */
export function getAvailableSlots(char: Character, spellLevel: SpellLevel): SlotAvailability {
  const isWarlock = (char.classes ?? []).some((c) => c.classId === 'Warlock');
  const pactMagic = char.spells.pactMagicSlots;
  const spellSlots = char.spells.spellSlots;

  const hasRegularSlot =
    spellLevel === 0 || (spellSlots[spellLevel]?.total ?? 0) > (spellSlots[spellLevel]?.used ?? 0);

  const hasPactSlot =
    isWarlock &&
    pactMagic !== null &&
    pactMagic.used < pactMagic.total &&
    spellLevel <= pactMagic.level;

  return { hasRegularSlot, hasPactSlot };
}

// ── Enhanced canCast (with slot check) ───────────────────

/**
 * Check if a character can cast a spell, including slot availability.
 * This is an enhanced version of `canCastSpell` that also checks slots.
 *
 * - Cantrips: castable if known (no slot consumption).
 * - Leveled spells: must be preparable/known AND have a slot available.
 */
export function canCastSpellWithSlots(char: Character, spell: Spell): boolean {
  if (!canCastSpell(char, spell)) return false;

  // Cantrips never consume slots
  if (spell.level === 0) return true;

  const slots = getAvailableSlots(char, spell.level);
  return slots.hasRegularSlot || slots.hasPactSlot;
}

// ── Spell Attack Bonus ───────────────────────────────────

/**
 * Get the spell attack bonus for a specific class.
 */
export function getSpellAttackBonusForClass(char: Character, classId: string): number {
  return char.spells.classSpellcasting[classId]?.spellAttackBonus ?? 0;
}

/**
 * Get the best spell attack bonus across all the character's classes.
 * For multiclass, picks the class with the highest bonus.
 */
export function getBestSpellAttackBonus(char: Character): number {
  let best = 0;
  for (const classData of Object.values(char.spells.classSpellcasting)) {
    const bonus = classData.spellAttackBonus ?? 0;
    if (bonus > best) {
      best = bonus;
    }
  }
  return best;
}

/**
 * Pick the best class ID for display purposes (e.g., spell attack bonus).
 * For single-class, returns that class.
 * For multiclass matching multiple classes, picks the one with highest spellAttackBonus.
 * Uses deterministic sorting (by bonus desc, then by classId asc) to avoid object key order dependency.
 */
export function pickBestClassId(char: Character, candidateIds: string[]): string | null {
  const classSpellcasting = char.spells.classSpellcasting;
  const availableIds = candidateIds.length === 0 ? Object.keys(classSpellcasting) : candidateIds;

  if (availableIds.length === 0) return null;
  if (availableIds.length === 1) return availableIds[0]!;

  // Sort by spellAttackBonus descending, then by classId for determinism
  let bestId = availableIds[0]!;
  let bestBonus = classSpellcasting[bestId]?.spellAttackBonus ?? -Infinity;

  for (let i = 1; i < availableIds.length; i++) {
    const id = availableIds[i]!;
    const bonus = classSpellcasting[id]?.spellAttackBonus ?? -Infinity;

    if (bonus > bestBonus || (bonus === bestBonus && id < bestId)) {
      bestId = id;
      bestBonus = bonus;
    }
  }

  return bestId;
}
