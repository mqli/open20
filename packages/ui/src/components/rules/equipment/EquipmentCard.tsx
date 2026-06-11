import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';
import { useTranslation, type BaseTranslations } from '@/i18n';

import type { Weapon, Armor, Gear, EquipmentItem } from 'open20-core';

/* -------------------------------------------------------------------------- */
/*  Type guards                                                               */
/* -------------------------------------------------------------------------- */

function isWeapon(equipment: EquipmentData): equipment is Weapon {
  return 'category' in equipment && (equipment as Weapon).type === 'weapon';
}

function isArmor(equipment: EquipmentData): equipment is Armor {
  return 'ac' in equipment;
}

function isGear(equipment: EquipmentData): equipment is Gear {
  return (equipment as Gear).type === 'gears' || (equipment as Gear).type === 'consumable';
}

/* -------------------------------------------------------------------------- */
/*  Type unions for variant maps                                               */
/* -------------------------------------------------------------------------- */

const weaponCategoryVariantMap: Record<'Simple' | 'Martial', BadgeProps['variant']> = {
  Simple: 'secondary',
  Martial: 'primary',
};

const armorCategoryVariantMap: Record<
  'Light' | 'Medium' | 'Heavy' | 'Shield',
  BadgeProps['variant']
> = {
  Light: 'success',
  Medium: 'warning',
  Heavy: 'danger',
  Shield: 'secondary',
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export type EquipmentData = Weapon | Armor | Gear;

export interface EquipmentCardProps {
  /** The equipment data from @open20/core */
  equipment: EquipmentData;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the equipment as argument */
  onClick?: (equipment: EquipmentData) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Additional className */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDamage(entries: readonly { dice: string; type: string }[]): string {
  if (!entries || entries.length === 0) return '';
  return entries.map((e) => `${e.dice} ${e.type}`).join(' + ');
}

function formatProperties(properties: readonly string[]): string {
  if (!properties || properties.length === 0) return '';
  return properties.join(', ');
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                           */
/* -------------------------------------------------------------------------- */

function WeaponDetails({ weapon }: { weapon: Weapon }) {
  const t = useTranslation();

  return (
    <div className={sectionDivider}>
      {/* Damage */}
      <CardMetaItem
        icon={
          <span className="text-text-tertiary text-xs font-semibold">{t('equipment.damage')}</span>
        }
        label={formatDamage(weapon.damage.entries)}
      />

      {/* Ability */}
      <CardMetaItem
        icon={
          <span className="text-text-tertiary text-xs font-semibold">{t('equipment.ability')}</span>
        }
        label={weapon.damage.ability}
      />

      {/* Bonus */}
      {weapon.damage.bonus !== 0 && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">{t('equipment.bonus')}</span>
          }
          label={`+${weapon.damage.bonus}`}
        />
      )}

      {/* Range */}
      {weapon.range && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">{t('equipment.range')}</span>
          }
          label={
            weapon.range.maximum
              ? `${weapon.range.normal}/${weapon.range.maximum} ft.`
              : `${weapon.range.normal} ft.`
          }
        />
      )}

      {/* Properties */}
      {weapon.properties.length > 0 && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.properties')}
            </span>
          }
          label={formatProperties(weapon.properties as readonly string[])}
        />
      )}

      {/* Mastery */}
      {weapon.mastery && weapon.mastery.length > 0 && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.mastery')}
            </span>
          }
          label={formatProperties(weapon.mastery as readonly string[])}
        />
      )}

      {/* Versatile Damage */}
      {weapon.versatileDamage && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.versatile')}
            </span>
          }
          label={weapon.versatileDamage}
        />
      )}
    </div>
  );
}

function ArmorDetails({ armor }: { armor: Armor }) {
  const t = useTranslation();

  return (
    <div className={sectionDivider}>
      {/* AC */}
      <CardMetaItem
        icon={<span className="text-text-tertiary text-xs font-semibold">{t('equipment.ac')}</span>}
        label={`${armor.ac}`}
      />

      {/* Dex Bonus */}
      {armor.dexBonus && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.dexBonus')}
            </span>
          }
          label={
            armor.maxDexBonus !== undefined && armor.maxDexBonus !== null
              ? `≤ ${armor.maxDexBonus}`
              : t('equipment.unlimited')
          }
        />
      )}

      {/* Strength Requirement */}
      {armor.strengthRequirement !== undefined && armor.strengthRequirement > 0 && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.strengthReq')}
            </span>
          }
          label={`${armor.strengthRequirement}`}
        />
      )}

      {/* Stealth Disadvantage */}
      {armor.stealthDisadvantage && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.stealth')}
            </span>
          }
          label={t('equipment.disadvantage')}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */

export function EquipmentCard({
  equipment,
  onClick,
  surfaceVariant,
  renderActions,
  density = 'default',
  className,
}: EquipmentCardProps) {
  const t = useTranslation();
  const isCompact = density === 'compact';

  // Determine equipment type using type guards
  const weapon = isWeapon(equipment) ? equipment : null;
  const armor = isArmor(equipment) ? equipment : null;
  const gear = isGear(equipment) ? equipment : null;

  // Check if equipment has equipped property (Weapon or Gear, not Armor)
  const hasEquipped = 'equipped' in equipment;

  // Get name and source
  const displayName = equipment.name ?? equipment.id;
  const source = 'source' in equipment ? equipment.source : undefined;

  // Get weight and cost
  const weight = equipment.weight;
  let cost = '';
  if (armor) {
    if (armor.cost) {
      cost = `${armor.cost.quantity} ${armor.cost.unit}`;
    }
  } else if ('cost' in equipment && equipment.cost) {
    // Weapon or Gear has cost as string
    cost = equipment.cost as string;
  }

  // Get equipment type for badge
  let typeKey: string = '';
  if (weapon) {
    typeKey = 'weapon';
  } else if (armor) {
    typeKey = 'armor';
  } else if (gear) {
    typeKey = gear.type;
  }

  // Type variant map for badge
  const typeVariantMap: Record<string, BadgeProps['variant']> = {
    weapon: 'primary',
    armor: 'success',
    gears: 'secondary',
    consumable: 'warning',
  };

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(equipment) : undefined}
      source={source}
      renderActions={renderActions}
      className={className}
    >
      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {displayName}
          </Text>

          {/* Type Badge */}
          <Badge variant={typeVariantMap[typeKey] || 'secondary'} size="sm">
            {t(`equipment.type.${typeKey}` as keyof BaseTranslations)}
          </Badge>

          {/* Category Badge (Weapon) */}
          {weapon && (
            <Badge variant={weaponCategoryVariantMap[weapon.category]} size="sm">
              {weapon.category}
            </Badge>
          )}

          {/* Category Badge (Armor) */}
          {armor && (
            <Badge variant={armorCategoryVariantMap[armor.category]} size="sm">
              {armor.category}
            </Badge>
          )}

          {/* Equipped Status */}
          {hasEquipped && (equipment as EquipmentItem).equipped && (
            <Badge variant="success" size="sm">
              {t('equipment.equipped' as keyof BaseTranslations)}
            </Badge>
          )}
        </div>
      </div>

      {/* ── Metadata ───────────────────────────────────────────── */}
      {/* Weight */}
      <CardMetaItem
        icon={
          <span className="text-text-tertiary text-xs font-semibold">{t('equipment.weight')}</span>
        }
        label={`${weight} lb.`}
      />

      {/* Cost */}
      {cost && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">{t('equipment.cost')}</span>
          }
          label={cost}
        />
      )}

      {/* Quantity */}
      {gear && gear.quantity !== undefined && (
        <CardMetaItem
          icon={
            <span className="text-text-tertiary text-xs font-semibold">
              {t('equipment.quantity')}
            </span>
          }
          label={`${gear.quantity}`}
        />
      )}

      {/* ── Weapon Details ─────────────────────────────────────── */}
      {weapon && <WeaponDetails weapon={weapon} />}

      {/* ── Armor Details ──────────────────────────────────────── */}
      {armor && <ArmorDetails armor={armor} />}
    </CardSurface>
  );
}
