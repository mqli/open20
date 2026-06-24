import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';

import type { Background } from 'open20-core';

export interface BackgroundCardProps {
  /** The background data from @open20/core */
  background: Background;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the background as argument */
  onClick?: (background: Background) => void;
  /** Override the Surface variant */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Additional className */
  className?: string;
}

export function BackgroundCard({
  background,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  density = 'default',
  className,
}: BackgroundCardProps) {
  const isCompact = density === 'compact';
  const displayName = background.name || background.id;
  const showDesc = showDescProp ?? !isCompact;

  const hasProficiencies =
    background.skillProficiencies.length > 0 ||
    background.toolProficiencies.length > 0 ||
    background.languages.length > 0;

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(background) : undefined}
      source={background.source}
      renderActions={renderActions}
      className={className}
    >
      {/* ── Header Row ── */}
      <div className="flex items-start justify-between gap-2">
        <Text as="h3" variant="heading" size="lg" className="truncate">
          {displayName}
        </Text>
      </div>

      {/* ── Starting Gold ── */}
      {background.startingGold > 0 && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">GP</span>}
          label={`${background.startingGold} gp`}
        />
      )}

      {/* ── Proficiencies ── */}
      {hasProficiencies && (
        <div className={sectionDivider}>
          {background.skillProficiencies.length > 0 && (
            <CardMetaItem
              icon={
                <span className="text-text-tertiary text-xs font-semibold">
                  Skill Proficiencies
                </span>
              }
              label={background.skillProficiencies.join(', ')}
            />
          )}
          {background.toolProficiencies.length > 0 && (
            <CardMetaItem
              icon={
                <span className="text-text-tertiary text-xs font-semibold">Tool Proficiencies</span>
              }
              label={background.toolProficiencies.join(', ')}
            />
          )}
          {background.languages.length > 0 && (
            <CardMetaItem
              icon={<span className="text-text-tertiary text-xs font-semibold">Languages</span>}
              label={background.languages.join(', ')}
            />
          )}
        </div>
      )}

      {/* ── Origin Feat ── */}
      {background.originFeatId && (
        <div className={sectionDivider}>
          <CardMetaItem
            icon={<span className="text-text-tertiary text-xs font-semibold">Origin Feat</span>}
            label={background.originFeatId}
          />
        </div>
      )}

      {/* ── Starting Equipment ── */}
      {background.startingEquipment && background.startingEquipment.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
            Starting Equipment
          </Text>
          {background.startingEquipment.map((gear, i) => (
            <div key={i} className="ml-2 mt-1 flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {gear.quantity && gear.quantity > 1 ? `${gear.quantity}x` : ''}
              </Badge>
              <Text variant="caption" as="span" className="text-text-primary">
                {gear.name}
              </Text>
            </div>
          ))}
        </div>
      )}

      {/* ── Description ── */}
      {showDesc && background.description && (
        <Text variant="bodySm" as="p" className="leading-relaxed text-text-secondary">
          {background.description}
        </Text>
      )}
    </CardSurface>
  );
}
