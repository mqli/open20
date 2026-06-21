import { describe, it, expect } from 'vitest';
import { calculateAC } from 'open20-core/engine';
import type { AbilityScores, Feature } from 'open20-core';
import { createTestDepsForCreate } from '../create-test-loader';

const defaultScores: AbilityScores = {
  base: {
    Strength: 15,
    Dexterity: 14,
    Constitution: 14,
    Intelligence: 10,
    Wisdom: 13,
    Charisma: 8,
  },
  racialBonuses: {},
};

describe('calculateAC - SRD Data', () => {
  const noFeatures: Feature[] = [];
  const deps = createTestDepsForCreate({
    speciesId: 'Human',
    backgroundId: 'soldier',
    classId: 'Fighter',
  });

  it('uses SRD armor AC fields from the default loader', () => {
    const equip = [
      {
        id: 'leather-armor',
        name: 'Leather Armor',
        type: 'armor' as const,
        weight: 10,
        cost: { quantity: 10, unit: 'gp' },
        equipped: true,
      },
    ];

    // Debug: check armor data
    const armor = deps.armors?.['leather-armor'];
    console.log('Leather armor data:', JSON.stringify(armor, null, 2));
    console.log('dexBonus:', armor?.dexBonus);

    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    console.log('AC result:', result.ac, 'breakdown:', JSON.stringify(result.breakdown));
    expect(result.ac).toBe(13);
    expect(result.breakdown[0]!.source.value).toBe('leather-armor');
  });

  it('uses the equipped shield AC value from SRD data', () => {
    const equip = [
      {
        id: 'buckler',
        name: 'Buckler',
        type: 'armor' as const,
        weight: 2,
        cost: { quantity: 5, unit: 'gp' },
        equipped: true,
      },
    ];

    const result = calculateAC(defaultScores, equip, noFeatures, deps);
    expect(result.ac).toBe(13);
    expect(result.breakdown[1]!).toEqual({
      ac: 1,
      source: { type: 'shield', value: 'buckler' },
    });
  });
});
