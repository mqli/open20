import type { ReactNode } from 'react';
import type { GlossaryEntry } from 'open20-core';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { GlossaryEntryContent } from './GlossaryEntryContent';
import { GlossaryEntryHeader } from './GlossaryEntryHeader';

export interface GlossaryEntryCardProps {
  entry: GlossaryEntry;
  showContent?: boolean;
  onClick?: (entry: GlossaryEntry) => void;
  onTermClick?: (entryId: string) => void;
  resolveTermLabel?: (entryId: string) => string | undefined;
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  renderActions?: () => ReactNode;
  density?: CardSurfaceDensity;
  glow?: boolean;
  className?: string;
}

export function GlossaryEntryCard({
  entry,
  showContent: showContentProp,
  onClick,
  onTermClick,
  resolveTermLabel,
  surfaceVariant,
  renderActions,
  density = 'default',
  glow,
  className,
}: GlossaryEntryCardProps) {
  const isCompact = density === 'compact';
  const showContent = showContentProp ?? !isCompact;

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(entry) : undefined}
      glow={glow}
      source={entry.source}
      renderActions={renderActions}
      className={className}
    >
      <GlossaryEntryHeader entry={entry} />

      {showContent && (
        <GlossaryEntryContent
          entry={entry}
          onTermClick={onTermClick}
          resolveTermLabel={resolveTermLabel}
        />
      )}
    </CardSurface>
  );
}
