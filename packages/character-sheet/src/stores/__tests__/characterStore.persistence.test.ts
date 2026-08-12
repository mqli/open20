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

  it('migrates legacy array-format characters on load', () => {
    // Simulate old format: [{ id: "abc", data: { schemaVersion: "2024.1", name: "OldHero", ... } }]
    const legacyData = JSON.stringify([
      {
        id: 'old-char-1',
        data: {
          schemaVersion: '2024.1',
          name: 'OldHero',
          species: 'Halfling',
          speciesSubtype: null,
          background: 'criminal',
          classes: [
            {
              classId: 'Paladin',
              level: 1,
              subclassId: null,
              subclassLevel: null,
              hitDice: { die: 'd10', used: 0 },
            },
          ],
          abilityScores: {
            base: SCORES,
            racialBonuses: {},
            backgroundBonuses: {},
            featBonuses: {},
            featGrants: {},
            temporaryBonuses: {},
          },
          skills: { Athletics: { proficient: false, expertise: false } },
          feats: [],
          equipment: [],
          spells: { classSpellcasting: {}, spellSlots: {}, pactMagicSlots: null },
          resources: {},
          hitPoints: {
            max: 10,
            current: 10,
            temporary: 0,
            deathSaves: { successes: 0, failures: 0, isStable: false },
          },
          combatStats: {
            AC: 10,
            initiative: 0,
            speed: 25,
            passivePerception: 10,
            proficiencyBonus: 2,
            attacks: [],
          },
          currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
          conditions: [],
          concentration: null,
          activeEffects: [],
          damageDefenses: { resistances: [], immunities: [], vulnerabilities: [] },
          notes: '',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      },
    ]);

    localStorage.setItem('open20-character-sheet-characters', legacyData);
    localStorage.setItem('open20-character-sheet-active-character', 'old-char-1');

    // Load — should migrate
    useCharacterStore.getState().load();
    const state = useCharacterStore.getState();

    expect(state.isLoaded).toBe(true);
    expect(state.characters['old-char-1']).toBeDefined();
    expect(state.character?.name).toBe('OldHero');
    expect(state.activeCharacterId).toBe('old-char-1');

    // Verify it was saved back in the new Record format
    const raw = localStorage.getItem('open20-character-sheet-characters');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(Array.isArray(parsed)).toBe(false);
    expect(parsed['old-char-1'].name).toBe('OldHero');
    expect(parsed['old-char-1'].id).toBe('old-char-1');
  });
});
