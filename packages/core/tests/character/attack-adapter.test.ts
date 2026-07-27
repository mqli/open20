// tests/character/attack-adapter.test.ts
// Tests for CharacterAttack → Weapon adapter

import { describe, it, expect } from 'vitest';
import { createCharacter } from '../../src/character/create';
import type { CreateCharacterParams } from '../../src/character/create';
import type { AbilityName } from '../../src/types/ability';
import type { CharacterAttack } from '../../src/types/character';
import { createMockDeps } from '../fixtures/data-loader';
import { HUMAN_SPECIES, SOLDIER_BACKGROUND, FIGHTER_CLASS } from '../fixtures/characters';
import {
  characterAttackToWeapon,
  rollStoredAttack,
  rollStoredAttackDamage,
} from '../../src/character/attack-adapter';
import { createDeterministicRNG } from '../../src/engine';

const STANDARD_SCORES: Record<AbilityName, number> = {
  Strength: 16,
  Dexterity: 14,
  Constitution: 15,
  Intelligence: 8,
  Wisdom: 12,
  Charisma: 10,
};

function makeFighter() {
  const deps = createMockDeps({
    species: HUMAN_SPECIES,
    background: SOLDIER_BACKGROUND,
    classes: { Fighter: FIGHTER_CLASS },
  });
  const params: CreateCharacterParams = {
    name: 'Aragorn',
    speciesId: 'Human',
    backgroundId: 'Soldier',
    classId: 'Fighter',
    abilityScores: STANDARD_SCORES,
  };
  return createCharacter(params, deps);
}

// –– Fixture attacks –––––––––––––––––––––––––––––––––––––––––

const LONGSWORD_ATTACK: CharacterAttack = {
  name: 'Longsword',
  attackBonus: 6,
  damage: '1d8+3 slashing',
  damageType: 'Slashing',
  mastery: ['Sap'],
};

const LONGSWORD_ENTRIES: CharacterAttack = {
  name: 'Longsword',
  attackBonus: 6,
  damageEntries: [{ dice: '1d8', type: 'Slashing', bonus: 3 }],
  mastery: ['Sap'],
};

const NO_DAMAGE_ATTACK: CharacterAttack = {
  name: 'Grapple',
  attackBonus: 5,
  mastery: [],
};

// –– Tests –––––––––––––––––––––––––––––––––––––––––––––––––––

describe('characterAttackToWeapon', () => {
  it('converts damage string form (e.g. "1d8+3 slashing")', () => {
    const weapon = characterAttackToWeapon(LONGSWORD_ATTACK);
    expect(weapon.name).toBe('Longsword');
    expect(weapon.type).toBe('weapon');
    expect(weapon.category).toBe('Simple');
    expect(weapon.damage.entries).toHaveLength(1);
    expect(weapon.damage.entries[0]!.dice).toBe('1d8');
    expect(weapon.damage.entries[0]!.type).toBe('Slashing');
    expect(weapon.damage.ability).toBe('Strength');
    expect(weapon.damage.bonus).toBe(0);
    expect(weapon.mastery).toEqual(['Sap']);
  });

  it('converts damageEntries form', () => {
    const weapon = characterAttackToWeapon(LONGSWORD_ENTRIES);
    expect(weapon.damage.entries).toHaveLength(1);
    expect(weapon.damage.entries[0]!.dice).toBe('1d8');
    expect(weapon.damage.entries[0]!.type).toBe('Slashing');
  });

  it('prefers damageEntries over damage string when both present', () => {
    const attack: CharacterAttack = {
      name: 'Dual',
      damage: '2d6 fire',
      damageEntries: [{ dice: '1d8', type: 'Slashing' }],
      mastery: [],
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.damage.entries[0]!.dice).toBe('1d8');
    expect(weapon.damage.entries[0]!.type).toBe('Slashing');
  });

  it('throws when neither damageEntries nor damage string is present', () => {
    expect(() => characterAttackToWeapon(NO_DAMAGE_ATTACK)).toThrow(
      /has no damageEntries or damage string/,
    );
  });

  it('generates id from name', () => {
    const weapon = characterAttackToWeapon(LONGSWORD_ATTACK);
    expect(weapon.id).toBe('longsword');
  });

  it('handles multi-word name for id', () => {
    const attack: CharacterAttack = {
      name: 'Great Axe',
      damage: '1d12 slashing',
      mastery: [],
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.id).toBe('great-axe');
  });

  it('defaults weight to 0 and equipped to true', () => {
    const weapon = characterAttackToWeapon(LONGSWORD_ATTACK);
    expect(weapon.weight).toBe(0);
    expect(weapon.equipped).toBe(true);
  });

  it('handles damage string without bonus (e.g. "2d6 fire")', () => {
    const attack: CharacterAttack = {
      name: 'Greatsword',
      damage: '2d6 slashing',
      mastery: [],
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.damage.entries[0]!.dice).toBe('2d6');
    expect(weapon.damage.entries[0]!.type).toBe('Slashing');
  });

  it('handles damage string without type (defaults to Bludgeoning)', () => {
    const attack: CharacterAttack = {
      name: 'Staff',
      damage: '1d6',
      mastery: [],
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.damage.entries[0]!.type).toBe('Bludgeoning');
  });

  it('uses abilityUsed when present (Dexterity → Finesse weapon)', () => {
    const attack: CharacterAttack = {
      name: 'Rapier',
      damage: '1d8+3 piercing',
      mastery: ['Vex'],
      abilityUsed: 'Dexterity',
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.damage.ability).toBe('Dexterity');
    expect(weapon.properties).toContain('Finesse');
  });

  it('defaults to Strength when abilityUsed is absent', () => {
    const attack: CharacterAttack = {
      name: 'Mace',
      damage: '1d6 bludgeoning',
      mastery: [],
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.damage.ability).toBe('Strength');
    expect(weapon.properties).not.toContain('Finesse');
  });

  it('handles no-space damage string (e.g. "1d8+3")', () => {
    const attack: CharacterAttack = {
      name: 'Club',
      damage: '1d8+3',
      mastery: [],
    };
    const weapon = characterAttackToWeapon(attack);
    expect(weapon.damage.entries[0]!.dice).toBe('1d8');
    expect(weapon.damage.entries[0]!.type).toBe('Bludgeoning');
  });
});

describe('rollStoredAttack', () => {
  it('rolls an attack using stored CharacterAttack', () => {
    const char = makeFighter();
    const rng = createDeterministicRNG([15]); // d20 = 15
    const result = rollStoredAttack({
      character: char,
      attack: LONGSWORD_ATTACK,
      rng,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.isCritical).toBe(false);
  });

  it('detects critical hit (natural 20)', () => {
    const char = makeFighter();
    const rng = createDeterministicRNG([20]);
    const result = rollStoredAttack({
      character: char,
      attack: LONGSWORD_ATTACK,
      rng,
    });

    expect(result.isCritical).toBe(true);
    expect(result.rawRoll).toBe(20);
  });

  it('detects critical miss (natural 1)', () => {
    const char = makeFighter();
    const rng = createDeterministicRNG([1]);
    const result = rollStoredAttack({
      character: char,
      attack: LONGSWORD_ATTACK,
      rng,
    });

    expect(result.isCriticalFail).toBe(true);
    expect(result.rawRoll).toBe(1);
  });
});

describe('rollStoredAttackDamage', () => {
  it('rolls damage using stored CharacterAttack', () => {
    const char = makeFighter();
    const rng = createDeterministicRNG([4]); // d8 = 4
    const result = rollStoredAttackDamage({
      character: char,
      attack: LONGSWORD_ATTACK,
      rng,
    });

    expect(result.total).toBeGreaterThan(0);
  });

  it('doubles dice on critical hit', () => {
    const char = makeFighter();
    // All max rolls: 8 + 8 = 16 (dice doubled) + 3 (ability)
    const rng = createDeterministicRNG([8, 8]);
    const result = rollStoredAttackDamage({
      character: char,
      attack: LONGSWORD_ATTACK,
      isCritical: true,
      rng,
    });

    // 1d8 doubled → 2d8, both roll 8 = 16, + STR mod (3) = 19
    expect(result.total).toBe(19);
  });
});
