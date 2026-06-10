import {
  defaultRandom,
  rollDiceExpression,
  type Spell,
  rollSpellDamage,
  rollSpellHeal,
  isCantrip,
} from 'open20-core';
import type { ComponentProps, ReactNode } from 'react';
import { SpellCard as SpellCardUI } from '@open20/ui';
import { characterService } from '@/core/character-service';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { useSpellCastLevel } from '@/hooks/useSpellCastLevel';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { ConcentrationToggle } from './ConcentrationToggle';
import { SpellActionRow } from './SpellActionRow';
import { SpellbookControls } from './SpellbookControls';
import { SpellStatusBadges } from './SpellStatusBadges';
import { useTranslation } from '@/i18n';

type SpellCardDensity = 'default' | 'compact';
type SpellActionStyle = 'button' | 'icon';

interface SpellCardWrapperProps {
  spell: Spell;
  density?: SpellCardDensity;
  className?: string;
  stickyActions?: boolean;
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
  className,
  stickyActions,
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
  const t = useTranslation();
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

  const {
    availableCastLevels,
    selectedCastLevel,
    setSelectedCastLevel,
    effectiveCastLevel,
    effectiveDamageEntries,
    effectiveHealDice,
  } = useSpellCastLevel(spell, activeCharacter);

  const damageEntries = spell.damage?.entries ?? [];
  const isIconStyle = actionStyle === 'icon';
  const hasDamageEntries = damageEntries.length > 0;
  const hasHealEntry = !!spell.heal?.dice;
  const canShowConcentrationAction =
    showConcentrationAction && spell.concentration && !!activeCharacter;
  const shouldUseSpellbookStateStyling = showSpellbookActions || showSpellbookBadges;
  const spellSlots = activeCharacter?.spells.spellSlots;

  const spellbookSurfaceVariant = isConcentratingOnThis
    ? 'warning'
    : isPrepared
      ? 'selected'
      : isKnown || isCantripKnown
        ? 'info'
        : 'default';

  const hasSharedActions =
    showSpellbookActions ||
    showCastAction ||
    (showAttackAction && !!spell.attack) ||
    (showDamageActions && (hasDamageEntries || hasHealEntry)) ||
    canShowConcentrationAction;
  const shouldRenderActions = hasSharedActions || !!renderActions;

  const handleCast = () => {
    castSpell(spell.id, effectiveCastLevel);
  };

  const handleAttackRoll = () => {
    if (!activeCharacter) {
      const result = rollDiceExpression(defaultRandom, '1d20 + 0');
      addRoll({ label: t('attack'), expression: '1d20 + 0', total: result.total });
      return;
    }

    const result = characterService.rollSpellAttack(activeCharacter, spell.name);
    addRoll({
      label: t('spellAttack'),
      expression: `d20 (${result.rawRoll}) + ${result.bonus}`,
      total: result.total,
    });
  };

  const handleDamageRoll = () => {
    if (!hasDamageEntries) return;
    const result = activeCharacter
      ? characterService.rollSpellDamage(activeCharacter, spell.id, effectiveCastLevel)
      : rollSpellDamage({
          spell,
          slotLevel: effectiveCastLevel,
          rng: defaultRandom,
        });
    const diceExpr = result.entries
      .map((entry) => `${entry.results.join('+')} (${entry.type})`)
      .join(' + ');
    const modExpr =
      result.modifiers.length > 0
        ? ` + ${result.modifiers.reduce((sum, modifier) => sum + modifier.value, 0)}`
        : '';

    addRoll({
      label: t('damageRoll'),
      expression: `${diceExpr}${modExpr}`,
      total: result.total,
    });
  };

  const handleHealRoll = () => {
    if (!effectiveHealDice) return;

    const result = activeCharacter
      ? characterService.rollSpellHeal(activeCharacter, spell.id, effectiveCastLevel)
      : rollSpellHeal({
          spell,
          slotLevel: effectiveCastLevel,
          rng: defaultRandom,
        });

    addRoll({
      label: t('healingRoll'),
      expression: result.expression,
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

  return (
    <SpellCardUI
      spell={spell}
      className={['spell-card', className].filter(Boolean).join(' ')}
      density={density}
      stickyActions={stickyActions}
      showDescription={showDescription}
      surfaceVariant={
        surfaceVariant ?? (shouldUseSpellbookStateStyling ? spellbookSurfaceVariant : undefined)
      }
      glow={glow ?? (shouldUseSpellbookStateStyling ? isPrepared : undefined)}
      onClick={onClick}
      renderBadges={
        showSpellbookBadges
          ? () => (
              <SpellStatusBadges
                isKnownOrCantrip={isKnown || isCantripKnown}
                isPrepared={isPrepared}
                renderBadges={renderBadges}
              />
            )
          : renderBadges
      }
      renderActions={
        shouldRenderActions
          ? () => (
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
                  isPrepared={isPrepared}
                  isIconStyle={isIconStyle}
                  showCastAction={!!activeCharacter && !!showCastAction && !isCantrip(spell)}
                  showAttackAction={showAttackAction}
                  showDamageActions={showDamageActions}
                  hasDamageEntries={hasDamageEntries}
                  hasHealEntry={hasHealEntry}
                  effectiveDamageEntries={effectiveDamageEntries}
                  healDice={effectiveHealDice}
                  availableCastLevels={availableCastLevels}
                  effectiveCastLevel={effectiveCastLevel}
                  selectedCastLevel={selectedCastLevel}
                  onCastLevelChange={setSelectedCastLevel}
                  spellAttackBonus={spellAttackBonus}
                  spellSlots={spellSlots}
                  onCast={handleCast}
                  onAttackRoll={handleAttackRoll}
                  onDamageRoll={handleDamageRoll}
                  onHealRoll={handleHealRoll}
                />

                {canShowConcentrationAction && (
                  <ConcentrationToggle
                    isConcentrating={isConcentratingOnThis}
                    isIconStyle={isIconStyle}
                    onToggle={handleConcentrationToggle}
                  />
                )}
              </>
            )
          : undefined
      }
    />
  );
}
