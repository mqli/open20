// roll-adapter.ts (T-006)
// Injects the RNG into core roll functions and pushes a normalized RollResult
// (with modifier breakdown) into the shared @open20/ui roll store.
//
// RNG shapes (README §2.1): core dice/roll functions take RandomProvider
// `{ roll(min,max) }` — use `defaultRandom`. Rest/level-up functions take a
// different `{ d(max) }` shape — use `restRng` for those.

import {
  defaultRandom,
  rollCharacterSkillCheck,
  rollCharacterSavingThrow,
  rollCharacterInitiative,
  rollCharacterAbilityCheck,
  type Character,
  type AbilityName,
  type RandomProvider,
} from 'open20-core';
import type { SkillName } from 'open20-core/types';
import { useRollStore } from '@open20/ui';
import { getClass } from './content-resolver';

/** RNG shape expected by shortRest/longRest/levelUp: `{ d(max) }`. */
export const restRng = { d: (max: number) => defaultRandom.roll(1, max) };

export type RollModifierType = 'none' | 'advantage' | 'disadvantage';

function sign(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function pushCheck(
  label: string,
  bonus: number,
  total: number,
  rawRoll: number,
  rollModifier: RollModifierType = 'none',
  rolls?: readonly number[],
): void {
  const suffix =
    rollModifier === 'advantage' ? ' (Adv)' : rollModifier === 'disadvantage' ? ' (Dis)' : '';
  useRollStore.getState().addRoll({
    label: `${label}${suffix}`,
    expression: `d20 ${sign(bonus)}`,
    total,
    components: [{ source: 'modifier', value: bonus }],
    mode: 'single',
    isCritical: rawRoll === 20,
    isCriticalMiss: rawRoll === 1,
    rolls,
  });
}

export function rollSkill(
  character: Character,
  skill: SkillName,
  rollModifier: RollModifierType = 'none',
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterSkillCheck({ character, skill, rollModifier, rng });
  pushCheck(
    `Skill: ${skill}`,
    result.bonus,
    result.total,
    result.rawRoll,
    rollModifier,
    result.rolls,
  );
  return result;
}

export function rollAbility(
  character: Character,
  ability: AbilityName,
  rollModifier: RollModifierType = 'none',
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterAbilityCheck({ character, ability, rollModifier, rng });
  pushCheck(
    `Ability: ${ability}`,
    result.bonus,
    result.total,
    result.rawRoll,
    rollModifier,
    result.rolls,
  );
  return result;
}

export function rollSave(
  character: Character,
  ability: AbilityName,
  rollModifier: RollModifierType = 'none',
  dc = 0,
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterSavingThrow({ character, ability, dc, rollModifier, getClass, rng });
  pushCheck(
    `Save: ${ability}`,
    result.bonus,
    result.total,
    result.rawRoll,
    rollModifier,
    result.rolls,
  );
  return result;
}

export function rollInitiative(
  character: Character,
  rollModifier: RollModifierType = 'none',
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterInitiative({ character, rollModifier, rng });
  pushCheck('Initiative', result.bonus, result.total, result.rawRoll, rollModifier, result.rolls);
  return result;
}
