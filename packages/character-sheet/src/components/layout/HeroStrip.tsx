// HeroStrip.tsx
// Mobile compact hero strip (48px). Shows only HP bar + AC + PB.
// Tap to expand full combat stats via Sheet or callback.
// NFR-02: >=44x44px tap targets.

import { Heart, Shield, Star } from 'lucide-react';
import type { AppCharacter } from '@/types';
import { Text, cn } from '@open20/ui';

export interface HeroStripProps {
  character: AppCharacter;
  onExpand?: () => void;
  className?: string;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function HeroStrip({ character, onExpand, className }: HeroStripProps) {
  const { combatStats, hitPoints } = character;
  const pct =
    hitPoints.max > 0 ? Math.max(0, Math.min(100, (hitPoints.current / hitPoints.max) * 100)) : 0;
  const isDanger = hitPoints.max > 0 && hitPoints.current / hitPoints.max < 0.25;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2',
        onExpand && 'cursor-pointer active:bg-primary-900/30',
        className,
      )}
      onClick={onExpand}
      role={onExpand ? 'button' : undefined}
      tabIndex={onExpand ? 0 : undefined}
      aria-label={onExpand ? 'Expand combat stats' : undefined}
    >
      {/* HP Bar */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Heart className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
        <div
          className="relative h-4 flex-1 overflow-hidden rounded-full bg-bg-tertiary"
          role="progressbar"
          aria-valuenow={hitPoints.current}
          aria-valuemin={0}
          aria-valuemax={hitPoints.max}
          aria-label="Hit points"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300',
              isDanger ? 'bg-danger' : 'bg-success',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <Text variant="bodySm" weight="bold" className="tabular-nums shrink-0">
          {hitPoints.current}/{hitPoints.max}
        </Text>
      </div>

      {/* AC */}
      <div className="flex items-center gap-1">
        <Shield className="h-4 w-4 text-primary-400" aria-hidden="true" />
        <Text variant="bodySm" weight="bold" className="tabular-nums text-primary-400">
          {combatStats.AC}
        </Text>
      </div>

      {/* PB */}
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-primary-400" aria-hidden="true" />
        <Text variant="bodySm" weight="bold" className="tabular-nums text-primary-400">
          {fmt(combatStats.proficiencyBonus)}
        </Text>
      </div>
    </div>
  );
}
