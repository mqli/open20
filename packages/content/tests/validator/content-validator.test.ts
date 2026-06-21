import { describe, it, expect } from 'vitest';
import { ContentValidator } from '../../src/validator/content-validator';
import { SpellSchema, MonsterSchema } from '../../src/validator/schemas';
import type { Spell, Monster } from 'open20-core';
import type { EditableContentPack } from '../../src/types/content-pack';

function makeValidSpell(overrides: Partial<Spell> = {}): Spell {
  return {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: ['V', 'S', 'M'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: ['You hurl a ball of fire...'],
    source: 'SRD 5.2',
    ...overrides,
  };
}

function makeValidMonster(overrides: Partial<Monster> = {}): Monster {
  return {
    id: 'goblin',
    name: 'Goblin',
    source: 'SRD 5.2',
    size: 'Small',
    type: 'Humanoid',
    alignment: 'Neutral Evil',
    armorClass: [{ value: 15, type: 'leather armor' }],
    hitPoints: { value: 7, formula: '2d6' },
    speed: { walk: 30 },
    abilityScores: {
      STR: 8,
      DEX: 14,
      CON: 10,
      INT: 10,
      WIS: 8,
      CHA: 8,
    },
    challengeRating: { rating: '1/4', xp: 50 },
    ...overrides,
  } as Monster;
}

function makePack(spells: Spell[], monsters: Monster[] = []): EditableContentPack {
  return {
    id: 'test-pack',
    name: 'Test Pack',
    version: '1.0.0',
    author: 'Test Author',
    source: 'Test',
    spells,
    monsters,
    meta: {
      description: '',
    },
  } as EditableContentPack;
}

describe('SpellSchema', () => {
  it('validates a valid spell', () => {
    const spell = makeValidSpell();
    const result = SpellSchema.safeParse(spell);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = SpellSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('id');
      expect(paths).toContain('name');
    }
  });

  it('rejects unknown fields (strict mode)', () => {
    const spell = makeValidSpell({ extraField: 1 } as unknown as Spell);
    const result = SpellSchema.safeParse(spell);
    expect(result.success).toBe(false);
  });

  it('accepts spell with optional fields', () => {
    const spell = makeValidSpell({
      classes: ['Wizard', 'Sorcerer'],
      damage: {
        entries: [{ dice: '8d6', type: 'fire' }],
        includeSpellcastingModifier: false,
      },
      save: 'DEX',
      attack: true,
    });
    const result = SpellSchema.safeParse(spell);
    expect(result.success).toBe(true);
  });
});

describe('MonsterSchema', () => {
  it('validates a valid monster', () => {
    const monster = makeValidMonster();
    const result = MonsterSchema.safeParse(monster);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = MonsterSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode)', () => {
    const monster = makeValidMonster({ extraField: 1 } as unknown as Monster);
    const result = MonsterSchema.safeParse(monster);
    expect(result.success).toBe(false);
  });

  it('accepts monster with optional fields', () => {
    const monster = makeValidMonster({
      traits: [{ name: 'Nimble Escape', description: 'Can Disengage or Hide as bonus action.' }],
      actions: [{ name: 'Scimitar', attacks: [{ name: 'Scimitar', toHit: 4 }] }],
      senses: { darkvision: 60, passivePerception: 9 },
      languages: ['Common', 'Goblin'],
    });
    const result = MonsterSchema.safeParse(monster);
    expect(result.success).toBe(true);
  });
});

describe('ContentValidator', () => {
  const validator = new ContentValidator();

  it('validateSpell returns valid=true for valid spell', () => {
    const result = validator.validateSpell(makeValidSpell());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validateSpell maps Zod errors to ValidationError[]', () => {
    const result = validator.validateSpell({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toHaveProperty('path');
    expect(result.errors[0]).toHaveProperty('message');
    expect(result.errors[0]).toHaveProperty('severity');
  });

  it('validateMonster returns valid=true for valid monster', () => {
    const result = validator.validateMonster(makeValidMonster());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validateMonster maps Zod errors to ValidationError[]', () => {
    const result = validator.validateMonster({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toHaveProperty('path');
    expect(result.errors[0]).toHaveProperty('message');
    expect(result.errors[0]).toHaveProperty('severity');
  });

  it('validateMonster rejects empty id', () => {
    const result = validator.validateMonster(makeValidMonster({ id: '' }));
    expect(result.valid).toBe(false);
  });

  it('validatePack returns ValidationReport with per-type results', () => {
    const pack = makePack([
      makeValidSpell(),
      makeValidSpell({ id: 'acid-rain', name: 'Acid Rain' }),
    ]);
    const report = validator.validatePack(pack);
    expect(report.valid).toBe(true);
    expect(report.results).toHaveProperty('spells');
    expect(report.results).toHaveProperty('monsters');
  });

  it('validatePack detects invalid spells', () => {
    const pack = makePack([makeValidSpell(), { id: '', name: '' } as Spell]);
    const report = validator.validatePack(pack);
    expect(report.valid).toBe(false);
    expect(report.results['spells'].valid).toBe(false);
    expect(report.results['spells'].errors.length).toBeGreaterThan(0);
  });

  it('validatePack with empty spells array', () => {
    const pack = makePack([]);
    const report = validator.validatePack(pack);
    expect(report.valid).toBe(true);
  });

  it('validatePack includes monsters results', () => {
    const pack = makePack(
      [makeValidSpell()],
      [makeValidMonster(), makeValidMonster({ id: 'orc', name: 'Orc' })],
    );
    const report = validator.validatePack(pack);
    expect(report.results).toHaveProperty('monsters');
    expect(report.results['monsters'].valid).toBe(true);
  });

  it('validatePack detects invalid monsters', () => {
    const pack = makePack([], [makeValidMonster(), { id: '', name: '' } as Monster]);
    const report = validator.validatePack(pack);
    expect(report.results['monsters'].valid).toBe(false);
    expect(report.results['monsters'].errors.length).toBeGreaterThan(0);
  });

  it('validatePack includes species results', () => {
    const pack = {
      ...makePack([]),
      species: [
        {
          id: 'dwarf',
          source: 'SRD',
          description: '',
          size: 'Medium',
          speed: 30,
          languages: [],
          abilityBonuses: {},
          baseTraits: [],
        },
      ],
    } as unknown as EditableContentPack;
    const report = validator.validatePack(pack);
    expect(report.results).toHaveProperty('species');
    expect(report.results['species'].valid).toBe(true);
  });

  it('validatePack detects invalid species', () => {
    const pack = {
      ...makePack([]),
      species: [{ id: '' }],
    } as unknown as EditableContentPack;
    const report = validator.validatePack(pack);
    expect(report.results['species'].valid).toBe(false);
  });

  it('validatePack includes backgrounds results', () => {
    const pack = {
      ...makePack([]),
      backgrounds: [
        {
          id: 'acolyte',
          source: 'SRD',
          skillProficiencies: [],
          toolProficiencies: [],
          languages: [],
          originFeatId: 'test',
          startingGold: 0,
        },
      ],
    } as unknown as EditableContentPack;
    const report = validator.validatePack(pack);
    expect(report.results).toHaveProperty('backgrounds');
    expect(report.results['backgrounds'].valid).toBe(true);
  });

  it('validatePack detects invalid backgrounds', () => {
    const pack = {
      ...makePack([]),
      backgrounds: [{ id: '' }],
    } as unknown as EditableContentPack;
    const report = validator.validatePack(pack);
    expect(report.results['backgrounds'].valid).toBe(false);
  });

  it('validatePack includes feats results', () => {
    const pack = {
      ...makePack([]),
      feats: [{ id: 'alert', source: 'SRD', description: 'Test', category: 'General' }],
    } as unknown as EditableContentPack;
    const report = validator.validatePack(pack);
    expect(report.results).toHaveProperty('feats');
    expect(report.results['feats'].valid).toBe(true);
  });

  it('validatePack detects invalid feats', () => {
    const pack = {
      ...makePack([]),
      feats: [{ id: '' }],
    } as unknown as EditableContentPack;
    const report = validator.validatePack(pack);
    expect(report.results['feats'].valid).toBe(false);
  });
});
