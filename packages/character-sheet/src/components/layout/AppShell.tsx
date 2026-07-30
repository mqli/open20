// AppShell.tsx
// Responsive scaffold implementing Wireframe_Design.md §4 layout architecture.
//
// Desktop (>= 1024px): Sidebar (250px) + ContentArea side by side
// Tablet  (768-1023px): HeroStrip + ContentArea + MobileBottomBar
// Mobile  (< 768px):    HeroStrip + ContentArea + MobileBottomBar
//
// Navigation: activeSection state drives both Sidebar tabs and MobileBottomBar tabs.
// All existing character components are embedded inside ContentArea sections.

import { useState } from 'react';
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

export function AppShell() {
  const { isDesktop } = useIsLargeScreen();
  const { character, error, modifyHP, toggleDeathSave, upsertCharacter } = useCharacterStore();
  const [activeSection, setActiveSection] = useState<SectionKey>('combat');

  // ── Empty state ────────────────────────────────────────────
  if (!character) {
    return (
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
    );
  }

  // ── Error banner ───────────────────────────────────────────
  const errorBanner = error && (
    <Surface variant="warning" padding="sm" className="m-2 lg:m-0">
      <Text variant="bodySm">{error}</Text>
    </Surface>
  );

  // ── Desktop layout ─────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="relative flex h-screen overflow-hidden bg-bg-primary">
        {errorBanner && <div className="absolute top-0 left-0 right-0 z-50 p-2">{errorBanner}</div>}

        {/* Sidebar */}
        <Sidebar
          character={character}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content */}
        <ContentArea
          character={character}
          activeSection={activeSection}
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
        />
      </div>
    );
  }

  // ── Tablet / Mobile layout ─────────────────────────────────
  // HeroStrip + ContentArea + MobileBottomBar
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
  const classLabel = character.classes.map((c) => getClassName(c.classId)).join(' / ');

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
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
        </div>

        {/* Hero Strip */}
        <HeroStrip character={character} className="border-b border-border" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-[56px]">
        <ContentArea
          character={character}
          activeSection={activeSection}
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
          className="pb-4"
        />
      </div>

      {/* Bottom Tab Bar */}
      <MobileBottomBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}
