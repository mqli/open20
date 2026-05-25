import { useEffect } from 'react';
import { useSpellStore } from '@/stores/spell-store';
import { spellService } from '@/core/spell-service';
import { SearchBar } from '@/components/spell-library/SearchBar';
import { LevelTabs } from '@/components/spell-library/LevelTabs';
import { FilterChips } from '@/components/spell-library/FilterChips';
import { SpellCard } from '@/components/spell-library/SpellCard';
import { SpellDetailFlyout } from '@/components/spell-library/SpellDetailFlyout';
import { Surface, Toggle } from '@open20/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCharacterStore } from '@/stores/character-store';
import { getCasterType } from '@/core/character-service';
import { CharacterBar } from '@/components/character/CharacterBar';

export function SpellLibraryLayout() {
  const {
    setSpells, filteredSpells,
    showPreparedOnly, setShowPreparedOnly,
    showKnownOnly, setShowKnownOnly,
  } = useSpellStore();
  const { activeCharacter, loadCharacters } = useCharacterStore();

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  useEffect(() => {
    const spells = spellService.searchSpells({});
    setSpells(spells);
  }, [setSpells]);

  // Cross-store filtering: apply known/prepared filters here where we have both stores
  let spellsToDisplay = filteredSpells;
  if ((showPreparedOnly || showKnownOnly) && !activeCharacter) {
    spellsToDisplay = [];
  } else if (showPreparedOnly && activeCharacter) {
    // Cantrips can't be "prepared" — exclude them from prepared filter
    spellsToDisplay = filteredSpells.filter(s =>
      s.level > 0 && spellService.isSpellPrepared(activeCharacter, s.id)
    );
  } else if (showKnownOnly && activeCharacter) {
    spellsToDisplay = filteredSpells.filter(s =>
      spellService.isSpellForCharacter(activeCharacter, s) &&
      spellService.isSpellKnown(activeCharacter, s.id)
    );
  }

  const casterType = activeCharacter ? getCasterType(activeCharacter) : { canLearn: false, canPrepare: false };
  const activeFilter = showPreparedOnly ? 'prepared' : showKnownOnly ? 'known' : null;

  const emptyMessage = activeFilter === 'prepared'
    ? 'No prepared spells. Open a spell and click "Prepare".'
    : activeFilter === 'known'
    ? 'No known spells yet. Open a spell and click "Learn".'
    : 'No spells found matching your criteria.';

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <CharacterBar />

      {/* Compact Header */}
      <Surface variant="default" className="rounded-none border-b px-3 md:px-4 py-2">
        {/* Row 1: title + search + filter toggles */}
        <div className="flex items-center gap-2 mb-1.5">
          <h1 className="text-base font-bold text-text-primary whitespace-nowrap">Spells</h1>
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {casterType.canLearn && (
              <Toggle
                variant="info"
                size="sm"
                pressed={showKnownOnly}
                onPressedChange={() => setShowKnownOnly(!showKnownOnly)}
              >
                Known
              </Toggle>
            )}
            {casterType.canPrepare && (
              <Toggle
                variant="primary"
                size="sm"
                pressed={showPreparedOnly}
                onPressedChange={() => setShowPreparedOnly(!showPreparedOnly)}
              >
                Prep
              </Toggle>
            )}
          </div>
        </div>

        {/* Row 2: level chips */}
        <LevelTabs />
      </Surface>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-3 md:px-4 relative">
        <FilterChips />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
          {spellsToDisplay.map(spell => (
            <SpellCard key={spell.id} spell={spell} />
          ))}
        </div>

        {spellsToDisplay.length === 0 && (
          <EmptyState title={emptyMessage} />
        )}
      </main>

      <SpellDetailFlyout />
    </div>
  );
}
