import { describe, it, expect, beforeEach } from 'vitest';
import { useSpellStore } from '@open20/spellbook/stores/spell-store';
import type { Spell } from 'open20-core';

describe('SpellStore', () => {
  beforeEach(() => {
    useSpellStore.setState({
      spells: [
        { id: '1', name: 'Fireball', level: 3, school: 'Evocation', classes: ['Wizard'], concentration: false, ritual: false, castingTime: 'Action', range: '150 feet', components: ['V', 'S', 'M'], duration: 'Instantaneous', source: 'SRD', description: [] } as Spell,
        { id: '2', name: 'Cure Wounds', level: 1, school: 'Evocation', classes: ['Cleric'], concentration: false, ritual: false, castingTime: 'Action', range: 'Touch', components: ['V', 'S'], duration: 'Instantaneous', source: 'SRD', description: [] } as Spell,
        { id: '3', name: 'Haste', level: 3, school: 'Transmutation', classes: ['Wizard'], concentration: true, ritual: false, castingTime: 'Action', range: '30 feet', components: ['V', 'S', 'M'], duration: '1 minute', source: 'SRD', description: [] } as Spell
      ],
      filteredSpells: [],
      searchQuery: '',
      selectedLevel: null,
      selectedClasses: [],
      selectedSchools: [],
      showRitualOnly: false,
      showConcentrationOnly: false,
      showPreparedOnly: false,
      showKnownOnly: false,
    });
    // Apply initial filters
    useSpellStore.getState().applyFilters();
  });

  it('should filter by search query', () => {
    useSpellStore.getState().setSearchQuery('Fire');
    expect(useSpellStore.getState().filteredSpells).toHaveLength(1);
    expect(useSpellStore.getState().filteredSpells[0].name).toBe('Fireball');
  });

  it('should filter by level', () => {
    useSpellStore.getState().setSelectedLevel(3);
    expect(useSpellStore.getState().filteredSpells).toHaveLength(2);
  });

  it('should filter by concentration', () => {
    useSpellStore.getState().setShowConcentrationOnly(true);
    expect(useSpellStore.getState().filteredSpells).toHaveLength(1);
    expect(useSpellStore.getState().filteredSpells[0].name).toBe('Haste');
  });

  it('should handle showKnownOnly and showPreparedOnly mutual exclusivity', () => {
    useSpellStore.getState().setShowKnownOnly(true);
    expect(useSpellStore.getState().showKnownOnly).toBe(true);
    expect(useSpellStore.getState().showPreparedOnly).toBe(false);

    useSpellStore.getState().setShowPreparedOnly(true);
    expect(useSpellStore.getState().showPreparedOnly).toBe(true);
    expect(useSpellStore.getState().showKnownOnly).toBe(false);
  });
});
