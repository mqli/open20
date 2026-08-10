// HitDiceRow.tsx — T-205
// Per-class hit dice display with used/total and a [Spend] button.
// Wireframe §6.9 — rows from character.classes, Spend opens short rest dialog.

import { useMemo, useCallback } from 'react';
import { Button, Text, Surface, cn } from '@open20/ui';
import { getModifier, getTotalScore } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassName } from '@/core/content-resolver';

export interface HitDiceRowProps {
  className?: string;
  /** Called when user clicks [Spend] on a class row. Parent opens ShortRest dialog. */
  onSpend?: (classId: string) => void;
}

interface HitDieClassRow {
  classId: string;
  className: string;
  dieType: string;
  used: number;
  total: number;
}

export function HitDiceRow({ className, onSpend }: HitDiceRowProps) {
  const character = useCharacterStore((s) => s.character);

  const conMod = useMemo(() => {
    if (!character) return 0;
    return getModifier(getTotalScore(character.abilityScores, 'Constitution'));
  }, [character]);

  const rows: HitDieClassRow[] = useMemo(() => {
    if (!character) return [];
    return character.classes.map((c) => ({
      classId: c.classId,
      className: getClassName(c.classId),
      dieType: c.hitDice.die,
      used: c.hitDice.used,
      total: c.level,
    }));
  }, [character]);

  // Pick a representative die type for the footer formula.
  const representativeDie = useMemo(() => {
    if (rows.length === 0) return 'd6';
    let best = rows[0];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].total - rows[i].used > best.total - best.used) {
        best = rows[i];
      }
    }
    return best.dieType;
  }, [rows]);

  const handleSpend = useCallback(
    (classId: string) => {
      onSpend?.(classId);
    },
    [onSpend],
  );

  if (!character || rows.length === 0) return null;

  const conSign = conMod >= 0 ? '+' : '−';
  const conFormatted = conMod >= 0 ? String(conMod) : String(Math.abs(conMod));

  return (
    <Surface variant="default" padding="sm" className={cn(className)}>
      <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
        Hit Dice
      </Text>

      {/* Per-class rows */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.classId}
            className="flex items-center justify-between rounded-md bg-bg-secondary px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Text variant="bodySm" className="font-semibold">
                {row.className}
              </Text>
              <Text variant="labelSm" color="tertiary">
                {row.dieType}
              </Text>
            </div>

            <div className="flex items-center gap-3">
              <Text variant="labelSm" color="secondary" className="tabular-nums">
                {row.used} / {row.total}
              </Text>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                aria-label={`Spend ${row.className} hit dice`}
                disabled={row.used >= row.total}
                onClick={() => handleSpend(row.classId)}
              >
                Spend
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: healing formula */}
      <Text variant="labelSm" color="tertiary" className="mt-3">
        Spend during Short Rest: {representativeDie} {conSign} CON ({conFormatted}) per hit die
      </Text>
    </Surface>
  );
}
