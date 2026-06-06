import { describe, it, expect } from 'vitest';
import { calculateAC } from 'open20-core/engine';
import type { Feature } from 'open20-core';
import { createTestLoader } from '../create-test-loader';

const defaultScores = {
  base: {
    Strength: 15,
    Dexterity: 14,
    Constitution: 14,
    Intelligence: 10,
    Wisdom: 13,
    Charisma: 8,
  },
};

describe('calculateAC - SRD Data', () => {
  const noFeatures: Feature[] = [];

  it('uses SRD armor AC fields from the default loader', () => {
    const equip = [
      {
        id: 'leather-armor',
        name: 'Leather Armor',
        type: 'armor' as const,
        weight: 10,
        cost: '10 gp',
        equipped: true,
      },
    ];
    const data = createTestLoader();

    // Debug: check armor data
    const armor = data.getArmor('leather-armor');
    console.log('Leather armor data:', JSON.stringify(armor, null, 2));
    console.log('dexBonus:', armor?.dexBonus);

    const result = calculateAC(defaultScores, equip, noFeatures, data);
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
        cost: '5 gp',
        equipped: true,
      },
    ];
    const data = createTestLoader();

    const result = calculateAC(defaultScores, equip, noFeatures, data);
    expect(result.ac).toBe(13);
    expect(result.breakdown[1]!).toEqual({
      ac: 1,
      source: { type: 'shield', value: 'buckler' },
    });
  });
});
