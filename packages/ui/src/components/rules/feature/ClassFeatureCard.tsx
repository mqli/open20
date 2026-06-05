import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/design-tokens';
import { Text } from '@/components/Text';
import { Badge, type BadgeProps } from '@/components/Badge';
import { CardSurface } from '@/components/CardSurface';
import type { CardSurfaceDensity } from '@/components/CardSurface';
import { CardMetaItem } from '@/components/CardSurface';

import { ResetType } from 'open20-core';
import type { Feature, FeatureType, ACFormula, ACRequirement, AbilityName } from 'open20-core';

/* -------------------------------------------------------------------------- */
/*  Feature type color map                                                    */
/* -------------------------------------------------------------------------- */

const featureTypeVariantMap: Record<FeatureType, BadgeProps['variant']> = {
  generic: 'slate',
  acFormula: 'info',
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface ClassFeatureCardProps {
  /** The feature data from @open20/core */
  feature: Feature;
  /** The level at which this feature is gained (overrides feature.level if present) */
  level?: number;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the feature as argument */
  onClick?: (feature: Feature) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Show decorative glow (e.g. when feature is chosen) */
  glow?: boolean;
  /** Additional className */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatResetType(reset?: ResetType): string {
  if (!reset) return '';
  switch (reset) {
    case ResetType.LongRest:
      return 'Long Rest';
    case ResetType.ShortRest:
      return 'Short Rest';
    case ResetType.Daily:
      return 'Daily';
    case ResetType.PerTurn:
      return 'Per Turn';
    case ResetType.Never:
      return 'Never';
    default: {
      const _exhaustive: never = reset;
      return _exhaustive;
    }
  }
}

function formatACFormula(acFormula: ACFormula): string {
  const parts: string[] = [`Base ${acFormula.baseAC}`];

  if (acFormula.addModifiers && acFormula.addModifiers.length > 0) {
    const mods = acFormula.addModifiers.map((m: AbilityName) => {
      const abbrev = m.substring(0, 3).toUpperCase();
      return `$${abbrev}`;
    });
    parts.push(`+ ${mods.join(' + ')}`);
  }

  if (acFormula.requires && acFormula.requires.length > 0) {
    const reqs = acFormula.requires.map((r: ACRequirement) => {
      switch (r) {
        case 'noArmor':
          return 'no armor';
        case 'noShield':
          return 'no shield';
        case 'noHeavyArmor':
          return 'no heavy armor';
      }
    });
    parts.push(`(requires ${reqs.join(', ')})`);
  }

  return parts.join(' ');
}

function getResourceSummary(feature: Feature): string | null {
  if (feature.featureType === 'acFormula') return null;
  if (!feature.resourceId) return null;

  const parts: string[] = [];

  // Resource max
  if (feature.resourceMax) {
    parts.push(`Max: ${feature.resourceMax}`);
  } else if (feature.resourceMaxByLevel) {
    parts.push('Max: scales by level');
  }

  // Reset type
  if (feature.resourceResetOn) {
    parts.push(`Reset: ${formatResetType(feature.resourceResetOn)}`);
  }

  // Scale with PB
  if (feature.resourceScaleWithPB) {
    parts.push('Scales with PB');
  }

  return parts.length > 0 ? parts.join(', ') : null;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function ClassFeatureCard({
  feature,
  level: levelProp,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  density = 'default',
  glow,
  className,
}: ClassFeatureCardProps) {
  const isCompact = density === 'compact';
  const displayName = feature.name;
  const displayLevel = levelProp ?? feature.level;
  const showDesc = showDescProp ?? !isCompact;
  const resourceSummary = getResourceSummary(feature);

  // For AC formula features, get the formatted AC formula
  const acFormulaText =
    feature.featureType === 'acFormula' ? formatACFormula(feature.acFormula) : null;

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(feature) : undefined}
      glow={glow}
      renderActions={renderActions}
      className={className}
    >
      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {displayName}
          </Text>

          {displayLevel !== undefined && (
            <Badge variant="secondary" size="sm">
              Level {displayLevel}
            </Badge>
          )}

          <Badge variant={featureTypeVariantMap[feature.featureType ?? 'generic']} size="sm">
            {feature.featureType ?? 'generic'}
          </Badge>
        </div>
      </div>

      {/* ── AC Formula (for acFormula feature type) ───────────────────── */}
      {acFormulaText && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">AC</span>}
          label={acFormulaText}
          className={sectionDivider}
        />
      )}

      {/* ── Resource Summary (for resource-granting features) ──────────── */}
      {resourceSummary && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">RES</span>}
          label={resourceSummary}
          className={sectionDivider}
        />
      )}

      {/* ── Description ────────────────────────────────────────────────── */}
      {showDesc && (
        <Text variant="bodySm" as="p" className="leading-relaxed text-text-secondary">
          {feature.description}
        </Text>
      )}
    </CardSurface>
  );
}
