import { X } from 'lucide-react';
import { useSpellStore } from '@/stores/spell-store';
import { IconButton, Sheet, Dialog } from '@open20/ui';
import { SpellCardWrapper } from '@/components/spell/SpellCardWrapper';
import { useIsLargeScreen } from '@/hooks/use-breakpoint';

function SpellDetailContent({
  spell,
}: {
  spell: NonNullable<ReturnType<typeof useSpellStore.getState>['selectedSpell']>;
}) {
  return (
    <div className="mb-6">
      <SpellCardWrapper
        spell={spell}
        showDescription
        showSpellbookActions
        showSpellbookBadges
        showCastAction
        showAttackAction
        showDamageActions
        showConcentrationAction
      />
    </div>
  );
}

export function SpellDetailFlyout() {
  const { selectedSpell, isDetailOpen, closeDetail } = useSpellStore();
  const isLarge = useIsLargeScreen();

  if (!selectedSpell) return null;

  // Mobile/Tablet: Use Sheet (slide-in from right)
  if (!isLarge) {
    return (
      <Sheet open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
        <Sheet.Content side="right" className="w-full sm:w-[540px]">
          <Sheet.Header>
            <Sheet.Close asChild>
              <IconButton size="sm">
                <X />
              </IconButton>
            </Sheet.Close>
          </Sheet.Header>
          <Sheet.Body>
            <SpellDetailContent spell={selectedSpell} />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );
  }

  // Desktop: Use Dialog (centered modal)
  return (
    <Dialog.Root open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
      <Dialog.Overlay />
      <Dialog.Content size="lg">
        <div className="flex justify-end mb-4">
          <Dialog.Close asChild>
            <IconButton size="sm">
              <X />
            </IconButton>
          </Dialog.Close>
        </div>
        <SpellDetailContent spell={selectedSpell} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
