import { useEffect, useState, useCallback } from 'react';
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
import { CharacterSelector } from '@/components/layout/CharacterSelector';
import { CharacterSheetContent } from '@/components/character/CharacterSheet/CharacterSheet';
import { CharacterModal } from '@/components/character/CharacterModal';
import { CustomSpellModal } from '@/components/spell/CustomSpellModal';
import { CustomClassModal } from '@/components/class/CustomClassModal';
import { FilterDrawer } from '@/components/layout/FilterDrawer';
import { MobileTabBar, type MobileTab } from '@/components/layout/MobileTabBar';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';
import { EmptyState, Surface, Text, Badge, Button, DropdownMenu } from '@open20/ui';
import { useTranslation, useI18n } from '@/i18n';
import { useCharacterStore } from '@/stores/characterStore';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { useCustomClassStore } from '@/stores/customClassStore';
import { useUIStore } from '@/stores/uiStore';
import { storageService } from '@/core/storage-service';
import { Pencil, Trash2, Sparkles, Settings, MoreHorizontal, Globe, Sun, Moon } from 'lucide-react';
import type { Spell } from 'open20-core';

export function SpellLibraryLayout() {
  const t = useTranslation();
  const { locale, setLocale } = useI18n();
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

  const { setSpells, filteredSpells, showPreparedOnly, showKnownOnly, selectSpell } =
    useSpellStore();
  const { activeCharacter, loadCharacters } = useCharacterStore();
  const { theme, setTheme } = useUIStore();
  const {
    spells: customSpells,
    loadSpells: loadCustomSpells,
    deleteSpell: deleteCustomSpell,
  } = useCustomSpellStore();
  const { loadClasses: loadCustomClasses } = useCustomClassStore();

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

  // Merge custom spells into display list whenever they change
  useEffect(() => {
    if (!isLoading) {
      const srdSpells = spellService.searchSpells({});
      setSpells([...srdSpells, ...customSpells]);
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
    <div className="flex flex-col h-full">
      {/* Spell Header */}
      <Surface variant="default" className="rounded-none border-b px-3 py-1.5">
        <div className="flex items-center gap-2">
          {isLarge ? (
            <Text as="h1" variant="heading" className="shrink-0 mr-1">
              {t('spells')}
            </Text>
          ) : (
            <CharacterSelector compact />
          )}
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>
          <FilterDrawer />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" variant="ghost" size="sm" className="shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content sideOffset={4} align="end">
              <DropdownMenu.Item
                onSelect={() => {
                  setEditingSpell(null);
                  setIsCustomModalOpen(true);
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('createCustomSpell')}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setIsClassModalOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                {t('manageCustomClasses')}
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                onSelect={() => {
                  const next = locale === 'en' ? 'zh-CN' : 'en';
                  setLocale(next);
                  storageService.savePreferences({ language: next });
                }}
              >
                <Globe className="w-4 h-4 mr-2" />
                {t('language')}: {locale === 'en' ? 'English' : '中文'}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Moon className="w-4 h-4 mr-2" />
                )}
                {t('theme')}: {theme === 'light' ? 'Light' : 'Dark'}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </Surface>

      {/* Spell Content */}
      <main className="flex-1 overflow-y-auto px-3 md:px-4 relative">
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
                isLarge ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
      </div>
    );
  }

  // Mobile: single column with tab bar
  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {mobileTab === 'spells' ? (
          spellLibraryContent
        ) : (
          <div className="h-full overflow-y-auto px-3 py-4">
            <CharacterSheetContent
              onEdit={() => {
                if (activeCharacter) {
                  setEditingId(activeCharacter.id);
                  setIsModalOpen(true);
                }
              }}
            />
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
    </div>
  );
}
