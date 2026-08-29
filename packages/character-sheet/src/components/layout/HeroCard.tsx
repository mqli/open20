// HeroCard.tsx
// Desktop sidebar hero identity card. Shows character name, species, class/level,
// and a compact HP summary. Combat quick-stats (AC/Init/Speed/PP/PB) live only in
// the Combat focus area (ContentArea) — single source of truth, no duplication.

import { Heart } from 'lucide-react';
import type { AppCharacter } from '@/types';
import { getClassName, getSpeciesName } from '@/core/content-resolver';
import { Text, Surface, Divider, cn } from '@open20/ui';

export interface HeroCardProps {
  character: AppCharacter;
  className?: string;
}

export function HeroCard({ character, className }: HeroCardProps) {
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
  const classLabel = character.classes.map((c) => getClassName(c.classId)).join(' / ');
  const { hitPoints } = character;

  return (
    <Surface variant="elevated" padding="sm" className={cn('flex flex-col gap-2', className)}>
      {/* Name */}
      <div>
        <Text variant="headingSm" weight="bold" className="truncate">
          {character.name}
        </Text>
        <Text variant="bodySm" color="secondary" className="truncate">
          {getSpeciesName(character.species)} <span className="text-text-tertiary">·</span> Lvl
          {totalLevel} {classLabel || 'No class'}
        </Text>
      </div>

      <Divider />

      {/* HP Summary */}
      <div
        className="flex items-center gap-1.5"
        role="status"
        aria-live="polite"
        aria-label={`Hit points: ${hitPoints.current} of ${hitPoints.max}`}
      >
        <Heart className="h-3.5 w-3.5 shrink-0 text-danger" aria-hidden="true" />
        <Text variant="bodySm" color="secondary">
          HP
        </Text>
        <Text variant="bodySm" weight="bold" className="tabular-nums ml-auto">
          {hitPoints.current}/{hitPoints.max}
        </Text>
        {hitPoints.temporary > 0 && (
          <Text variant="bodySm" className="text-info tabular-nums">
            +{hitPoints.temporary}
          </Text>
        )}
      </div>
    </Surface>
  );
}
