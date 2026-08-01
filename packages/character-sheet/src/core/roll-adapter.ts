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
  getModifier,
  getTotalScore,
  getExhaustionD20Penalty,
  rollStoredAttack,
  rollStoredAttackDamage,
  type Character,
  type CharacterAttack,
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

// ── Weapon Attack (dual-roll) ──────────────────────────

/** Build a damage expression string from DamageRollResult entries (e.g. "1d8 + 1d6"). */
function buildDamageExpression(damageResult: {
  entries: readonly { count: number; die: number | string; type: string }[];
}): string {
  return damageResult.entries
    .map((e) => {
      const die = typeof e.die === 'string' ? e.die : `d${e.die}`;
      return `${e.count}${die}`;
    })
    .join(' + ');
}

/** Collect distinct damage types from DamageRollResult entries. */
function damageTypes(damageResult: { entries: readonly { type: string }[] }): string {
  const types = [...new Set(damageResult.entries.map((e) => e.type))];
  return types.join(' / ');
}

/**
 * Roll a weapon attack + damage in one dual-roll overlay.
 *
 * Calls core's `rollStoredAttack` and `rollStoredAttackDamage` (which internally
 * adapt `CharacterAttack → Weapon`), then pushes a `mode: 'weapon-attack'`
 * RollResult with attack + damage rows into the shared roll store.
 */
export function rollWeaponAttack(
  character: Character,
  attack: CharacterAttack,
  rollModifier: RollModifierType = 'none',
  rng: RandomProvider = defaultRandom,
): void {
  // 1. Attack roll
  const attackResult = rollStoredAttack({ character, attack, rollModifier, rng });

  // 2. Damage roll (crit dice doubling handled by core)
  const damageResult = rollStoredAttackDamage({
    character,
    attack,
    isCritical: attackResult.isCritical,
    rng,
  });

  // 3. Rebuild attack bonus components for display
  const ability = attack.abilityUsed ?? 'Strength';
  const abilityMod = getModifier(getTotalScore(character.abilityScores, ability));
  const pb = character.combatStats.proficiencyBonus;
  const exhaustionPenalty = getExhaustionD20Penalty(character.conditions);

  const attackComponents: Array<{ source: string; value: number }> = [
    { source: ability.substring(0, 3).toUpperCase(), value: abilityMod },
    { source: 'PB', value: pb },
  ];
  if (exhaustionPenalty > 0) {
    attackComponents.push({ source: 'Exhaustion', value: -exhaustionPenalty });
  }

  // 4. Labels
  let hitLabel = 'Attack';
  if (attackResult.isCritical) hitLabel = 'Critical Hit!';
  else if (attackResult.isCriticalFail) hitLabel = 'Critical Miss!';

  useRollStore.getState().addRoll({
    label: `Attack: ${attack.name}`,
    expression: '',
    total: damageResult.total,
    mode: 'weapon-attack',
    isCritical: attackResult.isCritical,
    isCriticalMiss: attackResult.isCriticalFail,
    rolls: attackResult.rolls,
    rows: [
      {
        label: `${hitLabel} (vs AC)`,
        expression: `d20 ${sign(attackResult.bonus)}`,
        total: attackResult.total,
        components: attackComponents,
      },
      {
        label: `Damage: ${damageTypes(damageResult)}`,
        expression: buildDamageExpression(damageResult),
        total: damageResult.total,
      },
    ],
  });
}
