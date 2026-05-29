import type { AppCharacter } from './types';

interface Preferences {
  theme?: 'light' | 'dark';
  language?: 'en' | 'zh-CN';
}

const STORAGE_KEY = 'open20-spellbook-characters';
const PREFERENCES_KEY = 'open20-spellbook-preferences';

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
}

// Export a default instance for easy use
export const storageService = new StorageService();
