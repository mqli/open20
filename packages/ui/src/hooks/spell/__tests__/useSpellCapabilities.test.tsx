// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Spell, SpellLevel, Character, RecomputeDerivedStatsDeps } from 'open20-core';
import { useSpellCapabilities } from '../useSpellCapabilities';

const emptyDeps: RecomputeDerivedStatsDeps = {
  classes: {},
};

function makeSpell(overrides: Partial<Spell> = {}): Spell {
  return {
    id: 'test-spell',
    name: 'Test Spell',
    level: 1 as SpellLevel,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 ft.',
    duration: 'Instantaneous',
    attack: false,
    concentration: false,
    ritual: false,
    source: 'PHB',
    components: ['V', 'S'],
    description: [],
    classes: ['Wizard'],
    ...overrides,
  } as Spell;
}

function makeChar(overrides?: Partial<Character>): Character {
  return {
    name: 'Test',
    level: 1,
    classes: [
      {
        classId: 'Wizard',
        level: 1,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd6', used: 0 },
      },
    ],
    species: undefined,
    background: undefined,
    spells: {
      classSpellcasting: {
        Wizard: {
          knownSpells: [],
          preparedSpells: [],
          alwaysPreparedSpells: [],
          knownCantrips: [],
          spellAttackBonus: 5,
          maxPrepared: 3,
        },
      },
      spellSlots: {
        1: { total: 2, used: 0 },
      },
      pactMagicSlots: null,
      featSpells: {},
    },
    concentration: null,
    hitPoints: { max: 10, current: 10, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    hitDice: [{ die: 'd6', total: 1, used: 0 }],
    stats: {
      STR: 10,
      DEX: 14,
      CON: 12,
      INT: 18,
      WIS: 13,
      CHA: 8,
    },
    inspiration: false,
    ...overrides,
  } as Character;
}

describe('useSpellCapabilities', () => {
  it('returns empty capabilities when character is null', () => {
    const spell = makeSpell();
    const { result } = renderHook(() => useSpellCapabilities(spell, null, emptyDeps));

    expect(result.current.isKnown).toBe(false);
    expect(result.current.isPrepared).toBe(false);
    expect(result.current.canCast).toBe(false);
    expect(result.current.isClassSpell).toBe(false);
    expect(result.current.spellAttackBonus).toBe(0);
  });

  it('returns empty capabilities when spell is null', () => {
    const character = makeChar();
    const { result } = renderHook(() => useSpellCapabilities(null, character, emptyDeps));

    expect(result.current.isKnown).toBe(false);
    expect(result.current.canCast).toBe(false);
  });

  it('detects class spell for matching class', () => {
    const character = makeChar();
    const spell = makeSpell({ id: 'magic-missile', level: 1, classes: ['Wizard'] });
    const { result } = renderHook(() => useSpellCapabilities(spell, character, emptyDeps));

    expect(result.current.isClassSpell).toBe(true);
    expect(result.current.matchingClassIds).toContain('Wizard');
  });

  it('returns false for non-matching class spell', () => {
    const character = makeChar();
    const spell = makeSpell({ id: 'divine-smite', level: 1, classes: ['Paladin'] });
    const { result } = renderHook(() => useSpellCapabilities(spell, character, emptyDeps));

    expect(result.current.isClassSpell).toBe(false);
    expect(result.current.matchingClassIds).toHaveLength(0);
  });

  it('detects concentration for the concentrating spell', () => {
    const character = makeChar({
      concentration: { spellId: 'test-spell', startedAt: '2025-01-01T00:00:00Z' },
    });
    const spell = makeSpell({ id: 'test-spell', concentration: true, classes: ['Wizard'] });
    const { result } = renderHook(() => useSpellCapabilities(spell, character, emptyDeps));

    expect(result.current.isConcentratingOnThis).toBe(true);
  });

  it('handles undefined character the same as null', () => {
    const spell = makeSpell();
    const { result } = renderHook(() => useSpellCapabilities(spell, undefined, emptyDeps));

    expect(result.current.isKnown).toBe(false);
    expect(result.current.canCast).toBe(false);
  });
});
