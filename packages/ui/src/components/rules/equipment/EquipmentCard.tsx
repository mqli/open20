import type { ReactNode } from 'react';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
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

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                           */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Shared Sub-components                                                      */
/* -------------------------------------------------------------------------- */

function StatBlock({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text variant="caption" className="text-text-tertiary uppercase tracking-wide text-[10px]">
        {label}
      </Text>
      {value && (
        <Text variant="body" size="sm" className="font-medium">
          {value}
        </Text>
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Weapon Details                                                             */
/* -------------------------------------------------------------------------- */

function WeaponDetails({ weapon, compact }: { weapon: Weapon; compact?: boolean }) {
  const t = useTranslation();

  if (compact) {
    return (
      <div className="mt-1 space-y-1">
        {/* Inline damage + key stats */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold font-mono tabular-nums text-primary-600">
            {weapon.damage.entries[0]?.dice ?? '—'}
          </span>
          {weapon.damage.entries.map((entry) => (
            <Badge key={entry.type} variant="secondary" size="sm">
              {entry.type}
            </Badge>
          ))}
          {weapon.damage.bonus !== 0 && (
            <Text variant="caption" className="text-text-secondary">
              +{weapon.damage.bonus}
            </Text>
          )}
        </div>

        {/* Inline meta: range, versatile, mastery */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-text-tertiary">
          {weapon.range && (
            <span>
              {t('equipment.range')}:{' '}
              {weapon.range.maximum
                ? `${weapon.range.normal}/${weapon.range.maximum}`
                : weapon.range.normal}
            </span>
          )}
          {weapon.versatileDamage && (
            <span>
              {t('equipment.versatile')}: {weapon.versatileDamage}
            </span>
          )}
          {weapon.mastery && weapon.mastery.length > 0 && (
            <span>
              {t('equipment.mastery')}: {weapon.mastery.join(', ')}
            </span>
          )}
        </div>

        {/* Properties as tiny badges */}
        {weapon.properties.length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {weapon.properties.map((prop) => (
              <Badge key={prop} variant="secondary" size="sm">
                {prop}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Primary Stat: Damage (full-width prominent row) */}
      <div className="bg-bg-tertiary/50 rounded-lg p-3 flex items-center gap-3">
        {/* Large damage dice */}
        <span className="text-3xl font-bold font-mono tabular-nums text-primary-600">
          {weapon.damage.entries[0]?.dice ?? '—'}
        </span>

        <div className="flex flex-col gap-1">
          {/* Damage types */}
          <div className="flex flex-wrap gap-1">
            {weapon.damage.entries.map((entry) => (
              <Badge key={entry.type} variant="secondary" size="sm">
                {entry.type}
              </Badge>
            ))}
          </div>
          {/* Ability + Bonus */}
          <Text variant="caption" className="text-text-secondary">
            {weapon.damage.ability}
            {weapon.damage.bonus !== 0 && ` +${weapon.damage.bonus}`}
          </Text>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/* Range */}
        {weapon.range && (
          <StatBlock
            label={t('equipment.range')}
            value={
              weapon.range.maximum
                ? `${weapon.range.normal}/${weapon.range.maximum} ft.`
                : `${weapon.range.normal} ft.`
            }
          />
        )}

        {/* Versatile Damage */}
        {weapon.versatileDamage && (
          <StatBlock label={t('equipment.versatile')} value={weapon.versatileDamage} />
        )}

        {/* Mastery */}
        {weapon.mastery && weapon.mastery.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <Text
              variant="caption"
              className="text-text-tertiary uppercase tracking-wide text-[10px]"
            >
              {t('equipment.mastery')}
            </Text>
            <div className="flex flex-wrap gap-1">
              {weapon.mastery.map((m) => (
                <Badge key={m} variant="warning" size="sm">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Properties Row */}
      {weapon.properties.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <Text
            variant="caption"
            className="text-text-tertiary uppercase tracking-wide text-[10px] mb-1.5 block"
          >
            {t('equipment.properties')}
          </Text>
          <div className="flex flex-wrap gap-1">
            {weapon.properties.map((prop) => (
              <Badge key={prop} variant="secondary" size="sm">
                {prop}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Armor Details                                                              */
/* -------------------------------------------------------------------------- */

function ArmorDetails({ armor, compact }: { armor: Armor; compact?: boolean }) {
  const t = useTranslation();

  if (compact) {
    return (
      <div className="mt-1.5 space-y-1.5">
        {/* Inline AC + key stats */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold font-mono tabular-nums text-success-600">
            AC {armor.ac}
          </span>
          {armor.dexBonus && (
            <Text variant="caption" className="text-text-tertiary">
              +Dex
              {armor.maxDexBonus !== undefined && armor.maxDexBonus !== null
                ? ` (≤${armor.maxDexBonus})`
                : ''}
            </Text>
          )}
          {armor.strengthRequirement !== undefined && armor.strengthRequirement > 0 && (
            <Text variant="caption" className="text-text-tertiary">
              STR {armor.strengthRequirement}
            </Text>
          )}
        </div>

        {/* Inline flags */}
        {armor.stealthDisadvantage && (
          <Text variant="caption" className="text-warning-600 text-[10px]">
            {t('equipment.stealth')}: {t('equipment.disadvantage')}
          </Text>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Primary Stat: AC (full-width prominent row) */}
      <div className="bg-bg-tertiary/50 rounded-lg p-3 flex items-center gap-3">
        <span className="text-3xl font-bold font-mono tabular-nums text-success-600">
          {armor.ac}
        </span>
        <Text variant="caption" className="text-text-secondary uppercase tracking-wide text-[10px]">
          {t('equipment.ac')}
        </Text>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/* Dex Bonus */}
        {armor.dexBonus && (
          <StatBlock
            label={t('equipment.dexBonus')}
            value={
              armor.maxDexBonus !== undefined && armor.maxDexBonus !== null
                ? `≤ ${armor.maxDexBonus}`
                : t('equipment.unlimited')
            }
          />
        )}

        {/* Strength Requirement */}
        {armor.strengthRequirement !== undefined && armor.strengthRequirement > 0 && (
          <StatBlock label={t('equipment.strengthReq')} value={`${armor.strengthRequirement}`} />
        )}

        {/* Stealth Disadvantage */}
        {armor.stealthDisadvantage && (
          <StatBlock label={t('equipment.stealth')} value={t('equipment.disadvantage')} />
        )}
      </div>
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
  const cost = equipment.cost ? `${equipment.cost.quantity} ${equipment.cost.unit}` : '';

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
      <div
        className={
          isCompact ? 'flex items-center gap-1.5 min-w-0' : 'flex items-start justify-between gap-2'
        }
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size={isCompact ? 'md' : 'lg'} className="truncate">
            {displayName}
          </Text>

          {/* Type Badge */}
          <Badge variant={typeVariantMap[typeKey] || 'secondary'} size={isCompact ? 'xs' : 'sm'}>
            {t(`equipment.type.${typeKey}` as keyof BaseTranslations)}
          </Badge>

          {/* Category Badge - hidden in compact mode */}
          {!isCompact && weapon && (
            <Badge variant={weaponCategoryVariantMap[weapon.category]} size="sm">
              {weapon.category}
            </Badge>
          )}

          {!isCompact && armor && (
            <Badge variant={armorCategoryVariantMap[armor.category]} size="sm">
              {armor.category}
            </Badge>
          )}

          {/* Equipped Status */}
          {hasEquipped && (equipment as EquipmentItem).equipped && (
            <Badge variant="success" size={isCompact ? 'xs' : 'sm'}>
              {t('equipment.equipped' as keyof BaseTranslations)}
            </Badge>
          )}
        </div>
      </div>

      {/* ── Key Details (Primary Info) ─────────────────────────── */}
      {/* Weapon: Damage + Properties */}
      {weapon && <WeaponDetails weapon={weapon} compact={isCompact} />}

      {/* Armor: AC + Stats */}
      {armor && <ArmorDetails armor={armor} compact={isCompact} />}

      {/* ── Metadata Footer ─────────────────────────────────── */}
      <div
        className={
          isCompact
            ? 'pt-1 mt-1 border-t border-border/50'
            : 'pt-2 border-t border-border/50 mt-auto'
        }
      >
        {isCompact ? (
          <div className="flex items-center gap-2 text-[9px] text-text-tertiary">
            <span>{weight} lb.</span>
            {cost && <span>{cost}</span>}
            {gear && gear.quantity !== undefined && gear.quantity > 1 && (
              <span>×{gear.quantity}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-tertiary">
            {/* Weight */}
            <span className="flex items-center gap-1">
              <span className="font-medium uppercase tracking-wide">{t('equipment.weight')}</span>
              <span>{weight} lb.</span>
            </span>

            {/* Cost */}
            {cost && (
              <span className="flex items-center gap-1">
                <span className="font-medium uppercase tracking-wide">{t('equipment.cost')}</span>
                <span>{cost}</span>
              </span>
            )}

            {/* Quantity */}
            {gear && gear.quantity !== undefined && (
              <span className="flex items-center gap-1">
                <span className="font-medium uppercase tracking-wide">
                  {t('equipment.quantity')}
                </span>
                <span>{gear.quantity}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </CardSurface>
  );
}
