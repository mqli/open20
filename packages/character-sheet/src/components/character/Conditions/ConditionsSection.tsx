// ConditionsSection.tsx — T-209
// Composes ConcentrationBanner + ConditionsPanel into one section.
// ConditionsPanel already includes condition chips, AddConditionMenu, and ExhaustionTracker.

import { useMemo, useCallback } from 'react';
import type { ConditionName, ActiveCondition } from 'open20-core';
import { isConcentrating, getConcentratingSpellId, calculateConcentrationDC } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { getSpellName } from '@/core/content-resolver';
import { ConcentrationBanner } from '@/components/character/Spellcasting';
import { ConditionsPanel } from './Conditions';

export interface ConditionsSectionProps {
  className?: string;
}

export function ConditionsSection({ className }: ConditionsSectionProps) {
  const character = useCharacterStore((s) => s.character);
  const toggleCondition = useCharacterStore((s) => s.toggleCondition);
  const lastDamage = useCharacterStore((s) => s.lastDamageForConcentration);

  // Concentration state
  const concentrating = useMemo(
    () => (character ? isConcentrating(character) : false),
    [character],
  );

  const concentratingSpellId = useMemo(
    () => (character ? getConcentratingSpellId(character) : null),
    [character],
  );

  const spellName = useMemo(
    () => (concentratingSpellId ? getSpellName(concentratingSpellId) : null),
    [concentratingSpellId],
  );

  const concentrationDC = useMemo(
    () => (lastDamage !== null ? calculateConcentrationDC(lastDamage) : null),
    [lastDamage],
  );

  const handleEndConcentration = useCallback(() => {
    useCharacterStore.getState().endConcentration();
  }, []);

  const handleRollConcentrationSave = useCallback(() => {
    if (lastDamage !== null) {
      useCharacterStore.getState().makeConcentrationSave(lastDamage);
    }
  }, [lastDamage]);

  const handleToggleCondition = useCallback(
    (id: ConditionName) => {
      toggleCondition(id);
    },
    [toggleCondition],
  );

  if (!character) return null;

  const conditions: readonly ActiveCondition[] = character.conditions;

  return (
    <div className={className}>
      {/* Concentration Banner (only when concentrating) */}
      {concentrating && spellName && (
        <ConcentrationBanner
          spellName={spellName}
          damageAmount={lastDamage}
          concentrationDC={concentrationDC}
          onEndConcentration={handleEndConcentration}
          onRollConcentrationSave={handleRollConcentrationSave}
        />
      )}

      {/* Conditions panel: chips + add menu + exhaustion tracker */}
      <ConditionsPanel conditions={conditions} onToggle={handleToggleCondition} />
    </div>
  );
}
