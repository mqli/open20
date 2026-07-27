// HpBar.tsx (T-101)
// Presentational HP bar: current/max fill, temp-HP overlay, quick-adjust row.
// Values flow in as props; adjustments emit onAdjust(delta).

import { Surface, Text, Button, cn } from '@open20/ui';

export interface HpBarProps {
  current: number;
  max: number;
  temporary: number;
  onAdjust: (delta: number) => void;
  className?: string;
}

const DELTAS = [-10, -5, -1, 1, 5, 10] as const;

export function HpBar({ current, max, temporary, onAdjust, className }: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const isDanger = max > 0 && current / max < 0.25;

  return (
    <Surface variant="default" padding="md" className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <Text variant="labelSm" color="secondary" className="uppercase tracking-wide">
          Hit Points
        </Text>
        {temporary > 0 && (
          <Text
            variant="labelSm"
            className="text-info"
            aria-label={`${temporary} temporary hit points`}
          >
            +{temporary} Temp
          </Text>
        )}
      </div>

      <div
        className="relative h-6 w-full overflow-hidden rounded-md bg-bg-tertiary motion-reduce:transition-none"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label="Current hit points"
      >
        <div
          className={cn(
            'h-full rounded-md transition-[width] duration-300 motion-reduce:transition-none',
            isDanger ? 'bg-danger' : 'bg-success',
          )}
          style={{ width: `${pct}%` }}
        />
        {temporary > 0 && (
          <div
            className="absolute inset-y-0 left-0 border-y-2 border-info/70 bg-info/30"
            style={{
              width: `${Math.min(100, ((current + temporary) / Math.max(max, current + temporary)) * 100)}%`,
            }}
          />
        )}
      </div>

      <Text variant="body" weight="bold" className="tabular-nums">
        {current} / {max}
      </Text>

      <div className="flex flex-wrap gap-1">
        {DELTAS.map((d) => (
          <Button
            key={d}
            variant={d < 0 ? 'outline' : 'secondary'}
            size="sm"
            className="min-h-[44px] min-w-[44px] tabular-nums"
            onClick={() => onAdjust(d)}
            aria-label={`${d > 0 ? 'Heal' : 'Damage'} ${Math.abs(d)}`}
          >
            {d > 0 ? `+${d}` : d}
          </Button>
        ))}
      </div>
    </Surface>
  );
}
