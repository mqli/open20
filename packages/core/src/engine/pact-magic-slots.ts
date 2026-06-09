// engine/pact-magic-slots.ts
// Pact Magic slots — read from Warlock class data

import type { Class } from '../types/class';

/**
 * Get Pact Magic slots for a given Warlock level
 *
 * Reads from the Warlock class's `spellcasting.pactMagicSlots` field.
 *
 * @param warlockLevel - Warlock level (1-20)
 * @param warlockClass - Warlock Class object (with pactMagicSlots baked in)
 * @returns Pact Magic info, or null if not a Warlock or no Pact Magic
 *
 * @example
 * // Assuming you have the Warlock class object
 * getPactMagicSlots(1, warlockClass)  // { slots: 1, slotLevel: 1 }
 * getPactMagicSlots(5, warlockClass)  // { slots: 2, slotLevel: 3 }
 */
export function getPactMagicSlots(
  warlockLevel: number,
  warlockClass: Class,
): { slots: number; slotLevel: number } | null {
  if (warlockLevel < 1) return null;
  if (!warlockClass?.spellcasting?.pactMagic) return null;

  const slotsData = warlockClass.spellcasting.pactMagicSlots?.[warlockLevel];
  if (!slotsData) return null;

  return {
    slots: slotsData.slots,
    slotLevel: slotsData.slotLevel,
  };
}
