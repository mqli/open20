import { useState } from 'react';
import { useCharacter, useLocale } from '@/hooks';
import { Sheet, SheetHeader, SheetContent, SheetTitle, Button } from '@/components/ui';

interface HPModifyPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HPModifyPanel({ open, onOpenChange }: HPModifyPanelProps) {
  const { t } = useLocale();
  const { hitPoints, damage, heal, setTempHP } = useCharacter();
  const [amount, setAmount] = useState(0);

  if (!hitPoints) return null;

  const handleDamage = () => {
    damage(amount);
    setAmount(0);
    onOpenChange(false);
  };

  const handleHealing = () => {
    heal(amount);
    setAmount(0);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="space-y-6 p-4">
        <SheetHeader>
          <SheetTitle>
            {t('gameMode.hp')}: {hitPoints.current} / {hitPoints.max}
          </SheetTitle>
        </SheetHeader>
        {/* Temp HP */}
        <div className="w-full">
          <label className="text-sm text-[--color-text-secondary]">
            {t('gameMode.tempHP')}
          </label>
          <div className="flex flex-wrap gap-2 mt-1 w-full">
            {[0, 5, 10, 15, 20].map((val) => (
              <Button
                key={val}
                variant={hitPoints.temporary === val ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTempHP(val)}
              >
                {val}
              </Button>
            ))}
          </div>
        </div>

        {/* Damage/Healing Amount */}
        <div className="w-full">
          <label className="text-sm text-[--color-text-secondary]">
            {t('hp.damage')} / {t('hp.healing')}
          </label>
          <div className="flex items-center gap-3 mt-1 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.max(0, amount - 5))}
            >
              -5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(Math.max(0, amount - 1))}
            >
              -1
            </Button>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20 h-10 text-center bg-[--color-bg-elevated] border border-[--color-border] rounded-md text-lg"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(amount + 1)}
            >
              +1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(amount + 5)}
            >
              +5
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDamage}
          >
            {t('hp.applyDamage')}
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={handleHealing}
          >
            {t('hp.applyHealing')}
          </Button>
        </div>

        {/* Death Saves */}
        <div className="w-full pt-4 border-t border-[--color-border]">
          <h3 className="text-sm font-semibold text-[--color-text-secondary] mb-2">
            {t('hp.deathSaves')}
          </h3>
          <div className="text-sm text-[--color-text-muted]">
            Roll d20. 10+ = success, 1 = fail, 20 = full HP, 1 = 2 fails
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
