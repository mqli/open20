import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { chipBase, sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';
import { useTranslation } from '@/i18n';

import type { Feat, FeatCategory, AbilityName } from 'open20-core';

/* -------------------------------------------------------------------------- */
/*  Category color map                                                        */
/* -------------------------------------------------------------------------- */

const categoryVariantMap: Record<FeatCategory, BadgeProps['variant']> = {
  Origin: 'success',
  General: 'secondary',
  'Fighting Style': 'warning',
  'Epic Boon': 'primary',
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

/* -------------------------------------------------------------------------- */
/*  Sub-components with i18n                                                   */
/* -------------------------------------------------------------------------- */

function FeatPrerequisite({ feat }: { feat: Feat }) {
  const t = useTranslation();
  const pre = feat.prerequisites;
  if (!pre) return null;

  const parts: string[] = [];
  if (pre.level !== undefined) parts.push(t('feat.levelReq', { level: pre.level }));
  if (pre.ability) {
    for (const [ability, min] of Object.entries(pre.ability)) {
      parts.push(`${ABILITY_ABBREVS[ability as AbilityName] ?? ability} ${min}+`);
    }
  }
  if (pre.classId) parts.push(pre.classId);
  if (pre.species) parts.push(pre.species);
  if (pre.feature) parts.push(pre.feature!);
  if (parts.length === 0) return null;

  return (
    <CardMetaItem
      icon={
        <span className="text-text-tertiary text-xs font-semibold">{t('feat.prerequisite')}</span>
      }
      label={parts.join(', ')}
    />
  );
}

function FeatGrants({ grants }: { grants: Feat['grants'] }) {
  const t = useTranslation();
  if (!grants || grants.length === 0) return null;

  const lines: string[] = [];

  for (const grant of grants) {
    switch (grant.type) {
      case 'abilityBonus': {
        const parts = Object.entries(grant.bonus)
          .map(([k, v]) => `+${v} ${ABILITY_ABBREVS[k as AbilityName] ?? k}`)
          .join(', ');
        lines.push(t('feat.abilityBonus', { bonus: parts }));
        break;
      }

      case 'abilityBonusChoice': {
        const c = grant.choice;
        lines.push(t('feat.abilityBonusChoice', { count: c.count, value: c.valuePerChoice }));
        break;
      }

      case 'skillProficiencies': {
        if (grant.skills.length > 0) {
          lines.push(t('feat.skillProficiencies', { skills: grant.skills.join(', ') }));
        }
        break;
      }

      case 'skillProficiencyChoice': {
        lines.push(t('feat.skillProficiencyChoice', { count: grant.choice.count }));
        break;
      }

      case 'toolProficiencies': {
        if (grant.tools.length > 0) {
          lines.push(t('feat.toolProficiencies', { tools: grant.tools.join(', ') }));
        }
        break;
      }

      case 'toolProficiencyChoice': {
        lines.push(t('feat.toolProficiencyChoice', { count: grant.choice.count }));
        break;
      }

      case 'languages': {
        if (grant.languages.length > 0) {
          lines.push(t('feat.languages', { languages: grant.languages.join(', ') }));
        }
        break;
      }

      case 'armorTraining': {
        if (grant.armors.length > 0) {
          lines.push(t('feat.armorTraining', { armors: grant.armors.join(', ') }));
        }
        break;
      }

      case 'weaponMastery': {
        if (grant.weapons.length > 0) {
          lines.push(t('feat.weaponMastery', { weapons: grant.weapons.join(', ') }));
        }
        break;
      }

      case 'attackBonus': {
        const parts: string[] = [];
        if (grant.bonus.ranged)
          parts.push(t('feat.attackBonusRanged', { bonus: grant.bonus.ranged }));
        if (grant.bonus.melee) parts.push(t('feat.attackBonusMelee', { bonus: grant.bonus.melee }));
        if (parts.length > 0) lines.push(t('feat.attackBonus', { bonus: parts.join(', ') }));
        break;
      }

      case 'acBonus': {
        const parts: string[] = [];
        if (grant.bonus.lightArmor)
          parts.push(t('feat.acBonusLight', { bonus: grant.bonus.lightArmor }));
        if (grant.bonus.mediumArmor)
          parts.push(t('feat.acBonusMedium', { bonus: grant.bonus.mediumArmor }));
        if (grant.bonus.heavyArmor)
          parts.push(t('feat.acBonusHeavy', { bonus: grant.bonus.heavyArmor }));
        if (parts.length > 0) lines.push(t('feat.acBonus', { bonus: parts.join(', ') }));
        break;
      }

      case 'specialAbilities': {
        if (grant.abilities.length > 0) {
          lines.push(t('feat.specialAbilities', { abilities: grant.abilities.join(', ') }));
        }
        break;
      }

      case 'spellChoices': {
        const count = grant.choices.reduce((s, c) => s + c.count, 0);
        if (count > 0) {
          lines.push(t('feat.spellChoices', { count }));
        }
        break;
      }

      default: {
        const _exhaustive: never = grant;
        return _exhaustive;
      }
    }
  }

  if (lines.length === 0) return null;

  return (
    <div className={sectionDivider}>
      {lines.map((line, i) => (
        <Text key={i} variant="caption" as="span" className="text-text-tertiary">
          {line}
        </Text>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
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
  const t = useTranslation();
  const isCompact = density === 'compact';
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
      source={feat.source}
      renderActions={renderActions}
      className={className}
    >
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
              {t('feat.repeatable')}
            </span>
          )}
        </div>
      </div>

      {/* ── Prerequisites ───────────────────────────────────────────────── */}
      {showPrerequisites && <FeatPrerequisite feat={feat} />}

      {/* ── Description ────────────────────────────────────────────────── */}
      {showDesc && (
        <Text variant="bodySm" as="p" className="leading-relaxed text-text-secondary">
          {feat.description}
        </Text>
      )}

      {/* ── Grants summary ─────────────────────────────────────────────── */}
      {showDesc && <FeatGrants grants={feat.grants} />}
    </CardSurface>
  );
}
