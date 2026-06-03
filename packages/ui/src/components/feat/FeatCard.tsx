import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { chipBase, sectionDivider } from '@/styles/design-tokens';
import { Text } from '@/components/Text';
import { Badge, type BadgeProps } from '@/components/Badge';
import { CardSurface } from '@/components/CardSurface';
import type { CardSurfaceDensity } from '@/components/CardSurface';
import { CardMetaItem } from '@/components/CardMetaItem';

import type { Feat, FeatCategory, AbilityName } from 'open20-core';

/* -------------------------------------------------------------------------- */
/*  Category color map                                                        */
/* -------------------------------------------------------------------------- */

const categoryVariantMap: Record<FeatCategory, BadgeProps['variant']> = {
  Origin: 'success',
  General: 'slate',
  'Fighting Style': 'warning',
  'Epic Boon': 'purple',
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface FeatCardProps {
  /** The feat data from @open20/core */
  feat: Feat;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the feat as argument */
  onClick?: (feat: Feat) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Show prerequisite as a badge row (default: true) */
  showPrerequisites?: boolean;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Show decorative glow (e.g. when feat is chosen) */
  glow?: boolean;
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

function formatPrerequisite(feat: Feat): string | null {
  const pre = feat.prerequisites;
  if (!pre) return null;

  const parts: string[] = [];
  if (pre.level !== undefined) parts.push(`Level ${pre.level}+`);
  if (pre.ability) {
    for (const [ability, min] of Object.entries(pre.ability)) {
      parts.push(`${ABILITY_ABBREVS[ability as AbilityName] ?? ability} ${min}+`);
    }
  }
  if (pre.classId) parts.push(pre.classId);
  if (pre.species) parts.push(pre.species);
  if (pre.feature) parts.push(pre.feature!);
  if (parts.length === 0) return null;
  return parts.join(', ');
}

function formatGrants(feat: Feat): string[] {
  const grants = feat.grants;
  if (!grants) return [];

  const lines: string[] = [];

  if (grants.abilityBonus) {
    const parts = Object.entries(grants.abilityBonus)
      .map(([k, v]) => `+${v} ${ABILITY_ABBREVS[k as AbilityName] ?? k}`)
      .join(', ');
    lines.push(`Ability: ${parts}`);
  }

  if (grants.abilityBonusChoice) {
    const c = grants.abilityBonusChoice;
    lines.push(`Choose ${c.count}× +${c.valuePerChoice} ability`);
  }

  if (grants.skillProficiencies && grants.skillProficiencies.length > 0) {
    lines.push(`Skills: ${grants.skillProficiencies.join(', ')}`);
  }

  if (grants.skillProficiencyChoice) {
    lines.push(`Choose ${grants.skillProficiencyChoice.count} skill/tool`);
  }

  if (grants.toolProficiencies && grants.toolProficiencies.length > 0) {
    lines.push(`Tools: ${grants.toolProficiencies.join(', ')}`);
  }

  if (grants.languages && grants.languages.length > 0) {
    lines.push(`Languages: ${grants.languages.join(', ')}`);
  }

  if (grants.armorTraining && grants.armorTraining.length > 0) {
    lines.push(`Armor: ${grants.armorTraining.join(', ')}`);
  }

  if (grants.specialAbilities && grants.specialAbilities.length > 0) {
    lines.push(`Special: ${grants.specialAbilities.join(', ')}`);
  }

  if (grants.spellChoices && grants.spellChoices.length > 0) {
    const count = grants.spellChoices.reduce((s, c) => s + c.count, 0);
    lines.push(`Spells: ${count} spell(s)`);
  }

  return lines;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function FeatCard({
  feat,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  showPrerequisites = true,
  density = 'default',
  glow,
  className,
}: FeatCardProps) {
  const isCompact = density === 'compact';
  const prereqText = formatPrerequisite(feat);
  const grantLines = formatGrants(feat);
  const displayName = feat.name ?? feat.id;
  const showDesc = showDescProp ?? !isCompact;

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(feat) : undefined}
      glow={glow}
      className={className}
    >
      {/* ── Background glow ────────────────────────────────────────────── */}
      {glow && (
        <div className="absolute -top-1 -right-1 p-2 opacity-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary-500" />
        </div>
      )}

      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {displayName}
          </Text>

          <Badge variant={categoryVariantMap[feat.category]} size="sm">
            {feat.category}
          </Badge>

          {feat.repeatable && (
            <span
              className={cn(
                chipBase,
                'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20',
              )}
            >
              Repeatable
            </span>
          )}
        </div>
      </div>

      {/* ── Prerequisites ───────────────────────────────────────────────── */}
      {showPrerequisites && prereqText && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">REQ</span>}
          label={prereqText}
          className={sectionDivider}
        />
      )}

      {/* ── Description ────────────────────────────────────────────────── */}
      {showDesc && (
        <Text variant="bodySm" as="p" className="leading-relaxed text-text-secondary">
          {feat.description}
        </Text>
      )}

      {/* ── Grants summary ─────────────────────────────────────────────── */}
      {showDesc && grantLines.length > 0 && (
        <div className={cn('flex flex-wrap gap-x-3 gap-y-1', sectionDivider)}>
          {grantLines.map((line, i) => (
            <Text key={i} variant="caption" as="span" className="text-text-tertiary">
              {line}
            </Text>
          ))}
        </div>
      )}

      {/* ── Source / Actions Row ─────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center pt-1',
          renderActions ? 'justify-between' : 'justify-start',
        )}
      >
        <Text variant="caption" as="p" className="uppercase opacity-70">
          {feat.source}
        </Text>
        {renderActions && (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {renderActions()}
          </div>
        )}
      </div>
    </CardSurface>
  );
}
