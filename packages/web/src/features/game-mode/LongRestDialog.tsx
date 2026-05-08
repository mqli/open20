import { useLocale } from '@/hooks';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Button } from '@/components/ui';
import { Moon } from 'lucide-react';

interface LongRestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LongRestDialog({ open, onOpenChange, onConfirm }: LongRestDialogProps) {
  const { t } = useLocale();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-[--color-accent-blue]" />
            <DialogTitle>{t('rest.longRestTitle')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="w-full space-y-3">
          <p className="text-[--color-text-secondary]">{t('rest.longRestDesc')}</p>
          <ul className="w-full space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-[--color-accent-green]">✓</span>
              {t('rest.restoreHP')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[--color-accent-green]">✓</span>
              {t('rest.resetResources')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[--color-accent-green]">✓</span>
              {t('rest.recoverHitDice')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[--color-accent-green]">✓</span>
              {t('rest.recoverSpellSlots')}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[--color-accent-green]">✓</span>
              {t('rest.clearConditions')}
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm}>
            {t('rest.longRestTitle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
