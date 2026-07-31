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

  describe('shortRest', () => {
    it('recovers HP and increments hit dice used', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Damage the character first so HP recovery is visible
      useCharacterStore.getState().modifyHP(-20);
      const before = useCharacterStore.getState().character!;
      const hurtHp = before.hitPoints.current;
      const hdUsedBefore = before.classes[0].hitDice.used;

      useCharacterStore.getState().shortRest({ Wizard: 3 });

      const after = useCharacterStore.getState().character!;
      // HP should have recovered (3 × (avg d6 + CON mod))
      expect(after.hitPoints.current).toBeGreaterThan(hurtHp);
      // Hit dice used count increased
      expect(after.classes[0].hitDice.used).toBe(hdUsedBefore + 3);
      // Immutable snapshot
      expect(after).not.toBe(before);
    });

    it('persists to localStorage', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);
      useCharacterStore.getState().modifyHP(-10);
      useCharacterStore.getState().shortRest({ Wizard: 2 });

      const stored = JSON.parse(localStorage.getItem('open20-character-sheet-characters')!);
      const storedChar = stored[char.id];
      expect(storedChar.classes[0].hitDice.used).toBe(2);
      expect(storedChar.hitPoints.current).toBeGreaterThan(char.hitPoints.max - 10);
    });

    it('clears lastDamageForConcentration', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);
      useCharacterStore.setState({ lastDamageForConcentration: 15 });

      useCharacterStore.getState().shortRest({ Wizard: 1 });
      expect(useCharacterStore.getState().lastDamageForConcentration).toBeNull();
    });

    it('does nothing when no character is active', () => {
      useCharacterStore.getState().shortRest({ Wizard: 1 });
      // Should not throw
      expect(useCharacterStore.getState().character).toBeNull();
    });
  });

  describe('longRest', () => {
    it('restores full HP and resets all hit dice', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      useCharacterStore.getState().modifyHP(-15);
      useCharacterStore.getState().shortRest({ Wizard: 2 }); // spend some HD

      const before = useCharacterStore.getState().character!;
      expect(before.classes[0].hitDice.used).toBeGreaterThan(0);

      useCharacterStore.getState().longRest();

      const after = useCharacterStore.getState().character!;
      expect(after.hitPoints.current).toBe(after.hitPoints.max);
      expect(after.classes[0].hitDice.used).toBe(0);
      expect(after).not.toBe(before);
    });

    it('resets death saves', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      // Set some death saves
      useCharacterStore.getState().toggleDeathSave('failure', 0);
      useCharacterStore.getState().toggleDeathSave('failure', 1);
      expect(useCharacterStore.getState().character!.hitPoints.deathSaves.failures).toBe(2);

      useCharacterStore.getState().longRest();

      const ds = useCharacterStore.getState().character!.hitPoints.deathSaves;
      expect(ds.successes).toBe(0);
      expect(ds.failures).toBe(0);
      expect(ds.isStable).toBe(false);
    });

    it('persists to localStorage', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);
      useCharacterStore.getState().modifyHP(-20);
      useCharacterStore.getState().shortRest({ Wizard: 2 });
      useCharacterStore.getState().longRest();

      const stored = JSON.parse(localStorage.getItem('open20-character-sheet-characters')!);
      const storedChar = stored[char.id];
      expect(storedChar.hitPoints.current).toBe(storedChar.hitPoints.max);
      expect(storedChar.classes[0].hitDice.used).toBe(0);
    });

    it('clears lastDamageForConcentration', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);
      useCharacterStore.setState({ lastDamageForConcentration: 15 });

      useCharacterStore.getState().longRest();
      expect(useCharacterStore.getState().lastDamageForConcentration).toBeNull();
    });

    it('does nothing when no character is active', () => {
      useCharacterStore.getState().longRest();
      // Should not throw
      expect(useCharacterStore.getState().character).toBeNull();
    });
  });

  describe('toggleInspiration', () => {
    it('toggles inspiration from false to true', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);
      expect(useCharacterStore.getState().character!.inspiration).toBe(false);

      useCharacterStore.getState().toggleInspiration();
      expect(useCharacterStore.getState().character!.inspiration).toBe(true);
    });

    it('toggles inspiration from true to false', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);
      // Manually set inspiration to true via state override
      useCharacterStore.setState((s) => ({
        character: s.character ? { ...s.character, inspiration: true } : null,
      }));
      expect(useCharacterStore.getState().character!.inspiration).toBe(true);

      useCharacterStore.getState().toggleInspiration();
      expect(useCharacterStore.getState().character!.inspiration).toBe(false);
    });

    it('persists inspiration change to localStorage', () => {
      const char = makeCharacter();
      useCharacterStore.getState().upsertCharacter(char);

      useCharacterStore.getState().toggleInspiration();

      const stored = JSON.parse(localStorage.getItem('open20-character-sheet-characters')!);
      expect(stored[char.id].inspiration).toBe(true);
    });

    it('does nothing when no character is active', () => {
      useCharacterStore.getState().toggleInspiration();
      expect(useCharacterStore.getState().character).toBeNull();
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
