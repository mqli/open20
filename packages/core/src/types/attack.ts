// types/attack.ts
// Base attack interface — shared between Character and Monster

import type { DamageType, DamageEntry } from './damage';
import type { AbilityName } from './ability';

/**
 * Base attack interface
 * Shared properties between Character attacks and Monster attacks
 */
export interface BaseAttack {
  readonly name: string;
  readonly attackBonus?: number; // Optional: can be calculated from ability + proficiency
  readonly damage?: string; // Optional: not all attacks deal damage (e.g., Grapple)
  readonly damageType?: DamageType; // Optional: matches damage optionality
  readonly damageEntries?: readonly DamageEntry[]; // Structured damage (supports multiple damage types)
  /** The ability used for attack & damage rolls (e.g. 'Strength' or 'Dexterity' for Finesse weapons). */
  readonly abilityUsed?: AbilityName;
}
