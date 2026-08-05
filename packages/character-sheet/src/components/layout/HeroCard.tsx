// HeroCard.tsx
// Desktop sidebar hero identity card. Shows character name, species, class/level,
// and combat quick-stats (HP summary, AC, Initiative, Speed, PP, PB).
// All values are read-only display; names resolved via ContentResolver.

import { Heart, Shield, Swords, Footprints, Eye, Star } from 'lucide-react';
import type { AppCharacter } from '@/types';
import { getClassName, getSpeciesName } from '@/core/content-resolver';
import { Text, Surface, Divider, cn } from '@open20/ui';

export interface HeroCardProps {
  character: AppCharacter;
  className?: string;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function StatItem({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon
        className={cn('h-3.5 w-3.5 shrink-0', accent ? 'text-primary-400' : 'text-text-secondary')}
        aria-hidden="true"
      />
      <Text variant="bodySm" color="secondary">
        {label}
      </Text>
      <Text
        variant="bodySm"
        weight="bold"
        className={cn('tabular-nums ml-auto', accent && 'text-primary-400')}
      >
        {value}
      </Text>
    </div>
  );
}

export function HeroCard({ character, className }: HeroCardProps) {
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
  const classLabel = character.classes.map((c) => getClassName(c.classId)).join(' / ');
  const { combatStats, hitPoints } = character;

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

      {/* Combat Stats — 2-column grid for compact display */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <StatItem icon={Shield} label="AC" value={String(combatStats.AC)} accent />
        <StatItem icon={Swords} label="Init" value={fmt(combatStats.initiative)} />
        <StatItem icon={Footprints} label="Speed" value={`${combatStats.speed} ft`} />
        <StatItem icon={Eye} label="PP" value={String(combatStats.passivePerception)} />
        <StatItem icon={Star} label="PB" value={fmt(combatStats.proficiencyBonus)} accent />
      </div>
    </Surface>
  );
}
