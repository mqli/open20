import { create } from 'zustand';
import type { Class, Subclass } from 'open20-core';
import { storageService } from '@/core/storage-service';
import { reinitContent } from '@/core/content-resolver';

export interface CustomClassEntry {
  class: Class;
  subclasses: Subclass[];
}

/**
 * After custom class data changes, rebuild the content pack and
 * recompute all loaded characters so their spellcasting stats
 * reflect the updated class definitions.
 */
async function afterMutate() {
  await reinitContent();
  // Recompute loaded characters with updated content pack
  // Lazy import to avoid circular deps
  const { useCharacterStore } = await import('@/stores/characterStore');
  const { characterService } = await import('@/core/character-service');
  const state = useCharacterStore.getState();
  if (state.characters.length > 0) {
    const recomputed = state.characters.map((c) => characterService.recompute(c));
    useCharacterStore.setState({
      characters: recomputed,
      activeCharacter:
        recomputed.find((c) => c.id === state.activeCharacter?.id) ?? state.activeCharacter,
    });
  }
}

interface CustomClassState {
  classes: CustomClassEntry[];
  loadClasses: () => void;
  /** Add or replace a custom class and its subclasses (matched by class.id). */
  saveClass: (entry: CustomClassEntry) => void;
  deleteClass: (classId: string) => void;
  addSubclass: (classId: string, subclass: Subclass) => void;
  updateSubclass: (classId: string, subclass: Subclass) => void;
  deleteSubclass: (classId: string, subclassId: string) => void;
}

export const useCustomClassStore = create<CustomClassState>((set, get) => ({
  classes: [],

  loadClasses: () => {
    const classes = storageService.loadCustomClasses();
    set({ classes });
  },

  saveClass: (entry) => {
    const { classes } = get();
    const idx = classes.findIndex((c) => c.class.id === entry.class.id);
    const updated =
      idx >= 0 ? [...classes.slice(0, idx), entry, ...classes.slice(idx + 1)] : [...classes, entry];
    storageService.saveCustomClasses(updated);
    set({ classes: updated });
    afterMutate();
  },

  deleteClass: (classId) => {
    const { classes } = get();
    const filtered = classes.filter((c) => c.class.id !== classId);
    storageService.saveCustomClasses(filtered);
    set({ classes: filtered });
    afterMutate();
  },

  addSubclass: (classId, subclass) => {
    const { classes } = get();
    const updated = classes.map((entry) => {
      if (entry.class.id !== classId) return entry;
      const exists = entry.subclasses.some((s) => s.id === subclass.id);
      if (exists) return entry;
      return { ...entry, subclasses: [...entry.subclasses, subclass] };
    });
    storageService.saveCustomClasses(updated);
    set({ classes: updated });
    afterMutate();
  },

  updateSubclass: (classId, subclass) => {
    const { classes } = get();
    const updated = classes.map((entry) => {
      if (entry.class.id !== classId) return entry;
      return {
        ...entry,
        subclasses: entry.subclasses.map((s) => (s.id === subclass.id ? subclass : s)),
      };
    });
    storageService.saveCustomClasses(updated);
    set({ classes: updated });
    afterMutate();
  },

  deleteSubclass: (classId, subclassId) => {
    const { classes } = get();
    const updated = classes.map((entry) => {
      if (entry.class.id !== classId) return entry;
      return {
        ...entry,
        subclasses: entry.subclasses.filter((s) => s.id !== subclassId),
      };
    });
    storageService.saveCustomClasses(updated);
    set({ classes: updated });
    afterMutate();
  },
}));
