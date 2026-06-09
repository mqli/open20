import { describe, it, expect } from 'vitest';
import _species from '../data/species.json';
import _backgrounds from '../data/backgrounds.json';
import _classes from '../data/classes.json';
import _subclasses from '../data/subclasses.json';
import _feats from '../data/feats.json';
import _weapons from '../data/weapons.json';
import _armors from '../data/armor.json';
import _spells from '../data/spells.json';

// Cast JSON imports to any to allow dynamic property access in integrity tests
const species: any = _species;
const backgrounds: any = _backgrounds;
const classes: any = _classes;
const subclasses: any = _subclasses;
const feats: any = _feats;
const weapons: any = _weapons;
const armors: any = _armors;
const spells: any = _spells;

// ─── Helper Functions ─────────────────────────────────────────────────────────

function assertRequiredFields(collection: any[], requiredFields: string[]) {
  for (const item of collection) {
    for (const field of requiredFields) {
      expect(item[field]).toBeDefined();
    }
  }
}

// ─── Shared Validation Lists ──────────────────────────────────────────────────

const VALID_ABILITIES = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];
const VALID_SKILLS = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
];

// ─── Species ─────────────────────────────────────────────────────────────────

describe('Species Data Integrity', () => {
  const requiredFields = ['id', 'source'];

  it('has required fields', () => {
    assertRequiredFields(species, requiredFields);
  });

  it('has valid size categories', () => {
    const validSizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
    for (const s of species) {
      if (s.size) {
        expect(validSizes).toContain(s.size);
      }
    }
  });
});

// ─── Backgrounds ──────────────────────────────────────────────────────────────

describe('Background Data Integrity', () => {
  const requiredFields = ['id', 'name', 'source'];

  it('has required fields', () => {
    assertRequiredFields(backgrounds, requiredFields);
  });
});

// ─── Classes ──────────────────────────────────────────────────────────────────

describe('Class Data Integrity', () => {
  const requiredFields = ['id', 'name', 'source', 'hitDie'];

  it('has required fields', () => {
    assertRequiredFields(classes, requiredFields);
  });

  it('has valid hit die values', () => {
    const validHitDice = ['d6', 'd8', 'd10', 'd12'];
    for (const c of classes) {
      expect(validHitDice).toContain(c.hitDie);
    }
  });
});

// ─── Subclasses ───────────────────────────────────────────────────────────────

describe('Subclass Data Integrity', () => {
  const requiredFields = ['id', 'parentClass', 'source'];

  it('has required fields', () => {
    assertRequiredFields(subclasses, requiredFields);
  });

  it('references valid class IDs', () => {
    const classIds = new Set(classes.map((c: any) => c.id));
    for (const sc of subclasses) {
      expect(classIds.has(sc.parentClass)).toBe(true);
    }
  });
});

// ─── Feats ────────────────────────────────────────────────────────────────────

describe('Feat Data Integrity', () => {
  const requiredFields = ['id', 'name', 'source'];

  it('has required fields', () => {
    assertRequiredFields(feats, requiredFields);
  });
});

// ─── Weapons ──────────────────────────────────────────────────────────────────

describe('Weapon Data Integrity', () => {
  const requiredFields = ['id', 'name', 'source', 'damage', 'weight', 'cost'];

  it('has required fields', () => {
    assertRequiredFields(weapons, requiredFields);
  });

  it('has valid damage types', () => {
    const validDamageTypes = [
      'Slashing',
      'Piercing',
      'Bludgeoning',
      'Fire',
      'Cold',
      'Poison',
      'Acid',
      'Thunder',
      'Lightning',
      'Necrotic',
      'Radiant',
      'Force',
      'Psychic',
    ];
    for (const w of weapons) {
      if (w.damage?.type) {
        expect(validDamageTypes).toContain(w.damage.type);
      }
    }
  });
});

// ─── Armor ────────────────────────────────────────────────────────────────────

describe('Armor Data Integrity', () => {
  const requiredFields = ['id', 'name', 'category', 'ac', 'source'];

  it('has required fields', () => {
    assertRequiredFields(armors, requiredFields);
  });

  it('has valid armor categories', () => {
    const validCategories = ['Light', 'Medium', 'Heavy', 'Shield', 'Clothing'];
    for (const a of armors) {
      expect(validCategories).toContain(a.category);
    }
  });
});

// ─── Spells ───────────────────────────────────────────────────────────────────

describe('Spell Data Integrity', () => {
  const requiredFields = ['id', 'name', 'level', 'source'];

  it('has required fields', () => {
    assertRequiredFields(spells, requiredFields);
  });

  it('has valid spell levels (0-9)', () => {
    for (const s of spells) {
      expect(s.level).toBeGreaterThanOrEqual(0);
      expect(s.level).toBeLessThanOrEqual(9);
    }
  });
});
