// AppShell.tsx (T-004, vertical-slice wiring)
// Responsive scaffold. For the vertical slice it renders a minimal working
// sheet (identity + HpBar + AbilityScores) to validate the golden path end to
// end. Later tasks (T-123–T-128) replace the slots with the full layout.

import { createCharacter, type AbilityName } from 'open20-core';
import { Surface, Text, Button, EmptyState } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { buildDepsForCreate, getClassName, getSpeciesName } from '@/core/content-resolver';
import { HpBar } from '@/components/character/HPManager';
import { AbilityScoresGrid } from '@/components/character/AbilityScores';
import { rollAbility } from '@/core/roll-adapter';

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
  const { character, error, modifyHP, upsertCharacter } = useCharacterStore();

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
        {/* Ability grid needs full width so all 6 columns fit without overlap. */}
        <Surface variant="default" padding="md">
          <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
            Ability Scores
          </Text>
          <AbilityScoresGrid
            abilityScores={character.abilityScores}
            onRoll={(ability) => rollAbility(character, ability)}
          />
        </Surface>
      </div>
    </div>
  );
}
