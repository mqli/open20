import type { ReactNode } from 'react';
import { Badge } from '@open20/ui';

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
  return (
    <>
      {isKnownOrCantrip && !isPrepared && (
        <Badge variant="info" size="sm">Known</Badge>
      )}
      {isPrepared && (
        <Badge variant="primary" size="sm">Prepared</Badge>
      )}
      {renderBadges?.()}
    </>
  );
}
