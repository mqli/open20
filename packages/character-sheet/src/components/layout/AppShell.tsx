// AppShell.tsx
// Responsive scaffold implementing Wireframe_Design.md §4 layout architecture.
//
// Desktop (>= 1024px): Sidebar (250px) + ContentArea (accordion) side by side
// Tablet  (768-1023px): HeroStrip + ContentArea (accordion) + MobileBottomBar
// Mobile  (< 768px):    HeroStrip + ContentArea (accordion) + MobileBottomBar
//
// Navigation: Sidebar tabs / MobileBottomBar tabs expand the target section and scroll to it.
// Desktop: multi-open accordion (all sections independently togglable).
// Mobile: single-open accordion (only one section open at a time, combat always open).

import { useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import { createCharacter, type AbilityName } from 'open20-core';
import { Surface, Text, Button, EmptyState } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { buildDepsForCreate, getClassName, getSpeciesName } from '@/core/content-resolver';
import { useIsLargeScreen } from '@/hooks/useIsLargeScreen';
import { Sidebar } from './Sidebar';
import type { SectionKey } from './Sidebar';
import { HeroStrip } from './HeroStrip';
import { ContentArea } from './ContentArea';
import { MobileBottomBar } from './MobileBottomBar';
import { CharacterSelector } from '@/components/character/CharacterSelector';

const SAMPLE_SCORES: Record<AbilityName, number> = {
  Strength: 10,
  Dexterity: 14,
  Constitution: 14,
  Intelligence: 16,
  Wisdom: 12,
  Charisma: 10,
};

function createSampleCharacter() {
  const deps = buildDepsForCreate({
    speciesId: 'Elf',
    backgroundId: 'sage',
    classId: 'Wizard',
  });
  const char = createCharacter(
    {
      name: 'Tharion',
      speciesId: 'Elf',
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 5,
      abilityScores: SAMPLE_SCORES,
    },
    deps,
  );
  return { ...char, id: crypto.randomUUID() };
}

const ALL_SECTIONS: SectionKey[] = [
  'combat',
  'abilities',
  'skills',
  'spells',
  'equipment',
  'features',
  'notes',
];

export function AppShell() {
  const { isDesktop } = useIsLargeScreen();
  const { character, error, modifyHP, toggleDeathSave, toggleInspiration, upsertCharacter } =
    useCharacterStore();

  // Accordion state: combat is always expanded.
  // Desktop: all sections start expanded (multi-open).
  // Mobile: only combat expanded by default (single-open).
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>(() => {
    const initial = { combat: true } as Record<SectionKey, boolean>;
    // On mobile, only combat starts expanded; desktop has all open.
    // isDesktop defaults to true before matchMedia resolves (safe for SSR).
    ALL_SECTIONS.forEach((k) => {
      initial[k] = isDesktop || k === 'combat';
    });
    return initial;
  });

  // Track which section the user last navigated to (for sidebar/bottom-bar highlight).
  const [lastNavigatedSection, setLastNavigatedSection] = useState<SectionKey>('combat');

  // CharacterSelector dialog state
  const [showCharacterSelector, setShowCharacterSelector] = useState(false); // Toggle a section's expanded state.
  // Desktop: toggle independently.
  // Mobile: single-open (close other sections besides combat).
  const handleToggleSection = useCallback(
    (key: SectionKey) => {
      if (key === 'combat') return; // never collapse combat
      if (isDesktop) {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
      } else {
        // Single-open: close all other sections, toggle the target.
        // Use functional updater to avoid stale closure on expandedSections.
        setExpandedSections((prev) => {
          const next = { combat: true } as Record<SectionKey, boolean>;
          ALL_SECTIONS.forEach((k) => {
            next[k] = k === key ? !prev[key] : k === 'combat';
          });
          return next;
        });
      }
    },
    [isDesktop],
  );

  // Navigation handler: expand target section, scroll to it after React commit,
  // and update the highlighted nav item.
  const handleSectionChange = useCallback(
    (key: SectionKey) => {
      setLastNavigatedSection(key);

      setExpandedSections((prev) => {
        const next = { combat: true } as Record<SectionKey, boolean>;
        if (isDesktop) {
          // Desktop: preserve other sections, expand target
          ALL_SECTIONS.forEach((k) => {
            next[k] = k === key ? true : prev[k];
          });
        } else {
          // Mobile: single-open, only combat + target
          ALL_SECTIONS.forEach((k) => {
            next[k] = k === 'combat' || k === key;
          });
        }
        return next;
      });

      // Defer scroll until React has committed the expanded state update.
      // Without this, the target section may still be collapsed (grid-rows-[0fr])
      // and scrollIntoView would land on the wrong position.
      requestAnimationFrame(() => {
        document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth' });
      });
    },
    [isDesktop],
  );

  // CharacterSelector dialog — rendered at top level so it persists when
  // the active character is deleted (store sets character→null).
  const characterSelectorDialog = (
    <CharacterSelector open={showCharacterSelector} onOpenChange={setShowCharacterSelector} />
  );

  // ── Empty state ──���─────────────────────────────────────────
  if (!character) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center p-6">
          <EmptyState
            title="No Character Yet"
            description="Create a sample D&D 2024 character to explore the sheet."
            action={
              <Button variant="primary" onClick={() => upsertCharacter(createSampleCharacter())}>
                Create sample character
              </Button>
            }
          />
        </div>
        {characterSelectorDialog}
      </>
    );
  }

  // ── Error banner ───────────────────────────────────────────
  const errorBanner = error && (
    <Surface variant="warning" padding="sm" className="m-2 lg:m-0" role="alert">
      <Text variant="bodySm">{error}</Text>
    </Surface>
  );

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
        />

        {/* Content — accordion */}
        <ContentArea
          character={character}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
          toggleInspiration={toggleInspiration}
        />

        {/* CharacterSelector dialog — renders at top level */}
        {characterSelectorDialog}
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
            onClick={() => setShowCharacterSelector(true)}
            aria-label="Manage characters"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        {/* Hero Strip — tap to expand full combat stats */}
        <HeroStrip
          character={character}
          onExpand={() => handleSectionChange('combat')}
          className="border-b border-border"
        />
      </div>

      {/* Content — accordion */}
      <div className="flex-1 pb-[56px]">
        <ContentArea
          character={character}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
          toggleInspiration={toggleInspiration}
          className="pb-4"
        />
      </div>

      {/* Bottom Tab Bar */}
      <MobileBottomBar activeSection={lastNavigatedSection} onSectionChange={handleSectionChange} />

      {/* CharacterSelector dialog — renders at top level */}
      {characterSelectorDialog}
    </div>
  );
}
