import { create } from 'zustand';
import type { Spell } from 'open20-core';
import { storageService } from '@/core/storage-service';

interface CustomSpellState {
  spells: Spell[];
  loadSpells: () => void;
  addSpell: (spell: Spell) => void;
  updateSpell: (spell: Spell) => void;
  deleteSpell: (id: string) => void;
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
}));
