import type { ReactNode } from 'react';
import type { Spell } from 'open20-core';
import { SpellCard as UISpellCard } from '@open20/ui';
import { useSpellCardSurface } from '@/hooks/useSpellCardSurface';

interface SpellCardProps {
  spell: Spell;
  density?: 'default' | 'compact';
  className?: string;
  stickyActions?: boolean;
  showDescription?: boolean;
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  glow?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  /** Render prop for badge chips (passed to SpellCardUI) */
  renderBadges?: () => ReactNode;
  /** Render prop for action buttons (passed to SpellCardUI) */
  renderActions?: () => ReactNode;
}

function SpellCard({
  spell,
  density,
  className,
  stickyActions,
  showDescription,
  surfaceVariant: surfaceVariantProp,
  glow,
  onClick,
  children,
  renderBadges,
  renderActions,
}: SpellCardProps) {
  const surfaceVariant = useSpellCardSurface(spell);

  return (
    <UISpellCard
      spell={spell}
      className={['spell-card', className].filter(Boolean).join(' ')}
      density={density}
      stickyActions={stickyActions}
      showDescription={showDescription}
      surfaceVariant={surfaceVariantProp ?? surfaceVariant}
      glow={glow}
      onClick={onClick}
      renderBadges={renderBadges}
      renderActions={renderActions}
    >
      {children}
    </UISpellCard>
  );
}

export { SpellCard };
