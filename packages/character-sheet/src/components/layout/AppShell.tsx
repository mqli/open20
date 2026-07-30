// AppShell.tsx (T-004, vertical-slice wiring)
// Responsive scaffold. Components are wired incrementally after they pass
// tests. Currently wired: HpBar, AbilityScoresGrid, SavingThrowsGrid,
// DeathSavesTracker, Skills (by ability group).

import { createCharacter, getSkillBonus, type AbilityName } from 'open20-core';
import { SKILL_ABILITY_MAP, SKILL_NAMES } from 'open20-core/types';
import type { SkillEntry } from 'open20-core/types';
import { Surface, Text, Button, EmptyState, Divider } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { buildDepsForCreate, getClassName, getSpeciesName } from '@/core/content-resolver';
import { HpBar } from '@/components/character/HPManager';
import { AbilityScoresGrid } from '@/components/character/AbilityScores';
import { DeathSavesTracker } from '@/components/character/DeathSavesTracker';
import { SavingThrowsGrid } from '@/components/character/SavingThrows';
import { SkillRow } from '@/components/character/Skills';
import { CombatStatsBar } from '@/components/character/CombatStats';
import { rollAbility, rollSave, rollSkill } from '@/core/roll-adapter';

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
  const { character, error, modifyHP, toggleDeathSave, upsertCharacter } = useCharacterStore();

  if (!character) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
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

  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
  const classLabel = character.classes.map((c) => getClassName(c.classId)).join(' / ');

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      {error && (
        <Surface variant="warning" padding="sm" className="mb-4">
          <Text variant="bodySm">{error}</Text>
        </Surface>
      )}

      <header className="mb-4">
        <Text variant="heading" weight="bold">
          {character.name}
        </Text>
        <Text variant="bodySm" color="secondary">
          {getSpeciesName(character.species)} · Level {totalLevel} {classLabel}
        </Text>
      </header>

      <div className="flex flex-col gap-4">
        <HpBar
          current={character.hitPoints.current}
          max={character.hitPoints.max}
          temporary={character.hitPoints.temporary}
          onAdjust={modifyHP}
        />

        {/* Combat Stats (T-107, T-108) */}
        <Surface variant="default" padding="md">
          <CombatStatsBar character={character} />
        </Surface>

        {/* Ability grid needs full width so all 6 columns fit without overlap. */}
        <Surface variant="default" padding="md">
          <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
            Ability Scores
          </Text>
          <AbilityScoresGrid
            abilityScores={character.abilityScores}
            onRollCheck={(ability, rollModifier) => rollAbility(character, ability, rollModifier)}
          />
        </Surface>

        {/* Saving Throws (T-106) */}
        <Surface variant="default" padding="md">
          <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
            Saving Throws
          </Text>
          <SavingThrowsGrid
            character={character}
            onRollSave={(ability, rollModifier) => rollSave(character, ability, rollModifier)}
          />
        </Surface>

        {/* Death Saves (T-102) */}
        <DeathSavesTracker
          successes={character.hitPoints.deathSaves.successes}
          failures={character.hitPoints.deathSaves.failures}
          isStable={character.hitPoints.deathSaves.isStable}
          onToggleSuccess={(i) => toggleDeathSave('success', i)}
          onToggleFailure={(i) => toggleDeathSave('failure', i)}
        />

        {/* Skills grouped by ability (T-104) */}
        <Surface variant="default" padding="md">
          <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
            Skills
          </Text>
          {(['Strength', 'Dexterity', 'Intelligence', 'Wisdom', 'Charisma'] as const).map(
            (ability) => {
              const skillsForAbility = SKILL_NAMES.filter((s) => SKILL_ABILITY_MAP[s] === ability);
              if (skillsForAbility.length === 0) return null;
              const pb = character.combatStats.proficiencyBonus;
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
            },
          )}
        </Surface>
      </div>
    </div>
  );
}
