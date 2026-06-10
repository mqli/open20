import {
  defaultRandom,
  rollDiceExpression,
  rollSpellDamage,
  rollSpellHeal,
  isCantrip,
} from 'open20-core';
import type { Spell } from 'open20-core';
import { useCallback } from 'react';
import { SpellActionRow } from './SpellActionRow';
import { ConcentrationToggle } from './ConcentrationToggle';
import { SpellbookControls } from './SpellbookControls';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { useSpellCastLevel } from '@/hooks/useSpellCastLevel';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { characterService } from '@/core/character-service';
import { useTranslation } from '@/i18n';

interface SpellCardActionsProps {
  spell: Spell;
  showCast?: boolean;
  showAttack?: boolean;
  showDamage?: boolean;
  showConcentration?: boolean;
  showSpellbook?: boolean;
  actionStyle?: 'button' | 'icon';
  renderActions?: () => React.ReactNode;
}

export function SpellCardActions({
  spell,
  showCast = false,
  showAttack = false,
  showDamage = false,
  showConcentration = false,
  showSpellbook = false,
  actionStyle = 'button',
  renderActions,
}: SpellCardActionsProps) {
  const t = useTranslation();
  const { activeCharacter, castSpell, startConcentration, endConcentration } = useCharacterStore();
  const { addRoll } = useRollStore();
  const capabilities = useSpellCapabilities(spell);
  const castLevelState = useSpellCastLevel(spell, activeCharacter);

  const isIconStyle = actionStyle === 'icon';
  const hasDamageEntries = (spell.damage?.entries ?? []).length > 0;
  const hasHealEntry = !!spell.heal?.dice;
  const canShowConcentrationAction = showConcentration && spell.concentration && !!activeCharacter;

  const handleCast = useCallback(() => {
    castSpell(spell.id, castLevelState.effectiveCastLevel);
  }, [spell.id, castLevelState.effectiveCastLevel, castSpell]);

  const handleAttackRoll = useCallback(() => {
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
  }, [activeCharacter, spell.name, addRoll, t]);

  const handleDamageRoll = useCallback(() => {
    if (!hasDamageEntries) return;
    const result = activeCharacter
      ? characterService.rollSpellDamage(
          activeCharacter,
          spell.id,
          castLevelState.effectiveCastLevel,
        )
      : rollSpellDamage({
          spell,
          slotLevel: castLevelState.effectiveCastLevel,
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
  }, [activeCharacter, spell, castLevelState.effectiveCastLevel, hasDamageEntries, addRoll, t]);

  const handleHealRoll = useCallback(() => {
    if (!castLevelState.effectiveHealDice) return;

    const result = activeCharacter
      ? characterService.rollSpellHeal(activeCharacter, spell.id, castLevelState.effectiveCastLevel)
      : rollSpellHeal({
          spell,
          slotLevel: castLevelState.effectiveCastLevel,
          rng: defaultRandom,
        });

    addRoll({
      label: t('healingRoll'),
      expression: result.expression,
      total: result.total,
    });
  }, [
    activeCharacter,
    spell,
    castLevelState.effectiveCastLevel,
    castLevelState.effectiveHealDice,
    addRoll,
    t,
  ]);

  const handleConcentrationToggle = useCallback(() => {
    if (capabilities.isConcentratingOnThis) {
      endConcentration();
    } else {
      startConcentration(spell.id);
    }
  }, [capabilities.isConcentratingOnThis, startConcentration, endConcentration, spell.id]);

  const showCastAction = !!activeCharacter && !!showCast && !isCantrip(spell);
  const showAttackAction = showAttack && !!spell.attack;
  const showDamageActions = showDamage && (hasDamageEntries || hasHealEntry);

  const hasSharedActions =
    showSpellbook ||
    showCastAction ||
    showAttackAction ||
    showDamageActions ||
    canShowConcentrationAction;

  if (!hasSharedActions && !renderActions) return null;

  return (
    <>
      {renderActions?.()}
      {showSpellbook && (
        <SpellbookControls
          showCantripButton={capabilities.showCantripButton}
          showLearnButton={capabilities.showLearnButton}
          showPrepareButton={capabilities.showPrepareButton}
          isCantripKnown={capabilities.isCantripKnown}
          isKnown={capabilities.isKnown}
          isPrepared={capabilities.isPrepared}
          matchingClassIds={capabilities.matchingClassIds}
          cantripKnownClassIds={capabilities.cantripKnownClassIds}
          preparedClassIds={capabilities.preparedClassIds}
          alwaysPreparedClassIds={capabilities.alwaysPreparedClassIds}
          onLearnToggle={() => {
            if (capabilities.isKnown) {
              useCharacterStore.getState().unlearnSpell(spell.id);
            } else {
              useCharacterStore.getState().learnSpell(spell.id);
            }
          }}
          onCantripMultiToggle={(classId: string) => {
            if (capabilities.cantripKnownClassIds.includes(classId)) {
              useCharacterStore.getState().unlearnCantrip(classId, spell.id);
            } else {
              useCharacterStore.getState().learnCantrip(classId, spell.id);
            }
          }}
          onCantripSingleClick={() => {
            const classId = capabilities.matchingClassIds[0];
            if (!classId) return;
            if (capabilities.isCantripKnown) {
              useCharacterStore.getState().unlearnCantrip(classId, spell.id);
            } else {
              useCharacterStore.getState().learnCantrip(classId, spell.id);
            }
          }}
          onPrepareMultiToggle={(classId: string) => {
            if (capabilities.alwaysPreparedClassIds.includes(classId)) return;
            if (capabilities.preparedClassIds.includes(classId)) {
              useCharacterStore.getState().unprepareSpellForClass(classId, spell.id);
            } else {
              useCharacterStore.getState().prepareSpellForClass(classId, spell.id);
            }
          }}
          onPrepareSingleClick={() => {
            const classId = capabilities.matchingClassIds[0];
            if (capabilities.isPrepared) {
              if (classId && capabilities.alwaysPreparedClassIds.includes(classId)) return;
              const preparedClassId = capabilities.preparedClassIds[0] ?? classId;
              if (preparedClassId) {
                useCharacterStore.getState().unprepareSpellForClass(preparedClassId, spell.id);
              } else {
                useCharacterStore.getState().unprepareSpell(spell.id);
              }
            } else if (classId) {
              useCharacterStore.getState().prepareSpellForClass(classId, spell.id);
            } else {
              useCharacterStore.getState().prepareSpell(spell.id);
            }
          }}
        />
      )}
      <SpellActionRow
        spell={spell}
        isPrepared={capabilities.isPrepared}
        isIconStyle={isIconStyle}
        showCastAction={showCastAction}
        showAttackAction={showAttackAction}
        showDamageActions={showDamageActions}
        hasDamageEntries={hasDamageEntries}
        hasHealEntry={hasHealEntry}
        effectiveDamageEntries={castLevelState.effectiveDamageEntries}
        healDice={castLevelState.effectiveHealDice}
        availableCastLevels={castLevelState.availableCastLevels}
        effectiveCastLevel={castLevelState.effectiveCastLevel}
        selectedCastLevel={castLevelState.selectedCastLevel}
        onCastLevelChange={castLevelState.setSelectedCastLevel}
        spellAttackBonus={capabilities.spellAttackBonus}
        spellSlots={activeCharacter?.spells.spellSlots}
        onCast={handleCast}
        onAttackRoll={handleAttackRoll}
        onDamageRoll={handleDamageRoll}
        onHealRoll={handleHealRoll}
      />
      {canShowConcentrationAction && (
        <ConcentrationToggle
          isConcentrating={capabilities.isConcentratingOnThis}
          isIconStyle={isIconStyle}
          onToggle={handleConcentrationToggle}
        />
      )}
    </>
  );
}
