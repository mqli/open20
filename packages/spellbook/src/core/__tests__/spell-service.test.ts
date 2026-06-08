import { describe, it, expect, vi, beforeAll } from 'vitest';
import { spellService } from '@/core/spell-service';
import type { AppCharacter } from '@/core/types';
import type { AbilityName } from 'open20-core';

// Mock the dataLoader with already-normalised Spell[] data
vi.mock('../data-loader', () => ({
  dataLoader: {
    getAllSpells: () =>
      [
        {
          id: 'fireball',
          name: 'Fireball',
          level: 3 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: '150 feet',
          components: ['V', 'S', 'M'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A bright streak flashes from your pointing finger...'],
          source: 'SRD 5.2',
          classes: ['Sorcerer', 'Wizard'] as readonly string[],
        },
        {
          id: 'cure-wounds',
          name: 'Cure Wounds',
          level: 1 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: 'Touch',
          components: ['V', 'S'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A creature you touch regains a number of hit points...'],
          source: 'SRD 5.2',
          classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'] as readonly string[],
        },
      ] as import('open20-core').Spell[],
    getSpell: (id: string) => {
      const spells = [
        {
          id: 'fireball',
          name: 'Fireball',
          level: 3 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: '150 feet',
          components: ['V', 'S', 'M'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A bright streak flashes from your pointing finger...'],
          source: 'SRD 5.2',
          classes: ['Sorcerer', 'Wizard'] as readonly string[],
        },
        {
          id: 'cure-wounds',
          name: 'Cure Wounds',
          level: 1 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: 'Touch',
          components: ['V', 'S'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A creature you touch regains a number of hit points...'],
          source: 'SRD 5.2',
          classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'] as readonly string[],
        },
      ] as import('open20-core').Spell[];
      return spells.find((s) => s.id === id);
    },
  },
  initDataLoader: vi.fn(),
  isDataLoaderReady: () => true,
}));

// Mock open20-core/spells module
vi.mock('open20-core/spells', async () => {
  const actual = await vi.importActual('open20-core/spells');
  return {
    ...actual,
    getSpell: (id: string) => {
      const spells = [
        {
          id: 'fireball',
          name: 'Fireball',
          level: 3 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: '150 feet',
          components: ['V', 'S', 'M'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A bright streak flashes from your pointing finger...'],
          source: 'SRD 5.2',
          classes: ['Sorcerer', 'Wizard'] as readonly string[],
        },
      ] as import('open20-core').Spell[];
      return spells.find((s) => s.id === id);
    },
    searchSpells: (filter: { name?: string; level?: number[]; class?: string[] }) => {
      const allSpells = [
        {
          id: 'fireball',
          name: 'Fireball',
          level: 3 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: '150 feet',
          components: ['V', 'S', 'M'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A bright streak flashes from your pointing finger...'],
          source: 'SRD 5.2',
          classes: ['Sorcerer', 'Wizard'] as readonly string[],
        },
        {
          id: 'cure-wounds',
          name: 'Cure Wounds',
          level: 1 as const,
          school: 'Evocation' as const,
          castingTime: 'Action',
          range: 'Touch',
          components: ['V', 'S'] as const,
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
          description: ['A creature you touch regains a number of hit points...'],
          source: 'SRD 5.2',
          classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'] as readonly string[],
        },
      ] as import('open20-core').Spell[];

      let result = allSpells;
      if (filter.name) {
        result = result.filter((s) => s.name.toLowerCase().includes(filter.name!.toLowerCase()));
      }
      if (filter.level && filter.level.length > 0) {
        result = result.filter((s) => filter.level!.includes(s.level));
      }
      if (filter.class && filter.class.length > 0) {
        const classSet = new Set(filter.class.map((c: string) => c.toLowerCase()));
        result = result.filter((s) =>
          s.classes?.some((c: string) => classSet.has(c.toLowerCase())),
        );
      }
      return result;
    },
    isSpellPrepared: (char: AppCharacter, spellId: string) => {
      return Object.values(char.spells.classSpellcasting).some((csd) =>
        csd.preparedSpells.includes(spellId),
      );
    },
    knowsSpell: (char: AppCharacter, spellId: string) => {
      return Object.values(char.spells.classSpellcasting).some(
        (csd) => csd.knownCantrips?.includes(spellId) || csd.knownSpells.includes(spellId),
      );
    },
  };
});

describe('SpellService', () => {
  beforeAll(async () => {
    await spellService.ensureInitialized();
  });

  it('should get a spell by id', () => {
    const spell = spellService.getSpell('fireball');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Fireball');
  });

  it('should have correct components', () => {
    const fireball = spellService.getSpell('fireball');
    expect(fireball?.components).toEqual(['V', 'S', 'M']);
  });

  it('should search spells by name query', () => {
    const results = spellService.searchSpells({ query: 'fire' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('fireball');
  });

  it('should check if a spell is prepared', () => {
    const mockCharacter = {
      spells: {
        classSpellcasting: {
          Wizard: {
            classId: 'Wizard',
            spellcastingAbility: 'Intelligence' as AbilityName,
            spellSaveDC: 14,
            spellAttackBonus: 6,
            knownCantrips: [],
            knownSpells: [],
            preparedSpells: ['fireball'],
            maxPrepared: 4,
          },
        },
        spellSlots: {
          0: { total: 0, used: 0 },
          1: { total: 2, used: 0 },
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
    } as unknown as AppCharacter;

    expect(spellService.isSpellPrepared(mockCharacter, 'fireball')).toBe(true);
    expect(spellService.isSpellPrepared(mockCharacter, 'cure-wounds')).toBe(false);
  });
});
