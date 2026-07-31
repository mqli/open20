// ShortRestHitDiceDialog.tsx
// Per-class hit dice selector with HP recovery preview.
// Wireframe §7.2 — user picks per-class dice, previews recovery, then confirms.

import { useState, useMemo } from 'react';
import { Dices, Minus, Plus } from 'lucide-react';
import { Dialog, Button, Text, Surface } from '@open20/ui';
import { getHitDieFixedValue } from 'open20-core';
import type { DieType } from 'open20-core';

export interface ClassHitDiceInfo {
  classId: string;
  className: string;
  dieType: DieType;
  available: number;
  total: number;
}

export interface ShortRestHitDiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with per-class hit dice to spend when the user confirms. */
  onConfirm: (perClassSpending: Record<string, number>) => void;
  /** Per-class hit dice info (die type, available count, display name). */
  classHitDice: ClassHitDiceInfo[];
  /** Character's Constitution modifier. */
  conMod: number;
  /** Current HP before rest. */
  currentHp: number;
  /** Maximum HP. */
  maxHp: number;
}

export function ShortRestHitDiceDialog({
  open,
  onOpenChange,
  onConfirm,
  classHitDice,
  conMod,
  currentHp,
  maxHp,
}: ShortRestHitDiceDialogProps) {
  const [spending, setSpending] = useState<Record<string, number>>({});

  const totalAvailable = useMemo(
    () => classHitDice.reduce((sum, c) => sum + c.available, 0),
    [classHitDice],
  );

  const estimatedRecovery = useMemo(() => {
    let total = 0;
    for (const info of classHitDice) {
      const count = spending[info.classId] || 0;
      if (count <= 0) continue;
      // Use fixed/average value for deterministic preview
      const perDie = getHitDieFixedValue(info.dieType) + conMod;
      total += perDie * count;
    }
    return total;
  }, [classHitDice, spending, conMod]);

  const hpAfterRest = Math.min(currentHp + estimatedRecovery, maxHp);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSpending({});
    onOpenChange(next);
  };

  const handleConfirm = () => {
    // Build per-class spending map (only non-zero entries)
    const result: Record<string, number> = {};
    for (const info of classHitDice) {
      const count = spending[info.classId] || 0;
      if (count > 0) result[info.classId] = count;
    }
    onConfirm(result);
    handleOpenChange(false);
  };

  const setCount = (classId: string, count: number) => {
    const info = classHitDice.find((c) => c.classId === classId);
    const clamped = Math.max(0, Math.min(count, info?.available ?? 0));
    setSpending((prev) => ({ ...prev, [classId]: clamped }));
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Short Rest</Dialog.Title>
          <Dialog.Description>
            Spend hit dice to recover HP. Each hit die restores HP equal to the die roll + your
            Constitution modifier.
          </Dialog.Description>
        </Dialog.Header>

        {totalAvailable === 0 ? (
          <div className="mb-6 flex flex-col items-center gap-2 py-4">
            <Dices className="h-8 w-8 text-text-tertiary" aria-hidden="true" />
            <Text variant="bodySm" color="secondary">
              No hit dice available
            </Text>
            <Text variant="labelSm" color="tertiary">
              Take a long rest to recover your hit dice.
            </Text>
          </div>
        ) : (
          <>
            {/* Per-class rows */}
            <div className="mb-4 space-y-4">
              {classHitDice.map((info) => (
                <PerClassRow
                  key={info.classId}
                  info={info}
                  count={spending[info.classId] || 0}
                  conMod={conMod}
                  onChange={(count) => setCount(info.classId, count)}
                />
              ))}
            </div>

            {/* Total recovery summary */}
            <Surface className="mb-4 p-3" variant="ghost">
              <div className="flex items-center justify-between">
                <Text variant="labelSm" color="secondary">
                  Estimated recovery
                </Text>
                <Text variant="labelSm" className="font-semibold">
                  ~{estimatedRecovery} HP
                </Text>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <Text variant="labelSm" color="secondary">
                  HP after rest
                </Text>
                <Text variant="labelSm" className="font-semibold">
                  {currentHp === maxHp && estimatedRecovery === 0
                    ? `${currentHp} / ${maxHp} (at maximum)`
                    : hpAfterRest === maxHp && estimatedRecovery > 0
                      ? `${currentHp} → ${hpAfterRest} / ${maxHp} (capped)`
                      : `${currentHp} → ${hpAfterRest} / ${maxHp}`}
                </Text>
              </div>
            </Surface>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button
            variant="primary"
            onClick={handleConfirm}
            aria-label="Take Short Rest"
            disabled={totalAvailable === 0}
          >
            Take Short Rest
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ── Per-Class Row ────────────────────────────────────────────────

function PerClassRow({
  info,
  count,
  conMod,
  onChange,
}: {
  info: ClassHitDiceInfo;
  count: number;
  conMod: number;
  onChange: (count: number) => void;
}) {
  const perDie = getHitDieFixedValue(info.dieType) + conMod;
  const healEstimate = perDie * count;

  return (
    <div className="flex flex-col gap-1">
      {/* Header: class name + die type + used/total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Text variant="bodySm" className="font-semibold">
            {info.className}
          </Text>
          <Text variant="labelSm" color="secondary">
            {info.dieType}
          </Text>
        </div>
        <Text variant="labelSm" color="secondary">
          {info.total - info.available} / {info.total} used
        </Text>
      </div>

      {/* Stepper row */}
      <div className="flex items-center gap-2">
        <Text variant="labelSm" color="secondary" className="w-12 shrink-0">
          Spend:
        </Text>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            aria-label={`Spend one less ${info.className} hit die`}
            disabled={count <= 0}
            onClick={() => onChange(count - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Text variant="bodySm" className="w-6 text-center font-semibold">
            {count}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            aria-label={`Spend one more ${info.className} hit die`}
            disabled={count >= info.available}
            onClick={() => onChange(count + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-7 text-xs"
            aria-label={`Spend all ${info.className} hit dice`}
            disabled={info.available <= 0}
            onClick={() => onChange(info.available)}
          >
            Max
          </Button>
        </div>
      </div>

      {/* Heal estimate */}
      <Text variant="labelSm" color="secondary" className="pl-12">
        {count > 0
          ? `${count}${info.dieType} + ${count}×${conMod} (CON) = ~${healEstimate} HP`
          : `0${info.dieType} + 0 (CON) = +0 HP`}
      </Text>
    </div>
  );
}
