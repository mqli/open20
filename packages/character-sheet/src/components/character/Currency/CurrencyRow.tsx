// CurrencyRow.tsx — T-204
// Displays CP/SP/EP/GP/PP as 5 columns with coloured labels and
// direct numeric input fields. Type any non-negative amount; changes
// commit on blur or Enter. Responsive: stacked on mobile, 5-col on sm+.

import { useCallback, useRef } from 'react';
import type { Currency } from 'open20-core';
import { Text, Surface, cn } from '@open20/ui';

export interface CurrencyRowProps {
  currency: Currency;
  onModify: (delta: Partial<Currency>) => void;
  className?: string;
}

interface DenominationDef {
  key: keyof Currency;
  label: string;
  hex: string;
}

const DENOMINATIONS: DenominationDef[] = [
  { key: 'cp', label: 'CP', hex: '#b87333' },
  { key: 'sp', label: 'SP', hex: '#a0a8b0' },
  { key: 'ep', label: 'EP', hex: '#c9a84c' },
  { key: 'gp', label: 'GP', hex: '#d4a017' },
  { key: 'pp', label: 'PP', hex: '#c4c9cc' },
];

function DenominationInput({
  value,
  label,
  hex,
  onChange,
}: {
  value: number;
  label: string;
  hex: string;
  onChange: (delta: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const raw = input.value;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== value) {
      onChange(parsed - value);
    } else if (isNaN(parsed) || parsed < 0) {
      // Revert bad input
      input.value = String(value);
    }
  }, [value, onChange]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-bg-tertiary p-2">
      {/* Coin label */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        >
          {label[0]}
        </div>
        <Text variant="labelSm" color="secondary" className="leading-none">
          {label}
        </Text>
      </div>

      {/* Editable amount — uncontrolled with key remount on upstream change */}
      <input
        ref={inputRef}
        key={value}
        type="number"
        min="0"
        inputMode="numeric"
        defaultValue={String(value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        aria-label={`${label} amount`}
        className={cn(
          'flex-1 min-h-[44px] w-full rounded-md border border-border',
          'bg-bg-primary px-2 text-center tabular-nums text-sm font-bold',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
    </div>
  );
}

export function CurrencyRow({ currency, onModify, className }: CurrencyRowProps) {
  return (
    <Surface variant="default" padding="sm" className={cn(className)}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-3">
        {DENOMINATIONS.map((d) => (
          <DenominationInput
            key={d.key}
            value={currency[d.key]}
            label={d.label}
            hex={d.hex}
            onChange={(delta) => onModify({ [d.key]: delta })}
          />
        ))}
      </div>
    </Surface>
  );
}
