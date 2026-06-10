// src/spells/index.ts
// Barrel export for spell query functions

export type { SpellFilter } from './query';
export {
  getSpell,
  getSpell as getSpellData,
  searchSpells,
  getSpellsByClass,
  getKnownSpellsForClass,
  getSpellsForCharacter,
  getPreparedSpells,
  isSpellPrepared,
  knowsSpell,
  getClassSpellData,
  knowsSpellForClass,
  isSpellPreparedForClass,
  isClassListCaster,
  isSpellbookCaster,
  canChangeSpellsOnLongRest,
  canChangeSpellsOnLevelUp,
  canCastSpell,
} from './query';

export type { CasterType, SpellClassState, SlotAvailability } from './capabilities';
export {
  getCasterType,
  getCasterTypeForClass,
  getMatchingClassIds,
  getSpellClassStates,
  getAvailableSlots,
  canCastSpellWithSlots,
  getSpellAttackBonusForClass,
  getBestSpellAttackBonus,
  pickBestClassId,
} from './capabilities';

export { scaleDiceForUpcast, getScaledDamageEntries, getScaledHealDice } from './upcast';
