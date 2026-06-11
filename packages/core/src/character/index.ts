// character/index.ts
// Barrel export — character module public API

export { createCharacter, getAlwaysPreparedSpellsFromSubclass } from './create';
export type { CreateCharacterParams } from './create';

export { levelUp } from './level-up';
export type { LevelUpOptions } from './level-up';
export type { RandomProvider } from './level-up';

export { shortRest, longRest } from './rest';

export {
  modifyHP,
  setTemporaryHP,
  applyTypedDamage,
  consumeResource,
  recoverResource,
  consumeSpellSlot,
  recoverSpellSlot,
  toggleCondition,
  startConcentration,
  endConcentration,
  makeConcentrationCheck,
  toggleActiveEffect,
  addAlwaysPreparedSpell,
  removeAlwaysPreparedSpell,
  addKnownSpell,
  removeKnownSpell,
  equipItem,
  unequipItem,
  equipItemAndRecompute,
  unequipItemAndRecompute,
  addEquipment,
  removeEquipment,
  prepareSpellForClass,
  unprepareSpellForClass,
  learnCantripForClass,
  replaceCantripForClass,
  modifyCurrency,
} from './mutate';

export { validateCharacter } from './validate';
export type { ValidationError, ValidationResult } from './validate';

export { recomputeDerivedStats } from './recompute';

// ── Spell Casting ──────────────────────────────
export {
  canCastAsRitual,
  castAsRitual,
  getRitualCastingTime,
  normalizeCastingTime,
  isCantrip,
  canCastCantrip,
  canUpcast,
  getUpcastDescription,
  getAvailableCastLevels,
  castSpell,
} from './spell-casting';

// HP Accessor Helpers (for API consistency with monster module)
export {
  getCharacterCurrentHP,
  getCharacterMaxHP,
  getCharacterTemporaryHP,
} from '../engine/combat';
