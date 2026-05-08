import type { StorageProvider, CharacterMeta, AppSettings } from '../StorageProvider';

const PREFIX = 'open20_char_';
const SETTINGS_KEY = 'open20_settings';
const LAST_CHAR_KEY = 'open20_last_char';

export class LocalStorageProvider implements StorageProvider {
  async saveCharacter(id: string, data: string): Promise<void> {
    localStorage.setItem(`${PREFIX}${id}`, data);
  }

  async loadCharacter(id: string): Promise<string | null> {
    return localStorage.getItem(`${PREFIX}${id}`);
  }

  async deleteCharacter(id: string): Promise<void> {
    localStorage.removeItem(`${PREFIX}${id}`);
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    const metas: CharacterMeta[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) {
        const id = key.slice(PREFIX.length);
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            metas.push({
              id,
              name: parsed.name || 'Unknown',
              updatedAt: parsed.updatedAt || new Date().toISOString(),
            });
          } catch {
            // Skip invalid entries
          }
        }
      }
    }

    return metas.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  async loadSettings(): Promise<AppSettings | null> {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as AppSettings;
    } catch {
      return null;
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    return null; // Local-only, no sync
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getLastCharacterId(): Promise<string | null> {
    return localStorage.getItem(LAST_CHAR_KEY);
  }

  async setLastCharacterId(id: string): Promise<void> {
    localStorage.setItem(LAST_CHAR_KEY, id);
  }
}

export const localStorageProvider = new LocalStorageProvider();
