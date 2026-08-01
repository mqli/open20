// HpBar.tsx (T-101)
// Presentational HP bar: current/max fill, temp-HP overlay, quick-adjust row.
// Values flow in as props; adjustments emit onAdjust(delta).
// FR-101: inline number input for custom-value HP adjustment.

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Surface, Text, Button, Input, cn } from '@open20/ui';

export interface HpBarProps {
  current: number;
  max: number;
  temporary: number;
  onAdjust: (delta: number) => void;
  className?: string;
  /** When true, skip the outer Surface wrapper — for embedding in a merged panel. */
  noSurface?: boolean;
}

const DELTAS = [-10, -5, -1, 1, 5, 10] as const;

export function HpBar({ current, max, temporary, onAdjust, className, noSurface }: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const isDanger = max > 0 && current / max < 0.25;

  const [customValue, setCustomValue] = useState('');

  function apply(sign: 1 | -1) {
    const amount = Number(customValue);
    if (!Number.isNaN(amount) && amount > 0) {
      onAdjust(sign * amount);
    }
    setCustomValue('');
  }

  const content = (
    <>
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
            className="absolute inset-y-0 border-y-2 border-info/70 bg-info/30"
            style={{
              left: `${pct}%`,
              width: `${Math.min(100 - pct, (temporary / Math.max(max, 1)) * 100)}%`,
            }}
          />
        )}
      </div>

      <Text variant="body" weight="bold" className="tabular-nums">
        {current} / {max}
      </Text>

      {/* Three-group layout: grid columns on sm+, stacked on mobile */}
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {/* Damage */}
        <div className="flex gap-1">
          {DELTAS.filter((d) => d < 0).map((d) => (
            <Button
              key={d}
              variant="danger"
              size="sm"
              className="flex-1 min-h-[44px] min-w-0 tabular-nums sm:flex-none sm:min-w-[44px]"
              onClick={() => onAdjust(d)}
              aria-label={`Damage ${Math.abs(d)}`}
            >
              {d}
            </Button>
          ))}
        </div>

        {/* Custom input: − input + */}
        <div className="flex items-center justify-center gap-0.5">
          <Button
            variant="danger"
            size="sm"
            className="flex-1 min-h-[44px] min-w-0 sm:flex-none sm:min-w-[44px]"
            onClick={() => apply(-1)}
            disabled={customValue === ''}
            aria-label="Damage custom amount"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="HP"
            value={customValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+$/.test(val)) {
                setCustomValue(val);
              }
            }}
            aria-label="Custom HP adjustment value"
            className="min-h-[44px] w-full max-w-20 tabular-nums px-2 sm:w-16"
          />
          <Button
            variant="primary"
            size="sm"
            className="flex-1 min-h-[44px] min-w-0 sm:flex-none sm:min-w-[44px]"
            onClick={() => apply(1)}
            disabled={customValue === ''}
            aria-label="Heal custom amount"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Heal */}
        <div className="flex gap-1 sm:justify-end">
          {DELTAS.filter((d) => d > 0).map((d) => (
            <Button
              key={d}
              variant="primary"
              size="sm"
              className="flex-1 min-h-[44px] min-w-0 tabular-nums sm:flex-none sm:min-w-[44px]"
              onClick={() => onAdjust(d)}
              aria-label={`Heal ${Math.abs(d)}`}
            >
              +{d}
            </Button>
          ))}
        </div>
      </div>
    </>
  );

  if (noSurface) {
    return <div className={cn('flex flex-col gap-1.5', className)}>{content}</div>;
  }

  return (
    <Surface variant="default" padding="sm" className={cn('flex flex-col gap-1.5', className)}>
      {content}
    </Surface>
  );
}
