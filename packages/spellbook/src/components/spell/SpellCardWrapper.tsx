import { Activity, BookMarked, Flame, Sparkles, Star, Swords, Zap } from 'lucide-react';
import { defaultRandom, rollDiceExpression, type Spell } from 'open20-core';
import type { ComponentProps, ReactNode } from 'react';
import { Badge, Button, IconButton, SpellCard as SpellCardUI } from '@open20/ui';
import { ClassActionDropdown } from '@/components/spell/ClassActionDropdown';
import { characterService } from '@/core/character-service';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { renderInlineMarkdown } from '@/utils/inline-markdown';

type SpellCardDensity = 'default' | 'compact';
type SpellActionStyle = 'button' | 'icon';

interface SpellCardWrapperProps {
  spell: Spell;
  density?: SpellCardDensity;
  showDescription?: boolean;
  surfaceVariant?: ComponentProps<typeof SpellCardUI>['surfaceVariant'];
  glow?: boolean;
  onClick?: () => void;
  renderBadges?: () => ReactNode;
  renderActions?: () => ReactNode;
  showCastAction?: boolean;
  showAttackAction?: boolean;
  showDamageActions?: boolean;
  showConcentrationAction?: boolean;
  showSpellbookActions?: boolean;
  showSpellbookBadges?: boolean;
  actionStyle?: SpellActionStyle;
}

export function SpellCardWrapper({
  spell,
  density,
  showDescription,
  surfaceVariant,
  glow,
  onClick,
  renderBadges,
  renderActions,
  showCastAction = false,
  showAttackAction = false,
  showDamageActions = false,
  showConcentrationAction = false,
  showSpellbookActions = false,
  showSpellbookBadges = false,
  actionStyle = 'button',
}: SpellCardWrapperProps) {
  const {
    activeCharacter,
    castSpell,
    startConcentration,
    endConcentration,
    learnSpell, unlearnSpell,
    learnCantrip, unlearnCantrip,
    prepareSpell, unprepareSpell,
    prepareSpellForClass, unprepareSpellForClass,
  } = useCharacterStore();
  const { addRoll } = useRollStore();
  const {
    canCast,
    isConcentratingOnThis,
    spellAttackBonus,
    isKnown,
    isPrepared,
    isCantripKnown,
    showCantripButton,
    showLearnButton,
    showPrepareButton,
    matchingClassIds,
    preparedClassIds,
    alwaysPreparedClassIds,
    cantripKnownClassIds,
  } = useSpellCapabilities(spell);
  const damageEntries = spell.damage?.entries ?? [];

  const isIconStyle = actionStyle === 'icon';
  const hasDamageEntries = damageEntries.length > 0;
  const canShowConcentrationAction = showConcentrationAction && spell.concentration && !!activeCharacter;
  const shouldUseSpellbookStateStyling = showSpellbookActions || showSpellbookBadges;
  const spellbookSurfaceVariant = isConcentratingOnThis
    ? 'warning'
    : isPrepared
      ? 'selected'
      : (isKnown || isCantripKnown)
        ? 'info'
        : 'default';
  const hasSharedActions = (
    showSpellbookActions
    || showCastAction
    || (showAttackAction && !!spell.attack)
    || (showDamageActions && hasDamageEntries)
    || canShowConcentrationAction
  );
  const shouldRenderActions = hasSharedActions || !!renderActions;

  const handleCast = () => {
    castSpell(spell.id, spell.level);
  };

  const handleAttackRoll = () => {
    if (!activeCharacter) {
      const result = rollDiceExpression(defaultRandom, '1d20 + 0');
      addRoll({ label: 'Attack', expression: '1d20 + 0', total: result.total });
      return;
    }

    const result = characterService.rollSpellAttack(activeCharacter, spell.name);
    addRoll({
      label: 'Spell Attack',
      expression: `d20 (${result.rawRoll}) + ${result.bonus}`,
      total: result.total,
    });
  };

  const handleDamageRoll = (index: number) => {
    if (!activeCharacter || !hasDamageEntries) return;

    const result = characterService.rollSpellDamage(activeCharacter, spell.id, index);
    const diceExpr = result.entries.map((entry) => `${entry.results.join('+')} (${entry.type})`).join(' + ');
    const modExpr = result.modifiers.length > 0
      ? ` + ${result.modifiers.reduce((sum, modifier) => sum + modifier.value, 0)}`
      : '';
    const damageType = damageEntries[index]?.type;

    addRoll({
      label: damageType ? `${damageType} Damage` : 'Damage',
      expression: `${diceExpr}${modExpr}`,
      total: result.total,
    });
  };

  const handleConcentrationToggle = () => {
    if (isConcentratingOnThis) {
      endConcentration();
      return;
    }
    startConcentration(spell.id);
  };

  const handleLearnToggle = () => {
    if (isKnown) {
      unlearnSpell(spell.id);
      return;
    }
    learnSpell(spell.id);
  };

  return (
    <SpellCardUI
      spell={spell}
      density={density}
      showDescription={showDescription}
      surfaceVariant={surfaceVariant ?? (shouldUseSpellbookStateStyling ? spellbookSurfaceVariant : undefined)}
      glow={glow ?? (shouldUseSpellbookStateStyling ? isPrepared : undefined)}
      onClick={onClick ? () => onClick() : undefined}
      renderDescription={renderInlineMarkdown}
      renderBadges={showSpellbookBadges
        ? () => (
          <>
            {(isKnown || isCantripKnown) && !isPrepared && (
              <Badge variant="info" size="sm">Known</Badge>
            )}
            {isPrepared && (
              <Badge variant="primary" size="sm">Prepared</Badge>
            )}
            {renderBadges?.()}
          </>
        )
        : renderBadges}
      renderActions={shouldRenderActions ? () => (
        <>
          {renderActions?.()}

          {showSpellbookActions && (
            <>
              {showCantripButton && (
                matchingClassIds.length > 1 ? (
                  <ClassActionDropdown
                    matchingClassIds={matchingClassIds}
                    activeClassIds={cantripKnownClassIds}
                    label="Cantrip"
                    onToggle={(classId) => {
                      if (cantripKnownClassIds.includes(classId)) {
                        unlearnCantrip(classId, spell.id);
                      } else {
                        learnCantrip(classId, spell.id);
                      }
                    }}
                  />
                ) : (
                  <IconButton
                    variant="info"
                    active={isCantripKnown}
                    onClick={() => {
                      const classId = matchingClassIds[0];
                      if (!classId) return;
                      if (isCantripKnown) {
                        unlearnCantrip(classId, spell.id);
                      } else {
                        learnCantrip(classId, spell.id);
                      }
                    }}
                    title={isCantripKnown ? 'Unlearn Cantrip' : 'Learn Cantrip'}
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                  </IconButton>
                )
              )}

              {showLearnButton && (
                <IconButton
                  variant="info"
                  active={isKnown}
                  onClick={handleLearnToggle}
                  title={isKnown ? 'Unlearn Spell' : 'Learn Spell'}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                </IconButton>
              )}

              {showPrepareButton && (
                matchingClassIds.length > 1 ? (
                  <ClassActionDropdown
                    matchingClassIds={matchingClassIds}
                    activeClassIds={preparedClassIds}
                    disabledActiveClassIds={alwaysPreparedClassIds}
                    label="Spell"
                    onToggle={(classId) => {
                      if (alwaysPreparedClassIds.includes(classId)) return;
                      if (preparedClassIds.includes(classId)) {
                        unprepareSpellForClass(classId, spell.id);
                      } else {
                        prepareSpellForClass(classId, spell.id);
                      }
                    }}
                    variant="primary"
                    active={isPrepared}
                  />
                ) : (
                  <IconButton
                    variant="primary"
                    active={isPrepared}
                    disabled={
                      matchingClassIds.length === 1
                        && alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
                    }
                    onClick={() => {
                      const classId = matchingClassIds[0];
                      if (isPrepared) {
                        if (classId && alwaysPreparedClassIds.includes(classId)) return;
                        const preparedClassId = preparedClassIds[0] ?? classId;
                        if (preparedClassId) {
                          unprepareSpellForClass(preparedClassId, spell.id);
                        } else {
                          unprepareSpell(spell.id);
                        }
                      } else if (classId) {
                        prepareSpellForClass(classId, spell.id);
                      } else {
                        prepareSpell(spell.id);
                      }
                    }}
                    title={
                      matchingClassIds.length === 1 && alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
                        ? 'Always Prepared'
                        : isPrepared
                          ? 'Unprepare Spell'
                          : 'Prepare Spell'
                    }
                  >
                    <Star className={`w-3.5 h-3.5 ${isPrepared ? 'fill-current' : ''}`} />
                  </IconButton>
                )
              )}
            </>
          )}

          {showCastAction && (
            isIconStyle ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCast}
                title="Cast Spell"
                disabled={!canCast}
                className="p-1.5"
              >
                <Zap className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCast}
                disabled={!canCast}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Cast
              </Button>
            )
          )}

          {showAttackAction && spell.attack && (
            isIconStyle ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAttackRoll}
                title="Roll Attack"
                className="p-1.5"
              >
                <Swords className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAttackRoll}
              >
                <Swords className="w-3.5 h-3.5 mr-1.5" />
                Attack {spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus}
              </Button>
            )
          )}

          {showDamageActions && hasDamageEntries && (
            isIconStyle ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDamageRoll(0)}
                  title="Roll Damage"
                  className="p-1.5"
                >
                  <Flame className="w-3 h-3" />
                </Button>
                {damageEntries.slice(1).map((entry, index) => (
                  <Button
                    key={`alt-damage-${index}-${entry.dice}-${entry.type ?? 'none'}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDamageRoll(index + 1)}
                    title={`Roll ${entry.dice} ${entry.type} Damage`}
                    className="p-1.5 text-[10px] font-bold"
                  >
                    {entry.dice}
                  </Button>
                ))}
              </>
            ) : (
              <>
                {damageEntries.map((entry, index) => (
                  <Button
                    key={`${entry.dice}-${entry.type ?? 'none'}-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDamageRoll(index)}
                  >
                    {entry.dice} {entry.type}
                  </Button>
                ))}
              </>
            )
          )}

          {canShowConcentrationAction && (
            isIconStyle ? (
              <Button
                variant={isConcentratingOnThis ? 'warning' : 'ghost'}
                size="sm"
                onClick={handleConcentrationToggle}
                title={isConcentratingOnThis ? 'End Concentration' : 'Start Concentration'}
                className="p-1.5"
              >
                <Activity className="w-3 h-3" />
              </Button>
            ) : (
              <IconButton
                variant="warning"
                active={isConcentratingOnThis}
                title={isConcentratingOnThis ? 'End Concentration' : 'Start Concentration'}
                onClick={handleConcentrationToggle}
              >
                <Activity className={`w-3.5 h-3.5 ${isConcentratingOnThis ? 'animate-pulse' : ''}`} />
              </IconButton>
            )
          )}
        </>
      ) : undefined}
    />
  );
}
