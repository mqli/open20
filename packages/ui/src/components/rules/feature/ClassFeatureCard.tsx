import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';
import { useTranslation } from '@/i18n';

import { ResetType } from 'open20-core';
import type {
  Feature,
  FeatureGeneric,
  FeatureType,
  ACFormula,
  ACRequirement,
  AbilityName,
} from 'open20-core';

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
/*  Sub-components with i18n                                                   */
/* -------------------------------------------------------------------------- */

function FeatureACFormula({ acFormula }: { acFormula: ACFormula }) {
  const t = useTranslation();
  const parts: string[] = [t('feature.baseAC', { ac: acFormula.baseAC })];

  if (acFormula.addModifiers && acFormula.addModifiers.length > 0) {
    const mods = acFormula.addModifiers.map((m: AbilityName) => {
      const abbrev = m.substring(0, 3).toUpperCase();
      return `+${abbrev}`;
    });
    parts.push(`+ ${mods.join(' + ')}`);
  }

  if (acFormula.requires && acFormula.requires.length > 0) {
    const reqs = acFormula.requires.map((r: ACRequirement) => {
      switch (r) {
        case 'noArmor':
          return t('feature.noArmor');
        case 'noShield':
          return t('feature.noShield');
        case 'noHeavyArmor':
          return t('feature.noHeavyArmor');
      }
    });
    parts.push(t('feature.requires', { reqs: reqs.join(', ') }));
  }

  return (
    <CardMetaItem
      icon={<span className="text-text-tertiary text-xs font-semibold">AC</span>}
      label={parts.join(' ')}
      className={sectionDivider}
    />
  );
}

function FeatureResourceSummary({ feature }: { feature: FeatureGeneric }) {
  const t = useTranslation();

  if (!feature.resourceId) return null;

  const parts: string[] = [];

  // Resource max
  if (feature.resourceMax) {
    parts.push(t('feature.max', { max: feature.resourceMax }));
  } else if (feature.resourceMaxByLevel) {
    parts.push(t('feature.maxScalesByLevel'));
  }

  // Reset type
  if (feature.resourceResetOn) {
    let resetText: string;
    switch (feature.resourceResetOn) {
      case ResetType.LongRest:
        resetText = t('feature.longRest');
        break;
      case ResetType.ShortRest:
        resetText = t('feature.shortRest');
        break;
      case ResetType.Daily:
        resetText = t('feature.daily');
        break;
      case ResetType.PerTurn:
        resetText = t('feature.perTurn');
        break;
      case ResetType.Never:
        resetText = t('feature.never');
        break;
      default: {
        const _exhaustive: never = feature.resourceResetOn;
        return _exhaustive;
      }
    }
    parts.push(t('feature.reset', { reset: resetText }));
  }

  // Scale with PB
  if (feature.resourceScaleWithPB) {
    parts.push(t('feature.scalesWithPB'));
  }

  if (parts.length === 0) return null;

  return (
    <CardMetaItem
      icon={<span className="text-text-tertiary text-xs font-semibold">RES</span>}
      label={parts.join(', ')}
      className={sectionDivider}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
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
  const t = useTranslation();
  const isCompact = density === 'compact';

  const displayName = feature.name;
  const displayLevel = levelProp ?? feature.level;
  const showDesc = showDescProp ?? !isCompact;

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
              {t('feature.level', { level: displayLevel })}
            </Badge>
          )}

          <Badge variant={featureTypeVariantMap[feature.featureType ?? 'generic']} size="sm">
            {feature.featureType ?? 'generic'}
          </Badge>
        </div>
      </div>

      {/* ── AC Formula (for acFormula feature type) ───────────────────── */}
      {feature.featureType === 'acFormula' && <FeatureACFormula acFormula={feature.acFormula} />}

      {/* ── Resource Summary (for resource-granting features) ──────────── */}
      {feature.featureType === 'generic' && <FeatureResourceSummary feature={feature} />}

      {/* ── Description ────────────────────────────────────────────────── */}
      {showDesc && (
        <Text variant="bodySm" as="p" className="leading-relaxed text-text-secondary">
          {feature.description}
        </Text>
      )}
    </CardSurface>
  );
}
