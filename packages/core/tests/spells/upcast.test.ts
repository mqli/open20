// tests/spells/upcast.test.ts

import { describe, it, expect } from 'vitest';
import {
  scaleDiceForUpcast,
  getScaledDamageEntries,
  getScaledHealDice,
} from '../../src/spells/upcast';
import { createMockSpell } from '../fixtures/spells';
import type { Spell, SpellLevel } from '../../src/types/spell';

describe('scaleDiceForUpcast', () => {
  it('returns base dice when no levels above base', () => {
    expect(scaleDiceForUpcast('3d6', '1d6', 0)).toBe('3d6');
  });

  it('adds per-slot dice when die sides match', () => {
    expect(scaleDiceForUpcast('4d6', '1d6', 1)).toBe('5d6');
    expect(scaleDiceForUpcast('4d6', '1d6', 2)).toBe('6d6');
  });

  it('returns base dice when die sides differ', () => {
    expect(scaleDiceForUpcast('2d8', '1d6', 1)).toBe('2d8');
  });
});

describe('getScaledDamageEntries', () => {
  const spell = createMockSpell({
    level: 2 as SpellLevel,
    damage: {
      entries: [{ dice: '4d6', type: 'Fire' }],
      perSlot: [{ dice: '1d6', type: 'Fire' }],
    },
  });

  it('returns base entries at spell level', () => {
    expect(getScaledDamageEntries(spell, 2 as SpellLevel)).toEqual([{ dice: '4d6', type: 'Fire' }]);
  });

  it('scales first entry when cast at higher level', () => {
    expect(getScaledDamageEntries(spell, 4 as SpellLevel)).toEqual([{ dice: '6d6', type: 'Fire' }]);
  });

  it('leaves additional entries unchanged', () => {
    const multi = createMockSpell({
      level: 2 as SpellLevel,
      damage: {
        entries: [
          { dice: '2d6', type: 'Piercing' },
          { dice: '1d4', type: 'Poison' },
        ],
        perSlot: [{ dice: '1d6', type: 'Piercing' }],
      },
    });

    expect(getScaledDamageEntries(multi, 3 as SpellLevel)).toEqual([
      { dice: '3d6', type: 'Piercing' },
      { dice: '1d4', type: 'Poison' },
    ]);
  });
});

describe('getScaledDamageEntries - cantripUpgrade', () => {
  const cantripWithDamage: Spell = createMockSpell({
    level: 0 as SpellLevel,
    damage: {
      entries: [{ dice: '1d10', type: 'Fire' }],
    },
    cantripUpgrade: [
      { atCharacterLevel: 5, damage: [{ dice: '2d10', type: 'Fire' }] },
      { atCharacterLevel: 11, damage: [{ dice: '3d10', type: 'Fire' }] },
      { atCharacterLevel: 17, damage: [{ dice: '4d10', type: 'Fire' }] },
    ],
  });

  const cantripOnlyUpgrade: Spell = createMockSpell({
    level: 0 as SpellLevel,
    cantripUpgrade: [
      { atCharacterLevel: 5, damage: [{ dice: '2d8', type: 'Force' }] },
      { atCharacterLevel: 11, damage: [{ dice: '3d8', type: 'Force' }] },
      { atCharacterLevel: 17, damage: [{ dice: '4d8', type: 'Force' }] },
    ],
  });

  it('returns base damage when character level is below first upgrade', () => {
    const result = getScaledDamageEntries(cantripWithDamage, 0 as SpellLevel, 3);
    expect(result).toEqual([{ dice: '1d10', type: 'Fire' }]);
  });

  it('returns upgraded damage at character level 5', () => {
    const result = getScaledDamageEntries(cantripWithDamage, 0 as SpellLevel, 5);
    expect(result).toEqual([{ dice: '2d10', type: 'Fire' }]);
  });

  it('returns upgraded damage at character level 11', () => {
    const result = getScaledDamageEntries(cantripWithDamage, 0 as SpellLevel, 11);
    expect(result).toEqual([{ dice: '3d10', type: 'Fire' }]);
  });

  it('returns max upgraded damage at character level 17+', () => {
    const result = getScaledDamageEntries(cantripWithDamage, 0 as SpellLevel, 20);
    expect(result).toEqual([{ dice: '4d10', type: 'Fire' }]);
  });

  it('returns cantripUpgrade damage when spell has no spell.damage', () => {
    const result = getScaledDamageEntries(cantripOnlyUpgrade, 0 as SpellLevel, 11);
    expect(result).toEqual([{ dice: '3d8', type: 'Force' }]);
  });

  it('returns empty when no characterLevel and no spell.damage', () => {
    const result = getScaledDamageEntries(cantripOnlyUpgrade, 0 as SpellLevel);
    expect(result).toEqual([]);
  });

  it('does not affect non-cantrip spells', () => {
    const spell = createMockSpell({
      level: 2 as SpellLevel,
      damage: {
        entries: [{ dice: '4d6', type: 'Fire' }],
        perSlot: [{ dice: '1d6', type: 'Fire' }],
      },
    });
    const result = getScaledDamageEntries(spell, 4 as SpellLevel, 20);
    expect(result).toEqual([{ dice: '6d6', type: 'Fire' }]);
  });
});

describe('getScaledHealDice', () => {
  const spell = createMockSpell({
    level: 1 as SpellLevel,
    heal: { dice: '2d8', perSlot: '1d8' },
  });

  it('returns undefined when spell has no heal dice', () => {
    expect(getScaledHealDice(createMockSpell(), 1 as SpellLevel)).toBeUndefined();
  });

  it('returns base heal dice at spell level', () => {
    expect(getScaledHealDice(spell, 1 as SpellLevel)).toBe('2d8');
  });

  it('scales heal dice when cast at higher level', () => {
    expect(getScaledHealDice(spell, 3 as SpellLevel)).toBe('4d8');
  });
});
