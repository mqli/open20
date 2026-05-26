import { ArrowLeft, X } from 'lucide-react';
import { useSpellStore } from '@/stores/spell-store';
import {
  Button,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetRoot,
} from '@open20/ui';
import { SpellCardWrapper } from '@/components/spell/SpellCardWrapper';

export function SpellDetailFlyout() {
  const { selectedSpell, isDetailOpen, closeDetail } = useSpellStore();

  if (!selectedSpell) return null;
  return (
    <SheetRoot open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
      <SheetContent side="right">
        <SheetHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDetail}
            className="p-2 hover:bg-bg-tertiary rounded-md md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Button>
          
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto md:hidden absolute left-1/2 -translate-x-1/2 top-2" />

          <SheetClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-bg-tertiary rounded-md relative right-0 top-0"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <SheetBody>
          <div className="mb-6">
            <SpellCardWrapper
              spell={selectedSpell}
              showDescription
              showSpellbookActions
              showSpellbookBadges
              showCastAction
              showAttackAction
              showDamageActions
              showConcentrationAction
            />
          </div>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
}
