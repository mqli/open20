// character/feat-mutate.ts
// Feat-related mutations — pure functions that return new Character state
// Handles feat selection, feat choices, and feat removal

import type { Character } from '@/types/character';
import type { FeatSpellSelection, CharacterFeatEntry } from '@/types/feat';
import type { RecomputeDerivedStatsDeps } from '@/types/deps';
import { validateFeatPrerequisites, canTakeFeat } from './feat-validator';
import { recomputeDerivedStats } from './recompute';

// ── Helpers ──────────────────────────────────

/** Check if a character has a feat by featId. */
function hasFeat(char: Character, featId: string): boolean {
  return char.feats.some((f) => f.featId === featId);
}

/** Find a feat entry by featId (returns undefined if not found). */
function findFeatEntry(char: Character, featId: string): CharacterFeatEntry | undefined {
  return char.feats.find((f) => f.featId === featId);
}

/** Build a new feats array with one entry added or replaced. */
function upsertFeatEntry(
  feats: readonly CharacterFeatEntry[],
  entry: CharacterFeatEntry,
): CharacterFeatEntry[] {
  const filtered = feats.filter((f) => f.featId !== entry.featId);
  return [...filtered, entry];
}

/** Build a new feats array with one entry removed. */
function removeFeatEntry(
  feats: readonly CharacterFeatEntry[],
  featId: string,
): CharacterFeatEntry[] {
  return feats.filter((f) => f.featId !== featId);
}

// ── Public Interface ──────────────────────────────────

/**
 * Options for adding a feat to a character.
 */
export interface AddFeatOptions {
  /** Skill/tool choices (e.g., ["Athletics", "Stealth"]) */
  skillChoices?: readonly string[];
  /** Ability bonus choices (e.g., { "Strength": 2 } or { "Strength": 1, "Dexterity": 1 }) */
  abilityChoices?: Partial<Record<import('../types/ability').AbilityName, number>>;
  /** Spell choices for feats like Magic Initiate */
  spellSelection?: FeatSpellSelection;
}

/**
 * Add a feat to a character (with validation).
 * If the feat requires choices (e.g., "Skilled"), also store the choices.
 *
 * @param char - The character to modify
 * @param featId - The ID of the feat to add
 * @param deps - RecomputeDerivedStatsDeps for validation
 * @param options - Optional choices and spell selection
 * @returns New Character with the feat added
 * @throws Error if prerequisites not met
 *
 * @example
 * // Add a feat with skill choices
 * addFeat(char, 'skilled', deps, { skillChoices: ['Athletics', 'Stealth', 'Perception'] });
 *
 * @example
 * // Add a feat with ability bonus choice
 * addFeat(char, 'ability-score-improvement', deps, { abilityChoices: { Strength: 2 } });
 *
 * @example
 * // Add a feat with spell selection (Magic Initiate)
 * addFeat(char, 'magic-initiate', deps, { spellSelection: { classId: 'Wizard', spells: { cantrips: ['fire-bolt'], level1Spell: ['magic-missile'] } } });
 */
export function addFeat(
  char: Character,
  featId: string,
  deps: RecomputeDerivedStatsDeps,
  options?: AddFeatOptions,
): Character {
  const feat = deps.feats?.[featId];
  if (!feat) {
    throw new Error(`Feat "${featId}" not found in deps`);
  }

  // Validate prerequisites
  const validation = validateFeatPrerequisites(char, feat, deps);
  if (!validation.valid) {
    throw new Error(`Cannot take feat "${feat.name ?? featId}": ${validation.reasons.join(', ')}`);
  }

  // Check if feat can be taken (not already taken, or repeatable)
  if (!canTakeFeat(char, feat)) {
    throw new Error(`Feat "${feat.name ?? featId}" cannot be taken again (not repeatable)`);
  }

  const { skillChoices, abilityChoices, spellSelection } = options ?? {};

  // Build the new feat entry
  const newEntry: CharacterFeatEntry = {
    featId,
    ...(skillChoices && skillChoices.length > 0 ? { skillChoices } : {}),
    ...(abilityChoices && Object.keys(abilityChoices).length > 0 ? { abilityChoices } : {}),
    ...(spellSelection ? { spellChoices: spellSelection } : {}),
  };

  // Add feat entry
  const newFeats = upsertFeatEntry(char.feats, newEntry);

  // Build new character and recompute
  const newChar: Character = {
    ...char,
    feats: newFeats,
    updatedAt: new Date().toISOString(),
  };

  return recomputeDerivedStats(newChar, deps);
}

/**
 * Remove a feat from a character.
 * Note: In D&D 5e, feats are permanent once chosen (unless using optional "Feat Respec" rules).
 * This function is provided for flexibility (e.g., level respec, homebrew rules).
 *
 * @param char - The character to modify
 * @param featId - The ID of the feat to remove
 * @param deps - RecomputeDerivedStatsDeps
 * @returns New Character with the feat removed
 */
export function removeFeat(
  char: Character,
  featId: string,
  deps: RecomputeDerivedStatsDeps,
): Character {
  if (!hasFeat(char, featId)) {
    throw new Error(`Feat "${featId}" not found on character`);
  }

  // Remove feat entry
  const newFeats = removeFeatEntry(char.feats, featId);

  // Build new character and recompute
  const newChar: Character = {
    ...char,
    feats: newFeats,
    updatedAt: new Date().toISOString(),
  };

  return recomputeDerivedStats(newChar, deps);
}

/**
 * Update choices for a feat (e.g., change which skills you chose for "Skilled").
 *
 * @param char - The character to modify
 * @param featId - The ID of the feat
 * @param choices - New choices for this feat
 * @param deps - RecomputeDerivedStatsDeps
 * @returns New Character with updated choices
 */
export function updateFeatChoices(
  char: Character,
  featId: string,
  choices: {
    skillChoices?: readonly string[];
    abilityChoices?: Partial<Record<import('../types/ability').AbilityName, number>>;
  },
  deps: RecomputeDerivedStatsDeps,
): Character {
  if (!hasFeat(char, featId)) {
    throw new Error(`Feat "${featId}" not found on character`);
  }

  const feat = deps.feats?.[featId];
  if (!feat) {
    throw new Error(`Feat "${featId}" not found in deps`);
  }

  const existing = findFeatEntry(char, featId);

  // Build updated entry — spread {} conditionally to omit keys when not needed
  const updatedEntry: CharacterFeatEntry = {
    featId,
    ...(choices.skillChoices && choices.skillChoices.length > 0
      ? { skillChoices: choices.skillChoices }
      : existing?.skillChoices && existing.skillChoices.length > 0
        ? { skillChoices: existing.skillChoices }
        : {}),
    ...(choices.abilityChoices && Object.keys(choices.abilityChoices).length > 0
      ? { abilityChoices: choices.abilityChoices }
      : existing?.abilityChoices && Object.keys(existing.abilityChoices).length > 0
        ? { abilityChoices: existing.abilityChoices }
        : {}),
    ...(existing?.spellChoices ? { spellChoices: existing.spellChoices } : {}),
  };

  const newFeats = upsertFeatEntry(char.feats, updatedEntry);

  // Build new character and recompute
  const newChar: Character = {
    ...char,
    feats: newFeats,
    updatedAt: new Date().toISOString(),
  };

  return recomputeDerivedStats(newChar, deps);
}

/**
 * Update spell choices for a feat (e.g., Magic Initiate).
 *
 * @param char - The character to modify
 * @param featId - The ID of the feat
 * @param spellSelection - New spell selection for this feat
 * @param deps - RecomputeDerivedStatsDeps
 * @returns New Character with updated spell choices
 */
export function updateFeatSpellChoices(
  char: Character,
  featId: string,
  spellSelection: FeatSpellSelection,
  deps: RecomputeDerivedStatsDeps,
): Character {
  if (!hasFeat(char, featId)) {
    throw new Error(`Feat "${featId}" not found on character`);
  }

  const feat = deps.feats?.[featId];
  if (!feat) {
    throw new Error(`Feat "${featId}" not found in deps`);
  }

  // Find spellChoices grant in the grants array
  const hasSpellChoices = feat.grants?.some((g) => g.type === 'spellChoices');
  if (!hasSpellChoices) {
    throw new Error(`Feat "${featId}" does not have spell choices`);
  }

  // Get existing entry to preserve other choice types
  const existing = findFeatEntry(char, featId);

  // Build updated entry with spell choices
  const updatedEntry: CharacterFeatEntry = {
    featId,
    ...(existing?.skillChoices ? { skillChoices: existing.skillChoices } : {}),
    ...(existing?.abilityChoices ? { abilityChoices: existing.abilityChoices } : {}),
    spellChoices: spellSelection,
  };

  const newFeats = upsertFeatEntry(char.feats, updatedEntry);

  // Build new character and recompute
  const newChar: Character = {
    ...char,
    feats: newFeats,
    updatedAt: new Date().toISOString(),
  };

  return recomputeDerivedStats(newChar, deps);
}

/**
 * Get all special abilities granted by a character's feats.
 * Useful for UI display and engine logic.
 *
 * @param char - The character
 * @param deps - RecomputeDerivedStatsDeps
 * @returns Array of special ability names
 */
export function getFeatSpecialAbilities(
  char: Character,
  deps: RecomputeDerivedStatsDeps,
): string[] {
  const abilities: string[] = [];

  for (const entry of char.feats) {
    const feat = deps.feats?.[entry.featId];
    if (!feat?.grants) continue;

    // Find specialAbilities grant in the grants array
    for (const grant of feat.grants) {
      if (grant.type === 'specialAbilities') {
        abilities.push(...grant.abilities);
      }
    }
  }

  return abilities;
}
