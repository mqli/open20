import { create } from 'zustand';
import type { Spell } from 'open20-core';
import { storageService } from '@/core/storage-service';

interface CustomSpellState {
  spells: Spell[];
  loadSpells: () => void;
  addSpell: (spell: Spell) => void;
  updateSpell: (spell: Spell) => void;
  deleteSpell: (id: string) => void;
  importSpells: (spells: Spell[]) => { imported: number; skipped: number };
}

export const useCustomSpellStore = create<CustomSpellState>((set, get) => ({
  spells: [],

  loadSpells: () => {
    const spells = storageService.loadCustomSpells();
    set({ spells });
  },

  addSpell: (spell) => {
    const { spells } = get();
    const updated = [...spells, spell];
    storageService.saveCustomSpells(updated);
    set({ spells: updated });
  },

  updateSpell: (spell) => {
    const { spells } = get();
    const index = spells.findIndex((s) => s.id === spell.id);
    if (index >= 0) {
      const updated = [...spells];
      updated[index] = spell;
      storageService.saveCustomSpells(updated);
      set({ spells: updated });
    }
  },

  deleteSpell: (id) => {
    const updated = storageService.deleteCustomSpell(id);
    set({ spells: updated });
  },

  importSpells: (spells) => {
    const { spells: existing } = get();
    const existingIds = new Set(existing.map((s) => s.id));
    const newSpells = spells.filter((s) => !existingIds.has(s.id));
    if (newSpells.length === 0) {
      return { imported: 0, skipped: spells.length };
    }
    const updated = [...existing, ...newSpells];
    storageService.saveCustomSpells(updated);
    set({ spells: updated });
    return { imported: newSpells.length, skipped: spells.length - newSpells.length };
  },
}));
