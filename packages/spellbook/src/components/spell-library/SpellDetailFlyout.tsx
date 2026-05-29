import { X } from 'lucide-react';
import { useSpellStore } from '@/stores/spell-store';
import {
  IconButton,
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
          <SheetClose asChild>
            <IconButton size="sm">
              <X />
            </IconButton>
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
