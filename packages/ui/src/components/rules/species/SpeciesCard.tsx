import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';
import { useTranslation } from '@/i18n';

import type { Species, AbilityName } from 'open20-core';

/* -------------------------------------------------------------------------- */
/*  Size variant map                                                          */
/* -------------------------------------------------------------------------- */

const sizeVariantMap: Record<'Small' | 'Medium', BadgeProps['variant']> = {
  Small: 'secondary',
  Medium: 'success',
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface SpeciesCardProps {
  /** The species data from @open20/core */
  species: Species;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the species as argument */
  onClick?: (species: Species) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Show traits section (default: true) */
  showTraits?: boolean;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Additional className */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const ABILITY_ABBREVS: Record<AbilityName, string> = {
  Strength: 'STR',
  Dexterity: 'DEX',
  Constitution: 'CON',
  Intelligence: 'INT',
  Wisdom: 'WIS',
  Charisma: 'CHA',
};

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                           */
/* -------------------------------------------------------------------------- */

function SpeciesAbilityBonuses({ species }: { species: Species }) {
  const t = useTranslation();
  const bonuses = species.abilityBonuses;
  if (!bonuses || Object.keys(bonuses).length === 0) return null;

  const parts = Object.entries(bonuses)
    .map(([ability, bonus]) => `+${bonus} ${ABILITY_ABBREVS[ability as AbilityName] ?? ability}`)
    .join(', ');

  return (
    <CardMetaItem
      icon={
        <span className="text-text-tertiary text-xs font-semibold">
          {t('species.abilityBonuses')}
        </span>
      }
      label={parts}
    />
  );
}

function SpeciesTraits({ traits }: { traits: readonly { name: string; description?: string }[] }) {
  if (!traits || traits.length === 0) return null;

  return (
    <div className={sectionDivider}>
      {traits.map((trait, i) => (
        <div key={i} className="ml-2">
          <Text variant="caption" as="span" className="text-text-primary font-medium">
            {trait.name}
          </Text>
          {trait.description && (
            <Text variant="caption" as="span" className="text-text-tertiary ml-1">
              {trait.description}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */

export function SpeciesCard({
  species,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  showTraits = true,
  density = 'default',
  className,
}: SpeciesCardProps) {
  const t = useTranslation();
  const isCompact = density === 'compact';
  const displayName = species.id;
  const showDesc = showDescProp ?? !isCompact;

  const sizeKey = species.size === 'Small' ? 'species.small' : 'species.medium';

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(species) : undefined}
      source={species.source}
      renderActions={renderActions}
      className={className}
    >
      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {displayName}
          </Text>

          <Badge variant={sizeVariantMap[species.size]} size="sm">
            {t(sizeKey)}
          </Badge>
        </div>
      </div>

      {/* ── Metadata ───────────────────────────────────────────── */}
      <CardMetaItem
        icon={
          <span className="text-text-tertiary text-xs font-semibold">{t('species.speed')}</span>
        }
        label={`${species.speed} ft.`}
      />

      {species.languages.length > 0 && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('species.languages')}
            </span>
          }
          label={species.languages.join(', ')}
        />
      )}

      <SpeciesAbilityBonuses species={species} />

      {species.darkvision !== undefined && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('species.darkvision')}
            </span>
          }
          label={`${species.darkvision} ft.`}
        />
      )}

      {/* ── Description ────────────────────────────────────────── */}
      {showDesc && (
        <Text variant="bodySm" as="p" className="leading-relaxed text-text-secondary">
          {species.description}
        </Text>
      )}

      {/* ── Base Traits ────────────────────────────────────────── */}
      {showTraits && species.baseTraits.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
            {t('species.baseTraits')}
          </Text>
          <SpeciesTraits traits={species.baseTraits} />
        </div>
      )}

      {/* ── Subtypes ───────────────────────────────────────────── */}
      {showTraits && species.subtypes && species.subtypes.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
            {t('species.subtypes')}
          </Text>
          {species.subtypes.map((subtype) => (
            <div key={subtype.id} className="ml-2 mt-1">
              <Text variant="caption" as="span" className="text-text-primary font-medium">
                {subtype.name}
              </Text>
              <Text variant="caption" as="span" className="text-text-tertiary ml-1">
                {subtype.description}
              </Text>
              {subtype.traits.length > 0 && <SpeciesTraits traits={subtype.traits} />}
            </div>
          ))}
        </div>
      )}
    </CardSurface>
  );
}
