import { Activity, BookMarked, ChevronDown, Flame, Sparkles, Star, Swords, Zap } from 'lucide-react';
import { canUpcast, defaultRandom, rollDiceExpression, type Spell } from 'open20-core';
import type { SpellLevel } from 'open20-core/types';
import type { ComponentProps, ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Badge, Button, IconButton, SpellCard as SpellCardUI, Select } from '@open20/ui';
import { ClassActionDropdown } from '@/components/spell/ClassActionDropdown';
import { characterService } from '@/core/character-service';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { renderInlineMarkdown } from '@/utils/inline-markdown';

const SPELL_LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

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

  // ── Cast-at-higher-level state ──
  const [selectedCastLevel, setSelectedCastLevel] = useState<SpellLevel>(() => spell.level as SpellLevel);

  // Compute levels available for casting (base level + upcast levels with available slots)
  const availableCastLevels = useMemo<SpellLevel[]>(() => {
    if (spell.level === 0) return [0 as SpellLevel]; // cantrips don't use slots
    if (!activeCharacter) return [spell.level as SpellLevel];

    const levels: SpellLevel[] = [];
    const slots = activeCharacter.spells.spellSlots;
    const pactSlots = activeCharacter.spells.pactMagicSlots;

    const maxLevel = canUpcast(spell) ? 9 : spell.level;
    for (let lvl = spell.level; lvl <= maxLevel; lvl++) {
      const slotLevel = lvl as SpellLevel;
      const regularSlot = (slots as any)[slotLevel];
      if (regularSlot && regularSlot.used < regularSlot.total) {
        levels.push(slotLevel);
        continue;
      }
      if (pactSlots && pactSlots.used < pactSlots.total && lvl <= pactSlots.level) {
        levels.push(slotLevel);
      }
    }

    // Always include base level (may be disabled if no slot)
    if (!levels.includes(spell.level as SpellLevel)) {
      levels.unshift(spell.level as SpellLevel);
    }

    return levels;
  }, [activeCharacter, spell]);

  // Effective cast level: falls back to first available level if selected is invalid
  const effectiveCastLevel = useMemo<SpellLevel>(() => {
    if (spell.level === 0) return 0 as SpellLevel;
    if (availableCastLevels.includes(selectedCastLevel)) return selectedCastLevel;
    return availableCastLevels[0] ?? spell.level as SpellLevel;
  }, [selectedCastLevel, availableCastLevels, spell.level]);

  // Damage entries adjusted for upcasting
  const effectiveDamageEntries = useMemo(() => {
    const entries = spell.damage?.entries ?? [];
    const perSlot = spell.damage?.perSlot;
    if (!perSlot || perSlot.length === 0 || effectiveCastLevel <= spell.level) return entries;

    const numLevels = effectiveCastLevel - spell.level;
    return entries.map((entry, i) => {
      if (i !== 0) return entry;
      const perSlotDice = perSlot[0]!.dice;
      const baseMatch = entry.dice.match(/(\d+)d(\d+)/);
      const slotMatch = perSlotDice.match(/(\d+)d(\d+)/);
      if (baseMatch && slotMatch && baseMatch[2] === slotMatch[2]) {
        const baseCount = parseInt(baseMatch[1]!);
        const slotCount = parseInt(slotMatch[1]!);
        return { ...entry, dice: `${baseCount + slotCount * numLevels}d${baseMatch[2]}` };
      }
      return entry;
    });
  }, [spell, effectiveCastLevel]);

  const handleCast = () => {
    castSpell(spell.id, effectiveCastLevel);
  };

  const renderCastLevelSelect = (opts: { className: string; children: React.ReactNode }) => (
    <Select.Root value={String(selectedCastLevel)} onValueChange={(v) => setSelectedCastLevel(parseInt(v, 10) as SpellLevel)}>
      <Select.Trigger className={opts.className}>{opts.children}</Select.Trigger>
      <Select.Content>
        {availableCastLevels.map((lvl) => {
          const slot = (activeCharacter?.spells.spellSlots as any)[lvl];
          const remaining = slot ? slot.total - slot.used : 0;
          return (
            <Select.Item key={lvl} value={String(lvl)}>
              {SPELL_LEVEL_LABELS[lvl]} ({remaining})
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );

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

    const result = characterService.rollSpellDamage(activeCharacter, spell.id, index, effectiveCastLevel);
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

          <div className="flex items-center gap-1.5 shrink-0">
            {showCastAction && (
              isIconStyle ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCast}
                  title={`Cast at ${SPELL_LEVEL_LABELS[effectiveCastLevel]}`}
                  disabled={!availableCastLevels.includes(effectiveCastLevel)}
                  className="p-1.5"
                >
                  <Zap className="w-3 h-3" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCast}
                  disabled={!availableCastLevels.includes(effectiveCastLevel)}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Cast
                </Button>
              )
            )}

            {spell.level > 0 && availableCastLevels.length > 1 && (showCastAction || showDamageActions) &&
              renderCastLevelSelect({
                className: isIconStyle
                  ? 'h-5 px-1 text-[10px] border-0 bg-transparent hover:bg-bg-secondary w-auto'
                  : 'h-auto py-1 px-2 border-input bg-background hover:bg-accent text-sm w-auto',
                children: null,
              })
            }

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
                {effectiveDamageEntries.slice(1).map((entry, index) => (
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
                {effectiveDamageEntries.map((entry, index) => (
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
          </div>

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
