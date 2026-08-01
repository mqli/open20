// AbilityScoresGrid.tsx (T-103)
// 6 ability scores with modifiers. Each card supports:
// - ability check roll (dice icon)
// - advantage / normal / disadvantage mode toggle (per-card local state)
// Saving throws are handled by T-106 SavingThrows.

import { Dices } from 'lucide-react';
import { getModifier, getTotalScore, type AbilityScores, type AbilityName } from 'open20-core';
import { Surface, Text, Badge, cn } from '@open20/ui';

import type { RollModifierType } from '@/core/roll-adapter';

const ORDER: readonly { ability: AbilityName; short: string }[] = [
  { ability: 'Strength', short: 'STR' },
  { ability: 'Dexterity', short: 'DEX' },
  { ability: 'Constitution', short: 'CON' },
  { ability: 'Intelligence', short: 'INT' },
  { ability: 'Wisdom', short: 'WIS' },
  { ability: 'Charisma', short: 'CHA' },
];

export interface AbilityScoreCardProps {
  short: string;
  ability: AbilityName;
  score: number;
  modifier: number;
  onRollCheck: (ability: AbilityName, rollModifier: RollModifierType) => void;
}

function fmt(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const CHIP =
  'rounded px-1 py-px text-[10px] font-semibold uppercase leading-tight transition-colors';

export function AbilityScoreCard({
  short,
  ability,
  score,
  modifier,
  onRollCheck,
}: AbilityScoreCardProps) {
  return (
    <Surface
      variant="default"
      padding="sm"
      className={cn('flex min-h-[72px] min-w-[76px] flex-col items-center justify-center gap-0.5')}
    >
      <Text variant="labelSm" color="secondary">
        {short}
      </Text>
      <Text variant="heading" weight="bold" className="tabular-nums leading-none">
        {score}
      </Text>
      <Badge
        variant={modifier > 0 ? 'primary' : modifier < 0 ? 'danger' : 'secondary'}
        size="sm"
        className="tabular-nums"
      >
        {fmt(modifier)}
      </Badge>

      {/* ADV / dice / DIS row — each button rolls immediately */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(
            CHIP,
            'bg-bg-tertiary text-text-tertiary hover:bg-primary-100 hover:text-primary-600',
          )}
          onClick={() => onRollCheck(ability, 'advantage')}
          aria-label={`Roll ${ability} with advantage`}
        >
          ADV
        </button>

        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          onClick={() => onRollCheck(ability, 'none')}
          aria-label={`Roll ${ability} check`}
        >
          <Dices className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className={cn(
            CHIP,
            'bg-bg-tertiary text-text-tertiary hover:bg-danger/20 hover:text-danger',
          )}
          onClick={() => onRollCheck(ability, 'disadvantage')}
          aria-label={`Roll ${ability} with disadvantage`}
        >
          DIS
        </button>
      </div>
    </Surface>
  );
}

export interface AbilityScoresGridProps {
  abilityScores: AbilityScores;
  onRollCheck: (ability: AbilityName, rollModifier: RollModifierType) => void;
  className?: string;
}

export function AbilityScoresGrid({
  abilityScores,
  onRollCheck,
  className,
}: AbilityScoresGridProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2 md:grid-cols-6', className)}>
      {ORDER.map(({ ability, short }) => {
        const total = getTotalScore(abilityScores, ability);
        return (
          <AbilityScoreCard
            key={ability}
            short={short}
            ability={ability}
            score={total}
            modifier={getModifier(total)}
            onRollCheck={onRollCheck}
          />
        );
      })}
    </div>
  );
}
