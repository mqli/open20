import { useEffect, useState } from 'react';
import { useSpellStore } from '@/stores/spell-store';
import { spellService } from '@/core/spell-service';
import { SearchBar } from '@/components/spell-library/SearchBar';
import { LevelTabs } from '@/components/spell-library/LevelTabs';
import { FilterChips } from '@/components/spell-library/FilterChips';
import { SpellCardWrapper } from '@/components/spell/SpellCardWrapper';
import { SpellDetailFlyout } from '@/components/spell-library/SpellDetailFlyout';
import { EmptyState, Surface, Toggle, Text } from '@open20/ui';
import { useTranslation } from '@/i18n';
import { useCharacterStore } from '@/stores/character-store';
import { getCasterType } from '@/core/character-service';
import { CharacterBar } from '@/components/character/CharacterBar';

export function SpellLibraryLayout() {
  const t = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const {
    setSpells,
    filteredSpells,
    showPreparedOnly,
    setShowPreparedOnly,
    showKnownOnly,
    setShowKnownOnly,
    selectSpell,
  } = useSpellStore();
  const { activeCharacter, loadCharacters } = useCharacterStore();

  useEffect(() => {
    async function loadSpells() {
      setIsLoading(true);
      await spellService.ensureInitialized();
      loadCharacters();
      const spells = spellService.searchSpells({});
      setSpells(spells);
      setIsLoading(false);
    }
    loadSpells();
  }, [loadCharacters, setSpells]);

  // Cross-store filtering: apply known/prepared filters here where we have both stores
  let spellsToDisplay = filteredSpells;
  if ((showPreparedOnly || showKnownOnly) && !activeCharacter) {
    spellsToDisplay = [];
  } else if (showPreparedOnly && activeCharacter) {
    // Cantrips can't be "prepared" — exclude them from prepared filter
    spellsToDisplay = filteredSpells.filter(
      (s) => s.level > 0 && spellService.isSpellPrepared(activeCharacter, s.id),
    );
  } else if (showKnownOnly && activeCharacter) {
    spellsToDisplay = filteredSpells.filter(
      (s) =>
        spellService.isSpellForCharacter(activeCharacter, s) &&
        spellService.isSpellKnown(activeCharacter, s.id),
    );
  }

  const casterType = activeCharacter
    ? getCasterType(activeCharacter)
    : { canLearn: false, canPrepare: false };
  const activeFilter = showPreparedOnly ? 'prepared' : showKnownOnly ? 'known' : null;

  const emptyMessage =
    activeFilter === 'prepared'
      ? t('noPreparedSpells')
      : activeFilter === 'known'
        ? t('noKnownSpells')
        : t('noSpellsFound');

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      {!isLoading && <CharacterBar />}

      {/* Compact Header */}
      <Surface variant="default" className="rounded-none border-b px-3 md:px-4 py-2">
        {/* Row 1: title + search + filter toggles */}
        <div className="flex items-center gap-2 mb-1.5">
          <Text as="h1" variant="heading">
            {t('spells')}
          </Text>
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {casterType.canLearn && (
              <Toggle
                data-testid="known-toggle"
                variant="secondary"
                size="sm"
                pressed={showKnownOnly}
                onPressedChange={() => setShowKnownOnly(!showKnownOnly)}
              >
                {t('known')}
              </Toggle>
            )}
            {casterType.canPrepare && (
              <Toggle
                data-testid="prepared-toggle"
                variant="primary"
                size="sm"
                pressed={showPreparedOnly}
                onPressedChange={() => setShowPreparedOnly(!showPreparedOnly)}
              >
                {t('prepared')}
              </Toggle>
            )}
          </div>
        </div>
        {/* Row 2: level chips */}
        <LevelTabs />
      </Surface>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-3 md:px-4 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 gap-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <Text variant="body">{t('loading')}</Text>
          </div>
        ) : (
          <>
            <FilterChips />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
              {spellsToDisplay.map((spell) => (
                <SpellCardWrapper
                  key={spell.id}
                  spell={spell}
                  showDescription={false}
                  showSpellbookActions
                  showSpellbookBadges
                  onClick={() => selectSpell(spell)}
                />
              ))}
            </div>
            {spellsToDisplay.length === 0 && <EmptyState title={emptyMessage} />}
          </>
        )}
      </main>
      <SpellDetailFlyout />
    </div>
  );
}
