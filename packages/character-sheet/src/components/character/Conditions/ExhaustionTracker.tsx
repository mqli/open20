// ExhaustionTracker.tsx — T-208
// 0-6 stepper with live penalty text and danger tint at level ≥ 4.
// Wireframe §6.10 — stored as ActiveCondition with level, penalties from T-015.

import { useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Text, Button, Surface, cn } from '@open20/ui';
import {
  getExhaustionLevel,
  getExhaustionD20Penalty,
  getExhaustionSpeedPenalty,
} from 'open20-core';
import type { ActiveCondition } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';

export interface ExhaustionTrackerProps {
  className?: string;
}

export function ExhaustionTracker({ className }: ExhaustionTrackerProps) {
  const character = useCharacterStore((s) => s.character);
  const setExhaustionLevel = useCharacterStore((s) => s.setExhaustionLevel);

  const conditions: readonly ActiveCondition[] = character?.conditions ?? [];
  const currentLevel = getExhaustionLevel(conditions);
  const d20Penalty = getExhaustionD20Penalty(conditions);
  const speedPenalty = getExhaustionSpeedPenalty(conditions);

  const isDanger = currentLevel >= 4;

  const handleIncrement = useCallback(() => {
    if (currentLevel < 6) {
      setExhaustionLevel(currentLevel + 1);
    }
  }, [currentLevel, setExhaustionLevel]);

  const handleDecrement = useCallback(() => {
    if (currentLevel > 0) {
      setExhaustionLevel(currentLevel - 1);
    }
  }, [currentLevel, setExhaustionLevel]);

  return (
    <Surface
      variant="default"
      padding="sm"
      className={cn('flex flex-col gap-1.5', isDanger && 'border-danger/40 bg-danger/5', className)}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Text
          variant="labelSm"
          color="secondary"
          className={cn('uppercase tracking-wide', isDanger && 'text-danger')}
        >
          Exhaustion
        </Text>

        {/* Stepper: [-] [level] [+] */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 w-7 p-0',
              isDanger && 'text-danger hover:text-danger hover:bg-danger/10',
            )}
            aria-label="Decrease exhaustion level"
            disabled={currentLevel <= 0}
            onClick={handleDecrement}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <Text
            variant="bodySm"
            weight="semibold"
            className={cn('w-6 text-center tabular-nums', isDanger && 'text-danger')}
          >
            {currentLevel}
          </Text>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 w-7 p-0',
              isDanger && 'text-danger hover:text-danger hover:bg-danger/10',
            )}
            aria-label="Increase exhaustion level"
            disabled={currentLevel >= 6}
            onClick={handleIncrement}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Penalty text */}
      {currentLevel > 0 && (
        <Text variant="labelSm" className={cn(isDanger && 'text-danger')}>
          {d20Penalty > 0 && `−${d20Penalty} to D20 Tests`}
          {d20Penalty > 0 && speedPenalty > 0 && ', '}
          {speedPenalty > 0 && `−${speedPenalty} ft Speed`}
        </Text>
      )}

      {currentLevel === 0 && (
        <Text variant="labelSm" color="tertiary">
          No exhaustion
        </Text>
      )}
    </Surface>
  );
}
