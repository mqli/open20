// storage-service.ts (T-007)
// localStorage persistence for character-sheet. Mirrors spellbook's manual
// StorageService pattern (no Zustand persist middleware). All I/O is
// try/catch with graceful fallback; quota exhaustion surfaces a typed error
// (NFR-03) so the store can toast without corrupting existing data.

import type { AppCharacter } from '@/types';

const CHARACTERS_KEY = 'open20-character-sheet-characters';
const ACTIVE_KEY = 'open20-character-sheet-active-character';

/** Thrown when a write fails because localStorage is full. Non-destructive. */
export class StorageQuotaError extends Error {
  constructor(message = 'Storage is full') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

function isQuotaError(e: unknown): boolean {
  return (
    e instanceof DOMException &&
    (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

export class StorageService {
  /** Load all saved characters keyed by id.
   *  Auto-migrates from old array format `[{id, data}]` to new Record format. */
  loadAll(): Record<string, AppCharacter> {
    const data = localStorage.getItem(CHARACTERS_KEY);
    if (!data) return {};
    try {
      const parsed = JSON.parse(data);
      // Old format: array of { id: string, data: object }
      if (Array.isArray(parsed)) {
        return this.migrateFromLegacyArray(parsed);
      }
      return parsed as Record<string, AppCharacter>;
    } catch {
      return {};
    }
  }

  /**
   * One-time migration from legacy array format to Record<string, AppCharacter>.
   * Old: [{ id: "abc", data: { name: "Foo", ... } }]
   * New: { "abc": { id: "abc", name: "Foo", ... } }
   */
  private migrateFromLegacyArray(
    legacy: Array<{ id: string; data: Record<string, unknown> }>,
  ): Record<string, AppCharacter> {
    const migrated: Record<string, AppCharacter> = {};
    for (const entry of legacy) {
      if (!entry.id || !entry.data) continue;
      const character = { ...entry.data, id: entry.id } as AppCharacter;
      migrated[entry.id] = character;
    }
    // Save back in new format — one-time migration
    try {
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(migrated));
    } catch {
      // Non-fatal — will retry on next load
    }
    return migrated;
  }

  /** Persist one character (upsert). Throws StorageQuotaError on quota. */
  saveCharacter(character: AppCharacter): void {
    const all = this.loadAll();
    all[character.id] = character;
    this.writeAll(all);
  }

  /** Remove a character by id. */
  deleteCharacter(id: string): void {
    const all = this.loadAll();
    delete all[id];
    this.writeAll(all);
    if (this.getActiveId() === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }

  getActiveId(): string | null {
    return localStorage.getItem(ACTIVE_KEY);
  }

  setActiveId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch (e) {
      if (isQuotaError(e)) throw new StorageQuotaError();
      throw e;
    }
  }

  private writeAll(all: Record<string, AppCharacter>): void {
    try {
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('[Storage] Failed to write characters:', e);
      // Do NOT mutate stored data on failure — the prior value is untouched.
      if (isQuotaError(e)) throw new StorageQuotaError();
      throw e;
    }
  }
}

export const storageService = new StorageService();
