import { useMemo, useState } from 'react';
import type { Spell, SpellLevel } from 'open20-core';
import { getAvailableCastLevels, getScaledDamageEntries, getScaledHealDice } from 'open20-core';
import type { AppCharacter } from '@/core/types';

function getInitialCastLevel(
  spell: Spell,
  activeCharacter: AppCharacter | null | undefined,
): SpellLevel {
  const levels = getAvailableCastLevels(activeCharacter, spell);
  if (levels.length === 0) return spell.level as SpellLevel;
  return levels.find((level) => level >= spell.level) ?? levels[0]!;
}

export function useSpellCastLevel(spell: Spell, activeCharacter: AppCharacter | null | undefined) {
  const availableCastLevels = useMemo(
    () => getAvailableCastLevels(activeCharacter, spell),
    [activeCharacter, spell],
  );

  const [selectedCastLevel, setSelectedCastLevel] = useState<SpellLevel>(() =>
    getInitialCastLevel(spell, activeCharacter),
  );

  const effectiveCastLevel = useMemo<SpellLevel>(() => {
    if (spell.level === 0) return 0 as SpellLevel;
    if (availableCastLevels.includes(selectedCastLevel)) return selectedCastLevel;
    return availableCastLevels[0] ?? (spell.level as SpellLevel);
  }, [selectedCastLevel, availableCastLevels, spell.level]);

  const [prevAvailable, setPrevAvailable] = useState(availableCastLevels);
  if (prevAvailable !== availableCastLevels) {
    setPrevAvailable(availableCastLevels);
    if (
      availableCastLevels.length > 0 &&
      spell.level > 0 &&
      !availableCastLevels.includes(selectedCastLevel)
    ) {
      setSelectedCastLevel(availableCastLevels[0]!);
    }
  }

  const effectiveDamageEntries = useMemo(
    () => getScaledDamageEntries(spell, effectiveCastLevel),
    [spell, effectiveCastLevel],
  );

  const effectiveHealDice = useMemo(
    () => getScaledHealDice(spell, effectiveCastLevel),
    [spell, effectiveCastLevel],
  );

  return {
    availableCastLevels,
    selectedCastLevel,
    setSelectedCastLevel,
    effectiveCastLevel,
    effectiveDamageEntries,
    effectiveHealDice,
  };
}
