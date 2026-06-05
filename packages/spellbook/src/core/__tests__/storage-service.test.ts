import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../storage-service';
import type { AppCharacter } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StorageService', () => {
  let service: StorageService;

  const mockCharacter: AppCharacter = {
    id: 'char-1',
    name: 'Test Wizard',
    species: 'Human',
    speciesSubtype: null,
    background: 'Sage',
    classes: [
      {
        classId: 'Wizard',
        level: 1,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 6, used: 0 },
      },
    ],
    abilityScores: {
      base: {
        Strength: 10,
        Dexterity: 14,
        Constitution: 13,
        Intelligence: 16,
        Wisdom: 12,
        Charisma: 10,
      },
      racialBonuses: {},
      featBonuses: {},
      temporaryBonuses: {},
    },
    spells: {
      classSpellcasting: {
        Wizard: {
          classId: 'Wizard',
          spellcastingAbility: 'Intelligence',
          spellSaveDC: 14,
          spellAttackBonus: 6,
          knownSpells: ['fireball', 'mage-armor'],
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
    resources: [],
    hitPoints: {
      max: 8,
      current: 8,
      temporary: 0,
      deathSaves: { successes: 0, failures: 0, isStable: false },
    },
    combatStats: {
      AC: 12,
      initiative: 2,
      speed: 30,
      passivePerception: 11,
      proficiencyBonus: 2,
      attacks: [],
    },
    equipment: [],
    skills: {},
    feats: [],
    conditions: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    damageDefenses: { immune: [], resistant: [], vulnerable: [] },
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as unknown as AppCharacter;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    service = new StorageService();
  });

  describe('saveCharacter', () => {
    it('should save a new character to localStorage', () => {
      service.saveCharacter(mockCharacter);

      const saved = localStorageMock.setItem.mock.calls;
      expect(saved.length).toBe(1);
      expect(saved[0][0]).toBe('open20-spellbook-characters');

      const parsed = JSON.parse(saved[0][1]);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('char-1');
      expect(parsed[0].name).toBe('Test Wizard');
    });

    it('should update an existing character', () => {
      // Save initial character
      service.saveCharacter(mockCharacter);

      // Update character
      const updatedChar = { ...mockCharacter, name: 'Updated Wizard' } as AppCharacter;
      service.saveCharacter(updatedChar);

      const saved = localStorageMock.setItem.mock.calls;
      const parsed = JSON.parse(saved[saved.length - 1][1]);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Updated Wizard');
    });

    it('should save multiple characters', () => {
      const char2 = { ...mockCharacter, id: 'char-2', name: 'Test Sorcerer' } as AppCharacter;

      service.saveCharacter(mockCharacter);
      service.saveCharacter(char2);

      const saved = localStorageMock.setItem.mock.calls;
      const parsed = JSON.parse(saved[saved.length - 1][1]);
      expect(parsed).toHaveLength(2);
    });
  });

  describe('loadCharacters', () => {
    it('should return empty array when no characters stored', () => {
      const characters = service.loadCharacters();
      expect(characters).toEqual([]);
    });

    it('should load saved characters', () => {
      service.saveCharacter(mockCharacter);

      const characters = service.loadCharacters();
      expect(characters).toHaveLength(1);
      expect(characters[0].id).toBe('char-1');
      expect(characters[0].name).toBe('Test Wizard');
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem('open20-spellbook-characters', 'invalid json');

      const characters = service.loadCharacters();
      expect(characters).toEqual([]);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete a character by id', () => {
      const char2 = { ...mockCharacter, id: 'char-2', name: 'Test Sorcerer' } as AppCharacter;

      service.saveCharacter(mockCharacter);
      service.saveCharacter(char2);

      expect(service.loadCharacters()).toHaveLength(2);

      service.deleteCharacter('char-1');

      const remaining = service.loadCharacters();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('char-2');
    });

    it('should not affect other characters when deleting', () => {
      service.saveCharacter(mockCharacter);
      service.deleteCharacter('non-existent');

      const characters = service.loadCharacters();
      expect(characters).toHaveLength(1);
    });
  });

  describe('savePreferences', () => {
    it('should save preferences to localStorage', () => {
      service.savePreferences({ theme: 'dark' });

      const saved = localStorageMock.setItem.mock.calls;
      expect(saved.length).toBe(1);
      expect(saved[0][0]).toBe('open20-spellbook-preferences');

      const parsed = JSON.parse(saved[0][1]);
      expect(parsed.theme).toBe('dark');
    });

    it('should merge with existing preferences', () => {
      service.savePreferences({ theme: 'dark' });
      service.savePreferences({ language: 'zh-CN' });

      const saved = localStorageMock.setItem.mock.calls;
      const parsed = JSON.parse(saved[saved.length - 1][1]);
      expect(parsed.theme).toBe('dark');
      expect(parsed.language).toBe('zh-CN');
    });
  });

  describe('loadPreferences', () => {
    it('should return default preferences when none stored', () => {
      const prefs = service.loadPreferences();
      expect(prefs).toEqual({
        theme: 'light',
        language: 'en',
      });
    });

    it('should load saved preferences', () => {
      service.savePreferences({ theme: 'dark' });

      const prefs = service.loadPreferences();
      expect(prefs.theme).toBe('dark');
      expect(prefs.language).toBe('en'); // Default value preserved
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem('open20-spellbook-preferences', 'invalid json');

      const prefs = service.loadPreferences();
      expect(prefs).toEqual({
        theme: 'light',
        language: 'en',
      });
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      service.saveCharacter(mockCharacter);
      service.savePreferences({ theme: 'dark' });

      service.clearAll();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('open20-spellbook-characters');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('open20-spellbook-preferences');
      expect(service.loadCharacters()).toEqual([]);
    });
  });
});
