// point-buy.ts (T-120)
// Pure ability-score-generation helpers for the character create wizard.
// No React, no content pack, no core mutations — just the 2024 PHB tables and
// the validators the wizard uses to gate its Finish button.

import { ABILITY_NAMES } from 'open20-core/types';
import type { AbilityName } from 'open20-core';

/** How the player is assigning their six base scores. */
export type AbilityScoreMethod = 'point-buy' | 'standard-array' | 'manual';

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

/** 2024 PHB point-buy cost table. Scores outside 8–15 are not purchasable. */
export const POINT_BUY_COSTS: Readonly<Record<number, number>> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const STANDARD_ARRAY: readonly number[] = [15, 14, 13, 12, 10, 8];

export const MANUAL_MIN = 1;
export const MANUAL_MAX = 20;

export type Scores = Record<AbilityName, number>;

/** Point cost of a single score, or null when it is outside the purchasable range. */
export function pointBuyCost(score: number): number | null {
  return POINT_BUY_COSTS[score] ?? null;
}

/** Total points spent. `Infinity` when any score is unpurchasable. */
export function totalPointBuyCost(scores: Scores): number {
  let total = 0;
  for (const ability of ABILITY_NAMES) {
    const cost = pointBuyCost(scores[ability]);
    if (cost === null) return Infinity;
    total += cost;
  }
  return total;
}

export function pointsRemaining(scores: Scores): number {
  return POINT_BUY_BUDGET - totalPointBuyCost(scores);
}

export function canIncrementPointBuy(scores: Scores, ability: AbilityName): boolean {
  const current = scores[ability];
  if (current >= POINT_BUY_MAX) return false;
  const currentCost = pointBuyCost(current);
  const nextCost = pointBuyCost(current + 1);
  if (currentCost === null || nextCost === null) return false;
  return nextCost - currentCost <= pointsRemaining(scores);
}

export function canDecrementPointBuy(scores: Scores, ability: AbilityName): boolean {
  return scores[ability] > POINT_BUY_MIN;
}

function fill(value: number): Scores {
  return ABILITY_NAMES.reduce((acc, ability) => {
    acc[ability] = value;
    return acc;
  }, {} as Scores);
}

/** Starting scores when the player picks (or switches to) a method. */
export function defaultScoresFor(method: AbilityScoreMethod): Scores {
  if (method === 'point-buy') return fill(POINT_BUY_MIN);
  if (method === 'manual') return fill(10);
  // standard-array: hand out the array in ABILITY_NAMES order.
  return ABILITY_NAMES.reduce((acc, ability, i) => {
    acc[ability] = STANDARD_ARRAY[i];
    return acc;
  }, {} as Scores);
}

/** True when `scores` is exactly the standard array (order-independent). */
export function isValidStandardArray(scores: Scores): boolean {
  const sortDesc = (a: number, b: number) => b - a;
  const actual = ABILITY_NAMES.map((a) => scores[a]).sort(sortDesc);
  const expected = [...STANDARD_ARRAY].sort(sortDesc);
  return actual.every((value, i) => value === expected[i]);
}

/**
 * Find the ability holding the value adjacent to `ability`'s in the given
 * direction — the swap partner that keeps the array multiset intact.
 */
function findSwapPartner(
  scores: Scores,
  ability: AbilityName,
  dir: 1 | -1,
): AbilityName | undefined {
  const current = scores[ability];
  const candidates = ABILITY_NAMES.filter(
    (a) => a !== ability && (dir === 1 ? scores[a] > current : scores[a] < current),
  );
  if (candidates.length === 0) return undefined;
  // Closest value in that direction.
  return candidates.reduce((best, a) =>
    Math.abs(scores[a] - current) < Math.abs(scores[best] - current) ? a : best,
  );
}

export function canSwapStandardArray(scores: Scores, ability: AbilityName, dir: 1 | -1): boolean {
  return findSwapPartner(scores, ability, dir) !== undefined;
}

/**
 * Move `ability` one step up/down the standard array by SWAPPING with whichever
 * ability holds the adjacent value. Guarantees the multiset stays exact.
 * No-op when there is no partner in that direction.
 */
export function swapStandardArray(scores: Scores, ability: AbilityName, dir: 1 | -1): Scores {
  const partner = findSwapPartner(scores, ability, dir);
  if (!partner) return scores;
  return { ...scores, [ability]: scores[partner], [partner]: scores[ability] };
}

export interface ScoreValidation {
  valid: boolean;
  errors: string[];
}

export function validateAbilityScores(method: AbilityScoreMethod, scores: Scores): ScoreValidation {
  const errors: string[] = [];

  const nonInteger = ABILITY_NAMES.filter((a) => !Number.isInteger(scores[a]));
  if (nonInteger.length > 0) {
    errors.push('All ability scores must be whole numbers.');
    return { valid: false, errors };
  }

  if (method === 'point-buy') {
    const outOfRange = ABILITY_NAMES.filter(
      (a) => scores[a] < POINT_BUY_MIN || scores[a] > POINT_BUY_MAX,
    );
    if (outOfRange.length > 0) {
      errors.push(`Point buy scores must be between ${POINT_BUY_MIN} and ${POINT_BUY_MAX}.`);
    }
    // Leftover points are legal by RAW — only overspending is an error.
    if (pointsRemaining(scores) < 0) {
      errors.push(`Point buy budget exceeded — you may spend at most ${POINT_BUY_BUDGET} points.`);
    }
  } else if (method === 'standard-array') {
    if (!isValidStandardArray(scores)) {
      errors.push(`Scores must use each standard array value: ${STANDARD_ARRAY.join(', ')}.`);
    }
  } else {
    const outOfRange = ABILITY_NAMES.filter(
      (a) => scores[a] < MANUAL_MIN || scores[a] > MANUAL_MAX,
    );
    if (outOfRange.length > 0) {
      errors.push(`Ability scores must be between ${MANUAL_MIN} and ${MANUAL_MAX}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
