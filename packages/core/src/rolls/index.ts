// rolls/index.ts
// Layer 4: Application — Barrel export for roll functions

// Character roll functions
export {
  type CharacterSkillCheckParams,
  type CharacterSavingThrowParams,
  type CharacterAttackParams,
  type CharacterWeaponDamageParams,
  type SpellAttackParams,
  type SpellDamageParams,
  type SpellHealParams,
  type SpellHealRollResult,
  type CharacterInitiativeParams,
  rollCharacterSkillCheck,
  rollCharacterSavingThrow,
  rollCharacterAttack,
  rollCharacterWeaponDamage,
  rollSpellAttack,
  rollSpellDamage,
  rollSpellHeal,
  rollCharacterInitiative,
} from './character';

// Monster roll functions
export {
  type MonsterAttackParams,
  type MonsterDamageParams,
  type MonsterFullAttackParams,
  type MonsterInitiativeParams,
  rollMonsterAttack,
  rollMonsterDamage,
  rollMonsterAttackDamage,
  rollMonsterFullAttack,
  rollMonsterInitiative,
} from './monster';
