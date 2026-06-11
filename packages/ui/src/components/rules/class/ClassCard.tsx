import type { ReactNode } from 'react';
import { sectionDivider } from '@/styles/component-styles';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';

import type { Class, AbilityName, DieType, Spellcasting, Feature } from 'open20-core';
import { ClassFeatureCard } from '../feature/ClassFeatureCard';

/* -------------------------------------------------------------------------- */
/*  Die type color map                                                        */
/* -------------------------------------------------------------------------- */

const hitDieVariantMap: Record<DieType, BadgeProps['variant']> = {
  d4: 'secondary',
  d6: 'secondary',
  d8: 'info',
  d10: 'warning',
  d12: 'danger',
  d20: 'primary',
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface ClassCardProps {
  /** The class data from @open20/core */
  classData: Class;
  /** Show full description or collapse it */
  showDescription?: boolean;
  /** Called when the card is clicked, receives the class as argument */
  onClick?: (classData: Class) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Show decorative glow (e.g. when class is chosen) */
  glow?: boolean;
  /** Additional className */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Ability abbreviation helper                                                */
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
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function SpellcastingInfo({ spellcasting }: { spellcasting: Spellcasting }) {
  return (
    <div className={sectionDivider}>
      <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
        Spellcasting
      </Text>
      <div className="ml-2 space-y-1">
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">ABILITY</span>}
          label={ABILITY_ABBREVS[spellcasting.ability] ?? spellcasting.ability}
        />
        {spellcasting.knownSource && (
          <CardMetaItem
            icon={<span className="text-text-tertiary text-xs font-semibold">KNOWN</span>}
            label={spellcasting.knownSource === 'class_list' ? 'Class List' : 'Spellbook'}
          />
        )}
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">PREPARE</span>}
          label={spellcasting.preparationTiming === 'long_rest' ? 'After Long Rest' : 'On Level Up'}
        />
        {spellcasting.pactMagic && (
          <Badge variant="warning" size="sm">
            Pact Magic
          </Badge>
        )}
      </div>
    </div>
  );
}

function SpellSlotsTable({
  spellSlotsByLevel,
}: {
  spellSlotsByLevel?: Readonly<Record<number, ReadonlyArray<number>>>;
}) {
  if (!spellSlotsByLevel || Object.keys(spellSlotsByLevel).length === 0) return null;

  const levels = Object.keys(spellSlotsByLevel)
    .map(Number)
    .sort((a: number, b: number) => a - b);

  return (
    <div className={sectionDivider}>
      <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
        Spell Slots
      </Text>
      <div className="ml-2 mt-1 overflow-x-auto">
        <table className="text-xs text-text-secondary">
          <thead>
            <tr>
              <th className="pr-2 text-left">Level</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i: number) => (
                <th key={i} className="px-1 text-center">
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levels.map((level: number) => {
              const slots = spellSlotsByLevel[level];
              if (!slots || slots.length === 0) return null;
              return (
                <tr key={level}>
                  <td className="pr-2 font-medium">{level}</td>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i: number) => (
                    <td key={i} className="px-1 text-center">
                      {slots[i - 1] ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */

export function ClassCard({
  classData,
  showDescription: showDescProp,
  onClick,
  surfaceVariant,
  renderActions,
  density = 'default',
  glow,
  className,
}: ClassCardProps) {
  const isCompact = density === 'compact';
  const showDesc = showDescProp ?? !isCompact;

  // Flatten all features from featuresByLevel
  const allFeatures: Array<{ feature: Feature; level: number }> = classData.featuresByLevel.flatMap(
    (levelData) =>
      levelData.features.map((feature: Feature) => ({
        feature,
        level: levelData.level,
      })),
  );

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(classData) : undefined}
      glow={glow}
      source={classData.source}
      renderActions={renderActions}
      className={className}
    >
      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Text as="h3" variant="heading" size="lg" className="truncate">
            {classData.name}
          </Text>

          <Badge variant={hitDieVariantMap[classData.hitDie]} size="sm">
            Hit Die: {classData.hitDie}
          </Badge>
        </div>
      </div>

      {/* ── Saving Throw Proficiencies ──────────────────────────────────── */}
      {classData.savingThrowProficiencies.length > 0 && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">SAVE</span>}
          label={classData.savingThrowProficiencies
            .map((ability: AbilityName) => ABILITY_ABBREVS[ability] ?? ability)
            .join(', ')}
        />
      )}

      {/* ── Armor Training ──────────────────────────────────────────────── */}
      {classData.armorTraining.length > 0 && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">ARMOR</span>}
          label={classData.armorTraining.join(', ')}
        />
      )}

      {/* ── Weapon Proficiencies ────────────────────────────────────────── */}
      {classData.weaponProficiencies && classData.weaponProficiencies.length > 0 && (
        <CardMetaItem
          icon={<span className="text-text-tertiary text-xs font-semibold">WEAPON</span>}
          label={classData.weaponProficiencies.join(', ')}
        />
      )}

      {/* ── Weapon Mastery ──────────────────────────────────────────────── */}
      {classData.weaponMastery && (
        <Badge variant="success" size="sm">
          Weapon Mastery
        </Badge>
      )}

      {/* ── Spellcasting Info ───────────────────────────────────────────── */}
      {classData.spellcasting && <SpellcastingInfo spellcasting={classData.spellcasting} />}

      {/* ── Spell Slots Table ───────────────────────────────────────────── */}
      {classData.spellSlotsByLevel && (
        <SpellSlotsTable spellSlotsByLevel={classData.spellSlotsByLevel} />
      )}

      {/* ── Features List (Flattened) ──────────────────────────────────── */}
      {showDesc && allFeatures.length > 0 && (
        <div className={sectionDivider}>
          <Text variant="caption" as="span" className="text-text-tertiary font-semibold">
            Features
          </Text>
          <div className="ml-2 mt-2 space-y-2">
            {allFeatures.map((item: { feature: Feature; level: number }, index: number) => (
              <ClassFeatureCard
                key={`${item.feature.name}-${item.level}-${index}`}
                feature={item.feature}
                level={item.level}
                density="compact"
                showDescription={false}
              />
            ))}
          </div>
        </div>
      )}
    </CardSurface>
  );
}
