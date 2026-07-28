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
}

const DELTAS = [-10, -5, -1, 1, 5, 10] as const;

export function HpBar({ current, max, temporary, onAdjust, className }: HpBarProps) {
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
            variant={d < 0 ? 'danger' : 'primary'}
            size="sm"
            className="min-h-[44px] min-w-[44px] tabular-nums"
            onClick={() => onAdjust(d)}
            aria-label={`${d > 0 ? 'Heal' : 'Damage'} ${Math.abs(d)}`}
          >
            {d > 0 ? `+${d}` : d}
          </Button>
        ))}

        {/* Inline custom-value input (FR-101): type amount, then + or − */}
        <div className="flex items-center gap-0.5">
          <Input
            type="number"
            step="1"
            min="1"
            placeholder="HP"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            aria-label="Custom HP adjustment value"
            className="min-h-[44px] w-16 tabular-nums px-2"
          />
          <Button
            variant="primary"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => apply(1)}
            disabled={customValue === ''}
            aria-label="Heal custom amount"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => apply(-1)}
            disabled={customValue === ''}
            aria-label="Damage custom amount"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Surface>
  );
}
