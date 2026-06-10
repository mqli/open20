import { create } from 'zustand';
import type { AppCharacter, CharacterCreationParams } from '@/core/types';
import { characterService } from '@/core/character-service';
import { storageService } from '@/core/storage-service';
import type { SpellLevel } from 'open20-core/types';

interface CharacterState {
  activeCharacter: AppCharacter | null;
  characters: AppCharacter[];
  isLoading: boolean;
  error: string | null;

  setActiveCharacter: (character: AppCharacter) => void;
  createCharacter: (params: CharacterCreationParams) => void;
  updateCharacter: (character: AppCharacter) => void;
  deleteCharacter: (id: string) => void;

  prepareSpell: (spellId: string) => void;
  unprepareSpell: (spellId: string) => void;
  prepareSpellForClass: (classId: string, spellId: string) => void;
  unprepareSpellForClass: (classId: string, spellId: string) => void;
  learnSpell: (spellId: string) => void;
  unlearnSpell: (spellId: string) => void;
  learnCantrip: (classId: string, spellId: string) => void;
  unlearnCantrip: (classId: string, spellId: string) => void;
  replaceCantrip: (classId: string, oldSpellId: string, newSpellId: string) => void;
  castSpell: (spellId: string, level: SpellLevel) => void;
  consumeSpellSlot: (level: SpellLevel) => void;
  recoverSpellSlot: (level: SpellLevel) => void;
  consumePactMagicSlot: () => void;
  recoverPactMagicSlot: () => void;
  longRest: () => void;
  shortRest: () => void;
  startConcentration: (spellId: string) => void;
  endConcentration: () => void;

  loadCharacters: () => void;
  saveCharacters: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  activeCharacter: null,
  characters: [],
  isLoading: false,
  error: null,

  setActiveCharacter: (character) => {
    set({ activeCharacter: character });
    if (character) {
      localStorage.setItem('spellbook-active-character', character.id);
    } else {
      localStorage.removeItem('spellbook-active-character');
    }
  },

  createCharacter: (params) => {
    try {
      const newChar = characterService.createCharacter(params);
      const { characters } = get();
      set({ characters: [...characters, newChar] });
      get().setActiveCharacter(newChar);
      get().saveCharacters();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create character' });
    }
  },

  updateCharacter: (character) => {
    const recomputed = characterService.recompute(character);
    set((state) => ({
      activeCharacter:
        state.activeCharacter?.id === recomputed.id ? recomputed : state.activeCharacter,
      characters: state.characters.map((c) => (c.id === recomputed.id ? recomputed : c)),
    }));
    storageService.saveCharacter(recomputed);
  },

  deleteCharacter: (id) => {
    const { characters, activeCharacter } = get();
    const updatedChars = characters.filter((c) => c.id !== id);
    const newActive = activeCharacter?.id === id ? null : activeCharacter;
    set({
      characters: updatedChars,
      activeCharacter: newActive,
    });
    if (newActive) {
      localStorage.setItem('spellbook-active-character', newActive.id);
    } else {
      localStorage.removeItem('spellbook-active-character');
    }
    storageService.deleteCharacter(id);
  },

  prepareSpell: (spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.prepareSpell(activeCharacter, spellId);
    get().updateCharacter(updated);
  },

  unprepareSpell: (spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.unprepareSpell(activeCharacter, spellId);
    get().updateCharacter(updated);
  },

  prepareSpellForClass: (classId, spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.prepareSpellForClass(activeCharacter, classId, spellId);
    get().updateCharacter(updated);
  },

  unprepareSpellForClass: (classId, spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.unprepareSpellForClass(activeCharacter, classId, spellId);
    get().updateCharacter(updated);
  },

  learnSpell: (spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.learnSpell(activeCharacter, spellId);
    get().updateCharacter(updated);
  },

  unlearnSpell: (spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.unlearnSpell(activeCharacter, spellId);
    get().updateCharacter(updated);
  },

  learnCantrip: (classId, spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.learnCantrip(activeCharacter, classId, spellId);
    get().updateCharacter(updated);
  },

  unlearnCantrip: (classId, spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.unlearnCantrip(activeCharacter, classId, spellId);
    get().updateCharacter(updated);
  },

  replaceCantrip: (classId, oldSpellId, newSpellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.replaceCantrip(
      activeCharacter,
      classId,
      oldSpellId,
      newSpellId,
    );
    get().updateCharacter(updated);
  },

  castSpell: (spellId, level: SpellLevel) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = characterService.castSpell(activeCharacter, spellId, level);
    get().updateCharacter(updated);
  },

  consumeSpellSlot: (level) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.consumeSpellSlot(activeCharacter, level);
    get().updateCharacter(updated);
  },

  recoverSpellSlot: (level) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.recoverSpellSlot(activeCharacter, level);
    get().updateCharacter(updated);
  },

  consumePactMagicSlot: () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.consumePactMagicSlot(activeCharacter);
    get().updateCharacter(updated);
  },

  recoverPactMagicSlot: () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.recoverPactMagicSlot(activeCharacter);
    get().updateCharacter(updated);
  },

  longRest: () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.longRest(activeCharacter);
    get().updateCharacter(updated);
  },

  shortRest: () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.shortRest(activeCharacter);
    get().updateCharacter(updated);
  },

  startConcentration: (spellId) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.startConcentration(activeCharacter, spellId);
    get().updateCharacter(updated);
  },

  endConcentration: () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;

    const updated = characterService.endConcentration(activeCharacter);
    get().updateCharacter(updated);
  },

  loadCharacters: () => {
    const chars = storageService.loadCharacters();
    // Recompute to ensure derived stats and knownSpells are up-to-date
    const recomputed = chars.map((c) => characterService.recompute(c));

    // Restore previously selected character, or fall back to first character
    const savedActiveId = localStorage.getItem('spellbook-active-character');
    const savedChar = savedActiveId ? recomputed.find((c) => c.id === savedActiveId) : null;

    set({
      characters: recomputed,
      activeCharacter: savedChar || recomputed[0] || null,
    });
  },

  saveCharacters: () => {
    const { characters } = get();
    characters.forEach((c) => storageService.saveCharacter(c));
  },
}));
