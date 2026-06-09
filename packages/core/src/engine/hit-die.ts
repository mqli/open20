// engine/hit-die.ts
// Hit die fixed value calculation — pure function
// Formula: floor(dieTypeValue / 2) + 1
// Examples: d6 → 4, d8 → 5, d10 → 6, d12 → 7

import type { DieType } from '../types/dice';

const DIE_TYPE_TO_VALUE: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

/**
 * Calculate the fixed value for a hit die type
 *
 * @param die - The hit die type (d4, d6, d8, d10, d12, d20)
 * @returns The fixed value (d4→3, d6→4, d8→5, d10→6, d12→7, d20→11)
 *
 * @example
 * getHitDieFixedValue('d6')   // 4
 * getHitDieFixedValue('d8')   // 5
 * getHitDieFixedValue('d12')  // 7
 */
export function getHitDieFixedValue(die: DieType): number {
  const dieValue = DIE_TYPE_TO_VALUE[die] ?? 6; // default to d6
  return Math.floor(dieValue / 2) + 1;
}
