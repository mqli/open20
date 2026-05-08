import type { SkillEntry, AbilityScores } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { SkillBadge } from './SkillBadge';

// Standard D&D 5e skills with their governing abilities
const SKILL_DEFINITIONS = [
  { name: 'Acrobatics', ability: 'Dexterity' as const },
  { name: 'AnimalHandling', ability: 'Wisdom' as const },
  { name: 'Arcana', ability: 'Intelligence' as const },
  { name: 'Athletics', ability: 'Strength' as const },
  { name: 'Deception', ability: 'Charisma' as const },
  { name: 'History', ability: 'Intelligence' as const },
  { name: 'Insight', ability: 'Wisdom' as const },
  { name: 'Intimidation', ability: 'Charisma' as const },
  { name: 'Investigation', ability: 'Intelligence' as const },
  { name: 'Medicine', ability: 'Wisdom' as const },
  { name: 'Nature', ability: 'Intelligence' as const },
  { name: 'Perception', ability: 'Wisdom' as const },
  { name: 'Performance', ability: 'Charisma' as const },
  { name: 'Persuasion', ability: 'Charisma' as const },
  { name: 'Religion', ability: 'Intelligence' as const },
  { name: 'SleightOfHand', ability: 'Dexterity' as const },
  { name: 'Stealth', ability: 'Dexterity' as const },
  { name: 'Survival', ability: 'Wisdom' as const },
];

interface SkillChipsProps {
  skills: Record<string, SkillEntry>;
  abilityScores: AbilityScores;
  proficiencyBonus: number;
  onSkillClick?: (skillName: string, modifier: number) => void;
}

function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function SkillChips({ skills, abilityScores, proficiencyBonus, onSkillClick }: SkillChipsProps) {
  const { t } = useLocale();

  const getSkillModifier = (skillName: string, skill: SkillEntry): number => {
    const def = SKILL_DEFINITIONS.find((s) => s.name === skillName);
    if (!def) return 0;
    const abilityMod = getModifier(abilityScores[def.ability]);
    let mod = abilityMod;
    if (skill.proficient) mod += proficiencyBonus;
    if (skill.expertise) mod += proficiencyBonus; // Expertise = double proficiency
    return mod;
  };

  return (
    <section className="w-full bg-[--color-bg-surface] rounded-lg p-4 border border-[--color-border]">
      <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-3">
        {t('gameMode.skills')}
      </h2>
      <div className="flex flex-wrap gap-2">
        {SKILL_DEFINITIONS.map(({ name }) => {
          const skill = skills[name] || { proficient: false, expertise: false };
          const modifier = getSkillModifier(name, skill);
          return (
            <SkillBadge
              key={name}
              skillName={name}
              skill={skill}
              modifier={modifier}
              onClick={() => onSkillClick?.(name, modifier)}
            />
          );
        })}
      </div>
    </section>
  );
}
