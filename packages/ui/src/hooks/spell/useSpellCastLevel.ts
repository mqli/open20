import { useEffect, useMemo, useState } from 'react';
import type { Spell, SpellLevel, Character } from 'open20-core';
import { getAvailableCastLevels, getScaledDamageEntries, getScaledHealDice } from 'open20-core';

function getInitialCastLevel(spell: Spell, character: Character | null | undefined): SpellLevel {
  const levels = getAvailableCastLevels(character, spell);
  if (levels.length === 0) return spell.level as SpellLevel;
  return levels.find((level) => level >= spell.level) ?? levels[0]!;
}

export function useSpellCastLevel(spell: Spell, character: Character | null | undefined) {
  const availableCastLevels = useMemo(
    () => getAvailableCastLevels(character, spell),
    [character, spell],
  );

  const characterLevel = useMemo(
    () => (character ? character.classes.reduce((sum, c) => sum + c.level, 0) : undefined),
    [character],
  );

  const [selectedCastLevel, setSelectedCastLevel] = useState<SpellLevel>(() =>
    getInitialCastLevel(spell, character),
  );

  // Reset selected cast level when spell changes (e.g. user navigates to a different spell)
  // spell.id is the stable signal; adding spell/character to deps would cause redundant resets
  useEffect(() => {
    setSelectedCastLevel(getInitialCastLevel(spell, character));
  }, [spell.id]);

  // Reset selected cast level when available levels change and current selection is no longer valid
  useEffect(() => {
    if (
      availableCastLevels.length > 0 &&
      spell.level > 0 &&
      !availableCastLevels.includes(selectedCastLevel)
    ) {
      setSelectedCastLevel(availableCastLevels[0]!);
    }
  }, [availableCastLevels, spell.level, selectedCastLevel]);

  const effectiveCastLevel = useMemo<SpellLevel>(() => {
    if (spell.level === 0) return 0 as SpellLevel;
    if (availableCastLevels.includes(selectedCastLevel)) return selectedCastLevel;
    return availableCastLevels[0] ?? (spell.level as SpellLevel);
  }, [selectedCastLevel, availableCastLevels, spell.level]);

  const effectiveDamageEntries = useMemo(
    () => getScaledDamageEntries(spell, effectiveCastLevel, characterLevel),
    [spell, effectiveCastLevel, characterLevel],
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
