import type { StorageProvider, CharacterMeta, AppSettings } from '../StorageProvider';

export class RemoteStorageProvider implements StorageProvider {
  private readonly _baseUrl: string;
  private readonly _authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this._baseUrl = baseUrl;
    this._authToken = authToken;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this._baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this._authToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async saveCharacter(id: string, data: string): Promise<void> {
    await this.fetch(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async loadCharacter(id: string): Promise<string | null> {
    try {
      const result = await this.fetch<{ data: string }>(`/characters/${id}`);
      return result.data ?? null;
    } catch {
      return null;
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.fetch(`/characters/${id}`, { method: 'DELETE' });
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    return this.fetch<CharacterMeta[]>('/characters');
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.fetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async loadSettings(): Promise<AppSettings | null> {
    try {
      return await this.fetch<AppSettings>('/settings');
    } catch {
      return null;
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const result = await this.fetch<{ lastSync: number }>('/sync/status');
      return result.lastSync ?? null;
    } catch {
      return null;
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}
