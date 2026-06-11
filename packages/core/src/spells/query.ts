// spells/query.ts
// Spell query functions — filter, search, and retrieve spells
// Corresponds to requirement R11

import type { Spell, SpellLevel, SpellSchool, ClassSpellData } from '@/types/spell';

import type { Character } from '@/types/character';
import type { Class } from '@/types/class';
import type { RecomputeDerivedStatsDeps } from '@/types/deps';
import { calculateSpellSlots } from '@/engine/spell-slots';

// ── Spellcasting Type Helpers ──────────────────────────────

/** Check if a class knows spells from class list (Cleric, Druid, Paladin, Ranger, Bard, Sorcerer) */
export function isClassListCaster(classData: Class): boolean {
  return classData.spellcasting?.knownSource === 'class_list';
}

/** Check if a class uses spellbook (Wizard) */
export function isSpellbookCaster(classData: Class): boolean {
  return classData.spellcasting?.knownSource === 'spellbook';
}

/** Check if a class can change prepared spells after Long Rest */
export function canChangeSpellsOnLongRest(classData: Class): boolean {
  return classData.spellcasting?.preparationTiming === 'long_rest';
}

/** Check if a class can only change prepared spells on level up */
export function canChangeSpellsOnLevelUp(classData: Class): boolean {
  return classData.spellcasting?.preparationTiming === 'level_up';
}

// ── SpellFilter Interface ────────────────────────────────────

export interface SpellFilter {
  name?: string;
  level?: SpellLevel[];
  school?: SpellSchool[];
  class?: string[]; // Filter by which class can cast
  damageType?: string[]; // Filter by damage type
  castingTime?: string[]; // Filter by normalized casting time category (use values from normalizeCastingTime())
  range?: string; // Filter by range
  concentration?: boolean;
  ritual?: boolean;
  source?: string[];
}

// ── Query Functions (Character-Centric) ─────────────────────────────────

/**
 * Get spells for a character (known by any class or from feats)
 * Only returns spells the character can actually cast (cantrips + up to max spell level)
 *
 * @param char - Character object
 * @param deps - RecomputeDerivedStatsDeps
 * @returns Array of known spells within casting level
 *
 * @example
 * getSpellsForCharacter(char, deps) // Character's known spells within casting level
 */
export function getSpellsForCharacter(char: Character, deps: RecomputeDerivedStatsDeps): Spell[] {
  // Determine max spell level the character can cast
  let maxSpellLevel = 0;
  for (let level = 1; level <= 9; level++) {
    const entry = char.spells.spellSlots[level as SpellLevel];
    if (entry && entry.total > 0) {
      maxSpellLevel = level;
    }
  }

  // Collect known spells from all classes, filtered by castable level
  const knownSpellIds = new Set<string>();

  // Add class spells
  for (const classSpellData of Object.values(char.spells.classSpellcasting)) {
    // Add cantrips (level 0) from knownCantrips
    for (const spellId of classSpellData.knownCantrips ?? []) {
      knownSpellIds.add(spellId);
    }
    // Add level 1+ spells from knownSpells (filtered by castable level)
    for (const spellId of classSpellData.knownSpells) {
      const spell = deps.spells?.[spellId];
      if (spell && spell.level <= maxSpellLevel) {
        knownSpellIds.add(spellId);
      }
    }
  }

  // Add feat spells (e.g., Magic Initiate cantrips and once-per-long-rest spells)
  if (char.spells.featSpells) {
    for (const featSpellEntry of Object.values(char.spells.featSpells)) {
      // Add cantrips
      for (const spellId of featSpellEntry.cantrips) {
        knownSpellIds.add(spellId);
      }
      // Add prepared spells (level 1+ from feat)
      for (const spellId of featSpellEntry.preparedSpells) {
        const spell = deps.spells?.[spellId];
        // Feat spells can always be cast (once per long rest for level 1+)
        if (spell) {
          knownSpellIds.add(spellId);
        }
      }
    }
  }

  return Array.from(knownSpellIds)
    .map((id) => deps.spells?.[id])
    .filter((s): s is Spell => s !== undefined);
}

/**
 * Get prepared spells for a character
 * Includes both regularly prepared and always-prepared spells from all classes
 *
 * @param char - Character object
 * @param deps - RecomputeDerivedStatsDeps
 * @returns Array of prepared spells
 */
export function getPreparedSpells(char: Character, deps: RecomputeDerivedStatsDeps): Spell[] {
  const allPreparedIds = new Set<string>();

  for (const classSpellData of Object.values(char.spells.classSpellcasting)) {
    // Add regularly prepared spells
    for (const spellId of classSpellData.preparedSpells) {
      allPreparedIds.add(spellId);
    }
    // Add always-prepared spells
    for (const spellId of classSpellData.alwaysPreparedSpells ?? []) {
      allPreparedIds.add(spellId);
    }
  }

  return Array.from(allPreparedIds)
    .map((id) => deps.spells?.[id])
    .filter((s): s is Spell => s !== undefined);
}

/**
 * Check if a spell is prepared by the character
 * Checks all classes for prepared or always-prepared spells
 *
 * @param char - Character object
 * @param spellId - Spell ID
 * @returns True if the spell is prepared or always prepared in any class
 */
export function isSpellPrepared(char: Character, spellId: string): boolean {
  for (const classSpellData of Object.values(char.spells.classSpellcasting)) {
    if (
      classSpellData.preparedSpells.includes(spellId) ||
      (classSpellData.alwaysPreparedSpells ?? []).includes(spellId)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a character knows a spell (in any class or from feats)
 * Checks both knownCantrips (for cantrips) and knownSpells (for level 1+)
 * Also checks featSpells (e.g., Magic Initiate)
 *
 * @param char - Character object
 * @param spellId - Spell ID
 * @returns True if the character knows the spell in any class or from feats
 */
export function knowsSpell(char: Character, spellId: string): boolean {
  // Check class spellcasting
  for (const classSpellData of Object.values(char.spells.classSpellcasting)) {
    if (
      (classSpellData.knownCantrips ?? []).includes(spellId) ||
      classSpellData.knownSpells.includes(spellId)
    ) {
      return true;
    }
  }

  // Check feat spells (e.g., Magic Initiate)
  if (char.spells.featSpells) {
    for (const featSpellEntry of Object.values(char.spells.featSpells)) {
      if (
        featSpellEntry.cantrips.includes(spellId) ||
        featSpellEntry.preparedSpells.includes(spellId)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a character can cast a spell (cantrip or level 1+)
 * - Cantrips: check if known (can cast at will)
 * - Level 1+ spells: check if prepared or from feat (once per long rest)
 *
 * @param char - Character object
 * @param spell - Spell to check
 * @returns True if the character can cast the spell
 */
export function canCastSpell(char: Character, spell: Spell): boolean {
  if (spell.level === 0) {
    // Cantrip - check if known (in knownCantrips or featSpells)
    return knowsSpell(char, spell.id);
  }
  // Level 1+ - check if prepared or from feat (once per long rest)
  if (isSpellPrepared(char, spell.id)) return true;

  // Check if it's a feat spell (e.g., Magic Initiate)
  if (char.spells.featSpells) {
    for (const featSpellEntry of Object.values(char.spells.featSpells)) {
      if (featSpellEntry.preparedSpells.includes(spell.id)) {
        return true; // Feat spells can always be cast (once per long rest)
      }
    }
  }

  return false;
}

/**
 * Get the class spell data for a specific class
 *
 * @param char - Character object
 * @param classId - Class ID
 * @returns ClassSpellData or undefined
 */
export function getClassSpellData(char: Character, classId: string): ClassSpellData | undefined {
  return char.spells.classSpellcasting[classId];
}

/**
 * Check if a spell is known for a specific class
 * Checks both knownCantrips (for cantrips) and knownSpells (for level 1+)
 *
 * @param char - Character object
 * @param classId - Class ID
 * @param spellId - Spell ID
 * @returns True if the spell is known for that class
 */
export function knowsSpellForClass(char: Character, classId: string, spellId: string): boolean {
  const classSpellData = char.spells.classSpellcasting[classId];
  if (!classSpellData) return false;
  return (
    (classSpellData.knownCantrips ?? []).includes(spellId) ||
    classSpellData.knownSpells.includes(spellId)
  );
}

/**
 * Check if a spell is prepared for a specific class
 *
 * @param char - Character object
 * @param classId - Class ID
 * @param spellId - Spell ID
 * @returns True if the spell is prepared for that class
 */
export function isSpellPreparedForClass(
  char: Character,
  classId: string,
  spellId: string,
): boolean {
  const classSpellData = char.spells.classSpellcasting[classId];
  if (!classSpellData) return false;
  return (
    classSpellData.preparedSpells.includes(spellId) ||
    (classSpellData.alwaysPreparedSpells ?? []).includes(spellId)
  );
}

/**
 * Get known spells for a specific class, filtered by character level
 * Only returns spells the character can actually cast (cantrips + up to max spell level)
 *
 * @param char - Character object
 * @param classId - Class ID
 * @param deps - RecomputeDerivedStatsDeps
 * @returns Array of known spells within casting level for that class
 *
 * @example
 * getKnownSpellsForClass(char, 'sorcerer', deps) // Sorcerer's known spells filtered by level
 */
export function getKnownSpellsForClass(
  char: Character,
  classId: string,
  deps: RecomputeDerivedStatsDeps,
): Spell[] {
  const classSpellData = char.spells.classSpellcasting[classId];
  if (!classSpellData) return [];

  // Calculate per-class max spell level (not combined multiclass level)
  const charClass = char.classes.find((c) => c.classId === classId);
  const classLevel = charClass?.level ?? 1;
  const classSlots = calculateSpellSlots(classId, classLevel, deps.classes ?? {});
  let classMaxSpellLevel = 0;
  for (let level = 1; level <= 9; level++) {
    const entry = classSlots[level];
    if (entry && entry.total > 0) {
      classMaxSpellLevel = level;
    }
  }

  return classSpellData.knownSpells
    .map((id) => deps.spells?.[id])
    .filter((s): s is Spell => s !== undefined && (s.level === 0 || s.level <= classMaxSpellLevel));
}
