import { describe, it, expect, vi, beforeAll } from 'vitest';
import { spellService } from '@/core/spell-service';
import type { AppCharacter } from '@/core/types';
import type { AbilityName } from 'open20-core';

// Test data — simulates a merged ContentPack with SRD + custom/homebrew spells
const testSpells = [
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
  {
    id: 'arcane-bolt',
    name: 'Arcane Bolt',
    level: 1 as const,
    school: 'Evocation' as const,
    castingTime: 'Action',
    range: '90 feet',
    components: ['V', 'S'] as const,
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: ['A bolt of arcane energy strikes the target.'],
    source: 'Homebrew',
    classes: ['Wizard'] as readonly string[],
  },
];

// Mock content-resolver to return test data
vi.mock('@/core/content-resolver', () => ({
  initContent: vi.fn(),
  getContentPack: vi.fn(() => ({
    spells: testSpells,
    classes: [],
    species: [],
    backgrounds: [],
    feats: [],
    subclasses: [],
    weapons: [],
    armors: [],
    gears: [],
  })),
  getAllSpells: () => testSpells,
  getSpell: (id: string) => testSpells.find((s) => s.id === id),
}));

// Mock open20-core/spells module (used by SpellService for isSpellKnown/isSpellPrepared)
vi.mock('open20-core/spells', async () => {
  const actual = await vi.importActual('open20-core/spells');
  return {
    ...actual,
    knowsSpell: vi.fn((char: AppCharacter, spellId: string) => {
      return Object.values(char.spells.classSpellcasting).some(
        (csd) => csd.knownCantrips?.includes(spellId) || csd.knownSpells.includes(spellId),
      );
    }),
    isSpellPreparedForClass: vi.fn((char: AppCharacter, classId: string, spellId: string) => {
      return char.spells.classSpellcasting[classId]?.preparedSpells.includes(spellId) ?? false;
    }),
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
      classes: [{ classId: 'Wizard', level: 3 }],
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

  it('should find custom/homebrew spells by id', () => {
    const spell = spellService.getSpell('arcane-bolt');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Arcane Bolt');
    expect(spell?.source).toBe('Homebrew');
  });

  it('should return both SRD and custom spells in searchSpells({})', () => {
    const results = spellService.searchSpells({});
    const ids = results.map((s) => s.id);
    expect(ids).toContain('fireball'); // SRD
    expect(ids).toContain('cure-wounds'); // SRD
    expect(ids).toContain('arcane-bolt'); // Homebrew
  });
});
