// ContentArea.tsx
// Accordion-based content area. All sections are stacked vertically with collapse/expand behavior.
// Combat section is always visible (non-collapsible).
// Controlled by expandedSections/onToggleSection from AppShell.

import {
  Shield,
  Dumbbell,
  ScrollText,
  WandSparkles,
  Package,
  Feather,
  FileText,
} from 'lucide-react';
import { getSkillBonus } from 'open20-core';
import { SKILL_ABILITY_MAP, SKILL_NAMES } from 'open20-core/types';
import type { SkillEntry, AbilityName, SkillName } from 'open20-core/types';
import { Surface, Text, Divider, EmptyState, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import { HpBar } from '@/components/character/HPManager';
import { AbilityScoresGrid } from '@/components/character/AbilityScores';
import { SavingThrowsGrid } from '@/components/character/SavingThrows';
import { DeathSavesTracker } from '@/components/character/DeathSavesTracker';
import { CombatStatsBar } from '@/components/character/CombatStats';
import { SkillRow } from '@/components/character/Skills';
import { SpeciesPanel } from '@/components/character/Species';
import { BackgroundPanel } from '@/components/character/Background';
import { FeatList } from '@/components/character/Feats';
import { SpellcastingHeader, SpellSlotRow } from '@/components/character/Spellcasting';
import { rollAbility, rollSave, rollSkill } from '@/core/roll-adapter';
import type { RollModifierType } from '@/core/roll-adapter';
import { WeaponAttacksList } from '@/components/character/WeaponAttacks';
import type { SectionKey } from './Sidebar';
import { SectionCollapse } from './SectionCollapse';

export interface ContentAreaProps {
  character: AppCharacter;
  expandedSections: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  modifyHP: (delta: number) => void;
  toggleDeathSave: (kind: 'success' | 'failure', index: number) => void;
  toggleInspiration?: () => void;
  className?: string;
}

// ─── Combat Section (internal) ─────────────────────────────

function CombatSection({
  character,
  modifyHP,
  toggleDeathSave,
  toggleInspiration,
}: Omit<ContentAreaProps, 'expandedSections' | 'onToggleSection' | 'className'>) {
  return (
    <Surface variant="default" padding="sm">
      <div className="flex flex-col gap-3">
        {/* HP Bar — no Surface wrapper (embedded in merged panel) */}
        <HpBar
          current={character.hitPoints.current}
          max={character.hitPoints.max}
          temporary={character.hitPoints.temporary}
          onAdjust={modifyHP}
          noSurface
        />

        <Divider />

        {/* Combat Stats + Death Saves side-by-side on desktop */}
        <div className="flex flex-col gap-3 md:flex-row md:gap-0 md:items-center">
          <div className="flex-1 min-w-0 md:pr-6">
            <CombatStatsBar character={character} onToggleInspiration={toggleInspiration} />
          </div>

          <Divider className="md:hidden" />

          <DeathSavesTracker
            successes={character.hitPoints.deathSaves.successes}
            failures={character.hitPoints.deathSaves.failures}
            isStable={character.hitPoints.deathSaves.isStable}
            onToggleSuccess={(i) => toggleDeathSave('success', i)}
            onToggleFailure={(i) => toggleDeathSave('failure', i)}
            className="p-0 border-none shadow-none bg-transparent md:border-l md:border-border md:pl-6"
          />
        </div>

        <Divider />

        {/* Saving Throws */}
        <SavingThrowsGrid
          character={character}
          onRollSave={(ability: AbilityName, rollModifier: RollModifierType) =>
            rollSave(character, ability, rollModifier)
          }
        />

        <Divider />

        {/* Weapon Attacks (T-109/T-110) */}
        <WeaponAttacksList character={character} />
      </div>
    </Surface>
  );
}

// ─── Abilities Section (internal) ──────────────────────────

function AbilitiesSection({ character }: { character: AppCharacter }) {
  return (
    <Surface variant="default" padding="sm">
      <AbilityScoresGrid
        abilityScores={character.abilityScores}
        onRollCheck={(ability, rollModifier) => rollAbility(character, ability, rollModifier)}
      />
    </Surface>
  );
}

// ─── Skills Section (internal) ─────────────────────────────

const LEFT_ABILITIES = ['Strength', 'Dexterity', 'Intelligence'] as const;
const RIGHT_ABILITIES = ['Wisdom', 'Charisma'] as const;

function SkillsSection({ character }: { character: AppCharacter }) {
  const pb = character.combatStats.proficiencyBonus;

  const renderSkills = (abilities: readonly string[]) =>
    abilities.flatMap((ability) => SKILL_NAMES.filter((s) => SKILL_ABILITY_MAP[s] === ability));

  const renderSkillRow = (skill: SkillName) => {
    const entry: SkillEntry = character.skills[skill] ?? {
      proficient: false,
      expertise: false,
    };
    const bonus = getSkillBonus(character.abilityScores, entry, SKILL_ABILITY_MAP[skill], pb);
    return (
      <SkillRow
        key={skill}
        skill={skill}
        bonus={bonus}
        skillEntry={entry}
        onRoll={(s, mod) => rollSkill(character, s, mod)}
      />
    );
  };

  const leftSkills = renderSkills(LEFT_ABILITIES);
  const rightSkills = renderSkills(RIGHT_ABILITIES);

  return (
    <Surface variant="default" padding="sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div className="flex flex-col">{leftSkills.map(renderSkillRow)}</div>
        <div className="flex flex-col">{rightSkills.map(renderSkillRow)}</div>
      </div>
    </Surface>
  );
}

// ─── Spells Section (internal) ──────────────────────────

const SPELL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function SpellsSection({ character }: { character: AppCharacter }) {
  const { spells } = character;
  const hasSpellcasting = Object.keys(spells.classSpellcasting).length > 0;

  const slotLevels: Array<{ level: number | 'Cantrip'; total: number; used: number }> = [];

  const firstClassData = Object.values(spells.classSpellcasting)[0];
  const cantripCount = firstClassData?.maxCantripsKnown ?? 0;
  slotLevels.push({ level: 'Cantrip', total: cantripCount, used: 0 });

  for (const lvl of SPELL_LEVELS) {
    const slot = spells.spellSlots[lvl];
    slotLevels.push({
      level: lvl,
      total: slot?.total ?? 0,
      used: slot?.used ?? 0,
    });
  }

  if (!hasSpellcasting) {
    return (
      <Surface variant="default" padding="sm">
        <Text variant="bodySm" color="secondary">
          This character does not have spellcasting.
        </Text>
      </Surface>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SpellcastingHeader character={character} />

      <Surface variant="default" padding="sm">
        <div className="divide-y divide-border">
          {slotLevels.map((slot) => (
            <SpellSlotRow key={slot.level} level={slot.level} total={slot.total} used={slot.used} />
          ))}
        </div>
      </Surface>

      {/* Prepared spells placeholder (T-116 pending) */}
      <Surface
        variant="default"
        padding="sm"
        className="flex min-h-[80px] items-center justify-center"
      >
        <EmptyState
          title="Prepared Spells"
          description="Spell preparation and casting coming in the next update."
        />
      </Surface>
    </div>
  );
}

// ─── Features Section (internal) ─────────────────────────

function FeaturesSection({ character }: { character: AppCharacter }) {
  return (
    <div className="flex flex-col gap-2">
      <SpeciesPanel character={character} />
      <BackgroundPanel character={character} />

      {/* Feats (T-113) */}
      <FeatList character={character} />
    </div>
  );
}

// ─── Placeholder Section (internal) ────────────────────────

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <Surface
      variant="default"
      padding="sm"
      className="flex min-h-[200px] items-center justify-center"
    >
      <EmptyState title={title} description={description} />
    </Surface>
  );
}

// ─── Section definitions ───────────────────────────────────

interface SectionDefinition {
  key: SectionKey;
  title: string;
  icon: typeof Shield;
}

const SECTIONS: SectionDefinition[] = [
  { key: 'combat', title: 'Combat', icon: Shield },
  { key: 'abilities', title: 'Ability Scores', icon: Dumbbell },
  { key: 'skills', title: 'Skills', icon: ScrollText },
  { key: 'spells', title: 'Spellcasting', icon: WandSparkles },
  { key: 'equipment', title: 'Equipment', icon: Package },
  { key: 'features', title: 'Features & Traits', icon: Feather },
  { key: 'notes', title: 'Notes', icon: FileText },
];

// ─── ContentArea ────────────────────────────────────────────

export function ContentArea({
  character,
  expandedSections,
  onToggleSection,
  modifyHP,
  toggleDeathSave,
  toggleInspiration,
  className,
}: ContentAreaProps) {
  const renderSectionContent = (key: SectionKey) => {
    switch (key) {
      case 'combat':
        return (
          <CombatSection
            character={character}
            modifyHP={modifyHP}
            toggleDeathSave={toggleDeathSave}
            toggleInspiration={toggleInspiration}
          />
        );
      case 'abilities':
        return <AbilitiesSection character={character} />;
      case 'skills':
        return <SkillsSection character={character} />;
      case 'spells':
        return <SpellsSection character={character} />;
      case 'equipment':
        return (
          <PlaceholderSection
            title="Equipment"
            description="Inventory management coming soon. Track weapons, armor, gear, and currency."
          />
        );
      case 'features':
        return <FeaturesSection character={character} />;
      case 'notes':
        return (
          <PlaceholderSection
            title="Notes"
            description="Free-form notes for your character will be available in a future update."
          />
        );
    }
  };

  return (
    <main className={cn('flex-1 overflow-y-auto p-3 md:p-4 lg:p-5', className)}>
      <div className="flex flex-col gap-2">
        {SECTIONS.map(({ key, title, icon }) => (
          <SectionCollapse
            key={key}
            id={`section-${key}`}
            title={title}
            icon={icon}
            expanded={expandedSections[key]}
            onToggle={() => onToggleSection(key)}
            disabled={key === 'combat'}
          >
            {renderSectionContent(key)}
          </SectionCollapse>
        ))}
      </div>
    </main>
  );
}
