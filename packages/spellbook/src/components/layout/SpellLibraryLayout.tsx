import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSpellStore } from '@/stores/spellStore';
import { spellService } from '@/core/spell-service';
import { SearchBar } from '@/components/spell-library/SearchBar';
import { LevelTabs } from '@/components/spell-library/LevelTabs';
import { FilterChips } from '@/components/spell-library/FilterChips';
import { SpellCard } from '@/components/spell/SpellCard';
import { SpellCardBadges } from '@/components/spell/SpellCardBadges';
import { SpellCardActions } from '@/components/spell/SpellCardActions';
import { SpellDetailFlyout } from '@/components/spell-library/SpellDetailFlyout';
import { CharacterPanel } from '@/components/layout/CharacterPanel';
import { CharacterBottomControls } from '@/components/layout/CharacterBottomControls';
import { CharacterSelector } from '@/components/layout/CharacterSelector';
import { CharacterSheetContent } from '@/components/character/CharacterSheet/CharacterSheet';
import { CharacterModal } from '@/components/character/CharacterModal';
import { CustomSpellModal } from '@/components/spell/CustomSpellModal';
import { ImportSpellsDialog } from '@/components/spell/ImportSpellsDialog';
import { CharacterImportDialog } from '@/components/spell/CharacterImportDialog';
import { exportCharacter } from '@/components/spell/character-import-export-utils';
import { CustomClassModal } from '@/components/class/CustomClassModal';
import { FilterDrawer } from '@/components/layout/FilterDrawer';
import { MobileTabBar, type MobileTab } from '@/components/layout/MobileTabBar';
import { SpellLibraryMoreMenu } from '@/components/spell-library/SpellLibraryMoreMenu';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';
import { EmptyState, Surface, Text, Badge, Button } from '@open20/ui';
import { useTranslation } from '@/i18n';
import { useCharacterStore } from '@/stores/characterStore';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { useCustomClassStore } from '@/stores/customClassStore';
import { Pencil, Trash2 } from 'lucide-react';
import type { Spell } from 'open20-core';
import { getCasterType } from 'open20-core/spells';
import { resolveDeps } from '@/core/content-resolver';

export function SpellLibraryLayout() {
  const t = useTranslation();
  const isLarge = useIsLargeScreen();
  const [isLoading, setIsLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('spells');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  // Custom spell state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null);

  // Custom class state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Import dialog state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Character import dialog state
  const [isCharacterImportDialogOpen, setIsCharacterImportDialogOpen] = useState(false);

  const {
    setSpells,
    filteredSpells,
    showPreparedOnly,
    showKnownOnly,
    selectSpell,
    setShowPreparedOnly,
    setShowKnownOnly,
  } = useSpellStore();
  const { activeCharacter, loadCharacters, shortRest, longRest } = useCharacterStore();
  const {
    spells: customSpells,
    loadSpells: loadCustomSpells,
    deleteSpell: deleteCustomSpell,
  } = useCustomSpellStore();
  const { loadClasses: loadCustomClasses } = useCustomClassStore();

  const casterType = useMemo(() => {
    if (!activeCharacter) return { canLearn: false, canPrepare: false };
    return getCasterType(activeCharacter, resolveDeps(activeCharacter));
  }, [activeCharacter]);

  useEffect(() => {
    async function loadSpells() {
      setIsLoading(true);
      loadCustomClasses();
      await spellService.ensureInitialized();
      loadCharacters();
      loadCustomSpells();
      const spells = spellService.searchSpells({});
      setSpells(spells);
      setIsLoading(false);
    }
    loadSpells();
  }, [loadCharacters, loadCustomSpells, loadCustomClasses, setSpells]);

  // Refresh spell list from spellService (single source of truth)
  // whenever custom spells change (add/delete/import)
  useEffect(() => {
    if (!isLoading) {
      setSpells(spellService.searchSpells({}));
    }
  }, [customSpells, isLoading, setSpells]);

  // Cross-store filtering: apply known/prepared filters here where we have both stores
  let spellsToDisplay = filteredSpells;
  if ((showPreparedOnly || showKnownOnly) && !activeCharacter) {
    spellsToDisplay = [];
  } else if (showPreparedOnly && activeCharacter) {
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

  const activeFilter = showPreparedOnly ? 'prepared' : showKnownOnly ? 'known' : null;

  const emptyMessage =
    activeFilter === 'prepared'
      ? t('noPreparedSpells')
      : activeFilter === 'known'
        ? t('noKnownSpells')
        : t('noSpellsFound');

  // ── Character import/export callbacks ──
  const handleExportCharacter = useCallback(() => {
    if (activeCharacter) {
      exportCharacter(activeCharacter);
    }
  }, [activeCharacter]);

  const handleOpenCharacterImportDialog = useCallback(() => {
    setIsCharacterImportDialogOpen(true);
  }, []);

  // ── Custom spell actions ──
  const isHomebrew = useCallback((spell: Spell) => spell.source === 'Homebrew', []);

  const handleEditCustom = useCallback((spell: Spell) => {
    setEditingSpell(spell);
    setIsCustomModalOpen(true);
  }, []);

  const handleDeleteCustom = useCallback(
    (spellId: string) => {
      if (window.confirm(t('deleteConfirm'))) {
        deleteCustomSpell(spellId);
      }
    },
    [deleteCustomSpell, t],
  );

  // Spell library content (reused in desktop right column and mobile spells tab)
  const spellLibraryContent = (
    <div className="flex flex-col h-full min-w-0">
      {/* Spell Header */}
      <Surface variant="default" className="rounded-none border-b px-3 py-1.5">
        <div className="flex items-center gap-2">
          {isLarge && (
            <Text as="h1" variant="heading" className="shrink-0 mr-1">
              {t('spells')}
            </Text>
          )}
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>
          <FilterDrawer />
          <SpellLibraryMoreMenu
            onOpenCreateSpell={() => {
              setEditingSpell(null);
              setIsCustomModalOpen(true);
            }}
            onOpenClassManager={() => setIsClassModalOpen(true)}
            onOpenImportDialog={() => setIsImportDialogOpen(true)}
            onExportCharacter={handleExportCharacter}
            onOpenCharacterImportDialog={handleOpenCharacterImportDialog}
            hasActiveCharacter={!!activeCharacter}
          />
        </div>
      </Surface>

      {/* Spell Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-4 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 gap-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <Text variant="body">{t('loading')}</Text>
          </div>
        ) : (
          <>
            {isLarge && (
              <div className="mt-3 space-y-3">
                <LevelTabs />
                <FilterChips />
              </div>
            )}
            <div
              className={`grid gap-3 pb-8 ${
                isLarge ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              } mt-3`}
            >
              {spellsToDisplay.map((spell) => (
                <SpellCard
                  key={spell.id}
                  spell={spell}
                  showDescription={false}
                  onClick={() => selectSpell(spell)}
                  renderBadges={() => (
                    <SpellCardBadges
                      spell={spell}
                      showSpellbookBadges
                      renderBadges={
                        isHomebrew(spell)
                          ? () => (
                              <Badge variant="secondary" size="xs">
                                {t('homebrew')}
                              </Badge>
                            )
                          : undefined
                      }
                    />
                  )}
                  renderActions={() => (
                    <div className="flex items-center gap-1">
                      {isHomebrew(spell) && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustom(spell);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-1.5 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustom(spell.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <SpellCardActions spell={spell} showSpellbook />
                    </div>
                  )}
                />
              ))}
            </div>
            {spellsToDisplay.length === 0 && <EmptyState title={emptyMessage} />}
          </>
        )}
      </main>
    </div>
  );

  // Desktop: 2-column layout
  if (isLarge) {
    return (
      <div className="flex h-screen bg-bg-primary overflow-hidden">
        {/* Left: Character Panel */}
        <div className="w-80 shrink-0 h-full">
          <CharacterPanel />
        </div>

        {/* Right: Spell Library */}
        <div className="flex-1 flex flex-col min-w-0">{spellLibraryContent}</div>

        <SpellDetailFlyout />
        <CustomSpellModal
          open={isCustomModalOpen}
          onOpenChange={setIsCustomModalOpen}
          editingSpell={editingSpell}
        />
        <CustomClassModal open={isClassModalOpen} onOpenChange={setIsClassModalOpen} />
        <ImportSpellsDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
        <CharacterImportDialog
          open={isCharacterImportDialogOpen}
          onOpenChange={setIsCharacterImportDialogOpen}
        />
      </div>
    );
  }

  // Mobile: single column with tab bar
  return (
    <div className="flex flex-col h-dvh bg-bg-primary overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {mobileTab === 'spells' ? (
          spellLibraryContent
        ) : (
          <div className="flex flex-col h-full" data-testid="character-content">
            {/* Character Selector */}
            <div className="shrink-0 px-3 py-2 border-b border-border">
              <CharacterSelector />
            </div>

            {activeCharacter ? (
              <>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <CharacterSheetContent
                    onEdit={() => {
                      setEditingId(activeCharacter.id);
                      setIsModalOpen(true);
                    }}
                  />
                </div>
                {/* Fixed Bottom Controls */}
                <CharacterBottomControls
                  canPrepare={casterType.canPrepare}
                  canLearn={casterType.canLearn}
                  showPreparedOnly={showPreparedOnly}
                  showKnownOnly={showKnownOnly}
                  onShowPreparedOnlyChange={setShowPreparedOnly}
                  onShowKnownOnlyChange={setShowKnownOnly}
                  onShortRest={shortRest}
                  onLongRest={longRest}
                />
              </>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        )}
      </div>
      <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} />
      <SpellDetailFlyout />
      <CharacterModal open={isModalOpen} onOpenChange={setIsModalOpen} characterId={editingId} />
      <CustomSpellModal
        open={isCustomModalOpen}
        onOpenChange={setIsCustomModalOpen}
        editingSpell={editingSpell}
      />
      <CustomClassModal open={isClassModalOpen} onOpenChange={setIsClassModalOpen} />
      <ImportSpellsDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
      <CharacterImportDialog
        open={isCharacterImportDialogOpen}
        onOpenChange={setIsCharacterImportDialogOpen}
      />
    </div>
  );
}
