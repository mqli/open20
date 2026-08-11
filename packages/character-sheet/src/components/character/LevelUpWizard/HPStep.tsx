// HPStep.tsx (T-211)
// Step 2 of the level-up wizard: choose how to gain HP.
// Shows the selected class's hit die + CON modifier context, then two options:
//   - Take Average (fixed): uses core's getHitDieFixedValue + CON
//   - Roll: shows the 1dN + CON range

import { Check, Dices } from 'lucide-react';
import { Text, cn } from '@open20/ui';
import { getHitDieFixedValue, type DieType } from 'open20-core';

export interface HPStepProps {
  /** Display name of the selected class (for context label). */
  classDisplayName: string;
  /** Hit die of the selected class. */
  dieType: DieType;
  /** Constitution modifier. */
  conMod: number;
  /** Current HP choice selection. */
  hpChoice: 'fixed' | 'roll';
  /** Called when the user selects an HP option. */
  onChange: (hpChoice: 'fixed' | 'roll') => void;
  /** Additional CSS class for the container. */
  className?: string;
}

function formatMod(mod: number): string {
  if (mod >= 0) return `+${mod}`;
  return `${mod}`;
}

/** Extract the max value from a DieType, e.g. 'd8' → 8. */
function dieMax(die: DieType): number {
  return parseInt(die.slice(1), 10);
}

export function HPStep({
  classDisplayName,
  dieType,
  conMod,
  hpChoice,
  onChange,
  className: containerClass,
}: HPStepProps) {
  const fixedValue = getHitDieFixedValue(dieType);
  const fixedTotal = fixedValue + conMod;
  const max = dieMax(dieType);
  const rollMin = Math.max(1, 1 + conMod);
  const rollMax = max + conMod;

  const options = [
    {
      id: 'fixed',
      label: 'Take Average',
      preview: `${fixedValue} ${formatMod(conMod)} = ${fixedTotal} HP`,
    },
    {
      id: 'roll',
      label: 'Roll',
      preview: `1${dieType} ${formatMod(conMod)} = ${rollMin} to ${rollMax} HP`,
    },
  ] as const;

  return (
    <div className={cn('flex flex-col gap-3', containerClass)}>
      <Text variant="labelSm" color="secondary">
        {classDisplayName} hit die: {dieType} ({formatMod(conMod)} CON)
      </Text>

      <div role="group" aria-label="Hit point gain method" className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = option.id === hpChoice;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label}: ${option.preview}`}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                selected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-border hover:bg-bg-tertiary',
              )}
            >
              <span className="flex items-center gap-1.5">
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                )}
                {option.id === 'roll' && (
                  <Dices className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
                )}
                <Text as="span" variant="bodySm" weight="bold">
                  {option.label}
                </Text>
              </span>
              <Text as="span" variant="labelSm" color="secondary">
                {option.preview}
              </Text>
            </button>
          );
        })}
      </div>
    </div>
  );
}
