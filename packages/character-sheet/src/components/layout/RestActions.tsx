// RestActions.tsx
// Short Rest / Long Rest button panel. Desktop: sticky at sidebar bottom.
// Mobile: in "More" tab overflow.
// Core rest functions will be wired in T-118; currently UI placeholders.

import { Coffee, Moon } from 'lucide-react';
import { Button, Text, cn } from '@open20/ui';

export interface RestActionsProps {
  onShortRest?: () => void;
  onLongRest?: () => void;
  className?: string;
}

export function RestActions({ onShortRest, onLongRest, className }: RestActionsProps) {
  const handleShortRest = () => {
    if (onShortRest) {
      onShortRest();
    }
  };

  const handleLongRest = () => {
    if (onLongRest) {
      onLongRest();
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Text variant="labelSm" color="secondary" className="uppercase tracking-wide">
        Rest Actions
      </Text>

      <Button
        variant="secondary"
        size="md"
        className="w-full justify-start gap-2 border-warning/40 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
        onClick={handleShortRest}
        aria-label="Take a short rest"
        disabled={!onShortRest}
      >
        <Coffee className="h-4 w-4" />
        Short Rest
      </Button>

      <Button
        variant="secondary"
        size="md"
        className="w-full justify-start gap-2 border-info/40 bg-info/10 text-info hover:bg-info/20 hover:text-info"
        onClick={handleLongRest}
        aria-label="Take a long rest"
        disabled={!onLongRest}
      >
        <Moon className="h-4 w-4" />
        Long Rest
      </Button>
    </div>
  );
}
