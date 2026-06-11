import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';

import type { Subclass, Feature } from 'open20-core';
import { ClassFeatureCard } from '../feature/ClassFeatureCard';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface SubclassCardProps {
  /** The subclass data from @open20/core */
  subclass: Subclass;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the subclass as argument */
  onClick?: (subclass: Subclass) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Show decorative glow (e.g. when subclass is chosen) */
  glow?: boolean;
  /** Additional className */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */

export function SubclassCard({
  subclass,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  density = 'default',
  glow,
  className,
}: SubclassCardProps) {
  const isCompact = density === 'compact';
  const showDesc = showDescProp ?? !isCompact;

  // Flatten all features from featuresByLevel
  const allFeatures: Array<{ feature: Feature; level: number }> = subclass.featuresByLevel.flatMap(
    (levelData) =>
      levelData.features.map((feature: Feature) => ({
        feature,
        level: levelData.level,
      })),
  );

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(subclass) : undefined}
      glow={glow}
      source={subclass.source}
      renderActions={renderActions}
      className={className}
    >
      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {subclass.id}
          </Text>

          <Badge variant="secondary" size="sm">
            Level {subclass.grantedAtLevel}
          </Badge>

          <Badge variant="info" size="sm">
            {subclass.parentClass}
          </Badge>
        </div>
      </div>

      {/* ── Always Prepared Spells ────────────────────────────────────── */}
      {subclass.alwaysPreparedSpells && subclass.alwaysPreparedSpells.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
            Always Prepared Spells
          </Text>
          <div className="ml-2 mt-1 space-y-1">
            {subclass.alwaysPreparedSpells.map(
              (
                entry: { readonly level: number; readonly spells: readonly string[] },
                index: number,
              ) => (
                <div key={index} className="text-sm text-text-secondary">
                  <Text variant="caption" as="span" className="font-medium">
                    Level {entry.level}:
                  </Text>{' '}
                  <Text variant="caption" as="span">
                    {entry.spells.join(', ')}
                  </Text>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* ── Features List (Flattened) ──────────────────────────────────── */}
      {showDesc && allFeatures.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
            Features
          </Text>
          <div className="ml-2 mt-2 space-y-2">
            {allFeatures.map((item: { feature: Feature; level: number }, index: number) => (
              <ClassFeatureCard
                key={`${item.feature.name}-${item.level}-${index}`}
                feature={item.feature}
                level={item.level}
                density="compact"
                showDescription={false}
              />
            ))}
          </div>
        </div>
      )}
    </CardSurface>
  );
}
