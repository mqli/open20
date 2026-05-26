import { canUpcast, defaultRandom, rollDiceExpression, type Spell } from 'open20-core';
import type { SpellLevel } from 'open20-core/types';
import type { ComponentProps, ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { SpellCard as SpellCardUI } from '@open20/ui';
import { characterService } from '@/core/character-service';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { renderInlineMarkdown } from '@/utils/inline-markdown';
import { ConcentrationToggle } from './ConcentrationToggle';
import { SpellActionRow } from './SpellActionRow';
import { SpellbookControls } from './SpellbookControls';
import { SpellStatusBadges } from './SpellStatusBadges';

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
    learnSpell,
    unlearnSpell,
    learnCantrip,
    unlearnCantrip,
    prepareSpell,
    unprepareSpell,
    prepareSpellForClass,
    unprepareSpellForClass,
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

  const spellSlots = activeCharacter?.spells.spellSlots;

  const availableCastLevels = useMemo<SpellLevel[]>(() => {
    if (spell.level === 0) return [0 as SpellLevel];
    if (!activeCharacter) return [spell.level as SpellLevel];

    const levels: SpellLevel[] = [];
    const slots = activeCharacter.spells.spellSlots;
    const pactSlots = activeCharacter.spells.pactMagicSlots;
    const maxLevel = canUpcast(spell) ? 9 : spell.level;

    for (let lvl = spell.level; lvl <= maxLevel; lvl++) {
      const slotLevel = lvl as SpellLevel;
      const regularSlot = slots[slotLevel];
      if (regularSlot && regularSlot.used < regularSlot.total) {
        levels.push(slotLevel);
        continue;
      }
      if (pactSlots && pactSlots.used < pactSlots.total && lvl <= pactSlots.level) {
        levels.push(slotLevel);
      }
    }

    return levels;
  }, [activeCharacter, spell]);

  const effectiveCastLevel = useMemo<SpellLevel>(() => {
    if (spell.level === 0) return 0 as SpellLevel;
    if (availableCastLevels.includes(selectedCastLevel)) return selectedCastLevel;
    const fallback = availableCastLevels[0] ?? spell.level as SpellLevel;
    if (fallback !== selectedCastLevel) {
      setSelectedCastLevel(fallback);
    }
    return fallback;
  }, [selectedCastLevel, availableCastLevels, spell.level]);

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

  // ── Handlers ──

  const handleCast = () => {
    castSpell(spell.id, effectiveCastLevel);
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
    } else {
      startConcentration(spell.id);
    }
  };

  const handleLearnToggle = () => {
    if (isKnown) {
      unlearnSpell(spell.id);
    } else {
      learnSpell(spell.id);
    }
  };

  const handleCantripMultiToggle = (classId: string) => {
    if (cantripKnownClassIds.includes(classId)) {
      unlearnCantrip(classId, spell.id);
    } else {
      learnCantrip(classId, spell.id);
    }
  };

  const handleCantripSingleClick = () => {
    const classId = matchingClassIds[0];
    if (!classId) return;
    if (isCantripKnown) {
      unlearnCantrip(classId, spell.id);
    } else {
      learnCantrip(classId, spell.id);
    }
  };

  const handlePrepareMultiToggle = (classId: string) => {
    if (alwaysPreparedClassIds.includes(classId)) return;
    if (preparedClassIds.includes(classId)) {
      unprepareSpellForClass(classId, spell.id);
    } else {
      prepareSpellForClass(classId, spell.id);
    }
  };

  const handlePrepareSingleClick = () => {
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
  };

  // ── Render ──

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
          <SpellStatusBadges
            isKnownOrCantrip={isKnown || isCantripKnown}
            isPrepared={isPrepared}
            renderBadges={renderBadges}
          />
        )
        : renderBadges}
      renderActions={shouldRenderActions ? () => (
        <>
          {renderActions?.()}

          {showSpellbookActions && (
            <SpellbookControls
              showCantripButton={showCantripButton}
              showLearnButton={showLearnButton}
              showPrepareButton={showPrepareButton}
              isCantripKnown={isCantripKnown}
              isKnown={isKnown}
              isPrepared={isPrepared}
              matchingClassIds={matchingClassIds}
              cantripKnownClassIds={cantripKnownClassIds}
              preparedClassIds={preparedClassIds}
              alwaysPreparedClassIds={alwaysPreparedClassIds}
              onLearnToggle={handleLearnToggle}
              onCantripMultiToggle={handleCantripMultiToggle}
              onCantripSingleClick={handleCantripSingleClick}
              onPrepareMultiToggle={handlePrepareMultiToggle}
              onPrepareSingleClick={handlePrepareSingleClick}
            />
          )}

          <SpellActionRow
            spell={spell}
            isIconStyle={isIconStyle}
            showCastAction={showCastAction}
            showAttackAction={showAttackAction}
            showDamageActions={showDamageActions}
            hasDamageEntries={hasDamageEntries}
            effectiveDamageEntries={effectiveDamageEntries}
            availableCastLevels={availableCastLevels}
            effectiveCastLevel={effectiveCastLevel}
            selectedCastLevel={selectedCastLevel}
            onCastLevelChange={setSelectedCastLevel}
            spellAttackBonus={spellAttackBonus}
            spellSlots={spellSlots}
            onCast={handleCast}
            onAttackRoll={handleAttackRoll}
            onDamageRoll={handleDamageRoll}
          />

          {canShowConcentrationAction && (
            <ConcentrationToggle
              isConcentrating={isConcentratingOnThis}
              isIconStyle={isIconStyle}
              onToggle={handleConcentrationToggle}
            />
          )}
        </>
      ) : undefined}
    />
  );
}
