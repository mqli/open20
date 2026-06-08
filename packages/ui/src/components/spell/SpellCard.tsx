import { useEffect, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Clock, Hourglass, ChevronDown, ChevronUp, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  RitualIcon,
  ConcentrationIcon,
  RangeIcon,
  MaterialIcon,
  DefenseIcon,
  MagicIcon,
  AttackIcon,
  HealIcon,
  DamageIcon,
} from '@/components/base/icons';
import { Button } from '@/components/base/Button';
import { chipBase, collapseToggle, iconSizes, sectionDivider } from '@/styles/component-styles';
import { spellSchoolVariants, cantripBadgeVariants } from '@/styles/design-tokens';
import { Text } from '@/components/base/Text';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';
import { useTranslation } from '@/i18n';

import type { Spell } from 'open20-core';
import { SpellDescription } from './SpellDescription';

/* -------------------------------------------------------------------------- */
/*  Component Variants                                                        */
/* -------------------------------------------------------------------------- */

const cardVariants = cva('', {
  variants: {
    emphasis: { default: '', tint: '' },
  },
  defaultVariants: { emphasis: 'default' },
});

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

/** Alias for brevity */
const I = iconSizes;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type SpellComponent = Spell['components'][number];

function formatComponents(components: readonly SpellComponent[]): string {
  return components.join(', ');
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface SpellCardProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'color'>,
    VariantProps<typeof cardVariants> {
  /** The spell data from @open20/core */
  spell: Spell;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the spell as argument */
  onClick?: (spell: Spell) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Slot for action buttons rendered in the bottom row (click events are stopPropagation'd) */
  renderActions?: () => ReactNode;
  /** Keep source/actions row visible while parent container scrolls */
  stickyActions?: boolean;
  /** Slot for badge chips rendered next to the school badge (e.g. "Known", "Prepared") */
  renderBadges?: () => ReactNode;
  /** Show decorative sparkle glow in the background (e.g. when spell is prepared) */
  glow?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SpellCard({
  spell,
  emphasis,
  density: densityProp,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  stickyActions,
  renderBadges,
  glow,
  className,
  ...props
}: SpellCardProps) {
  const t = useTranslation();
  const density = (densityProp ?? 'default') as CardSurfaceDensity;
  const isCompact = density === 'compact';
  const [showDesc, setShowDesc] = useState(showDescProp ?? !isCompact);

  useEffect(() => {
    if (showDescProp !== undefined) {
      setShowDesc(showDescProp);
    }
  }, [showDescProp]);

  const effectiveShowDesc = showDesc;
  const isCantrip = spell.level === 0;
  const badgeKey = isCantrip ? ('true' as const) : ('false' as const);
  const higherLevelText = spell.usingAHigherLevelSpellSlot;
  const cantripUpgrades = spell.cantripUpgrade;

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(spell) : undefined}
      glow={glow}
      renderGlow={
        glow
          ? () => (
              <MagicIcon className="w-12 h-12 text-primary-500 group-hover:opacity-20 transition-opacity" />
            )
          : undefined
      }
      source={spell.source}
      stickyActions={stickyActions}
      renderSourceSuffix={
        isCompact
          ? () => (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDesc((prev) => !prev);
                }}
                className={collapseToggle}
              >
                {showDesc ? (
                  <>
                    <ChevronUp className={I.xs} />
                    {t('common.less')}
                  </>
                ) : (
                  <>
                    <ChevronDown className={I.xs} />
                    {t('common.details')}
                  </>
                )}
              </Button>
            )
          : undefined
      }
      renderActions={renderActions}
      className={cn(cardVariants({ emphasis }), className)}
      {...props}
    >
      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size={isCompact ? 'md' : 'lg'} className="truncate">
            {spell.name}
          </Text>

          <span className={cn(chipBase, 'tracking-wide', cantripBadgeVariants[badgeKey])}>
            {isCantrip ? t('common.cantrip') : `${t('common.level')} ${spell.level}`}
          </span>

          <span className={cn(chipBase, spellSchoolVariants[spell.school])}>{spell.school}</span>

          {renderBadges?.()}
        </div>

        {/* Ritual / Concentration tags */}
        <div className="flex items-center gap-1 shrink-0">
          {spell.ritual && (
            <span title={t('common.ritual')} className="text-text-tertiary">
              <RitualIcon size="md" aria-label={t('common.ritual')} />
            </span>
          )}
          {spell.concentration && (
            <span title={t('common.concentration')} className="text-text-tertiary">
              <ConcentrationIcon size="md" aria-label={t('common.concentration')} />
            </span>
          )}
        </div>
      </div>

      {/* ── Meta Row ───────────────────────────────────────────── */}
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', isCompact && 'gap-x-2')}>
        <CardMetaItem icon={<Clock className={I.sm} />} label={spell.castingTime} />
        <CardMetaItem icon={<RangeIcon size="sm" />} label={spell.range} />
        <CardMetaItem
          icon={<MaterialIcon size="sm" />}
          label={formatComponents(spell.components)}
        />
        <CardMetaItem icon={<Hourglass className={I.sm} />} label={spell.duration} />
      </div>

      {/* ── Description ────────────────────────────────────────── */}
      {effectiveShowDesc && (
        <div className="space-y-1.5">
          <div className="text-xs text-text-secondary">
            <SpellDescription description={spell.description} />
          </div>

          {/* Damage / Heal / Save / Attack */}
          {(spell.damage || spell.heal || spell.save || spell.attack) && (
            <div className={cn('mt-2 flex flex-wrap items-center gap-x-3 gap-y-1', sectionDivider)}>
              {spell.damage && (
                <CardMetaItem
                  icon={<DamageIcon size="sm" className="text-amber-500" />}
                  label={spell.damage.entries.map((e) => `${e.dice} ${e.type}`).join(' + ')}
                />
              )}
              {spell.heal && (
                <CardMetaItem
                  icon={<HealIcon size="sm" className="text-rose-500" />}
                  label={spell.heal.dice}
                />
              )}
              {spell.save && (
                <CardMetaItem
                  icon={<DefenseIcon size="sm" className="text-text-tertiary" />}
                  label={`${spell.save} save`}
                />
              )}
              {spell.attack && (
                <CardMetaItem
                  icon={<AttackIcon size="sm" className="text-text-tertiary" />}
                  label="Attack roll"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── At Higher Levels ───────────────────────────────────── */}
      {effectiveShowDesc && higherLevelText && higherLevelText.length > 0 && (
        <div className={cn(sectionDivider, 'space-y-1')}>
          <Text variant="labelSm" as="p" className="flex items-center gap-1">
            <ArrowBigUp className={I.xs} />
            {t('common.atHigherLevels')}
          </Text>
          {higherLevelText.map((text, i) => (
            <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
              {text}
            </Text>
          ))}
        </div>
      )}

      {/* ── Cantrip Upgrade ─────────────────────────────────────── */}
      {effectiveShowDesc && cantripUpgrades && cantripUpgrades.length > 0 && (
        <div className={cn(sectionDivider, 'space-y-1')}>
          <Text variant="labelSm" as="p" className="flex items-center gap-1">
            <ArrowBigUp className={I.xs} />
            {t('common.cantripUpgrade')}
          </Text>
          {cantripUpgrades.map((u, i) => (
            <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
              <span className="font-semibold text-text-primary">
                {t('common.level')} {u.atCharacterLevel}:
              </span>{' '}
              {u.damage
                ? u.damage.map((d) => `${d.dice} ${d.type}`).join(' + ')
                : (spell.cantripUpgradeText ?? '')}
            </Text>
          ))}
        </div>
      )}
    </CardSurface>
  );
}
