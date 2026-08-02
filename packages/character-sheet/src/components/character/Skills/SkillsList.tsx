// SkillsList.tsx (T-105)
// Extracted from ContentArea.tsx SkillsSection.
// Renders 18 skills in a two-column grid (desktop) or single-column (mobile),
// grouped by LEFT_ABILITIES / RIGHT_ABILITIES.
// Pure presentational: receives derived values and roll callback as props.

import { getSkillBonus } from 'open20-core';
import { SKILL_ABILITY_MAP, SKILL_NAMES } from 'open20-core/types';
import type { SkillEntry, SkillName } from 'open20-core/types';
import { Surface } from '@open20/ui';
import type { AppCharacter } from '@/types';
import type { RollModifierType } from '@/core/roll-adapter';
import { SkillRow } from './SkillRow';

const LEFT_ABILITIES = ['Strength', 'Dexterity', 'Intelligence'] as const;
const RIGHT_ABILITIES = ['Wisdom', 'Charisma'] as const;

export interface SkillsListProps {
  character: AppCharacter;
  onRollSkill: (skill: SkillName, rollModifier: RollModifierType) => void;
}

export function SkillsList({ character, onRollSkill }: SkillsListProps) {
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
        onRoll={(s, mod) => onRollSkill(s, mod)}
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
