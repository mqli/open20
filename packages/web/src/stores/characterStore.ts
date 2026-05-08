import { create } from 'zustand';
import type { Character, DataLoader, CreateCharacterParams, ConditionName } from '@/types/open20-core';
import { getAppContext } from '@/contexts';

interface CharacterState {
  character: Character | null;
  dataLoader: DataLoader | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initCharacter: (params: CreateCharacterParams) => Promise<void>;
  loadCharacter: (id: string) => Promise<void>;
  reloadCharacter: () => Promise<void>;
  exportCharacter: () => string;
  deleteCharacter: () => Promise<void>;

  // HP Actions
  damage: (amount: number) => void;
  heal: (amount: number) => void;
  setTempHP: (value: number) => void;

  // Resource Actions
  useResource: (resourceId: string) => void;
  recoverResource: (resourceId: string) => void;

  // Spell Slot Actions
  castSpell: (level: number) => void;
  recoverSpellSlot: (level: number) => void;

  // Condition Actions
  toggleCondition: (condition: ConditionName) => void;

  // Rest Actions
  doShortRest: (hitDiceToSpend?: number) => void;
  doLongRest: () => void;
}

let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

const autoSave = (character: Character) => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(async () => {
    const { storage, computation } = getAppContext();
    await storage.saveCharacter(character.id, computation.serialize(character));
  }, 500);
};

export const useCharacterStore = create<CharacterState>((set, get) => ({
  character: null,
  dataLoader: null,
  isLoading: false,
  error: null,

  initCharacter: async (params) => {
    const { computation, storage } = getAppContext();
    set({ isLoading: true, error: null });

    try {
      const loader = computation.createDataLoader();
      const character = computation.createCharacter(params, loader);

      await storage.saveCharacter(character.id, computation.serialize(character));

      if ('setLastCharacterId' in storage) {
        await (storage as unknown as { setLastCharacterId: (id: string) => Promise<void> }).setLastCharacterId(character.id);
      }

      set({ character, dataLoader: loader, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loadCharacter: async (id) => {
    const { computation, storage } = getAppContext();
    set({ isLoading: true, error: null });

    try {
      const json = await storage.loadCharacter(id);
      if (!json) throw new Error('Character not found');

      const character = computation.deserialize(json);
      const loader = computation.createDataLoader();

      if ('setLastCharacterId' in storage) {
        await (storage as unknown as { setLastCharacterId: (id: string) => Promise<void> }).setLastCharacterId(character.id);
      }

      set({ character, dataLoader: loader, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  reloadCharacter: async () => {
    const { character } = get();
    if (character) {
      await get().loadCharacter(character.id);
    }
  },

  exportCharacter: () => {
    const { character } = get();
    if (!character) return '';

    const { computation } = getAppContext();
    return computation.serialize(character);
  },

  deleteCharacter: async () => {
    const { character } = get();
    if (!character) return;

    const { storage } = getAppContext();
    await storage.deleteCharacter(character.id);
    set({ character: null, dataLoader: null });
  },

  damage: (amount) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.modifyHP(character, -amount),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  heal: (amount) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.modifyHP(character, amount),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  setTempHP: (value) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.setTemporaryHP(character, value),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  useResource: (resourceId) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.consumeResource(character, resourceId),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  recoverResource: (resourceId) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.recoverResource(character, resourceId),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  castSpell: (level) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.consumeSpellSlot(character, level),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  recoverSpellSlot: (level) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.recoverSpellSlot(character, level),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  toggleCondition: (condition) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.toggleCondition(character, condition),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  doShortRest: (hitDiceToSpend = 0) => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.shortRest(character, hitDiceToSpend),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },

  doLongRest: () => {
    const { character, dataLoader } = get();
    if (!character || !dataLoader) return;

    const { computation } = getAppContext();
    const updated = computation.recompute(
      computation.longRest(character),
      dataLoader
    );

    set({ character: updated });
    autoSave(updated);
  },
}));
