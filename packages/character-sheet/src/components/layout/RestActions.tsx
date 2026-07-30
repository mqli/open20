// RestActions.tsx
// Short Rest / Long Rest button panel + dialogs (T-118).
// Self-contained: manages its own dialog state and calls characterStore directly.

import { useState } from 'react';
import { Coffee, Moon } from 'lucide-react';
import { Button, Text, cn } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { LongRestDialog } from '@/components/character/Rests';

export interface RestActionsProps {
  className?: string;
  /** Called after a short rest completes — useful for closing parent menus on mobile. */
  onShortRest?: () => void;
}

export function RestActions({ className, onShortRest }: RestActionsProps) {
  const character = useCharacterStore((s) => s.character);
  const shortRest = useCharacterStore((s) => s.shortRest);
  const longRest = useCharacterStore((s) => s.longRest);

  const [showLongRestDialog, setShowLongRestDialog] = useState(false);

  const hasCharacter = character !== null;

  return (
    <>
      <div className={cn('flex flex-col gap-2', className)}>
        <Text variant="labelSm" color="secondary" className="uppercase tracking-wide">
          Rest Actions
        </Text>

        <Button
          variant="secondary"
          size="md"
          className="w-full justify-start gap-2 border-warning/40 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
          onClick={() => {
            shortRest(0);
            onShortRest?.();
          }}
          aria-label="Take a short rest"
          disabled={!hasCharacter}
        >
          <Coffee className="h-4 w-4" />
          Short Rest
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="w-full justify-start gap-2 border-info/40 bg-info/10 text-info hover:bg-info/20 hover:text-info"
          onClick={() => setShowLongRestDialog(true)}
          aria-label="Take a long rest"
          disabled={!hasCharacter}
        >
          <Moon className="h-4 w-4" />
          Long Rest
        </Button>
      </div>

      {/* Long Rest confirmation dialog */}
      <LongRestDialog
        open={showLongRestDialog}
        onOpenChange={setShowLongRestDialog}
        onConfirm={longRest}
      />
    </>
  );
}
