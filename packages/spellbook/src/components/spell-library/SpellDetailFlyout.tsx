import { X } from 'lucide-react';
import { useSpellStore } from '@/stores/spellStore';
import { IconButton, ResponsiveDialog } from '@open20/ui';
import { SpellCard } from '@/components/spell/SpellCard';
import { SpellCardBadges } from '@/components/spell/SpellCardBadges';
import { SpellCardActions } from '@/components/spell/SpellCardActions';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';

function SpellDetailContent({
  spell,
}: {
  spell: NonNullable<ReturnType<typeof useSpellStore.getState>['selectedSpell']>;
}) {
  return (
    <div>
      <SpellCard
        spell={spell}
        density="compact"
        className="border-0 rounded-none bg-transparent p-0 ring-0"
        stickyActions
        showDescription
        renderBadges={() => <SpellCardBadges spell={spell} showSpellbookBadges />}
        renderActions={() => (
          <SpellCardActions
            spell={spell}
            showSpellbook
            showCast
            showAttack
            showDamage
            showConcentration
          />
        )}
      />
    </div>
  );
}

export function SpellDetailFlyout() {
  const { selectedSpell, isDetailOpen, closeDetail } = useSpellStore();
  const isLarge = useIsLargeScreen();

  if (!selectedSpell) return null;

  return (
    <ResponsiveDialog
      open={isDetailOpen}
      onOpenChange={(open) => !open && closeDetail()}
      isMobile={!isLarge}
      sheetSide="right"
      sheetClassName="w-full sm:w-[540px]"
      dialogSize="xl"
      dialogClassName="w-[min(96vw,1200px)] max-h-[min(92vh,1000px)] overflow-hidden"
      renderHeader={() => (
        <div className="flex items-center justify-between gap-3 shrink-0 border-b border-border px-3 py-2 sm:px-4">
          <h2 className="text-lg font-semibold text-text-primary truncate">{selectedSpell.name}</h2>
          <IconButton size="sm" aria-label="Close spell details" onClick={closeDetail}>
            <X />
          </IconButton>
        </div>
      )}
    >
      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        <SpellDetailContent spell={selectedSpell} />
      </div>
    </ResponsiveDialog>
  );
}
