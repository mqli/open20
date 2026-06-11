// character/mutate/conditions.ts
// Condition and concentration-related character mutations

import type { Character, ConditionName, ActiveCondition, ActiveEffect } from '@/types/character';
import type { RandomProvider } from '@/dice/core';
import type { ConcentrationCheckResult } from '@/engine/concentration';
import { isConcentrating, calculateConcentrationDC } from '@/engine/concentration';
import { getModifier, getTotalScore } from '@/engine/ability-modifier';
import { rollSavingThrow } from '@/dice/mechanics';
import { withUpdate } from './hp';
import type { RecomputeDerivedStatsDeps } from '@/types/deps';

export function toggleCondition(char: Character, conditionId: ConditionName): Character {
  const existingIdx = char.conditions.findIndex((c) => c.id === conditionId);

  if (existingIdx !== -1) {
    // Remove existing condition
    const newConditions = char.conditions.filter((_, i) => i !== existingIdx);
    return withUpdate(char, { conditions: newConditions });
  }

  // Add new condition
  const newCondition: ActiveCondition = {
    id: conditionId,
    source: '',
    appliedAt: new Date().toISOString(),
  };

  return withUpdate(char, {
    conditions: [...char.conditions, newCondition],
  });
}

export function startConcentration(char: Character, spellId: string): Character {
  // End any existing concentration first
  let updated = char;
  if (isConcentrating(char)) {
    updated = endConcentration(char);
  }

  return withUpdate(updated, {
    concentration: { spellId, startedAt: new Date().toISOString() },
  });
}

export function endConcentration(char: Character): Character {
  if (!char.concentration) return char;

  return withUpdate(char, {
    concentration: null,
  });
}

/**
 * Toggle an active effect on the character.
 * If the effect is already present, remove it; otherwise add it.
 */
export function toggleActiveEffect(char: Character, effectId: string): Character {
  const existingIdx = char.activeEffects.findIndex((e) => e.id === effectId);

  if (existingIdx !== -1) {
    // Remove existing effect
    const newEffects = char.activeEffects.filter((_, i) => i !== existingIdx);
    return withUpdate(char, { activeEffects: newEffects });
  }

  // Add new effect
  const newEffect: ActiveEffect = {
    id: effectId,
    source: effectId,
    appliedAt: new Date().toISOString(),
  };

  return withUpdate(char, {
    activeEffects: [...char.activeEffects, newEffect],
  });
}

export function makeConcentrationCheck(
  char: Character,
  damageAmount: number,
  deps: RecomputeDerivedStatsDeps,
  rng: RandomProvider,
): { char: Character; result: ConcentrationCheckResult } {
  // Calculate DC
  const dc = calculateConcentrationDC(damageAmount);

  // Get Constitution modifier using shared utility (respects all bonus sources)
  const conMod = getModifier(getTotalScore(char.abilityScores, 'Constitution'));

  // Check if proficient in Constitution saves
  let isProficient = false;
  for (const charClass of char.classes) {
    const classData = deps.classes?.[charClass.classId];
    if (classData?.savingThrowProficiencies.includes('Constitution')) {
      isProficient = true;
      break;
    }
  }

  // Roll the save
  const check = rollSavingThrow({
    abilityMod: conMod,
    proficiencyBonus: isProficient ? char.combatStats.proficiencyBonus : 0,
    isProficient,
    dc,
    rng,
  });

  // If failed, end concentration
  let updatedChar = char;
  if (!check.success) {
    updatedChar = endConcentration(char);
  }

  return {
    char: updatedChar,
    result: {
      check,
      dc,
      maintained: check.success ?? false,
    },
  };
}
