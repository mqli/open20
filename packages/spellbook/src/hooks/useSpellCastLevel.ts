import { useSpellCastLevel as useSharedSpellCastLevel } from '@open20/ui';
import type { Spell } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';

export function useSpellCastLevel(spell: Spell) {
  const activeCharacter = useCharacterStore((s) => s.activeCharacter);
  return useSharedSpellCastLevel(spell, activeCharacter);
}
