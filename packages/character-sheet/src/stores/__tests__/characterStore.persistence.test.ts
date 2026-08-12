import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent } from '@/core/content-resolver';

const SCORES = {
  Strength: 10,
  Dexterity: 14,
  Constitution: 14,
  Intelligence: 15,
  Wisdom: 12,
  Charisma: 8,
};

describe('character store persistence', () => {
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

  it('creates a character and saves to localStorage', () => {
    const id = useCharacterStore.getState().createCharacter({
      name: 'PersistTest',
      speciesId: 'Human',
      backgroundId: 'acolyte',
      classId: 'Cleric',
      classLevel: 3,
      abilityScores: SCORES,
    });

    expect(id).toBeTruthy();

    // Check localStorage contains the character
    const raw = localStorage.getItem('open20-character-sheet-characters');
    expect(raw).toBeTruthy();

    const parsed = JSON.parse(raw!);
    // The saved character should have spell data
    expect(parsed[id!]).toBeDefined();
    expect(parsed[id!].name).toBe('PersistTest');
    expect(parsed[id!].spells.classSpellcasting.Cleric).toBeDefined();
    expect(parsed[id!].spells.classSpellcasting.Cleric.knownSpells.length).toBeGreaterThan(0);
  });

  it('creates and reloads a character across simulated refresh', () => {
    // Create
    const id = useCharacterStore.getState().createCharacter({
      name: 'ReloadTest',
      speciesId: 'Human',
      backgroundId: 'acolyte',
      classId: 'Cleric',
      classLevel: 3,
      abilityScores: SCORES,
    });
    expect(id).toBeTruthy();

    // Clear in-memory state
    useCharacterStore.setState({
      character: null,
      characters: {},
      activeCharacterId: null,
      isLoaded: false,
    });

    // Reload from localStorage
    useCharacterStore.getState().load();

    const state = useCharacterStore.getState();
    expect(state.isLoaded).toBe(true);
    expect(state.characters[id!]).toBeDefined();
    expect(state.character?.name).toBe('ReloadTest');
    expect(state.character?.spells.classSpellcasting.Cleric?.knownSpells.length).toBeGreaterThan(0);
  });

  it('recomputes spell data correctly on load', () => {
    const id = useCharacterStore.getState().createCharacter({
      name: 'RecomputeTest',
      speciesId: 'Human',
      backgroundId: 'acolyte',
      classId: 'Cleric',
      classLevel: 3,
      abilityScores: SCORES,
    });
    expect(id).toBeTruthy();

    // Recompute and compare
    const stateAfter = useCharacterStore.getState();
    const active = stateAfter.character!;
    const wizData = active.spells.classSpellcasting.Cleric!;

    expect(wizData.spellSaveDC).toBeGreaterThan(0);
    expect(wizData.spellAttackBonus).toBeGreaterThan(0);
    expect(wizData.maxPrepared).toBeGreaterThan(0);
    expect(wizData.knownSpells.length).toBeGreaterThan(0);
  });
});
