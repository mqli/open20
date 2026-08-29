// RestActions.tsx
// Short Rest / Long Rest button panel + dialogs (T-118).
// Self-contained: manages its own dialog state and calls characterStore directly.

import { useState, useMemo } from 'react';
import { Coffee, Moon, TrendingUp } from 'lucide-react';
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

// Shared rest logic: dialog state, hit-dice info, CON modifier, and the dialogs
// themselves. Reused by both the full-size panel (RestActions) and the compact
// icon row (RestActionsCompact) to avoid duplicating dialog wiring.
function useRestActions(onShortRest?: () => void) {
  const character = useCharacterStore((s) => s.character);
  const shortRest = useCharacterStore((s) => s.shortRest);
  const longRest = useCharacterStore((s) => s.longRest);

  const [showLongRestDialog, setShowLongRestDialog] = useState(false);
  const [showShortRestDialog, setShowShortRestDialog] = useState(false);

  const hasCharacter = character !== null;

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

  const conMod = useMemo(() => {
    if (!character) return 0;
    return getModifier(getTotalScore(character.abilityScores, 'Constitution'));
  }, [character]);

  const currentHp = character?.hitPoints.current ?? 0;
  const maxHp = character?.hitPoints.max ?? 0;

  return {
    hasCharacter,
    classHitDice,
    conMod,
    currentHp,
    maxHp,
    showShortRestDialog,
    setShowShortRestDialog,
    showLongRestDialog,
    setShowLongRestDialog,
    shortRest,
    longRest,
    onShortRest,
  };
}

function RestDialogs(props: ReturnType<typeof useRestActions>) {
  return (
    <>
      <ShortRestHitDiceDialog
        open={props.showShortRestDialog}
        onOpenChange={props.setShowShortRestDialog}
        onConfirm={(perClassSpending) => {
          props.shortRest(perClassSpending);
          props.onShortRest?.();
        }}
        classHitDice={props.classHitDice}
        conMod={props.conMod}
        currentHp={props.currentHp}
        maxHp={props.maxHp}
      />
      <LongRestDialog
        open={props.showLongRestDialog}
        onOpenChange={props.setShowLongRestDialog}
        onConfirm={props.longRest}
      />
    </>
  );
}

export function RestActions({ className, onShortRest }: RestActionsProps) {
  const rest = useRestActions(onShortRest);

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
          onClick={() => rest.setShowShortRestDialog(true)}
          aria-label="Take a short rest"
          disabled={!rest.hasCharacter}
        >
          <Coffee className="h-4 w-4" />
          Short Rest
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="w-full justify-start gap-2 border-info/40 bg-info/10 text-info hover:bg-info/20 hover:text-info"
          onClick={() => rest.setShowLongRestDialog(true)}
          aria-label="Take a long rest"
          disabled={!rest.hasCharacter}
        >
          <Moon className="h-4 w-4" />
          Long Rest
        </Button>
      </div>

      <RestDialogs {...rest} />
    </>
  );
}

export interface RestActionsCompactProps {
  className?: string;
  /** Called when the Level Up trigger is clicked. */
  onLevelUp: () => void;
  /** Disable the Level Up trigger (e.g. character at level 20). */
  levelUpDisabled?: boolean;
}

/**
 * Compact icon-only triggers for the mobile sticky header: Short Rest, Long Rest,
 * and Level Up. Each is a 44px tap target with an aria-label. Reuses the same
 * dialog logic as RestActions via useRestActions.
 */
export function RestActionsCompact({
  className,
  onLevelUp,
  levelUpDisabled = false,
}: RestActionsCompactProps) {
  const rest = useRestActions();

  const iconButton =
    'flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-600 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <>
      <div className={cn('flex items-center gap-0.5', className)}>
        <button
          type="button"
          className={cn(iconButton, 'text-warning hover:text-warning')}
          onClick={() => rest.setShowShortRestDialog(true)}
          aria-label="Take a short rest"
          disabled={!rest.hasCharacter}
        >
          <Coffee className="h-5 w-5" />
        </button>
        <button
          type="button"
          className={cn(iconButton, 'text-info hover:text-info')}
          onClick={() => rest.setShowLongRestDialog(true)}
          aria-label="Take a long rest"
          disabled={!rest.hasCharacter}
        >
          <Moon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className={cn(iconButton, 'text-primary-400 hover:text-primary-400')}
          onClick={onLevelUp}
          aria-label="Level up character"
          disabled={levelUpDisabled}
        >
          <TrendingUp className="h-5 w-5" />
        </button>
      </div>

      <RestDialogs {...rest} />
    </>
  );
}
