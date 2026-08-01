// RollModifierRow.tsx
// Shared ▲ / center / ▼ row for ability checks and saving throws.
// ChevronUp → advantage roll, center content → normal roll, ChevronDown → disadvantage roll.

import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export interface RollModifierRowProps {
  /** Aria label suffix, e.g. "Strength" or "Dexterity saving throw". */
  ariaLabel: string;
  /** Called with the roll modifier type. */
  onRoll: (modifier: 'advantage' | 'none' | 'disadvantage') => void;
  /** Content rendered in the center (clickable for normal roll). */
  children: ReactNode;
}

const BTN =
  'inline-flex h-5 w-5 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2';

export function RollModifierRow({ ariaLabel, onRoll, children }: RollModifierRowProps) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className={`${BTN} text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 focus-visible:ring-primary-600`}
        onClick={() => onRoll('advantage')}
        aria-label={`Roll ${ariaLabel} with advantage`}
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>

      <button type="button" onClick={() => onRoll('none')} aria-label={`Roll ${ariaLabel}`}>
        {children}
      </button>

      <button
        type="button"
        className={`${BTN} text-danger hover:bg-danger/20 focus-visible:ring-danger`}
        onClick={() => onRoll('disadvantage')}
        aria-label={`Roll ${ariaLabel} with disadvantage`}
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
