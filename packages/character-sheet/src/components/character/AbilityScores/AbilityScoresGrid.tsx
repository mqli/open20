// AbilityScoresGrid.tsx (T-103)
// 6 ability scores with modifiers; tap a card to roll an ability check.

import { getModifier, getTotalScore, type AbilityScores, type AbilityName } from 'open20-core';
import { Surface, Text, Badge, cn } from '@open20/ui';

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
  onRoll: (ability: AbilityName) => void;
}

function fmt(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function AbilityScoreCard({
  short,
  ability,
  score,
  modifier,
  onRoll,
}: AbilityScoreCardProps) {
  return (
    <button
      type="button"
      onClick={() => onRoll(ability)}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      aria-label={`Roll ${ability} check`}
    >
      <Surface
        variant="default"
        padding="sm"
        className={cn(
          'flex min-h-[80px] min-w-[64px] flex-col items-center justify-center gap-1',
          'cursor-pointer',
        )}
      >
        <Text variant="labelSm" color="secondary">
          {short}
        </Text>
        <Text variant="heading" weight="bold" className="tabular-nums">
          {score}
        </Text>
        <Badge
          variant={modifier > 0 ? 'primary' : modifier < 0 ? 'danger' : 'secondary'}
          size="sm"
          className="tabular-nums"
        >
          {fmt(modifier)}
        </Badge>
      </Surface>
    </button>
  );
}

export interface AbilityScoresGridProps {
  abilityScores: AbilityScores;
  onRoll: (ability: AbilityName) => void;
  className?: string;
}

export function AbilityScoresGrid({ abilityScores, onRoll, className }: AbilityScoresGridProps) {
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
            onRoll={onRoll}
          />
        );
      })}
    </div>
  );
}
