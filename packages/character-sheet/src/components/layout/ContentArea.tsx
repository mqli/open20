// ContentArea.tsx
// Main content area. Renders the active section's content.
// Desktop: uses Tabs for section switching (synchronized with Sidebar).
// All existing character components are embedded into their respective sections.
// Unfinished sections show a SectionHeader + EmptyState placeholder.

import { getSkillBonus } from 'open20-core';
import { SKILL_ABILITY_MAP, SKILL_NAMES } from 'open20-core/types';
import type { SkillEntry, AbilityName } from 'open20-core/types';
import { Surface, Text, SectionHeader, Divider, EmptyState, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import { HpBar } from '@/components/character/HPManager';
import { AbilityScoresGrid } from '@/components/character/AbilityScores';
import { SavingThrowsGrid } from '@/components/character/SavingThrows';
import { DeathSavesTracker } from '@/components/character/DeathSavesTracker';
import { CombatStatsBar } from '@/components/character/CombatStats';
import { SkillRow } from '@/components/character/Skills';
import { rollAbility, rollSave, rollSkill } from '@/core/roll-adapter';
import type { RollModifierType } from '@/core/roll-adapter';
import type { SectionKey } from './Sidebar';

export interface ContentAreaProps {
  character: AppCharacter;
  activeSection: SectionKey;
  modifyHP: (delta: number) => void;
  toggleDeathSave: (kind: 'success' | 'failure', index: number) => void;
  className?: string;
}

// ─── Combat Section ───────────────────────────────────────

function CombatSection({
  character,
  modifyHP,
  toggleDeathSave,
}: Omit<ContentAreaProps, 'activeSection' | 'className'>) {
  return (
    <div className="flex flex-col gap-4">
      <HpBar
        current={character.hitPoints.current}
        max={character.hitPoints.max}
        temporary={character.hitPoints.temporary}
        onAdjust={modifyHP}
      />

      {/* 2-column grid for compact panels on md+ screens */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Surface variant="default" padding="md">
          <Text variant="labelSm" color="secondary" className="mb-3 uppercase tracking-wide">
            Combat Stats
          </Text>
          <CombatStatsBar character={character} />
        </Surface>

        <DeathSavesTracker
          successes={character.hitPoints.deathSaves.successes}
          failures={character.hitPoints.deathSaves.failures}
          isStable={character.hitPoints.deathSaves.isStable}
          onToggleSuccess={(i) => toggleDeathSave('success', i)}
          onToggleFailure={(i) => toggleDeathSave('failure', i)}
        />

        <Surface variant="default" padding="md" className="md:col-span-2">
          <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
            Saving Throws
          </Text>
          <SavingThrowsGrid
            character={character}
            onRollSave={(ability: AbilityName, rollModifier: RollModifierType) =>
              rollSave(character, ability, rollModifier)
            }
          />
        </Surface>
      </div>
    </div>
  );
}

// ─── Abilities Section ────────────────────────────────────

function AbilitiesSection({ character }: { character: AppCharacter }) {
  return (
    <Surface variant="default" padding="md">
      <Text variant="labelSm" color="secondary" className="mb-3 uppercase tracking-wide">
        Ability Scores
      </Text>
      <Text variant="bodySm" color="secondary" className="mb-3">
        Tap any score to roll an ability check
      </Text>
      <AbilityScoresGrid
        abilityScores={character.abilityScores}
        onRollCheck={(ability, rollModifier) => rollAbility(character, ability, rollModifier)}
      />
    </Surface>
  );
}

// ─── Skills Section ───────────────────────────────────────

function SkillsSection({ character }: { character: AppCharacter }) {
  const pb = character.combatStats.proficiencyBonus;

  return (
    <Surface variant="default" padding="md">
      <Text variant="labelSm" color="secondary" className="mb-3 uppercase tracking-wide">
        Skills
      </Text>
      {(['Strength', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma'] as const).map((ability) => {
        const skillsForAbility = SKILL_NAMES.filter((s) => SKILL_ABILITY_MAP[s] === ability);
        if (skillsForAbility.length === 0) return null;
        return (
          <div key={ability}>
            <Text
              variant="labelSm"
              color="secondary"
              className="mt-3 mb-1 first:mt-0 uppercase tracking-wide"
            >
              {ability}
            </Text>
            <Divider className="mb-1" />
            {skillsForAbility.map((skill) => {
              const entry: SkillEntry = character.skills[skill] ?? {
                proficient: false,
                expertise: false,
              };
              const bonus = getSkillBonus(
                character.abilityScores,
                entry,
                SKILL_ABILITY_MAP[skill],
                pb,
              );
              return (
                <SkillRow
                  key={skill}
                  skill={skill}
                  bonus={bonus}
                  skillEntry={entry}
                  onRoll={(s, mod) => rollSkill(character, s, mod)}
                />
              );
            })}
          </div>
        );
      })}
    </Surface>
  );
}

// ─── Placeholder Section ──────────────────────────────────

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <Surface
      variant="default"
      padding="md"
      className="flex min-h-[200px] items-center justify-center"
    >
      <EmptyState title={title} description={description} />
    </Surface>
  );
}

// ─── ContentArea ───────────────────────────────────────────

export function ContentArea({
  character,
  activeSection,
  modifyHP,
  toggleDeathSave,
  className,
}: ContentAreaProps) {
  return (
    <main className={cn('flex-1 overflow-y-auto p-4 md:p-6 lg:p-8', className)}>
      {/* Section Header */}
      <SectionHeader
        title={
          activeSection === 'combat'
            ? 'Combat'
            : activeSection === 'abilities'
              ? 'Ability Scores'
              : activeSection === 'skills'
                ? 'Skills'
                : activeSection === 'spells'
                  ? 'Spellcasting'
                  : activeSection === 'equipment'
                    ? 'Equipment'
                    : activeSection === 'features'
                      ? 'Features & Traits'
                      : 'Notes'
        }
        className="mb-4"
      />

      {/* Section Content */}
      {activeSection === 'combat' && (
        <CombatSection
          character={character}
          modifyHP={modifyHP}
          toggleDeathSave={toggleDeathSave}
        />
      )}
      {activeSection === 'abilities' && <AbilitiesSection character={character} />}
      {activeSection === 'skills' && <SkillsSection character={character} />}
      {activeSection === 'spells' && (
        <PlaceholderSection
          title="Spellcasting"
          description="Spell management coming in the next update. Manage spell slots, prepared spells, and casting."
        />
      )}
      {activeSection === 'equipment' && (
        <PlaceholderSection
          title="Equipment"
          description="Inventory management coming soon. Track weapons, armor, gear, and currency."
        />
      )}
      {activeSection === 'features' && (
        <PlaceholderSection
          title="Features & Traits"
          description="Species, background, feats, and class features display coming soon."
        />
      )}
      {activeSection === 'notes' && (
        <PlaceholderSection
          title="Notes"
          description="Free-form notes for your character will be available in a future update."
        />
      )}
    </main>
  );
}
