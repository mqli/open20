import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CardSurface } from '@/components/base/CardSurface';
import type { CardSurfaceDensity } from '@/components/base/CardSurface';
import { CardMetaItem } from '@/components/base/CardSurface';
import { Text } from '@/components/base/Text';
import { sectionDivider, chipBase } from '@/styles/component-styles';
import { useTranslation } from '@/i18n';

import type {
  Monster,
  MonsterAction,
  MonsterReaction,
  MonsterLegendaryAction,
  MonsterSpellcasting,
} from 'open20-core';

import {
  getAllAbilityScores,
  formatSpeed,
  formatAC,
  formatHP,
  formatInitiative,
  formatSenses,
  formatSizeType,
  formatSavingThrows,
  formatSkills,
  formatChallengeRating,
  formatDamageTypes,
  formatLimitedUsage,
  formatModifier,
} from './MonsterCard.helpers';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  CTA Context Types                                                         */
/* -------------------------------------------------------------------------- */

export interface MonsterSpellCTAContext {
  readonly spellcast: MonsterSpellcasting;
  readonly spellName: string;
  readonly type: 'atWill' | 'daily';
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface MonsterCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onClick' | 'color'
> {
  /** The monster data from @open20/core */
  monster: Monster;
  /** Called when the card is clicked, receives the monster as argument */
  onClick?: (monster: Monster) => void;
  /** Override the Surface variant (e.g. 'selected', 'warning', 'info') */
  surfaceVariant?: 'default' | 'tint' | 'selected' | 'warning' | 'info';
  /** Density variant */
  density?: CardSurfaceDensity;
  /** Slot for action buttons rendered in the bottom row */
  renderActions?: () => ReactNode;
  /** Show decorative glow in the background */
  glow?: boolean;

  // ── Per-item CTA render props ──────────────────────────────────────────
  /** Render CTA buttons next to each action */
  renderActionCTA?: (action: MonsterAction, index: number) => ReactNode;
  /** Render CTA buttons next to each bonus action */
  renderBonusActionCTA?: (action: MonsterAction, index: number) => ReactNode;
  /** Render CTA buttons next to each reaction */
  renderReactionCTA?: (reaction: MonsterReaction, index: number) => ReactNode;
  /** Render CTA buttons next to each legendary action */
  renderLegendaryActionCTA?: (action: MonsterLegendaryAction, index: number) => ReactNode;
  /** Render CTA buttons next to each spell entry */
  renderSpellCTA?: (context: MonsterSpellCTAContext, index: number) => ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function MonsterCard({
  monster,
  onClick,
  surfaceVariant,
  density: densityProp,
  renderActions,
  glow,
  renderActionCTA,
  renderBonusActionCTA,
  renderReactionCTA,
  renderLegendaryActionCTA,
  renderSpellCTA,
  className,
  ...props
}: MonsterCardProps) {
  const t = useTranslation();
  const density = (densityProp ?? 'default') as CardSurfaceDensity;
  const isCompact = density === 'compact';

  // Format ability scores for display
  const abilityScores = getAllAbilityScores(monster.abilityScores);

  return (
    <CardSurface
      surfaceVariant={surfaceVariant}
      density={density}
      padding={isCompact ? 'sm' : 'md'}
      clickable={!!onClick}
      onClick={onClick ? () => onClick(monster) : undefined}
      glow={glow}
      renderActions={renderActions}
      className={cn(className)}
      {...props}
    >
      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="space-y-1 mb-3">
        <Text as="h3" variant="heading" size={isCompact ? 'md' : 'lg'}>
          {monster.name}
        </Text>
        <Text variant="bodySm" className="text-text-secondary">
          {formatSizeType(monster)}, {monster.alignment}
        </Text>
        {monster.descriptiveTags && monster.descriptiveTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {monster.descriptiveTags.map((tag) => (
              <span key={tag} className={cn(chipBase, 'text-xs')}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Core Stats (AC, HP, Speed) ─────────────────────── */}
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', isCompact && 'gap-x-2')}>
        <CardMetaItem
          icon={<span className="font-bold text-xs">AC</span>}
          label={formatAC(monster.armorClass)}
        />
        <CardMetaItem
          icon={<span className="font-bold text-xs">HP</span>}
          label={formatHP(monster.hitPoints)}
        />
        <CardMetaItem
          icon={<span className="font-bold text-xs">Spd</span>}
          label={formatSpeed(monster.speed)}
        />
      </div>

      {/* ── Ability Scores ────────────────────────────────────── */}
      <div className={cn(sectionDivider, 'grid grid-cols-6 gap-2 text-center')}>
        {abilityScores.map((ability) => (
          <div key={ability.name} className="space-y-0.5">
            <Text variant="labelSm" className="font-bold">
              {ability.name}
            </Text>
            <Text variant="bodySm" className="block">
              {ability.score}
            </Text>
            <Text variant="labelSm" className="text-text-secondary">
              {formatModifier(ability.modifier)}
            </Text>
          </div>
        ))}
      </div>

      {/* ── Compact Mode: Show only CR and stop ──────────────── */}
      {isCompact && (
        <div className={cn(sectionDivider, 'flex items-center gap-2')}>
          <Text variant="labelSm" className="font-bold">
            {t('monster.challenge')}:
          </Text>
          <Text variant="bodySm">{formatChallengeRating(monster.challengeRating)}</Text>
        </div>
      )}

      {/* ── Full Mode: Show all sections ────────────────────── */}
      {!isCompact && (
        <>
          {/* Initiative */}
          {monster.initiative && (
            <div className={cn(sectionDivider, 'flex items-center gap-2')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.initiative')}:
              </Text>
              <Text variant="bodySm">{formatInitiative(monster.initiative)}</Text>
            </div>
          )}

          {/* Saving Throws */}
          {monster.savingThrows && Object.keys(monster.savingThrows).length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.savingThrows')}:
              </Text>
              <Text variant="bodySm">{formatSavingThrows(monster.savingThrows)}</Text>
            </div>
          )}

          {/* Skills */}
          {monster.skills && Object.keys(monster.skills).length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.skills')}:
              </Text>
              <Text variant="bodySm">{formatSkills(monster.skills)}</Text>
            </div>
          )}

          {/* Damage Vulnerabilities */}
          {monster.vulnerabilities && monster.vulnerabilities.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0 text-red-600">
                {t('monster.damageVulnerabilities')}:
              </Text>
              <Text variant="bodySm">{formatDamageTypes(monster.vulnerabilities)}</Text>
            </div>
          )}

          {/* Damage Resistances */}
          {monster.resistances && monster.resistances.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0 text-blue-600">
                {t('monster.damageResistances')}:
              </Text>
              <Text variant="bodySm">{formatDamageTypes(monster.resistances)}</Text>
            </div>
          )}

          {/* Damage Immunities */}
          {monster.damageDefenses?.immunities && monster.damageDefenses.immunities.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0 text-green-600">
                {t('monster.damageImmunities')}:
              </Text>
              <Text variant="bodySm">{formatDamageTypes(monster.damageDefenses.immunities)}</Text>
            </div>
          )}

          {/* Condition Immunities */}
          {monster.conditionImmunities && monster.conditionImmunities.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.conditionImmunities')}:
              </Text>
              <Text variant="bodySm">{monster.conditionImmunities.join(', ')}</Text>
            </div>
          )}

          {/* Senses */}
          {monster.senses && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.senses')}:
              </Text>
              <Text variant="bodySm">{formatSenses(monster.senses)}</Text>
            </div>
          )}

          {/* Languages */}
          {monster.languages && monster.languages.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.languages')}:
              </Text>
              <Text variant="bodySm">{monster.languages.join(', ')}</Text>
            </div>
          )}

          {/* Challenge Rating */}
          <div className={cn(sectionDivider, 'flex items-center gap-2')}>
            <Text variant="labelSm" className="font-bold">
              {t('monster.challenge')}:
            </Text>
            <Text variant="bodySm">{formatChallengeRating(monster.challengeRating)}</Text>
          </div>

          {/* Traits */}
          {monster.traits && monster.traits.length > 0 && (
            <div className={cn(sectionDivider, 'space-y-2')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.traits')}
              </Text>
              {monster.traits.map((trait) => (
                <div key={trait.name} className="space-y-0.5">
                  <Text variant="bodySm" className="font-semibold">
                    {trait.name}.
                  </Text>
                  <Text variant="bodySm" className="text-text-secondary">
                    {trait.description}
                  </Text>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {monster.actions && monster.actions.length > 0 && (
            <div className={cn(sectionDivider, 'space-y-2')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.actions')}
              </Text>
              {monster.actions.map((action, actionIdx) => {
                const cta = renderActionCTA?.(action, actionIdx);
                const content = (
                  <>
                    <Text variant="bodySm" className="font-semibold">
                      {action.name}.
                      {action.limitedUsage && (
                        <span className="font-normal text-text-tertiary ml-1">
                          ({formatLimitedUsage(t, action.limitedUsage)})
                        </span>
                      )}
                    </Text>
                    {action.description && (
                      <Text variant="bodySm" className="text-text-secondary block">
                        {action.description}
                      </Text>
                    )}
                    {action.attacks && action.attacks.length > 0 && (
                      <div className="pl-2 space-y-1">
                        {action.attacks.map((attack, idx) => (
                          <Text key={idx} variant="bodySm" className="text-text-secondary">
                            <span className="font-medium">{attack.name}:</span>{' '}
                            {attack.damageEntries?.map((d) => d.dice).join(' + ') ?? ''}
                          </Text>
                        ))}
                      </div>
                    )}
                  </>
                );
                return (
                  <div key={action.name} className="space-y-0.5">
                    {cta ? (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">{content}</div>
                        <div className="shrink-0">{cta}</div>
                      </div>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bonus Actions */}
          {monster.bonusActions && monster.bonusActions.length > 0 && (
            <div className={cn(sectionDivider, 'space-y-2')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.bonusActions')}
              </Text>
              {monster.bonusActions.map((action, actionIdx) => {
                const cta = renderBonusActionCTA?.(action, actionIdx);
                const content = (
                  <>
                    <Text variant="bodySm" className="font-semibold">
                      {action.name}.
                    </Text>
                    {action.description && (
                      <Text variant="bodySm" className="text-text-secondary">
                        {action.description}
                      </Text>
                    )}
                  </>
                );
                return (
                  <div key={action.name} className="space-y-0.5">
                    {cta ? (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">{content}</div>
                        <div className="shrink-0">{cta}</div>
                      </div>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reactions */}
          {monster.reactions && monster.reactions.length > 0 && (
            <div className={cn(sectionDivider, 'space-y-2')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.reactions')}
              </Text>
              {monster.reactions.map((reaction, reactionIdx) => {
                const cta = renderReactionCTA?.(reaction, reactionIdx);
                const content = (
                  <>
                    <Text variant="bodySm" className="font-semibold">
                      {reaction.name}.
                    </Text>
                    <Text variant="bodySm" className="text-text-secondary">
                      {reaction.description}
                    </Text>
                  </>
                );
                return (
                  <div key={reaction.name} className="space-y-0.5">
                    {cta ? (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">{content}</div>
                        <div className="shrink-0">{cta}</div>
                      </div>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legendary Actions */}
          {monster.legendaryActions && monster.legendaryActions.length > 0 && (
            <div className={cn(sectionDivider, 'space-y-2')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.legendaryActions')}
              </Text>
              <Text variant="bodySm" className="text-text-secondary italic">
                {t('monster.legendaryActionsDesc', {
                  name: monster.name,
                  count: monster.legendaryActions.length,
                })}
              </Text>
              {monster.legendaryActions.map((action, laIdx) => {
                const cta = renderLegendaryActionCTA?.(action, laIdx);
                const content = (
                  <>
                    <Text variant="bodySm" className="font-semibold">
                      {action.name} (Cost {action.cost || 1}).
                    </Text>
                    <Text variant="bodySm" className="text-text-secondary">
                      {action.description}
                    </Text>
                  </>
                );
                return (
                  <div key={action.name} className="space-y-0.5">
                    {cta ? (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">{content}</div>
                        <div className="shrink-0">{cta}</div>
                      </div>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Spellcasting */}
          {monster.spellcasting && monster.spellcasting.length > 0 && (
            <div className={cn(sectionDivider, 'space-y-3')}>
              <Text variant="labelSm" className="font-bold">
                {t('monster.spellcasting')}
              </Text>
              {monster.spellcasting.map((spellcast, scIdx) => {
                let spellCtaIndex = 0;
                return (
                  <div key={scIdx} className="space-y-1">
                    <Text variant="bodySm" className="font-semibold">
                      {t('monster.spellcasting.abilityDc', {
                        ability: spellcast.ability,
                        dc: spellcast.saveDC,
                      })}
                      {spellcast.attackBonus !== undefined &&
                        t('monster.spellcasting.attackBonus', {
                          bonus: spellcast.attackBonus,
                        })}
                    </Text>

                    {/* At-will spells as individual items */}
                    {spellcast.atWill && spellcast.atWill.length > 0 && (
                      <div className="space-y-1">
                        <Text variant="bodySm" className="text-text-secondary font-medium">
                          {t('monster.spellcasting.atWill')}
                        </Text>
                        {spellcast.atWill.map((spellName) => {
                          const idx = spellCtaIndex++;
                          const spellCta = renderSpellCTA?.(
                            { spellcast, spellName, type: 'atWill' },
                            idx,
                          );
                          return (
                            <div
                              key={spellName}
                              className="flex items-start justify-between gap-2 pl-2"
                            >
                              <Text variant="bodySm" className="text-text-secondary flex-1 min-w-0">
                                {spellName}
                              </Text>
                              {spellCta && <div className="shrink-0">{spellCta}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Daily spells as individual items */}
                    {spellcast.daily && spellcast.daily.length > 0 && (
                      <div className="space-y-1">
                        {spellcast.daily.map((d) => {
                          const idx = spellCtaIndex++;
                          const spellCta = renderSpellCTA?.(
                            { spellcast, spellName: d.spell, type: 'daily' },
                            idx,
                          );
                          return (
                            <div
                              key={d.spell}
                              className="flex items-start justify-between gap-2 pl-2"
                            >
                              <Text variant="bodySm" className="text-text-secondary flex-1 min-w-0">
                                {t('monster.spellcasting.daily', { times: d.times })} {d.spell}
                              </Text>
                              {spellCta && <div className="shrink-0">{spellCta}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Equipment */}
          {monster.gears && monster.gears.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.equipment')}:
              </Text>
              <Text variant="bodySm">{monster.gears.join(', ')}</Text>
            </div>
          )}

          {/* Environments */}
          {monster.environments && monster.environments.length > 0 && (
            <div className={cn(sectionDivider, 'flex items-start gap-2')}>
              <Text variant="labelSm" className="font-bold shrink-0">
                {t('monster.environments')}:
              </Text>
              <Text variant="bodySm">{monster.environments.join(', ')}</Text>
            </div>
          )}
        </>
      )}
    </CardSurface>
  );
}
