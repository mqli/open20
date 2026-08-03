// OptionGrid.tsx (T-120)
// Grid of selectable option buttons — the wizard's picker primitive.
// Used instead of a Select so every choice is visible, keyboard-reachable and
// assertable by accessible name.

import { useId } from 'react';
import { Check } from 'lucide-react';
import { Text, cn } from '@open20/ui';

export interface GridOption {
  id: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface OptionGridProps {
  /** Visible group label; also the accessible name of the button group. */
  legend: string;
  options: GridOption[];
  /** Currently selected option id, or '' / undefined for none. */
  value: string | undefined;
  onChange: (id: string) => void;
  className?: string;
}

export function OptionGrid({ legend, options, value, onChange, className }: OptionGridProps) {
  const groupId = useId();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Text variant="labelSm" color="secondary">
        {legend}
      </Text>
      <div
        role="group"
        aria-label={legend}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        {options.map((option) => {
          const selected = option.id === value;
          const sublabelId = `${groupId}-${option.id}-sublabel`;
          return (
            <button
              key={option.id}
              type="button"
              // Accessible name is the label alone; the sublabel is a hint, so
              // it is exposed as a description instead of appended to the name.
              aria-label={option.label}
              aria-describedby={option.sublabel ? sublabelId : undefined}
              aria-pressed={selected}
              disabled={option.disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex min-h-[44px] min-w-0 flex-col items-start justify-center gap-0.5 rounded-md border p-2 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                'disabled:cursor-not-allowed disabled:opacity-40',
                selected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-border hover:bg-bg-tertiary',
              )}
            >
              <span className="flex w-full min-w-0 items-center gap-1">
                {/* NFR-01: selection is shown by a check icon, not colour alone. */}
                {selected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary-600" aria-hidden="true" />
                )}
                {/* `block` is required: `truncate` has no effect on inline spans. */}
                <Text as="span" variant="bodySm" weight="bold" className="block min-w-0 truncate">
                  {option.label}
                </Text>
              </span>
              {option.sublabel && (
                <span id={sublabelId} className="block w-full min-w-0">
                  <Text as="span" variant="labelSm" color="secondary" className="block truncate">
                    {option.sublabel}
                  </Text>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
