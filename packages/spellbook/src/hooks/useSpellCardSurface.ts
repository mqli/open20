import { useSpellCardSurface as useSharedSpellCardSurface } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { resolveDeps } from '@/core/content-resolver';
import { useMemo } from 'react';
import type { Spell } from 'open20-core';

/**
 * Calculate the appropriate surface variant for a spell card
 * based on the character's relationship with the spell.
 */
export function useSpellCardSurface(
  spell: Spell | null | undefined,
): 'default' | 'tint' | 'selected' | 'warning' | 'info' {
  const activeCharacter = useCharacterStore((s) => s.activeCharacter);
  const deps = useMemo(
    () => (activeCharacter ? resolveDeps(activeCharacter) : { classes: {} }),
    [activeCharacter],
  );
  return useSharedSpellCardSurface(spell, activeCharacter, deps);
}
