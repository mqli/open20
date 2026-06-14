import { describe, it, expect } from 'vitest';
import { ContentValidator } from '../../src/validator/content-validator';
import { SpellSchema } from '../../src/validator/schemas';
import type { Spell } from 'open20-core';
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

function makePack(spells: Spell[]): EditableContentPack {
  return {
    id: 'test-pack',
    name: 'Test Pack',
    version: '1.0.0',
    author: 'Test Author',
    source: 'Test',
    spells,
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

  it('validatePack returns ValidationReport with per-type results', () => {
    const pack = makePack([
      makeValidSpell(),
      makeValidSpell({ id: 'acid-rain', name: 'Acid Rain' }),
    ]);
    const report = validator.validatePack(pack);
    expect(report.valid).toBe(true);
    expect(report.results).toHaveProperty('spells');
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
});
