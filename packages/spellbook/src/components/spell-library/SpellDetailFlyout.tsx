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
        className="border-0 rounded-none bg-transparent p-0 ring-0"
        stickyActions
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
      <Dialog.Content
        size="xl"
        className="flex flex-col w-[min(96vw,1200px)] p-0 max-h-[min(92vh,1000px)] overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4 sm:px-8">
          <h2 className="text-lg font-semibold text-text-primary truncate">{selectedSpell.name}</h2>
          <IconButton size="sm" aria-label="Close spell details" onClick={closeDetail}>
            <X />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <SpellDetailContent spell={selectedSpell} />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
