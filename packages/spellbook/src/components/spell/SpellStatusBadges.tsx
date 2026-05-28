import type { ReactNode } from 'react';
import { Badge } from '@open20/ui';
import { useSpellbookTranslation } from '@/i18n';

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
  const t = useSpellbookTranslation();
  return (
    <>
      {isKnownOrCantrip && !isPrepared && (
        <Badge variant="info" size="sm">
          {t('learn')}
        </Badge>
      )}
      {isPrepared && (
        <Badge variant="primary" size="sm">
          {t('preparedShort')}
        </Badge>
      )}
      {renderBadges?.()}
    </>
  );
}
