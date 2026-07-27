import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';

describe('characterStore', () => {
  beforeEach(() => {
    initContent();
    localStorage.clear();
    useCharacterStore.setState({
      character: null,
      characters: {},
      activeCharacterId: null,
      isLoaded: false,
      error: null,
    });
  });

  it('modifyHP replaces the snapshot immutably and persists', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    const before = useCharacterStore.getState().character!;
    const maxHp = before.hitPoints.max;

    useCharacterStore.getState().modifyHP(-5);

    const after = useCharacterStore.getState().character!;
    expect(after.hitPoints.current).toBe(maxHp - 5);
    expect(after).not.toBe(before); // new immutable snapshot
    // persisted
    const stored = JSON.parse(localStorage.getItem('open20-character-sheet-characters')!);
    expect(stored[char.id].hitPoints.current).toBe(maxHp - 5);
  });

  it('load() hydrates from storage and recomputes derived stats', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    // fresh store, then load from localStorage
    useCharacterStore.setState({ character: null, characters: {}, activeCharacterId: null });
    useCharacterStore.getState().load();

    const state = useCharacterStore.getState();
    expect(state.isLoaded).toBe(true);
    expect(state.activeCharacterId).toBe(char.id);
    expect(state.character!.combatStats.proficiencyBonus).toBe(3);
  });

  it('deleteCharacter removes and clears active', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    useCharacterStore.getState().deleteCharacter(char.id);
    expect(useCharacterStore.getState().character).toBeNull();
    expect(useCharacterStore.getState().characters[char.id]).toBeUndefined();
  });
});
