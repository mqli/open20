import { useEffect, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  BookOpen,
  Brain,
  Clock,
  Crosshair,
  Hand,
  Heart,
  Hourglass,
  MessageSquare,
  Package,
  Shield,
  Sparkles,
  Swords,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import {
  chipBase,
  collapseToggle,
  iconSizes,
  inlineMeta,
  spellSchoolVariants,
  sectionDivider,
} from '../../styles/design-tokens';
import { Surface } from '../Surface';
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

const levelBadgeVariants = cva(
  cn(chipBase, 'tracking-wide uppercase'),
  {
    variants: {
      isCantrip: {
        true: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        false: 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
      },
    },
    defaultVariants: { isCantrip: false },
  },
);

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

/** Alias for brevity */
const I = iconSizes;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type SpellComponent = Spell['components'][number];

function componentIcon(c: SpellComponent) {
  switch (c) {
    case 'V':
      return <MessageSquare className={I.xs} aria-hidden />;
    case 'S':
      return <Hand className={I.xs} aria-hidden />;
    case 'M':
      return <Package className={I.xs} aria-hidden />;
    default:
      return null;
  }
}

function formatComponents(components: readonly SpellComponent[]): string {
  return components.join(', ');
}

function levelLabel(level: number): string {
  return level === 0 ? 'Cantrip' : `Level ${level}`;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface SpellCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof cardVariants> {
  /** The spell data from @open20/core */
  spell: Spell;
  /** Show full description or collapse it */
  showDescription?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function SpellCard({
  spell,
  emphasis,
  density,
  showDescription: showDescProp,
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

  return (
    <Surface
      className={cn(cardVariants({ emphasis, density }), className)}
      padding={isCompact ? 'sm' : 'md'}
      {...props}
    >
      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="headingSm" className="truncate text-text-primary">
            {spell.name}
          </Text>

          <span className={levelBadgeVariants({ isCantrip })}>
            {levelLabel(spell.level)}
          </span>

          <span className={cn(chipBase, spellSchoolVariants[spell.school])}>
            {spell.school}
          </span>
        </div>

        {/* Ritual / Concentration tags */}
        <div className="flex items-center gap-1 shrink-0">
          {spell.ritual && (
            <span title="Ritual" className="text-text-tertiary">
              <BookOpen className={I.md} aria-label="Ritual" />
            </span>
          )}
          {spell.concentration && (
            <span title="Concentration" className="text-text-tertiary">
              <Brain className={I.md} aria-label="Concentration" />
            </span>
          )}
        </div>
      </div>

      {/* ── Meta Row ───────────────────────────────────────────────────── */}
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', isCompact && 'gap-x-2')}>
        <MetaItem icon={<Clock className={I.sm} />} label={spell.castingTime} />
        <MetaItem icon={<Crosshair className={I.sm} />} label={spell.range} />

        <MetaItem
          icon={
            <span className="flex items-center gap-0.5">
              {spell.components.map((c) => (
                <span key={c}>{componentIcon(c)}</span>
              ))}
            </span>
          }
          label={formatComponents(spell.components)}
        />

        <MetaItem icon={<Hourglass className={I.sm} />} label={spell.duration} />
      </div>

      {/* ── Description ────────────────────────────────────────────────── */}
      {effectiveShowDesc && spell.description.length > 0 && (
        <div className="space-y-1.5">
          {spell.description.map((p, i) => (
            <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
              {p}
            </Text>
          ))}

          {/* Damage / Heal / Save / Attack */}
          {(spell.damage || spell.heal || spell.save || spell.attack) && (
            <div className={cn('mt-2 flex flex-wrap items-center gap-x-3 gap-y-1', sectionDivider)}>
              {spell.damage && (
                <MetaItem
                  icon={<Zap className={cn(I.sm, 'text-amber-500')} />}
                  label={spell.damage.entries.map((e) => `${e.dice} ${e.type}`).join(' + ')}
                />
              )}
              {spell.heal && (
                <MetaItem
                  icon={<Heart className={cn(I.sm, 'text-rose-500')} />}
                  label={spell.heal.dice}
                />
              )}
              {spell.save && (
                <MetaItem
                  icon={<Shield className={cn(I.sm, 'text-text-tertiary')} />}
                  label={`${spell.save} save`}
                />
              )}
              {spell.attack && (
                <MetaItem
                  icon={<Swords className={cn(I.sm, 'text-text-tertiary')} />}
                  label="Attack roll"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Collapse toggle (compact mode) ──────────────────────────────── */}
      {isCompact && (
        <button type="button" onClick={() => setShowDesc((prev) => !prev)} className={collapseToggle}>
          {showDesc ? (
            <><ChevronUp className={I.xs} /> Less</>
          ) : (
            <><ChevronDown className={I.xs} /> Details</>
          )}
        </button>
      )}

      {/* ── At Higher Levels ───────────────────────────────────────────── */}
      {effectiveShowDesc &&
        higherLevelText && higherLevelText.length > 0 && (
          <div className={cn(sectionDivider, 'space-y-1')}>
            <Text variant="labelSm" as="p" className="flex items-center gap-1">
              <Sparkles className={I.xs} />
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
      {effectiveShowDesc &&
        cantripUpgrades && cantripUpgrades.length > 0 && (
          <div className={cn(sectionDivider, 'space-y-1')}>
            <Text variant="labelSm" as="p" className="flex items-center gap-1">
              <Sparkles className={I.xs} />
              Cantrip Upgrade
            </Text>
            {cantripUpgrades.map((u, i) => (
              <Text key={i} variant="bodySm" as="p" className="leading-relaxed">
                <span className="font-semibold text-text-primary">
                  Level {u.atCharacterLevel}:
                </span>{' '}
                {u.damage
                  ? u.damage.map((d) => `${d.dice} ${d.type}`).join(' + ')
                  : spell.cantripUpgradeText ?? ''}
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
  return <span className={inlineMeta}>{icon}<span>{label}</span></span>;
}
