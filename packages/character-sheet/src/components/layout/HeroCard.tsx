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
    <div className="flex items-center gap-2">
      <Icon
        className={cn('h-4 w-4 shrink-0', accent ? 'text-primary-400' : 'text-text-secondary')}
        aria-hidden="true"
      />
      <Text variant="bodySm" color="secondary" className="min-w-0 flex-1">
        {label}
      </Text>
      <Text
        variant="bodySm"
        weight="bold"
        className={cn('tabular-nums shrink-0', accent && 'text-primary-400')}
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
    <Surface variant="elevated" padding="md" className={cn('flex flex-col gap-3', className)}>
      {/* Name */}
      <div>
        <Text variant="headingSm" weight="bold" className="truncate">
          {character.name}
        </Text>
        <Text variant="bodySm" color="secondary" className="truncate">
          {getSpeciesName(character.species)} <span className="text-text-tertiary">·</span> Lv.
          {totalLevel} {classLabel}
        </Text>
      </div>

      <Divider />

      {/* HP Summary */}
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
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

      {/* Combat Stats */}
      <div className="flex flex-col gap-1.5">
        <StatItem icon={Shield} label="Armor Class" value={String(combatStats.AC)} accent />
        <StatItem icon={Swords} label="Initiative" value={fmt(combatStats.initiative)} />
        <StatItem icon={Footprints} label="Speed" value={`${combatStats.speed} ft`} />
        <StatItem
          icon={Eye}
          label="Passive Perception"
          value={String(combatStats.passivePerception)}
        />
        <StatItem
          icon={Star}
          label="Proficiency"
          value={fmt(combatStats.proficiencyBonus)}
          accent
        />
      </div>
    </Surface>
  );
}
