import type { ReactNode } from 'react';
import { Badge } from '@open20/ui';
import { useTranslation } from '@open20/ui';

interface SpellStatusBadgesProps {
  isKnownOrCantrip: boolean;
  isPrepared: boolean;
  renderBadges?: () => ReactNode;
}

export function SpellStatusBadges({
  isKnownOrCantrip,
  isPrepared,
  renderBadges,
}: SpellStatusBadgesProps) {
  const t = useTranslation();
  return (
    <>
      {isKnownOrCantrip && !isPrepared && <Badge variant="info">{t('known')}</Badge>}
      {isPrepared && <Badge variant="primary">{t('prepared')}</Badge>}
      {renderBadges?.()}
    </>
  );
}
