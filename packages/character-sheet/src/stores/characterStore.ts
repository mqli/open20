// characterStore.ts (T-008)
// Single source of truth for character state. Every mutation calls a core
// function and REPLACES the immutable snapshot (never mutates in place),
// then persists via StorageService.

import { create } from 'zustand';
import {
  modifyHP as coreModifyHP,
  setTemporaryHP as coreSetTemporaryHP,
  recomputeDerivedStats,
  type Character,
  type RecomputeDerivedStatsDeps,
} from 'open20-core';
import type { AppCharacter } from '@/types';
import { resolveDeps } from '@/core/content-resolver';
import { storageService, StorageQuotaError } from '@/core/storage-service';

interface CharacterSheetState {
  character: AppCharacter | null;
  characters: Record<string, AppCharacter>;
  activeCharacterId: string | null;
  isLoaded: boolean;
  error: string | null;

  load: () => void;
  loadCharacter: (id: string) => void;
  setActiveCharacter: (id: string) => void;
  deleteCharacter: (id: string) => void;
  /** Add/replace a character (e.g. from creation or import) and make it active. */
  upsertCharacter: (character: AppCharacter) => void;

  // Reference mutation pair (other feature tasks add more via applyMutation).
  modifyHP: (delta: number) => void;
  setTemporaryHP: (value: number) => void;
}

export const useCharacterStore = create<CharacterSheetState>((set, get) => {
  /** Run a core mutation on the active character and persist the result. */
  function applyMutation(
    fn: (char: Character, deps: RecomputeDerivedStatsDeps) => Character,
  ): void {
    const active = get().character;
    if (!active) return;
    const deps = resolveDeps(active);
    const next: AppCharacter = { ...fn(active, deps), id: active.id };
    persist(next);
  }

  function persist(next: AppCharacter): void {
    try {
      storageService.saveCharacter(next);
      set((s) => ({
        character: next,
        characters: { ...s.characters, [next.id]: next },
        error: null,
      }));
    } catch (e) {
      // Keep the in-memory update but surface the persistence failure.
      set((s) => ({
        character: next,
        characters: { ...s.characters, [next.id]: next },
        error:
          e instanceof StorageQuotaError
            ? 'Storage is full. Export or delete characters to free space.'
            : 'Could not save character.',
      }));
    }
  }

  return {
    character: null,
    characters: {},
    activeCharacterId: null,
    isLoaded: false,
    error: null,

    load: () => {
      const characters = storageService.loadAll();
      const activeId = storageService.getActiveId();
      const active = activeId ? characters[activeId] : null;
      // Refresh derived stats on the active character from current content.
      let refreshed = active ?? null;
      if (active) {
        refreshed = { ...recomputeDerivedStats(active, resolveDeps(active)), id: active.id };
        characters[active.id] = refreshed;
      }
      set({
        characters,
        activeCharacterId: active ? active.id : null,
        character: refreshed,
        isLoaded: true,
      });
    },

    loadCharacter: (id) => {
      const char = get().characters[id];
      if (char) set({ character: char, activeCharacterId: id });
    },

    setActiveCharacter: (id) => {
      const char = get().characters[id];
      if (!char) return;
      storageService.setActiveId(id);
      set({ character: char, activeCharacterId: id });
    },

    deleteCharacter: (id) => {
      storageService.deleteCharacter(id);
      set((s) => {
        const rest = { ...s.characters };
        delete rest[id];
        const wasActive = s.activeCharacterId === id;
        return {
          characters: rest,
          activeCharacterId: wasActive ? null : s.activeCharacterId,
          character: wasActive ? null : s.character,
        };
      });
    },

    upsertCharacter: (character) => {
      storageService.setActiveId(character.id);
      persist(character);
      set({ activeCharacterId: character.id });
    },

    modifyHP: (delta) => applyMutation((char) => coreModifyHP(char, delta)),
    setTemporaryHP: (value) => applyMutation((char) => coreSetTemporaryHP(char, value)),
  };
});
