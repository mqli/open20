// RestActions.tsx
// Short Rest / Long Rest button panel + dialogs (T-118).
// Self-contained: manages its own dialog state and calls characterStore directly.

import { useState, useMemo } from 'react';
import { Coffee, Moon } from 'lucide-react';
import { Button, Text, cn } from '@open20/ui';
import { getModifier, getTotalScore } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassName } from '@/core/content-resolver';
import { LongRestDialog, ShortRestHitDiceDialog } from '@/components/character/Rests';
import type { ClassHitDiceInfo } from '@/components/character/Rests';

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
  const [showShortRestDialog, setShowShortRestDialog] = useState(false);

  const hasCharacter = character !== null;

  // Per-class hit dice info for the dialog
  const classHitDice: ClassHitDiceInfo[] = useMemo(() => {
    if (!character) return [];
    return character.classes.map((c) => ({
      classId: c.classId,
      className: getClassName(c.classId),
      dieType: c.hitDice.die,
      available: Math.max(0, c.level - c.hitDice.used),
      total: c.level,
    }));
  }, [character]);

  // CON modifier for HP recovery preview — uses same calculation as core shortRest()
  const conMod = useMemo(() => {
    if (!character) return 0;
    return getModifier(getTotalScore(character.abilityScores, 'Constitution'));
  }, [character]);

  const currentHp = character?.hitPoints.current ?? 0;
  const maxHp = character?.hitPoints.max ?? 0;

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
          onClick={() => setShowShortRestDialog(true)}
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

      {/* Short Rest hit dice dialog */}
      <ShortRestHitDiceDialog
        open={showShortRestDialog}
        onOpenChange={setShowShortRestDialog}
        onConfirm={(perClassSpending) => {
          shortRest(perClassSpending);
          onShortRest?.();
        }}
        classHitDice={classHitDice}
        conMod={conMod}
        currentHp={currentHp}
        maxHp={maxHp}
      />

      {/* Long Rest confirmation dialog */}
      <LongRestDialog
        open={showLongRestDialog}
        onOpenChange={setShowLongRestDialog}
        onConfirm={longRest}
      />
    </>
  );
}
