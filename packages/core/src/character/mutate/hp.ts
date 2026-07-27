// character/mutate/hp.ts
// HP-related character mutations

import type { Character, DamageDefenses, DamageResult } from '@/types';
import type { DamageType } from '@/types';
import { applyHPChange, applyTypedDamageToHP, setTemporaryHPShared } from '@/engine/combat';

/** @internal */
export function withUpdate(char: Character, patch: Partial<Character>): Character {
  return {
    ...char,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Modify character HP (healing or untyped damage)
 * For typed damage, use applyTypedDamage instead
 */
export function modifyHP(char: Character, delta: number): Character {
  const oldCurrent = char.hitPoints.current;
  const { currentHP, temporaryHP } = applyHPChange(
    oldCurrent,
    char.hitPoints.max,
    char.hitPoints.temporary,
    delta,
  );

  // Reset death saves when HP transitions from 0 to positive
  const wasDefeated = oldCurrent === 0;
  const isHealed = currentHP > 0;
  const resetDeathSaves = wasDefeated && isHealed;

  return withUpdate(char, {
    hitPoints: {
      ...char.hitPoints,
      current: currentHP,
      temporary: temporaryHP,
      ...(resetDeathSaves && {
        deathSaves: { successes: 0, failures: 0, isStable: false },
      }),
    },
  });
}

/**
 * Apply typed damage to character and return damage result
 * Combines defense calculation with HP modification
 */
export function applyTypedDamage(
  char: Character,
  damage: number,
  damageType: DamageType,
  defenses: DamageDefenses,
): { char: Character; result: DamageResult } {
  const { currentHP, temporaryHP, result } = applyTypedDamageToHP(
    char.hitPoints.current,
    char.hitPoints.max,
    char.hitPoints.temporary,
    damage,
    damageType,
    defenses,
  );

  const updatedChar = withUpdate(char, {
    hitPoints: {
      ...char.hitPoints,
      current: currentHP,
      temporary: temporaryHP,
    },
  });

  return { char: updatedChar, result };
}

export function setTemporaryHP(char: Character, value: number): Character {
  const newTemp = setTemporaryHPShared(char.hitPoints.temporary, value);
  return withUpdate(char, {
    hitPoints: {
      ...char.hitPoints,
      temporary: newTemp,
    },
  });
}
