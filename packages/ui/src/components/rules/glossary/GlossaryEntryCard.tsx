import type { ReactNode } from 'react';
import type { GlossaryEntry, GlossaryEntryTag } from 'open20-core';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { useTranslation } from '@/i18n';
import { GlossaryEntryContent } from './GlossaryEntryContent';

const tagVariantMap: Record<GlossaryEntryTag, BadgeProps['variant']> = {
  Action: 'primary',
  'Area of Effect': 'info',
  Attitude: 'secondary',
  Condition: 'warning',
  Hazard: 'danger',
};

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
  const t = useTranslation();
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
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <Text as="h3" variant="heading" size="lg" className="truncate">
          {entry.name}
        </Text>

        {entry.tag && (
          <Badge variant={tagVariantMap[entry.tag]} size="sm">
            {entry.tag}
          </Badge>
        )}

        {entry.condition && (
          <Badge variant="warning" size="sm">
            {entry.condition}
          </Badge>
        )}
      </div>

      {entry.aliases && entry.aliases.length > 0 && (
        <Text variant="caption" as="p" className="text-text-tertiary">
          {t('glossary.aliases', { aliases: entry.aliases.join(', ') })}
        </Text>
      )}

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
