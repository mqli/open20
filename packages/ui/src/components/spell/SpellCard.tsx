import { useEffect, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Clock, Hourglass, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import {
  RitualIcon,
  ConcentrationIcon,
  RangeIcon,
  MaterialIcon,
  DefenseIcon,
  MagicIcon,
  AttackIcon,
  HealIcon,
  CastSpellIcon,
  Button,
} from '../..';
import {
  chipBase,
  collapseToggle,
  iconSizes,
  inlineMeta,
  spellSchoolVariants,
  sectionDivider,
} from '../../styles/design-tokens';
import { Surface } from '../Surface';
import type { SurfaceProps } from '../Surface';
import { Text } from '../Text';

import type { Spell } from 'open20-core';

/* -------------------------------------------------------------------------- */
/*  Component Variants                                                        */
/* -------------------------------------------------------------------------- */

const cardVariants = cva('flex flex-col gap-3 transition-all', {
  variants: {
    emphasis: { default: '', tint: '' },
    density: { default: '', compact: 'gap-2' },
  },
  defaultVariants: { emphasis: 'default', density: 'default' },
});

const levelBadgeVariants = cva(cn(chipBase, 'tracking-wide'), {
  variants: {
    isCantrip: {
      true: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      false:
        'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
    },
  },
  defaultVariants: { isCantrip: false },
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

function levelLabel(level: number): string {
  return level === 0 ? 'Cantrip' : `Lv. ${level}`;
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
  surfaceVariant?: SurfaceProps['variant'];
  /** Slot for action buttons rendered in the bottom row (click events are stopPropagation'd) */
  renderActions?: () => ReactNode;
  /** Slot for badge chips rendered next to the school badge (e.g. "Known", "Prepared") */
  renderBadges?: () => ReactNode;
  /** Slot for description rendered below the header (e.g. "Known", "Prepared") */
  renderDescription?: (string: string) => ReactNode;
  /** Show decorative sparkle glow in the background (e.g. when spell is prepared) */
  glow?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SpellCard({
  spell,
  emphasis,
  density,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  renderBadges,
  renderDescription = (p: string) => p,
  glow,
  className,
  ...props
}: SpellCardProps) {
  const isCompact = density === 'compact';
  const [showDesc, setShowDesc] = useState(showDescProp ?? !isCompact);

  useEffect(() => {
    if (showDescProp !== undefined) {
      setShowDesc(showDescProp);
    }
  }, [showDescProp]);

  const effectiveShowDesc = showDesc;
  const isCantrip = spell.level === 0;
  const higherLevelText = spell.usingAHigherLevelSpellSlot;
  const cantripUpgrades = spell.cantripUpgrade;
  const isClickable = !!onClick;
  const isDefaultVariant = !surfaceVariant || surfaceVariant === 'default';

  return (
    <Surface
      variant={surfaceVariant}
      className={cn(
        cardVariants({ emphasis, density }),
        glow && 'relative overflow-hidden',
        isClickable &&
          isDefaultVariant &&
          'cursor-pointer hover:shadow-md hover:border-primary-300',
        className,
      )}
      padding={isCompact ? 'sm' : 'md'}
      onClick={onClick ? () => onClick(spell) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick(spell);
            }
          : undefined
      }
      {...props}
    >
      {/* ── Background glow ────────────────────────────────────────────── */}
      {glow && (
        <div className="absolute -top-1 -right-1 p-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <MagicIcon className="w-12 h-12 text-primary-500" />
        </div>
      )}

      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {spell.name}
          </Text>

          <span className={levelBadgeVariants({ isCantrip })}>{levelLabel(spell.level)}</span>

          <span className={cn(chipBase, spellSchoolVariants[spell.school])}>{spell.school}</span>

          {renderBadges?.()}
        </div>

        {/* Ritual / Concentration tags */}
        <div className="flex items-center gap-1 shrink-0">
          {spell.ritual && (
            <span title="Ritual" className="text-text-tertiary">
              <RitualIcon size="md" aria-label="Ritual" />
            </span>
          )}
          {spell.concentration && (
            <span title="Concentration" className="text-text-tertiary">
              <ConcentrationIcon size="md" aria-label="Concentration" />
            </span>
          )}
        </div>
      </div>

      {/* ── Meta Row ───────────────────────────────────────────────────── */}
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', isCompact && 'gap-x-2')}>
        <MetaItem icon={<Clock className={I.sm} />} label={spell.castingTime} />
        <MetaItem icon={<RangeIcon size="sm" />} label={spell.range} />
        <MetaItem icon={<MaterialIcon size="sm" />} label={formatComponents(spell.components)} />
        <MetaItem icon={<Hourglass className={I.sm} />} label={spell.duration} />
      </div>

      {/* ── Source / Actions Row ─────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center pt-1',
          renderActions ? 'justify-between' : 'justify-start',
        )}
      >
        <div className="flex items-center gap-2">
          <Text variant="caption" as="p" className="uppercase opacity-70">
            {spell.source}
          </Text>
          {isCompact && (
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
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className={I.xs} />
                  Details
                </>
              )}
            </Button>
          )}
        </div>
        {renderActions && (
          <div
            className={cn('flex items-center gap-1.5', !isCompact && 'flex-wrap justify-end')}
            onClick={(e) => e.stopPropagation()}
          >
            {renderActions()}
          </div>
        )}
      </div>

      {/* ── Description ────────────────────────────────────────────────── */}
      {effectiveShowDesc && spell.description.length > 0 && (
        <div className="space-y-1.5">
          {spell.description.map((p, i) => (
            <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
              {renderDescription(p)}
            </Text>
          ))}

          {/* Damage / Heal / Save / Attack */}
          {(spell.damage || spell.heal || spell.save || spell.attack) && (
            <div className={cn('mt-2 flex flex-wrap items-center gap-x-3 gap-y-1', sectionDivider)}>
              {spell.damage && (
                <MetaItem
                  icon={<CastSpellIcon size="sm" className="text-amber-500" />}
                  label={spell.damage.entries.map((e) => `${e.dice} ${e.type}`).join(' + ')}
                />
              )}
              {spell.heal && (
                <MetaItem
                  icon={<HealIcon size="sm" className="text-rose-500" />}
                  label={spell.heal.dice}
                />
              )}
              {spell.save && (
                <MetaItem
                  icon={<DefenseIcon size="sm" className="text-text-tertiary" />}
                  label={`${spell.save} save`}
                />
              )}
              {spell.attack && (
                <MetaItem
                  icon={<AttackIcon size="sm" className="text-text-tertiary" />}
                  label="Attack roll"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── At Higher Levels ───────────────────────────────────────────── */}
      {effectiveShowDesc && higherLevelText && higherLevelText.length > 0 && (
        <div className={cn(sectionDivider, 'space-y-1')}>
          <Text variant="labelSm" as="p" className="flex items-center gap-1">
            <MagicIcon size="xs" />
            At Higher Levels
          </Text>
          {higherLevelText.map((text, i) => (
            <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
              {text}
            </Text>
          ))}
        </div>
      )}

      {/* ── Cantrip Upgrade ─────────────────────────────────────────────── */}
      {effectiveShowDesc && cantripUpgrades && cantripUpgrades.length > 0 && (
        <div className={cn(sectionDivider, 'space-y-1')}>
          <Text variant="labelSm" as="p" className="flex items-center gap-1">
            <MagicIcon size="xs" />
            Cantrip Upgrade
          </Text>
          {cantripUpgrades.map((u, i) => (
            <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
              <span className="font-semibold text-text-primary">Level {u.atCharacterLevel}:</span>{' '}
              {u.damage
                ? u.damage.map((d) => `${d.dice} ${d.type}`).join(' + ')
                : (spell.cantripUpgradeText ?? '')}
            </Text>
          ))}
        </div>
      )}
    </Surface>
  );
}

/* -------------------------------------------------------------------------- */
/*  Internal helper                                                           */
/* -------------------------------------------------------------------------- */

function MetaItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className={inlineMeta}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
