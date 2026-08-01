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
  rollSpellAttack,
  rollSpellDamage,
  rollSpellHeal,
  type Character,
  type CharacterAttack,
  type AbilityName,
  type RandomProvider,
  type Spell,
  type SpellLevel,
} from 'open20-core';
import type { SkillName } from 'open20-core/types';
import { useRollStore } from '@open20/ui';
import type { RollResultRow } from '@open20/ui';
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

// ── Spell Cast Roll ─────────────────────────────────────

/**
 * Roll a spell cast: attack + damage + heal rows in one multi-row overlay.
 *
 * Handles four spell categories:
 * 1. Attack spells (spell.attack === true) — attack row + damage row
 * 2. Save spells with damage — damage row only (no attack roll)
 * 3. Save-only spells (no attack, no damage) — info row showing Save DC
 * 4. Heal spells — heal row
 *
 * Concentration is handled by the caller (store action).
 */
export function rollSpellCast(
  character: Character,
  spell: Spell,
  slotLevel: SpellLevel,
  castingClassId: string,
): void {
  const classData = character.spells.classSpellcasting[castingClassId];
  const spellcastingAbility: AbilityName = classData?.spellcastingAbility ?? 'Intelligence';
  const abilityMod = getModifier(getTotalScore(character.abilityScores, spellcastingAbility));
  const pb = character.combatStats.proficiencyBonus;
  const exhaustionPenalty = getExhaustionD20Penalty(character.conditions);
  const characterLevel = character.classes.reduce((sum, c) => sum + c.level, 0);

  const rows: RollResultRow[] = [];
  let total = 0;
  let isCritical = false;
  let isCriticalMiss = false;
  let rolls: readonly number[] | undefined;

  // 1. Attack row
  if (spell.attack) {
    const attackResult = rollSpellAttack({
      character,
      spellcastingAbility,
      rng: defaultRandom,
    });

    const attackBonus = abilityMod + pb - exhaustionPenalty;
    const attackComponents: Array<{ source: string; value: number }> = [
      { source: spellcastingAbility.substring(0, 3).toUpperCase(), value: abilityMod },
      { source: 'PB', value: pb },
    ];
    if (exhaustionPenalty > 0) {
      attackComponents.push({ source: 'Exhaustion', value: -exhaustionPenalty });
    }

    let hitLabel = 'Spell Attack';
    if (attackResult.isCritical) hitLabel = 'Critical Hit!';
    else if (attackResult.isCriticalFail) hitLabel = 'Critical Miss!';

    rows.push({
      label: `${hitLabel} (vs AC)`,
      expression: `d20 ${sign(attackBonus)}`,
      total: attackResult.total,
      components: attackComponents,
    });

    isCritical = attackResult.isCritical;
    isCriticalMiss = attackResult.isCriticalFail;
    rolls = attackResult.rolls;
  }

  // 2. Damage row (when spell has damage or is a cantrip with cantripUpgrade damage)
  const damageResult = rollSpellDamage({
    spell,
    slotLevel,
    isCritical,
    rng: defaultRandom,
    spellcastingModifier: abilityMod,
    characterLevel,
  });

  if (damageResult.entries.length > 0) {
    const dmgExpr = buildDamageExpression(damageResult);
    const dmgLabel = `Damage: ${damageTypes(damageResult)}`;
    rows.push({
      label: dmgLabel,
      expression: dmgExpr,
      total: damageResult.total,
    });
    total += damageResult.total;
  }

  // 3. Heal row
  if (spell.heal) {
    const healResult = rollSpellHeal({
      spell,
      slotLevel,
      rng: defaultRandom,
      spellcastingModifier: abilityMod,
    });

    if (healResult.total > 0 || healResult.expression) {
      rows.push({
        label: 'Healing',
        expression: healResult.expression || '',
        total: healResult.total,
      });
      total += healResult.total;
    }
  }

  // 4. Save-only spells (no attack, no damage, no heal — just a save DC info row)
  if (!spell.attack && !spell.damage && !spell.heal && spell.save) {
    const saveDC = classData?.spellSaveDC ?? 8 + abilityMod + pb;
    rows.push({
      label: `Save DC ${saveDC} (${spell.save})`,
      expression: '',
      total: 0,
    });
  }

  useRollStore.getState().addRoll({
    label: spell.name,
    expression: '',
    total,
    mode: 'weapon-attack',
    isCritical,
    isCriticalMiss,
    rolls,
    rows,
  });
}
