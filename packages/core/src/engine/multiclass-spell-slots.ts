// engine/multiclass-spell-slots.ts
// Multiclass spell slots calculation — pure function
// D&D 5e 2024 rules: combine levels from spellcasting classes

/**
 * Multiclass spell slots table (constant data)
 * Key: total spellcasting level (1-20)
 * Value: { "1": count, "2": count, ... "9": count }
 */
const MULTICLASS_SPELL_SLOTS: Record<number, Record<number, number>> = {
  '1': { '1': 2, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '2': { '1': 3, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '3': { '1': 4, '2': 2, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '4': { '1': 4, '2': 3, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '5': { '1': 4, '2': 3, '3': 2, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '6': { '1': 4, '2': 3, '3': 3, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '7': { '1': 4, '2': 3, '3': 3, '4': 1, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '8': { '1': 4, '2': 3, '3': 3, '4': 2, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  '9': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1, '6': 0, '7': 0, '8': 0, '9': 0 },
  '10': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 0, '7': 0, '8': 0, '9': 0 },
  '11': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 0, '8': 0, '9': 0 },
  '12': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 0, '8': 0, '9': 0 },
  '13': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 0, '9': 0 },
  '14': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 0, '9': 0 },
  '15': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1, '9': 0 },
  '16': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1, '9': 0 },
  '17': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1, '9': 1 },
  '18': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 1, '7': 1, '8': 1, '9': 1 },
  '19': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 1, '8': 1, '9': 1 },
  '20': { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 2, '8': 1, '9': 1 },
};

function emptySlotRecord(): Record<number, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

/**
 * Get multiclass spell slots for a given total spellcasting level
 *
 * @param totalSpellcastingLevel - Total spellcasting level (sum of levels in spellcasting classes)
 * @returns Record mapping spell level (1-9) to number of slots
 *
 * @example
 * getMulticlassSpellSlots(1)  // { 1: 2, 2: 0, ... }
 * getMulticlassSpellSlots(3)  // { 1: 4, 2: 2, 3: 0, ... }
 */
export function getMulticlassSpellSlots(totalSpellcastingLevel: number): Record<number, number> {
  const slotsObj = MULTICLASS_SPELL_SLOTS[totalSpellcastingLevel];
  if (!slotsObj) return emptySlotRecord();
  return { ...slotsObj };
}
