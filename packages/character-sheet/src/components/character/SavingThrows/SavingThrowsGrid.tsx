// SavingThrowsGrid.tsx (T-106)
// 6 saving throw cards in ability-scores grid pattern.
// Proficiency: ring-2 ring-primary-600 border + Shield icon (NFR-01 non-color cue).
// Roll: ▲ / bonus / ▼ row, calls onRollSave which delegates to rollAdapter.rollSave.

import { ChevronUp, ChevronDown, Shield, ShieldOff } from 'lucide-react';
import { getSavingThrowBonus, type AbilityName, type Character } from 'open20-core';
import { Surface, Text, cn } from '@open20/ui';

import { getClass } from '@/core/content-resolver';
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
  const ProficiencyIcon = isProficient ? Shield : ShieldOff;

  return (
    <Surface
      variant="default"
      padding="sm"
      className={cn(
        'flex min-h-[72px] min-w-[76px] flex-col items-center justify-center gap-0.5',
        isProficient && 'ring-2 ring-primary-600',
      )}
    >
      <Text variant="labelSm" color="secondary">
        {short}
      </Text>

      <ProficiencyIcon
        className={cn('h-4 w-4', isProficient ? 'text-primary-600' : 'text-text-tertiary')}
        aria-hidden
      />

      {/* Roll row: ▲ / bonus / ▼ */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          onClick={() => onRollSave(ability, 'advantage')}
          aria-label={`Roll ${ability} saving throw with advantage`}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onRollSave(ability, 'none')}
          aria-label={`Roll ${ability} saving throw`}
        >
          <Text
            variant="heading"
            weight="bold"
            className="tabular-nums leading-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            {fmt(bonus)}
          </Text>
        </button>

        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded text-danger hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          onClick={() => onRollSave(ability, 'disadvantage')}
          aria-label={`Roll ${ability} saving throw with disadvantage`}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
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
