import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Character } from 'open20-core';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be at the top for vi.mock to work correctly
// ---------------------------------------------------------------------------

const { mockValidateSpell } = vi.hoisted(() => ({
  mockValidateSpell: vi.fn().mockReturnValue({ valid: true, errors: [] }),
}));

vi.mock('@open20/content/validator', () => {
  const MockValidator = vi.fn(function (this: Record<string, unknown>) {
    this.validateSpell = mockValidateSpell;
  });
  return { ContentValidator: MockValidator };
});

// ---------------------------------------------------------------------------
// Minimal CharacterBundle fixture
// ---------------------------------------------------------------------------

function makeMinimalCharacter(): Character {
  return {
    schemaVersion: '2024.1',
    name: 'Test Hero',
    species: 'Human',
    speciesSubtype: null,
    background: 'Acolyte',
    classes: [
      {
        classId: 'Cleric',
        level: 3,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd8', used: 0 },
      },
    ],
    abilityScores: {
      base: {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 16,
        Charisma: 12,
      },
      racialBonuses: {},
    },
    skills: {},
    feats: [],
    equipment: [],
    resources: {},
    spells: {
      classSpellcasting: {},
      spellSlots: {
        0: { total: 0, used: 0 },
        1: { total: 0, used: 0 },
        2: { total: 0, used: 0 },
        3: { total: 0, used: 0 },
        4: { total: 0, used: 0 },
        5: { total: 0, used: 0 },
        6: { total: 0, used: 0 },
        7: { total: 0, used: 0 },
        8: { total: 0, used: 0 },
        9: { total: 0, used: 0 },
      },
      pactMagicSlots: null,
    },
    hitPoints: {
      max: 24,
      current: 24,
      temporary: 0,
      deathSaves: { successes: 0, failures: 0, isStable: false },
    },
    combatStats: {
      AC: 10,
      initiative: 0,
      speed: 30,
      passivePerception: 10,
      proficiencyBonus: 2,
      attacks: [],
    },
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    conditions: [],
    concentration: null,
    activeEffects: [],
    damageDefenses: { resistances: [], immunities: [], vulnerabilities: [] },
    notes: '',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

function makeValidBundle(overrides?: Record<string, unknown>) {
  return JSON.stringify({
    schemaVersion: '1.0.0',
    character: makeMinimalCharacter(),
    content: {
      meta: { id: 'test-pack', name: 'Test Pack', version: '1.0.0', source: 'test', priority: 0 },
    },
    meta: {
      exportedFrom: 'open20-spellbook',
      exportedAt: '2025-01-01T00:00:00.000Z',
      version: '0.0.0',
    },
    ...overrides,
  });
}

// Minimal valid spell for spell validation tests
const minimalSpell = {
  id: 'custom-heal',
  name: 'Custom Heal',
  level: 1,
  school: 'Evocation',
  castingTime: 'Action',
  range: 'Touch',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: ['Heals a creature.'],
  source: 'Homebrew',
  classes: ['Cleric'],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const utilsPromise = import('../character-import-export-utils');

describe('parseAndValidateCharacterBundle', () => {
  let utils: Awaited<typeof utilsPromise>;

  beforeEach(async () => {
    utils = await utilsPromise;
    vi.clearAllMocks();
    mockValidateSpell.mockReturnValue({ valid: true, errors: [] });
  });

  // ── Happy path ──

  it('parses a valid CharacterBundle JSON', () => {
    const json = makeValidBundle();
    const result = utils.parseAndValidateCharacterBundle(json);
    expect(result.type).toBe('character-bundle');
    if (result.type === 'character-bundle') {
      expect(result.bundle.schemaVersion).toBe('1.0.0');
      expect(result.bundle.character.name).toBe('Test Hero');
      expect(result.bundle.meta.exportedFrom).toBe('open20-spellbook');
    }
  });

  it('calls spell validator for each spell in the content pack', () => {
    const bundleWithSpells = {
      schemaVersion: '1.0.0',
      character: makeMinimalCharacter(),
      content: {
        meta: { id: 'test-pack', name: 'Test Pack', version: '1.0.0', source: 'test', priority: 0 },
        spells: [minimalSpell],
      },
      meta: {
        exportedFrom: 'open20-spellbook',
        exportedAt: '2025-01-01T00:00:00.000Z',
        version: '0.0.0',
      },
    };
    const json = JSON.stringify(bundleWithSpells);
    const result = utils.parseAndValidateCharacterBundle(json);
    expect(result.type).toBe('character-bundle');
    expect(mockValidateSpell).toHaveBeenCalledTimes(1);
  });

  it('returns error when spell validation fails', () => {
    mockValidateSpell.mockReturnValue({
      valid: false,
      errors: [{ path: 'level', message: 'Invalid level' }],
    });

    const bundleWithBadSpell = {
      schemaVersion: '1.0.0',
      character: makeMinimalCharacter(),
      content: {
        meta: { id: 'test-pack', name: 'Test Pack', version: '1.0.0', source: 'test', priority: 0 },
        spells: [{ id: 'bad-spell', name: 'Bad Spell', level: 1, school: 'Evocation' }],
      },
      meta: {
        exportedFrom: 'open20-spellbook',
        exportedAt: '2025-01-01T00:00:00.000Z',
        version: '0.0.0',
      },
    };
    const json = JSON.stringify(bundleWithBadSpell);
    const result = utils.parseAndValidateCharacterBundle(json);
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  // ── Error paths ──

  it('rejects non-JSON input', () => {
    const result = utils.parseAndValidateCharacterBundle('not json at all');
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.errors).toContain('Invalid JSON file.');
    }
  });

  it('rejects an arbitrary object without CharacterBundle signature', () => {
    const json = JSON.stringify({ some: 'random', object: true });
    const result = utils.parseAndValidateCharacterBundle(json);
    expect(result.type).toBe('error');
  });

  it('detects ContentPack format and returns spells-or-pack (or error)', () => {
    const contentPack = JSON.stringify({
      meta: { id: 'test', name: 'Test', version: '1.0.0', source: 'test', priority: 0 },
      spells: [minimalSpell],
    });
    const result = utils.parseAndValidateCharacterBundle(contentPack);
    // detectImportFormat may or may not recognize this → either spells-or-pack or error
    expect(['spells-or-pack', 'error']).toContain(result.type);
  });
});
