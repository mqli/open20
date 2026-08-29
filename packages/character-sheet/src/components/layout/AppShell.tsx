// AppShell.tsx
// Responsive scaffold implementing Wireframe_Design.md §4 layout architecture.
//
// Desktop (>= 1024px): Sidebar (250px) + ContentArea (Combat focus area + two-column grid)
// Tablet  (768-1023px): HeroStrip + ContentArea (single column) + MobileBottomBar
// Mobile  (< 768px):    HeroStrip + ContentArea (single column) + MobileBottomBar
//
// Navigation: Sidebar tabs / MobileBottomBar tabs scroll to the target section.
// Desktop: all sections always expanded (no collapse).
// Mobile: single-open collapse (only one section open at a time, combat always pinned).

import { useState, useCallback } from 'react';
import { Plus, Users, Pencil } from 'lucide-react';
import { Surface, Text, Button, EmptyState } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassName, getSpeciesName } from '@/core/content-resolver';
import { useIsLargeScreen } from '@/hooks/useIsLargeScreen';
import { Sidebar } from './Sidebar';
import { COLLAPSIBLE_SECTIONS } from './sections';
import type { CollapsibleKey, SectionKey } from './sections';
import { HeroStrip } from './HeroStrip';
import { ContentArea } from './ContentArea';
import { MobileBottomBar } from './MobileBottomBar';
import { RestActionsCompact } from './RestActions';
import { CharacterSelector } from '@/components/character/CharacterSelector';
import { CharacterCreateWizard } from '@/components/character/CharacterCreateWizard';
import { CharacterEditDialog } from '@/components/character/CharacterEditDialog';
import { LevelUpWizard } from '@/components/character/LevelUpWizard';

export function AppShell() {
  const { isDesktop } = useIsLargeScreen();
  const {
    character,
    error,
    modifyHP,
    toggleDeathSave,
    toggleInspiration,
    modifyCurrency,
    toggleCondition,
    equipItem,
    unequipItem,
    removeEquipment,
    addEquipment,
    toggleDamageDefense,
  } = useCharacterStore();

  // Collapse state (mobile single-open only). Combat is excluded — it is a
  // permanent focus area rendered above the fold and never collapses.
  const [expandedSections, setExpandedSections] = useState<Record<CollapsibleKey, boolean>>(() => {
    const initial = {} as Record<CollapsibleKey, boolean>;
    COLLAPSIBLE_SECTIONS.forEach((k) => {
      initial[k] = k === 'abilities';
    });
    return initial;
  });

  // Track which section the user last navigated to (for sidebar/bottom-bar highlight).
  const [lastNavigatedSection, setLastNavigatedSection] = useState<SectionKey>('combat');

  // Character-management dialog state
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLevelUpWizard, setShowLevelUpWizard] = useState(false);

  // Toggle a section's expanded state (mobile single-open only).
  const handleToggleSection = useCallback((key: CollapsibleKey) => {
    setExpandedSections((prev) => {
      const next = {} as Record<CollapsibleKey, boolean>;
      COLLAPSIBLE_SECTIONS.forEach((k) => {
        next[k] = k === key ? !prev[key] : false;
      });
      return next;
    });
  }, []);

  // Navigation handler: expand target section (mobile), scroll to it after
  // React commit, and update the highlighted nav item.
  const handleSectionChange = useCallback((key: SectionKey) => {
    setLastNavigatedSection(key);

    if (key !== 'combat') {
      const next = {} as Record<CollapsibleKey, boolean>;
      COLLAPSIBLE_SECTIONS.forEach((k) => {
        next[k] = k === key;
      });
      setExpandedSections(next);
    }

    // Defer scroll until React has committed the expanded state update.
    // Without this, the target section may still be collapsed (grid-rows-[0fr])
    // and scrollIntoView would land on the wrong position.
    requestAnimationFrame(() => {
      document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const handleToggleEquip = useCallback(
    (itemId: string) => {
      if (!character) return;
      const item = character.equipment.find((e) => e.id === itemId);
      if (!item) return;
      if (item.equipped) {
        unequipItem(itemId);
      } else {
        equipItem(itemId);
      }
    },
    [character, equipItem, unequipItem],
  );

  // Character dialogs — rendered at top level so they persist when the active
  // character is deleted (store sets character→null), and so the wizard is a
  // sibling of the selector rather than nested inside it.
  const characterDialogs = (
    <>
      <CharacterSelector
        open={showCharacterSelector}
        onOpenChange={setShowCharacterSelector}
        onRequestCreate={() => {
          setShowCharacterSelector(false);
          setShowCreateWizard(true);
        }}
      />
      <CharacterCreateWizard open={showCreateWizard} onOpenChange={setShowCreateWizard} />
      <CharacterEditDialog open={showEditDialog} onOpenChange={setShowEditDialog} />
      <LevelUpWizard open={showLevelUpWizard} onOpenChange={setShowLevelUpWizard} />
    </>
  );

  // ── Error banner (rendered before empty state so errors are visible even without a character) ──
  const errorBanner = error && (
    <Surface variant="warning" padding="sm" className="m-2 lg:m-0" role="alert">
      <Text variant="bodySm">{error}</Text>
    </Surface>
  );

  // ── Empty state ──���─────────────────────────────────────────
  if (!character) {
    return (
      <>
        {errorBanner}
        <div className="flex min-h-screen items-center justify-center p-6">
          <EmptyState
            title="No Character Yet"
            description="Create your first D&D 2024 character to get started."
            action={
              <Button variant="primary" onClick={() => setShowCreateWizard(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Create Character
              </Button>
            }
          />
        </div>
        {characterDialogs}
      </>
    );
  }

  // ── Desktop layout ─���───────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="relative flex h-screen overflow-hidden bg-bg-primary max-w-7xl mx-auto">
        {errorBanner && <div className="absolute top-0 left-0 right-0 z-50 p-2">{errorBanner}</div>}

        {/* Sidebar */}
        <Sidebar
          character={character}
          activeSection={lastNavigatedSection}
          onSectionChange={handleSectionChange}
          onOpenCharacterSelector={() => setShowCharacterSelector(true)}
          onEditCharacter={() => setShowEditDialog(true)}
          onLevelUp={() => setShowLevelUpWizard(true)}
        />

        {/* Content — combat focus area + two-column grid */}
        <ContentArea
          character={character}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          isDesktop
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
          toggleInspiration={toggleInspiration}
          modifyCurrency={modifyCurrency}
          toggleCondition={toggleCondition}
          onToggleEquip={handleToggleEquip}
          onRemoveEquipment={removeEquipment}
          onAddEquipment={addEquipment}
          onToggleDamageDefense={toggleDamageDefense}
        />

        {/* Character dialogs — render at top level */}
        {characterDialogs}
      </div>
    );
  }

  // ── Tablet / Mobile layout ─────────────────────────────────
  // HeroStrip + accordion ContentArea + MobileBottomBar
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
  const classLabel = character.classes.map((c) => getClassName(c.classId)).join(' / ');

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary max-w-7xl mx-auto">
      {/* Error banner */}
      {errorBanner}

      {/* Sticky header: top bar + hero strip */}
      <div className="sticky top-0 z-20 bg-bg-secondary">
        {/* Character name + level info */}
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="min-w-0 flex-1">
            <Text variant="body" weight="bold" className="truncate">
              {character.name}
            </Text>
            <Text variant="bodySm" color="secondary" className="truncate">
              {getSpeciesName(character.species)} · Lv.{totalLevel} {classLabel}
            </Text>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setShowEditDialog(true)}
            aria-label="Edit character"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setShowCharacterSelector(true)}
            aria-label="Manage characters"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        {/* Hero Strip + Rest/LevelUp actions — combat stats pinned at top */}
        <div className="flex items-center gap-1 border-b border-border">
          <HeroStrip
            character={character}
            onExpand={() => handleSectionChange('combat')}
            className="flex-1 min-w-0"
          />
          <RestActionsCompact
            onLevelUp={() => setShowLevelUpWizard(true)}
            levelUpDisabled={character.classes.reduce((sum, c) => sum + c.level, 0) >= 20}
            className="shrink-0 pr-3"
          />
        </div>
      </div>

      {/* Content — single column, single-open collapse */}
      <div className="flex-1 pb-[56px]">
        <ContentArea
          character={character}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          isDesktop={false}
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
          toggleInspiration={toggleInspiration}
          modifyCurrency={modifyCurrency}
          toggleCondition={toggleCondition}
          onToggleEquip={handleToggleEquip}
          onRemoveEquipment={removeEquipment}
          onAddEquipment={addEquipment}
          onToggleDamageDefense={toggleDamageDefense}
          className="pb-4"
        />
      </div>

      {/* Bottom Tab Bar */}
      <MobileBottomBar activeSection={lastNavigatedSection} onSectionChange={handleSectionChange} />

      {/* Character dialogs — render at top level */}
      {characterDialogs}
    </div>
  );
}
