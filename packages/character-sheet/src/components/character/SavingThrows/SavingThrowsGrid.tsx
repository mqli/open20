// SavingThrowsGrid.tsx (T-106)
// 6 saving throw cards in ability-scores grid pattern.
// Proficiency: ring-2 ring-primary-600 border + CircleDot icon (NFR-01 non-color cue).
// Roll: ▲ / bonus / ▼ row, calls onRollSave which delegates to rollAdapter.rollSave.

import { Circle, CircleDot } from 'lucide-react';
import { getSavingThrowBonus, type AbilityName, type Character } from 'open20-core';
import { Surface, Text, cn } from '@open20/ui';

import { getClass } from '@/core/content-resolver';
import { RollModifierRow } from '@/components/character/RollModifierRow';
import type { RollModifierType } from '@/core/roll-adapter';

const ORDER: readonly { ability: AbilityName; short: string }[] = [
  { ability: 'Strength', short: 'STR' },
  { ability: 'Dexterity', short: 'DEX' },
  { ability: 'Constitution', short: 'CON' },
  { ability: 'Intelligence', short: 'INT' },
  { ability: 'Wisdom', short: 'WIS' },
  { ability: 'Charisma', short: 'CHA' },
];

/** Union of saving-throw proficiencies across all classes. */
function getProficientAbilities(character: Character): readonly AbilityName[] {
  const all: AbilityName[] = [];
  for (const cc of character.classes) {
    const cls = getClass(cc.classId);
    if (cls) all.push(...cls.savingThrowProficiencies);
  }
  return all;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

// ── SavingThrowCard ────────────────────────────────────────

export interface SavingThrowCardProps {
  short: string;
  ability: AbilityName;
  bonus: number;
  isProficient: boolean;
  onRollSave: (ability: AbilityName, rollModifier: RollModifierType) => void;
}

export function SavingThrowCard({
  short,
  ability,
  bonus,
  isProficient,
  onRollSave,
}: SavingThrowCardProps) {
  const ProficiencyIcon = isProficient ? CircleDot : Circle;

  return (
    <Surface
      variant="default"
      padding="sm"
      className={cn(
        'flex min-h-[60px] min-w-[76px] flex-col items-center justify-center gap-0.5',
        isProficient && 'ring-2 ring-primary-600',
      )}
    >
      <span className="flex items-center gap-1">
        <Text variant="labelSm" color="secondary">
          {short}
        </Text>
        <ProficiencyIcon
          className={cn('h-3.5 w-3.5', isProficient ? 'text-primary-600' : 'text-text-tertiary')}
          aria-hidden
        />
      </span>

      {/* Roll row: ▲ / bonus / ▼ */}
      <RollModifierRow ariaLabel={`${ability} saving throw`} onRoll={(m) => onRollSave(ability, m)}>
        <Text
          variant="heading"
          weight="bold"
          className="tabular-nums leading-none cursor-pointer hover:opacity-80 transition-opacity"
        >
          {fmt(bonus)}
        </Text>
      </RollModifierRow>
    </Surface>
  );
}

// ── SavingThrowsGrid ───────────────────────────────────────

export interface SavingThrowsGridProps {
  character: Character;
  onRollSave: (ability: AbilityName, rollModifier: RollModifierType) => void;
  className?: string;
}

export function SavingThrowsGrid({ character, onRollSave, className }: SavingThrowsGridProps) {
  const proficientAbilities = getProficientAbilities(character);
  const { proficiencyBonus } = character.combatStats;
  const { abilityScores } = character;

  return (
    <div className={cn('grid grid-cols-3 gap-2 md:grid-cols-6', className)}>
      {ORDER.map(({ ability, short }) => {
        const isProficient = proficientAbilities.includes(ability);
        const bonus = getSavingThrowBonus(
          abilityScores,
          ability,
          proficientAbilities,
          proficiencyBonus,
        );
        return (
          <SavingThrowCard
            key={ability}
            short={short}
            ability={ability}
            bonus={bonus}
            isProficient={isProficient}
            onRollSave={onRollSave}
          />
        );
      })}
    </div>
  );
}
