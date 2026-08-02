// DeathSavesTracker.tsx (T-102)
// Presentational death save tracker: 3 success + 3 failure toggle circles
// (32px, filled SVG icons, NFR-01 non-color redundant cues).
// FR-103: auto-stable at 3 successes; HP 0→+ clears via core (T-011).

import { Check, X } from 'lucide-react';
import { Surface, Text, cn } from '@open20/ui';

export interface DeathSavesTrackerProps {
  successes: number;
  failures: number;
  isStable: boolean;
  onToggleSuccess: (index: number) => void;
  onToggleFailure: (index: number) => void;
  className?: string;
}

function DeathSaveCircle({
  filled,
  kind,
  index,
  isToggleable,
  onClick,
}: {
  filled: boolean;
  kind: 'success' | 'failure';
  index: number;
  /** Whether this circle can be toggled (only the next empty or last filled position). */
  isToggleable: boolean;
  onClick: () => void;
}) {
  const label = `Toggle death save ${kind} ${index + 1}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isToggleable}
      aria-label={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-full border-2',
        'focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        filled
          ? kind === 'success'
            ? 'border-success bg-success'
            : 'border-danger bg-danger'
          : 'border-border bg-transparent',
      )}
    >
      {filled &&
        (kind === 'success' ? (
          <Check className="size-5 text-white" aria-hidden="true" />
        ) : (
          <X className="size-5 text-white" aria-hidden="true" />
        ))}
    </button>
  );
}

export function DeathSavesTracker({
  successes,
  failures,
  isStable,
  onToggleSuccess,
  onToggleFailure,
  className,
}: DeathSavesTrackerProps) {
  const statusText = isStable ? 'Stable' : `${successes} / 3 successes · ${failures} / 3 failures`;

  return (
    <Surface variant="default" padding="sm" className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <Text variant="labelSm" color="secondary" className="mb-3 uppercase tracking-wide">
          Death Saves
        </Text>
        <Text variant="labelSm" color={isStable ? 'primary' : 'secondary'}>
          {statusText}
        </Text>
      </div>

      {/* Success row */}
      <div className="flex items-center gap-2" role="group" aria-label="Death save successes">
        <Text variant="labelSm" className="w-16 shrink-0 text-success">
          Success
        </Text>
        {[0, 1, 2].map((i) => {
          const filled = i < successes;
          const isToggleable = filled ? i === successes - 1 : i === successes;
          return (
            <DeathSaveCircle
              key={`success-${i}`}
              filled={filled}
              kind="success"
              index={i}
              isToggleable={isToggleable}
              onClick={() => onToggleSuccess(i)}
            />
          );
        })}
      </div>

      {/* Failure row */}
      <div className="flex items-center gap-2" role="group" aria-label="Death save failures">
        <Text variant="labelSm" className="w-16 shrink-0 text-danger">
          Fail
        </Text>
        {[0, 1, 2].map((i) => {
          const filled = i < failures;
          const isToggleable = filled ? i === failures - 1 : i === failures;
          return (
            <DeathSaveCircle
              key={`failure-${i}`}
              filled={filled}
              kind="failure"
              index={i}
              isToggleable={isToggleable}
              onClick={() => onToggleFailure(i)}
            />
          );
        })}
      </div>

      {/* Threshold labels */}
      {successes >= 3 && (
        <Text variant="labelSm" className="mt-1 text-success">
          Stable at 3 successes
        </Text>
      )}
      {failures >= 3 && (
        <Text variant="labelSm" className="mt-1 text-danger">
          Death at 3 failures
        </Text>
      )}
    </Surface>
  );
}
