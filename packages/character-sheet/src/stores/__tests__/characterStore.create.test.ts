// Separate file: the module mock on open20-core is scoped per test file, and
// the main store suite must run against the real core.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RecomputeDerivedStatsDeps } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent, resolveDeps } from '@/core/content-resolver';

const createSpy = vi.fn();

vi.mock('open20-core', async () => {
  const actual = await vi.importActual<typeof import('open20-core')>('open20-core');
  return {
    ...actual,
    createCharacter: (
      params: Parameters<typeof actual.createCharacter>[0],
      deps: RecomputeDerivedStatsDeps,
    ) => {
      createSpy(params, deps);
      return actual.createCharacter(params, deps);
    },
  };
});

const SCORES = {
  Strength: 10,
  Dexterity: 14,
  Constitution: 14,
  Intelligence: 15,
  Wisdom: 12,
  Charisma: 8,
};

describe('characterStore.createCharacter → core', () => {
  beforeEach(() => {
    initContent();
    localStorage.clear();
    createSpy.mockReset();
    useCharacterStore.setState({
      character: null,
      characters: {},
      activeCharacterId: null,
      isLoaded: false,
      error: null,
      lastDamageForConcentration: null,
    });
  });

  it('calls core createCharacter once with the wizard params', () => {
    useCharacterStore.getState().createCharacter({
      name: 'Nyx',
      speciesId: 'Elf',
      speciesSubtypeId: 'High Elf',
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 3,
      abilityScores: SCORES,
      additionalClasses: [{ classId: 'Fighter', level: 2 }],
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    const [params] = createSpy.mock.calls[0];
    expect(params).toMatchObject({
      name: 'Nyx',
      speciesId: 'Elf',
      speciesSubtypeId: 'High Elf',
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 3,
      abilityScores: SCORES,
      additionalClasses: [{ classId: 'Fighter', level: 2 }],
    });
  });

  it('passes a resolved deps bag covering every class', () => {
    useCharacterStore.getState().createCharacter({
      name: 'Multi',
      speciesId: 'Elf',
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 3,
      abilityScores: SCORES,
      additionalClasses: [{ classId: 'Fighter', level: 2 }],
    });

    const [, deps] = createSpy.mock.calls[0] as [unknown, RecomputeDerivedStatsDeps];
    expect(deps.species?.id).toBe('Elf');
    expect(deps.background?.id).toBe('sage');
    expect(deps.classes.Wizard).toBeDefined();
    expect(deps.classes.Fighter).toBeDefined();
  });

  it('cannot give core deps.feats on the first pass — hence the second recompute', () => {
    useCharacterStore.getState().createCharacter({
      name: 'Initiate',
      speciesId: 'Human',
      backgroundId: 'sage',
      classId: 'Fighter',
      classLevel: 1,
      abilityScores: SCORES,
      featIds: ['magic-initiate'],
    });

    // buildDepsForCreate has no Character to read feat ids from, so core's
    // internal recompute runs feat-blind. The store's second pass, using
    // resolveDeps on the built character, is what supplies them.
    const [, deps] = createSpy.mock.calls[0] as [unknown, RecomputeDerivedStatsDeps];
    expect(deps.feats).toBeUndefined();

    const created = useCharacterStore.getState().character!;
    expect(resolveDeps(created).feats).toHaveProperty('magic-initiate');
  });

  it('resolves subclasses into deps (regression: buildDepsForCreate dropped them)', () => {
    useCharacterStore.getState().createCharacter({
      name: 'Devoted',
      speciesId: 'Human',
      backgroundId: 'acolyte',
      classId: 'Cleric',
      classLevel: 1,
      subclassId: 'Life Domain',
      abilityScores: SCORES,
    });

    const [, deps] = createSpy.mock.calls[0] as [unknown, RecomputeDerivedStatsDeps];
    expect(deps.subclasses?.['Life Domain']).toBeDefined();
  });
});
