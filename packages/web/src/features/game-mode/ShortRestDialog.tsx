import { useState } from 'react';
import { useCharacter, useLocale } from '@/hooks';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Button } from '@/components/ui';

interface ShortRestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (hitDiceToSpend: number) => void;
}

export function ShortRestDialog({ open, onOpenChange, onConfirm }: ShortRestDialogProps) {
  const { t } = useLocale();
  const { character } = useCharacter();
  const [hitDiceToSpend, setHitDiceToSpend] = useState(0);

  if (!character) return null;

  // Calculate available hit dice
  const availableHitDice = character.classes.reduce(
    (sum: number, cls: { hitDice: { used: number } }) => sum + cls.hitDice.used,
    0
  );

  const estimatedHealing = hitDiceToSpend * 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>{t('rest.shortRestTitle')}</DialogTitle>
        </DialogHeader>

        <div className="w-full space-y-4">
          <p className="text-[--color-text-secondary]">{t('rest.shortRestDesc')}</p>

          <div className="w-full bg-[--color-bg-elevated] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[--color-text-secondary]">
                {t('rest.hitDiceRemaining')}
              </span>
              <span className="font-semibold">{availableHitDice}</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={availableHitDice}
                value={hitDiceToSpend}
                onChange={(e) => setHitDiceToSpend(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-center font-semibold">
                {hitDiceToSpend}
              </span>
            </div>

            <p className="text-sm text-[--color-text-secondary] mt-2">
              {t('rest.estimatedHealing')}: +{estimatedHealing}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => onConfirm(hitDiceToSpend)}>
            {hitDiceToSpend > 0
              ? t('rest.spendHitDice', { count: hitDiceToSpend })
              : t('common.skip')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
