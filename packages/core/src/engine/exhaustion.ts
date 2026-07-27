// engine/exhaustion.ts
// Shared exhaustion helpers used across engine and rolls modules.
//
// D&D 2024 Exhaustion:
//   -2 × level to all d20 Tests (ability/skill/save/attack/initiative/spell-attack)
//   -5 ft × level to speed
//   Level 6 = death (display-only, handled by UI)

import type { ActiveCondition } from '@/types/character';

/**
 * Get the highest exhaustion level from the character's conditions.
 * Returns 0 if no Exhaustion condition is present.
 *
 * 2024 PHB: Exhaustion is a single condition with a level field (1–6).
 * If multiple entries exist (should not happen), the highest level is used.
 */
export function getExhaustionLevel(conditions: readonly ActiveCondition[]): number {
  let max = 0;
  for (const c of conditions) {
    if (c.id !== 'Exhaustion') continue;
    const lvl = c.level ?? 1;
    if (lvl > max) max = lvl;
  }
  return max;
}

/**
 * Return the d20 Test penalty for the current exhaustion level.
 * D&D 2024: −2 × level.
 */
export function getExhaustionD20Penalty(conditions: readonly ActiveCondition[]): number {
  return 2 * getExhaustionLevel(conditions);
}

/**
 * Return the speed penalty (in feet) for the current exhaustion level.
 * D&D 2024: −5 ft × level.
 */
export function getExhaustionSpeedPenalty(conditions: readonly ActiveCondition[]): number {
  return 5 * getExhaustionLevel(conditions);
}
