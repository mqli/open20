export interface CharacterMeta {
  id: string;
  name: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'zh';
}

export interface StorageProvider {
  saveCharacter(id: string, data: string): Promise<void>;
  loadCharacter(id: string): Promise<string | null>;
  deleteCharacter(id: string): Promise<void>;
  listCharacters(): Promise<CharacterMeta[]>;
  saveSettings(settings: AppSettings): Promise<void>;
  loadSettings(): Promise<AppSettings | null>;
  getLastSyncTime(): Promise<number | null>;
  isOnline(): boolean;
}
