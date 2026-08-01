// AbilityScoresGrid.tsx (T-103)
// 6 ability scores with modifiers. Each card supports:
// - normal ability check roll (click modifier badge)
// - advantage (ChevronUp) / disadvantage (ChevronDown) flanking the modifier
// Saving throws are handled by T-106 SavingThrows.

import { getModifier, getTotalScore, type AbilityScores, type AbilityName } from 'open20-core';
import { Surface, Text, Badge, cn } from '@open20/ui';

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
      {/* Roll row: ▲ / modifier / ▼ */}
      <RollModifierRow ariaLabel={`${ability} check`} onRoll={(m) => onRollCheck(ability, m)}>
        <Badge
          variant={modifier > 0 ? 'primary' : modifier < 0 ? 'danger' : 'secondary'}
          size="sm"
          className="tabular-nums cursor-pointer hover:opacity-80 transition-opacity"
        >
          {fmt(modifier)}
        </Badge>
      </RollModifierRow>
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
