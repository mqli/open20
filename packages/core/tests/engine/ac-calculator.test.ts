// tests/engine/ac-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateAC } from '../../src/engine/ac-calculator';
import type { Feature } from '../../src/types/class';
import { createAbilityScores } from '../fixtures/ability-scores';
import { createMockDeps } from '../fixtures/data-loader';
import { LEATHER_ARMOR, CHAIN_MAIL, HALF_PLATE, SHIELD } from '../fixtures/equipment';

// ── Test Data ──────────────────────────────────────

const defaultScores = createAbilityScores({
  Strength: 15,
  Dexterity: 14,
  Constitution: 14,
  Intelligence: 10,
  Wisdom: 13,
  Charisma: 8,
});

// ── Tests ──────────────────────────────────────────

describe('calculateAC', () => {
  const noFeatures: Feature[] = [];

  it('unarmored = 10 + Dex', () => {
    const deps = createMockDeps();
    // Dex 14 → +2
    const result = calculateAC(defaultScores, [], noFeatures, deps);
    expect(result.ac).toBe(12);
    expect(result.breakdown[0]!.source.type).toBe('Unarmored');
    expect(result.breakdown[0]!.source.value).toContain('10 + Dex');
  });

  it('light armor = armor AC + Dex', () => {
    const equip = [
      {
        id: 'Leather Armor',
        name: 'Leather Armor',
        type: 'armor' as const,
        weight: 10,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Leather Armor': LEATHER_ARMOR },
    });
    // 11 + 2(Dex) = 13
    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    expect(result.ac).toBe(13);
    expect(result.breakdown[0]!.source.type).toBe('Armor');
    expect(result.breakdown[0]!.source.value).toContain('Leather Armor');
  });

  it('heavy armor = armor AC only (no Dex)', () => {
    const equip = [
      {
        id: 'Chain Mail',
        name: 'Chain Mail',
        type: 'armor' as const,
        weight: 55,
        cost: '75 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Chain Mail': CHAIN_MAIL },
    });
    // 16 (no Dex bonus)
    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    expect(result.ac).toBe(16);
    expect(result.breakdown[0]!.source.type).toBe('Armor');
    expect(result.breakdown[0]!.source.value).toContain('Chain Mail');
  });

  it('medium armor = armor AC + min(Dex, +2)', () => {
    const equip = [
      {
        id: 'Half Plate',
        name: 'Half Plate',
        type: 'armor' as const,
        weight: 40,
        cost: '750 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Half Plate': HALF_PLATE },
    });
    // Dex +2, cap +2 → 15 + 2 = 17
    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    expect(result.ac).toBe(17);
    expect(result.breakdown[0]!.source.value).toBe('Half Plate');
  });

  it('medium armor caps Dex at +2 even if Dex is higher', () => {
    const highDex = createAbilityScores({
      Strength: 15,
      Dexterity: 20,
      Constitution: 14,
      Intelligence: 10,
      Wisdom: 13,
      Charisma: 8,
    });
    const equip = [
      {
        id: 'Half Plate',
        name: 'Half Plate',
        type: 'armor' as const,
        weight: 40,
        cost: '750 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Half Plate': HALF_PLATE },
    });
    // 15 + min(5, 2) = 17 (not 20)
    const result = calculateAC(highDex, equip, noFeatures, deps);
    expect(result.ac).toBe(17);
    expect(result.breakdown[0]!.source.value).toBe('Half Plate');
  });

  it('shield adds +2 to any armor', () => {
    const equip = [
      {
        id: 'Chain Mail',
        name: 'Chain Mail',
        type: 'armor' as const,
        weight: 55,
        cost: '75 gp',
        equipped: true,
      },
      {
        id: 'Shield',
        name: 'Shield',
        type: 'armor' as const,
        weight: 6,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Chain Mail': CHAIN_MAIL, Shield: SHIELD },
    });
    // 16 + 2 = 18
    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    expect(result.ac).toBe(18);
    expect(result.breakdown[0]!.source.value).toBe('Chain Mail');
    expect(result.breakdown[1]!).toEqual({
      ac: 2,
      source: { type: 'shield', value: 'Shield' },
    });
  });

  it('Barbarian Unarmored Defense = 10 + Dex + Con', () => {
    const features: Feature[] = [
      {
        name: 'Unarmored Defense',
        description: '',
        featureType: 'acFormula',
        acFormula: {
          baseAC: 10,
          addModifiers: ['Dexterity', 'Constitution'],
          requires: ['noArmor'],
        },
      },
    ];
    const deps = createMockDeps();
    // Dex +2, Con +2 → 10 + 2 + 2 = 14
    const result = calculateAC(defaultScores, [], features, deps);
    expect(result.ac).toBe(14);
    expect(result.breakdown[0]!.source.value).toBe('Unarmored Defense');
  });

  it('Monk Unarmored Defense = 10 + Dex + Wis', () => {
    const features: Feature[] = [
      {
        name: 'Unarmored Defense',
        description: '',
        featureType: 'acFormula',
        acFormula: {
          baseAC: 10,
          addModifiers: ['Dexterity', 'Wisdom'],
          requires: ['noArmor', 'noShield'],
        },
      },
    ];
    const deps = createMockDeps();
    // Dex +2, Wis +1 → 10 + 2 + 1 = 13
    const result = calculateAC(defaultScores, [], features, deps);
    expect(result.ac).toBe(13);
    expect(result.breakdown[0]!.source.value).toBe('Unarmored Defense');
  });

  it('Barbarian UD works WITH shield (requires noArmor only)', () => {
    const features: Feature[] = [
      {
        name: 'Unarmored Defense',
        description: '',
        featureType: 'acFormula',
        acFormula: {
          baseAC: 10,
          addModifiers: ['Dexterity', 'Constitution'],
          requires: ['noArmor'],
        },
      },
    ];
    const equip = [
      {
        id: 'Shield',
        name: 'Shield',
        type: 'armor' as const,
        weight: 6,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { Shield: SHIELD },
    });
    // UD: 10+2+2=14, Shield +2 → 16
    const result = calculateAC(defaultScores, equip, features, deps);
    expect(result.ac).toBe(16);
    expect(result.breakdown[0]!.source.value).toBe('Unarmored Defense');
    // expect(result.bonuses).toContainEqual({ ac: 2, source: 'Shield' });
  });

  it('Monk UD blocked by shield (requires noShield)', () => {
    const features: Feature[] = [
      {
        name: 'Unarmored Defense',
        description: '',
        featureType: 'acFormula',
        acFormula: {
          baseAC: 10,
          addModifiers: ['Dexterity', 'Wisdom'],
          requires: ['noArmor', 'noShield'],
        },
      },
    ];
    const equip = [
      {
        id: 'Shield',
        name: 'Shield',
        type: 'armor' as const,
        weight: 6,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { Shield: SHIELD },
    });
    // UD blocked, unarmored 10+2=12, Shield +2 → 14
    const result = calculateAC(defaultScores, equip, features, deps);
    expect(result.ac).toBe(14);
    expect(result.breakdown[0]!.source.type).toContain('Unarmored');
    // expect(result.bonuses).toContainEqual({ ac: 2, source: 'Shield' });
  });

  it('UD blocked by armor (requires noArmor)', () => {
    const features: Feature[] = [
      {
        name: 'Unarmored Defense',
        description: '',
        featureType: 'acFormula',
        acFormula: {
          baseAC: 10,
          addModifiers: ['Dexterity', 'Constitution'],
          requires: ['noArmor'],
        },
      },
    ];
    const equip = [
      {
        id: 'Leather Armor',
        name: 'Leather Armor',
        type: 'armor' as const,
        weight: 10,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Leather Armor': LEATHER_ARMOR },
    });
    // UD blocked, Leather 11+2=13
    const result = calculateAC(defaultScores, equip, features, deps);
    expect(result.ac).toBe(13);
    expect(result.breakdown[0]!.source.value).toBe('Leather Armor');
  });

  it('Barbarian Unarmored Defense does not stack with armor (takes highest)', () => {
    const features: Feature[] = [{ name: 'Unarmored Defense', description: '' }];
    const equip = [
      {
        id: 'Chain Mail',
        name: 'Chain Mail',
        type: 'armor' as const,
        weight: 55,
        cost: '75 gp',
        equipped: true,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Chain Mail': CHAIN_MAIL },
    });
    // Unarmored: 10+2+2=14, Chain Mail: 16 → takes 16
    const result = calculateAC(defaultScores, equip, features, deps);
    expect(result.ac).toBe(16);
    expect(result.breakdown[0]!.source.value).toBe('Chain Mail');
  });

  it('unequipped armor does not count', () => {
    const equip = [
      {
        id: 'Chain Mail',
        name: 'Chain Mail',
        type: 'armor' as const,
        weight: 55,
        cost: '75 gp',
        equipped: false,
      },
    ];
    const deps = createMockDeps({
      armors: { 'Chain Mail': CHAIN_MAIL },
    });
    // No armor equipped → falls back to unarmored 10+2=12
    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    expect(result.ac).toBe(12);
    expect(result.breakdown[0]!.source.type).toContain('Unarmored');
  });

  // Test: Mage Armor (via conditions)
  it('should apply Mage Armor AC when condition is present', () => {
    const scores = createAbilityScores({
      Strength: 10,
      Dexterity: 16,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10,
    });
    const equip: {
      id: string;
      name: string;
      type: 'armor';
      weight: number;
      cost: string;
      equipped: boolean;
    }[] = [];
    const features: readonly Feature[] = [];
    const conditions = [
      { id: 'mage-armor', source: 'Mage Armor', appliedAt: '2024-01-01T00:00:00.000Z' },
    ];
    const deps = createMockDeps();

    // Mage Armor: 13 + Dex mod (3) = 16
    const result = calculateAC(scores, equip, features, deps, conditions);
    expect(result.ac).toBe(16);
    expect(result.breakdown[0]!.source.type).toContain('Spell');
  });

  it('should not apply Mage Armor while wearing armor', () => {
    const scores = createAbilityScores({
      Strength: 10,
      Dexterity: 16,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10,
    });
    const equip = [
      {
        id: 'Leather Armor',
        name: 'Leather Armor',
        type: 'armor' as const,
        weight: 10,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const conditions = [
      { id: 'mage-armor', source: 'Mage Armor', appliedAt: '2024-01-01T00:00:00.000Z' },
    ];
    const deps = createMockDeps({
      armors: { 'Leather Armor': LEATHER_ARMOR },
    });

    const result = calculateAC(scores, equip, noFeatures, deps, conditions);
    expect(result.ac).toBe(14);
    expect(result.breakdown[0]!.source.value).toBe('Leather Armor');
  });

  it('should not apply Mage Armor AC when condition is absent', () => {
    const scores = createAbilityScores({
      Strength: 10,
      Dexterity: 16,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10,
    });
    const equip: {
      id: string;
      name: string;
      type: 'armor';
      weight: number;
      cost: string;
      equipped: boolean;
    }[] = [];
    const features: readonly Feature[] = [];
    const conditions: { id: string; source: string; appliedAt: string }[] = [];
    const deps = createMockDeps();

    // No Mage Armor → unarmored 10 + 3 = 13
    const result = calculateAC(scores, equip, features, deps, conditions);
    expect(result.ac).toBe(13);
    expect(result.breakdown[0]!.source.type).toContain('Unarmored');
  });
});
