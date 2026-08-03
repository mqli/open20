// engine/index.ts
// Barrel export — engine 模块公共API

export { getModifier, getTotalScore } from './ability-modifier';
export {
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  POINT_BUY_COSTS,
  STANDARD_ARRAY,
  MANUAL_MIN,
  MANUAL_MAX,
  pointBuyCost,
  totalPointBuyCost,
  pointsRemaining,
  canIncrementPointBuy,
  canDecrementPointBuy,
  defaultScoresFor,
  isValidStandardArray,
  canSwapStandardArray,
  swapStandardArray,
  validateAbilityScores,
} from './point-buy';
export type { AbilityScoreMethod, Scores, ScoreValidation } from './point-buy';
export { getProficiencyBonus } from './proficiency-bonus';
export { getSkillBonus, getAllSkillBonuses } from './skill-bonus';
export { getSavingThrowBonus } from './saving-throw';
export { calculateAC } from './ac-calculator';
export { getHitDieFixedValue } from './hit-die';

export { calculateHPAtLevel1, calculateHPIncrement, calculateMaxHP } from './hp-calculator';
export {
  calculateSpellSlots,
  calculateSpellSlotsFromClasses,
  calculatePactMagic,
  getMulticlassSpellcasterLevel,
  calculateMulticlassSpellSlots,
} from './spell-slots';
export type { SpellSlotEntry, PactMagicResult } from './spell-slots';
export { calculateInitiative } from './initiative';
export { calculatePassivePerception } from './passive-perception';
export { calculateAttacks } from './attack-calculator';
export {
  getExhaustionLevel,
  getExhaustionD20Penalty,
  getExhaustionSpeedPenalty,
} from './exhaustion';
export {
  buildClassSpellData,
  getMaxSpellLevel,
  getAlwaysPreparedSpellsFromSubclass,
} from './spell-data';
export type { BuildClassSpellDataOpts } from './spell-data';

// ── Dice System (New Layered Architecture) ─────────────
// Import from dice/ folder
export {
  type RandomProvider,
  defaultRandom,
  createDeterministicRNG,
  type DieType,
  type DiceRollResult,
  rollDie,
  rollDice,
  rollWithAdvantage,
  rollWithDisadvantage,
  type RollModifier,
  rollD20WithModifier,
  type DiceTerm,
  type DiceExpression,
  parseDiceExpression,
  rollExpression,
  rollDiceExpression,
  isCriticalHit,
  isCriticalFail,
} from '../dice/core';

export {
  type RollResult,
  type CheckResult,
  type SkillCheckParams,
  type SavingThrowParams,
  type AttackRollParams,
  type AttackRollResult,
  type DamageRollParams,
  type DamageEntry,
  type DamageRollResult,
  type InitiativeRollParams,
  rollSkillCheck,
  rollSavingThrow,
  rollAttack,
  rollDamage,
  rollInitiative,
} from '../dice/mechanics';

// ── Combat Helpers ─────────────────────────────────────
export type { DamageResult, DamageDefenses } from '../types/damage';
export {
  applyHPChange,
  applyTypedDamageToHP,
  setTemporaryHPShared,
  isDefeatedShared,
  getCharacterCurrentHP,
  getCharacterMaxHP,
  getCharacterTemporaryHP,
  getMonsterCurrentHP,
  getMonsterMaxHP,
  getMonsterTemporaryHP,
  addDamageResistance,
  addDamageImmunity,
  addDamageVulnerability,
  emptyDefenses,
  mergeDefenses,
} from './combat';

// ── Concentration Management ────────────────────────
export {
  isConcentrating,
  getConcentratingSpellId,
  calculateConcentrationDC,
  type ConcentrationCheckResult,
} from './concentration';
