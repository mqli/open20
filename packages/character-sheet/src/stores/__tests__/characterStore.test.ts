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
      lastDamageForConcentration: null,
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

  describe('toggleDeathSave', () => {
    it('toggles first success on and off', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Toggle ON: successes 0 → 1
      useCharacterStore.getState().toggleDeathSave('success', 0);
      let c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(1);
      expect(c.hitPoints.deathSaves.failures).toBe(0);
      expect(c.hitPoints.deathSaves.isStable).toBe(false);

      // Toggle OFF: successes 1 → 0
      useCharacterStore.getState().toggleDeathSave('success', 0);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(0);
    });

    it('cannot skip positions — must fill in order', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Try to toggle index 1 when successes=0 → no change (skip index 0)
      useCharacterStore.getState().toggleDeathSave('success', 1);
      let c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(0);

      // Try to toggle index 2 when successes=0 → no change
      useCharacterStore.getState().toggleDeathSave('success', 2);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(0);

      // Fill index 0 first
      useCharacterStore.getState().toggleDeathSave('success', 0);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(1);

      // Skip index 1, try index 2 → no change
      useCharacterStore.getState().toggleDeathSave('success', 2);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(1);

      // Fill index 1 (now valid)
      useCharacterStore.getState().toggleDeathSave('success', 1);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(2);

      // Fill index 2 — next in sequence, works
      useCharacterStore.getState().toggleDeathSave('success', 2);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(3);
    });

    it('auto-stable at 3 successes and un-stable when rolled back', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Fill 3 successes
      useCharacterStore.getState().toggleDeathSave('success', 0);
      useCharacterStore.getState().toggleDeathSave('success', 1);
      useCharacterStore.getState().toggleDeathSave('success', 2);

      let c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(3);
      expect(c.hitPoints.deathSaves.isStable).toBe(true);

      // Roll back: remove the third
      useCharacterStore.getState().toggleDeathSave('success', 2);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.successes).toBe(2);
      expect(c.hitPoints.deathSaves.isStable).toBe(false);
    });

    it('toggles failure markers independently', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      useCharacterStore.getState().toggleDeathSave('failure', 0);
      useCharacterStore.getState().toggleDeathSave('failure', 1);

      let c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.failures).toBe(2);
      expect(c.hitPoints.deathSaves.successes).toBe(0);

      // Remove the second failure
      useCharacterStore.getState().toggleDeathSave('failure', 1);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.failures).toBe(1);
    });

    it('cannot unfill a non-last position', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Fill all 3 failures
      useCharacterStore.getState().toggleDeathSave('failure', 0);
      useCharacterStore.getState().toggleDeathSave('failure', 1);
      useCharacterStore.getState().toggleDeathSave('failure', 2);

      // Try to unfill index 1 (not the last) — should no-op
      useCharacterStore.getState().toggleDeathSave('failure', 1);
      let c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.failures).toBe(3);

      // Unfill index 2 (the last) — should work
      useCharacterStore.getState().toggleDeathSave('failure', 2);
      c = useCharacterStore.getState().character!;
      expect(c.hitPoints.deathSaves.failures).toBe(2);
    });

    it('persists death save changes to localStorage', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      useCharacterStore.getState().toggleDeathSave('success', 0);
      useCharacterStore.getState().toggleDeathSave('success', 1);

      const stored = JSON.parse(localStorage.getItem('open20-character-sheet-characters')!);
      expect(stored[char.id].hitPoints.deathSaves.successes).toBe(2);
      expect(stored[char.id].hitPoints.deathSaves.failures).toBe(0);
    });
  });

  describe('lastDamageForConcentration', () => {
    it('sets lastDamageForConcentration when HP reduced while concentrating', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Start concentrating on a spell
      useCharacterStore.setState((s) => ({
        character: s.character
          ? {
              ...s.character,
              concentration: { spellId: 'fireball', startedAt: new Date().toISOString() },
            }
          : null,
      }));

      useCharacterStore.getState().modifyHP(-12);
      expect(useCharacterStore.getState().lastDamageForConcentration).toBe(12);
    });

    it('does not set lastDamageForConcentration when HP reduced while NOT concentrating', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      useCharacterStore.getState().modifyHP(-8);
      expect(useCharacterStore.getState().lastDamageForConcentration).toBeNull();
    });

    it('does not set lastDamageForConcentration when HP is healed', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      useCharacterStore.setState((s) => ({
        character: s.character
          ? {
              ...s.character,
              concentration: { spellId: 'fireball', startedAt: new Date().toISOString() },
            }
          : null,
      }));

      useCharacterStore.getState().modifyHP(5);
      expect(useCharacterStore.getState().lastDamageForConcentration).toBeNull();
    });
  });
});
