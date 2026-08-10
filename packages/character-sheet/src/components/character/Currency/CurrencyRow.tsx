// CurrencyRow.tsx — T-204
// Displays CP/SP/EP/GP/PP as 5 columns with coloured labels,
// amount readouts, and [-]/[+] stepper buttons (NFR-02 ≥44px targets).
// Responsive: stacked on mobile, 5-column grid on sm+.

import { Minus, Plus } from 'lucide-react';
import type { Currency } from 'open20-core';
import { Text, Button, Surface, cn } from '@open20/ui';

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

export function CurrencyRow({ currency, onModify, className }: CurrencyRowProps) {
  return (
    <Surface variant="default" padding="sm" className={cn(className)}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-3">
        {DENOMINATIONS.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5 rounded-lg bg-bg-tertiary p-2">
            {/* Coin label with denomination colour */}
            <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white"
                style={{ backgroundColor: d.hex }}
                aria-hidden="true"
              >
                {d.label[0]}
              </div>
              <Text variant="labelSm" color="secondary" className="leading-none">
                {d.label}
              </Text>
            </div>

            {/* Amount */}
            <Text
              variant="bodySm"
              weight="bold"
              className="mx-1 min-w-[2ch] flex-1 text-center tabular-nums"
            >
              {currency[d.key]}
            </Text>

            {/* Subtract */}
            <Button
              variant="danger"
              size="sm"
              className="min-h-[44px] min-w-[44px] shrink-0 p-0"
              onClick={() => onModify({ [d.key]: -1 })}
              aria-label={`Spend 1 ${d.label}`}
            >
              <Minus className="h-4 w-4" />
            </Button>

            {/* Add */}
            <Button
              variant="primary"
              size="sm"
              className="min-h-[44px] min-w-[44px] shrink-0 p-0"
              onClick={() => onModify({ [d.key]: 1 })}
              aria-label={`Add 1 ${d.label}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Surface>
  );
}
