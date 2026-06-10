import type { ReactNode } from 'react';
import type { Spell } from 'open20-core';
import { SpellStatusBadges } from './SpellStatusBadges';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';

interface SpellCardBadgesProps {
  spell: Spell;
  showSpellbookBadges?: boolean;
  renderBadges?: () => ReactNode;
}

export function SpellCardBadges({
  spell,
  showSpellbookBadges = false,
  renderBadges,
}: SpellCardBadgesProps) {
  const { isKnown, isPrepared, isCantripKnown } = useSpellCapabilities(spell);

  if (!showSpellbookBadges) {
    return <>{renderBadges?.()}</>;
  }

  return (
    <SpellStatusBadges
      isKnownOrCantrip={isKnown || isCantripKnown}
      isPrepared={isPrepared}
      renderBadges={renderBadges}
    />
  );
}
