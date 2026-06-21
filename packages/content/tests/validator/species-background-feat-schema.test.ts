import { describe, it, expect } from 'vitest';
import { SpeciesSchema, BackgroundSchema, FeatSchema } from '../../src/validator/schemas';
import type { Species, Background, Feat } from 'open20-core';

function makeValidSpecies(overrides: Partial<Species> = {}): Species {
  return {
    id: 'dwarf',
    source: 'SRD 5.2',
    description: 'Dwarves are short and stout.',
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Dwarvish'],
    abilityBonuses: { CON: 2 },
    baseTraits: [{ name: 'Darkvision', description: 'Accustomed to life underground.' }],
    ...overrides,
  };
}

function makeValidBackground(overrides: Partial<Background> = {}): Background {
  return {
    id: 'acolyte',
    source: 'SRD 5.2',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: [],
    languages: [],
    originFeatId: 'magic-initiate',
    startingGold: 50,
    ...overrides,
  };
}

function makeValidFeat(overrides: Partial<Feat> = {}): Feat {
  return {
    id: 'alert',
    source: 'SRD 5.2',
    description: 'Always on the lookout for danger.',
    category: 'Origin',
    ...overrides,
  };
}

describe('SpeciesSchema', () => {
  it('validates a valid species', () => {
    const result = SpeciesSchema.safeParse(makeValidSpecies());
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = SpeciesSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('source');
      expect(paths).toContain('description');
    }
  });

  it('rejects empty id', () => {
    const result = SpeciesSchema.safeParse(makeValidSpecies({ id: '' }));
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode)', () => {
    const result = SpeciesSchema.safeParse(
      makeValidSpecies({ extraField: 1 } as unknown as Species),
    );
    expect(result.success).toBe(false);
  });

  it('accepts species with optional fields', () => {
    const species = makeValidSpecies({
      darkvision: 60,
      subtypes: [
        {
          id: 'hill-dwarf',
          name: 'Hill Dwarf',
          description: 'Hill dwarves have keen senses.',
          traits: [{ name: 'Dwarven Toughness', description: '+1 HP per level.' }],
        },
      ],
    });
    const result = SpeciesSchema.safeParse(species);
    expect(result.success).toBe(true);
  });

  it('rejects invalid size', () => {
    const result = SpeciesSchema.safeParse(makeValidSpecies({ size: 'Tiny' as Species['size'] }));
    expect(result.success).toBe(false);
  });

  it('accepts traits with grants', () => {
    const species = makeValidSpecies({
      baseTraits: [
        {
          name: 'Dwarven Resilience',
          description: 'You have resistance to poison damage.',
          grants: {
            damageResistances: ['poison'],
            toolProficiencies: ["Brewer's Supplies"],
          },
        },
      ],
    });
    const result = SpeciesSchema.safeParse(species);
    expect(result.success).toBe(true);
  });
});

describe('BackgroundSchema', () => {
  it('validates a valid background', () => {
    const result = BackgroundSchema.safeParse(makeValidBackground());
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = BackgroundSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('source');
      expect(paths).toContain('originFeatId');
    }
  });

  it('rejects empty id', () => {
    const result = BackgroundSchema.safeParse(makeValidBackground({ id: '' }));
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode)', () => {
    const result = BackgroundSchema.safeParse(
      makeValidBackground({ extraField: 1 } as unknown as Background),
    );
    expect(result.success).toBe(false);
  });

  it('accepts background with optional fields', () => {
    const bg = makeValidBackground({
      name: 'Acolyte',
      description: 'You served in a temple.',
      startingEquipment: [{ id: 'holy-symbol', name: 'Holy Symbol', quantity: 1 }],
    });
    const result = BackgroundSchema.safeParse(bg);
    expect(result.success).toBe(true);
  });
});

describe('FeatSchema', () => {
  it('validates a valid feat', () => {
    const result = FeatSchema.safeParse(makeValidFeat());
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = FeatSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('source');
      expect(paths).toContain('description');
    }
  });

  it('rejects empty id', () => {
    const result = FeatSchema.safeParse(makeValidFeat({ id: '' }));
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode)', () => {
    const result = FeatSchema.safeParse(makeValidFeat({ extraField: 1 } as unknown as Feat));
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = FeatSchema.safeParse(makeValidFeat({ category: 'Invalid' as Feat['category'] }));
    expect(result.success).toBe(false);
  });

  it('accepts feat with prerequisites', () => {
    const feat = makeValidFeat({
      prerequisites: { level: 4 },
    });
    const result = FeatSchema.safeParse(feat);
    expect(result.success).toBe(true);
  });

  it('accepts feat with abilityBonus grants', () => {
    const feat = makeValidFeat({
      grants: [{ type: 'abilityBonus', bonus: { STR: 2 } }],
    });
    const result = FeatSchema.safeParse(feat);
    expect(result.success).toBe(true);
  });

  it('accepts feat with skillProficiencies grants', () => {
    const feat = makeValidFeat({
      grants: [{ type: 'skillProficiencies', skills: ['Athletics', 'Perception'] }],
    });
    const result = FeatSchema.safeParse(feat);
    expect(result.success).toBe(true);
  });

  it('accepts feat with spellChoices grants', () => {
    const feat = makeValidFeat({
      grants: [
        {
          type: 'spellChoices',
          choices: [
            {
              id: 'cantrips',
              classOptions: ['Wizard'],
              spellLevel: 0,
              count: 2,
            },
            {
              id: 'level1',
              classOptions: ['Wizard'],
              spellLevel: 1,
              count: 1,
              oncePerLongRest: true,
            },
          ],
        },
      ],
    });
    const result = FeatSchema.safeParse(feat);
    expect(result.success).toBe(true);
  });

  it('rejects feat grant with wrong discriminator', () => {
    const feat = makeValidFeat({
      grants: [{ type: 'invalidType' } as any],
    });
    const result = FeatSchema.safeParse(feat);
    expect(result.success).toBe(false);
  });

  it('accepts feat with repeatable flag', () => {
    const feat = makeValidFeat({ repeatable: true });
    const result = FeatSchema.safeParse(feat);
    expect(result.success).toBe(true);
  });
});
