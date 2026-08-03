import { describe, it, expect } from 'vitest';
import type { AbilityName } from '../../src/types/ability';
import {
  POINT_BUY_BUDGET,
  POINT_BUY_COSTS,
  STANDARD_ARRAY,
  canDecrementPointBuy,
  canIncrementPointBuy,
  canSwapStandardArray,
  defaultScoresFor,
  isValidStandardArray,
  pointBuyCost,
  pointsRemaining,
  swapStandardArray,
  totalPointBuyCost,
  validateAbilityScores,
  type Scores,
} from '../../src/engine/point-buy';

function scores(overrides: Partial<Record<AbilityName, number>> = {}, base = 8): Scores {
  return {
    Strength: base,
    Dexterity: base,
    Constitution: base,
    Intelligence: base,
    Wisdom: base,
    Charisma: base,
    ...overrides,
  };
}

describe('point-buy cost table', () => {
  it('matches the 2024 PHB costs', () => {
    expect(POINT_BUY_COSTS).toEqual({ 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 });
  });

  it('returns null for scores outside the purchasable range', () => {
    expect(pointBuyCost(7)).toBeNull();
    expect(pointBuyCost(16)).toBeNull();
  });

  it('all-8s costs nothing and leaves the full budget', () => {
    expect(totalPointBuyCost(scores())).toBe(0);
    expect(pointsRemaining(scores())).toBe(POINT_BUY_BUDGET);
  });

  it('the standard array costs exactly the point-buy budget', () => {
    const arrayScores = scores({
      Strength: 15,
      Dexterity: 14,
      Constitution: 13,
      Intelligence: 12,
      Wisdom: 10,
      Charisma: 8,
    });
    expect(totalPointBuyCost(arrayScores)).toBe(POINT_BUY_BUDGET);
    expect(pointsRemaining(arrayScores)).toBe(0);
  });

  it('treats unpurchasable scores as infinitely expensive', () => {
    expect(totalPointBuyCost(scores({ Strength: 18 }))).toBe(Infinity);
  });
});

describe('point-buy increment / decrement gating', () => {
  it('cannot increment past 15', () => {
    expect(canIncrementPointBuy(scores({ Strength: 15 }), 'Strength')).toBe(false);
  });

  it('cannot increment when the next step costs more than the points left', () => {
    // 15 (9) + 15 (9) + 13 (5) + 8 + 8 + 8 = 23 spent, 4 remaining.
    // Bumping the 13 → 14 costs 2, which is affordable.
    const affordable = scores({ Strength: 15, Dexterity: 15, Constitution: 13 });
    expect(pointsRemaining(affordable)).toBe(4);
    expect(canIncrementPointBuy(affordable, 'Constitution')).toBe(true);

    // 15 (9) + 15 (9) + 14 (7) + 9 (1) + 8 + 8 = 26 spent, 1 remaining.
    const tight = scores({ Strength: 15, Dexterity: 15, Constitution: 14, Intelligence: 9 });
    expect(pointsRemaining(tight)).toBe(1);
    expect(canIncrementPointBuy(tight, 'Constitution')).toBe(false); // 14 → 15 costs 2
    expect(canIncrementPointBuy(tight, 'Intelligence')).toBe(true); // 9 → 10 costs 1
  });

  it('cannot decrement below 8', () => {
    expect(canDecrementPointBuy(scores(), 'Strength')).toBe(false);
    expect(canDecrementPointBuy(scores({ Strength: 9 }), 'Strength')).toBe(true);
  });
});

describe('validateAbilityScores', () => {
  it('rejects an over-budget point-buy spread', () => {
    const allFifteens = scores({}, 15);
    const result = validateAbilityScores('point-buy', allFifteens);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/budget exceeded/i);
  });

  it('accepts an under-budget point-buy spread (leftover points are legal)', () => {
    expect(validateAbilityScores('point-buy', scores()).valid).toBe(true);
  });

  it('rejects point-buy scores outside 8–15', () => {
    expect(validateAbilityScores('point-buy', scores({ Strength: 16 })).valid).toBe(false);
  });

  it('validates the standard array regardless of assignment order', () => {
    const shuffled = scores({
      Strength: 8,
      Dexterity: 15,
      Constitution: 10,
      Intelligence: 14,
      Wisdom: 12,
      Charisma: 13,
    });
    expect(validateAbilityScores('standard-array', shuffled).valid).toBe(true);
  });

  it('rejects a standard array with a duplicated value', () => {
    const duplicated = scores({
      Strength: 15,
      Dexterity: 15,
      Constitution: 13,
      Intelligence: 12,
      Wisdom: 10,
      Charisma: 8,
    });
    expect(isValidStandardArray(duplicated)).toBe(false);
    expect(validateAbilityScores('standard-array', duplicated).valid).toBe(false);
  });

  it('accepts manual scores 1–20 and rejects anything outside', () => {
    expect(validateAbilityScores('manual', scores({ Strength: 20 }, 10)).valid).toBe(true);
    expect(validateAbilityScores('manual', scores({ Strength: 21 }, 10)).valid).toBe(false);
    expect(validateAbilityScores('manual', scores({ Strength: 0 }, 10)).valid).toBe(false);
  });

  it('rejects non-integer scores', () => {
    expect(validateAbilityScores('manual', scores({ Strength: 12.5 }, 10)).valid).toBe(false);
  });
});

describe('standard array swapping', () => {
  const base = defaultScoresFor('standard-array');

  it('starts as a valid standard array', () => {
    expect(isValidStandardArray(base)).toBe(true);
    expect(base.Strength).toBe(15);
    expect(base.Charisma).toBe(8);
  });

  it('swaps with the ability holding the adjacent value', () => {
    // Dexterity holds 14; stepping up swaps it with Strength's 15.
    const next = swapStandardArray(base, 'Dexterity', 1);
    expect(next.Dexterity).toBe(15);
    expect(next.Strength).toBe(14);
    expect(isValidStandardArray(next)).toBe(true);
  });

  it('preserves the multiset through repeated swaps', () => {
    let current = base;
    current = swapStandardArray(current, 'Charisma', 1);
    current = swapStandardArray(current, 'Charisma', 1);
    current = swapStandardArray(current, 'Wisdom', -1);
    expect(isValidStandardArray(current)).toBe(true);
  });

  it('is guarded at the extremes', () => {
    expect(canSwapStandardArray(base, 'Strength', 1)).toBe(false); // already the highest
    expect(canSwapStandardArray(base, 'Charisma', -1)).toBe(false); // already the lowest
    expect(swapStandardArray(base, 'Strength', 1)).toBe(base); // no-op returns the same object
  });
});

describe('defaultScoresFor', () => {
  it('point-buy starts at all 8s', () => {
    expect(Object.values(defaultScoresFor('point-buy'))).toEqual([8, 8, 8, 8, 8, 8]);
  });

  it('standard-array hands out each array value once', () => {
    expect(isValidStandardArray(defaultScoresFor('standard-array'))).toBe(true);
    expect(STANDARD_ARRAY).toEqual([15, 14, 13, 12, 10, 8]);
  });

  it('manual starts at all 10s', () => {
    expect(Object.values(defaultScoresFor('manual'))).toEqual([10, 10, 10, 10, 10, 10]);
  });
});
