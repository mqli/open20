// HitDiceRow.tsx — T-205 / T-206
// Per-class hit dice display with used/total and a [Spend] button.
// Wireframe §6.9 — rows from character.classes, Spend opens short rest dialog.

import { useMemo, useState } from 'react';
import { Button, Text, Surface, cn } from '@open20/ui';
import { getModifier, getTotalScore } from 'open20-core';
import type { DieType } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassName } from '@/core/content-resolver';
import { ShortRestHitDiceDialog } from '@/components/character/Rests';
import type { ClassHitDiceInfo } from '@/components/character/Rests';

export interface HitDiceRowProps {
  className?: string;
}

interface HitDieClassRow {
  classId: string;
  className: string;
  dieType: DieType;
  used: number;
  total: number;
}

export function HitDiceRow({ className }: HitDiceRowProps) {
  const character = useCharacterStore((s) => s.character);
  const shortRest = useCharacterStore((s) => s.shortRest);

  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Build ClassHitDiceInfo for the dialog
  const classHitDice: ClassHitDiceInfo[] = useMemo(() => {
    return rows.map((r) => ({
      classId: r.classId,
      className: r.className,
      dieType: r.dieType,
      available: Math.max(0, r.total - r.used),
      total: r.total,
    }));
  }, [rows]);

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

  const handleSpend = () => {
    setDialogOpen(true);
  };

  const handleShortRestConfirm = (perClassSpending: Record<string, number>) => {
    shortRest(perClassSpending);
  };

  if (!character || rows.length === 0) return null;

  const conSign = conMod >= 0 ? '+' : '−';
  const conFormatted = conMod >= 0 ? String(conMod) : String(Math.abs(conMod));
  const anyAvailable = classHitDice.some((c) => c.available > 0);

  return (
    <>
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
                  disabled={!anyAvailable}
                  onClick={handleSpend}
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

      {/* Short Rest dialog */}
      <ShortRestHitDiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleShortRestConfirm}
        classHitDice={classHitDice}
        conMod={conMod}
        currentHp={character.hitPoints.current}
        maxHp={character.hitPoints.max}
      />
    </>
  );
}
