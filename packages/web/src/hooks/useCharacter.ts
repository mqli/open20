import { useCallback } from 'react';
import { useCharacterStore } from '@/stores';

export function useCharacter() {
  const store = useCharacterStore();
  const character = store.character;

  const proficiencyBonus = character?.combatStats?.proficiencyBonus ?? 2;

  return {
    // State
    character,
    isLoading: store.isLoading,
    error: store.error,
    hitPoints: character?.hitPoints,
    combatStats: character?.combatStats,
    resources: character?.resources,
    conditions: character?.conditions,
    spells: character?.spells,
    skills: character?.skills,
    abilityScores: character?.abilityScores,
    proficiencyBonus,

    // Actions
    damage: useCallback((amount: number) => store.damage(amount), [store]),
    heal: useCallback((amount: number) => store.heal(amount), [store]),
    setTempHP: useCallback((value: number) => store.setTempHP(value), [store]),
    useResource: useCallback((id: string) => store.useResource(id), [store]),
    recoverResource: useCallback((id: string) => store.recoverResource(id), [store]),
    castSpell: useCallback((level: number) => store.castSpell(level), [store]),
    recoverSpellSlot: useCallback((level: number) => store.recoverSpellSlot(level), [store]),
    toggleCondition: useCallback((condition: string) => store.toggleCondition(condition as any), [store]),
    doShortRest: useCallback((hitDice?: number) => store.doShortRest(hitDice), [store]),
    doLongRest: useCallback(() => store.doLongRest(), [store]),
  };
}
