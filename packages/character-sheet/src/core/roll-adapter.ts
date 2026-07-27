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

function sign(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function pushCheck(label: string, bonus: number, total: number, rawRoll: number): void {
  useRollStore.getState().addRoll({
    label,
    expression: `d20 ${sign(bonus)}`,
    total,
    components: [{ source: 'modifier', value: bonus }],
    mode: 'single',
    isCritical: rawRoll === 20,
    isCriticalMiss: rawRoll === 1,
  });
}

export function rollSkill(
  character: Character,
  skill: SkillName,
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterSkillCheck({ character, skill, rng });
  pushCheck(`Skill: ${skill}`, result.bonus, result.total, result.rawRoll);
  return result;
}

export function rollAbility(
  character: Character,
  ability: AbilityName,
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterAbilityCheck({ character, ability, rng });
  pushCheck(`Ability: ${ability}`, result.bonus, result.total, result.rawRoll);
  return result;
}

export function rollSave(
  character: Character,
  ability: AbilityName,
  dc = 0,
  rng: RandomProvider = defaultRandom,
) {
  const result = rollCharacterSavingThrow({ character, ability, dc, getClass, rng });
  pushCheck(`Save: ${ability}`, result.bonus, result.total, result.rawRoll);
  return result;
}

export function rollInitiative(character: Character, rng: RandomProvider = defaultRandom) {
  const result = rollCharacterInitiative({ character, rng });
  pushCheck('Initiative', result.bonus, result.total, result.rawRoll);
  return result;
}
