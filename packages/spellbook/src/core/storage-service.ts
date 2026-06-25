import type { AppCharacter } from './types';
import type { Spell } from 'open20-core';

interface Preferences {
  theme?: 'light' | 'dark';
  language?: 'en' | 'zh-CN';
}

const STORAGE_KEY = 'open20-spellbook-characters';
const PREFERENCES_KEY = 'open20-spellbook-preferences';
const CUSTOM_SPELLS_KEY = 'open20-spellbook-custom-spells';

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'light',
  language: 'en',
};

export class StorageService {
  saveCharacter(character: AppCharacter): void {
    const characters = this.loadCharacters();
    const index = characters.findIndex((c) => c.id === character.id);

    if (index >= 0) {
      characters[index] = character;
    } else {
      characters.push(character);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }

  loadCharacters(): AppCharacter[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data) as AppCharacter[];
    } catch {
      return [];
    }
  }

  deleteCharacter(id: string): void {
    const characters = this.loadCharacters();
    const filtered = characters.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  savePreferences(preferences: Partial<Preferences>): void {
    const data = this.loadPreferences();
    const merged = { ...data, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
  }

  loadPreferences(): Preferences {
    const data = localStorage.getItem(PREFERENCES_KEY);
    if (!data) return DEFAULT_PREFERENCES;

    try {
      return JSON.parse(data) as Preferences;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
  }

  // ── Custom spells ───────────────────────────────────────

  saveCustomSpells(spells: Spell[]): void {
    try {
      localStorage.setItem(CUSTOM_SPELLS_KEY, JSON.stringify(spells));
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }

  loadCustomSpells(): Spell[] {
    const data = localStorage.getItem(CUSTOM_SPELLS_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data) as Spell[];
    } catch {
      return [];
    }
  }

  deleteCustomSpell(id: string): Spell[] {
    const spells = this.loadCustomSpells();
    const filtered = spells.filter((s) => s.id !== id);
    this.saveCustomSpells(filtered);
    return filtered;
  }
}

// Export a default instance for easy use
export const storageService = new StorageService();
