import type { Spell, Character, RecomputeDerivedStatsDeps } from 'open20-core';
import { useSpellCapabilities } from './useSpellCapabilities';

/**
 * Calculate the appropriate surface variant for a spell card
 * based on the character's relationship with the spell.
 */
export function useSpellCardSurface(
  spell: Spell | null | undefined,
  character: Character | null | undefined,
  deps: RecomputeDerivedStatsDeps,
): 'default' | 'tint' | 'selected' | 'warning' | 'info' {
  const { isConcentratingOnThis, isPrepared, isKnown, isCantripKnown } = useSpellCapabilities(
    spell,
    character,
    deps,
  );

  if (isConcentratingOnThis) return 'warning';
  if (isPrepared) return 'selected';
  if (isKnown || isCantripKnown) return 'info';
  return 'default';
}
