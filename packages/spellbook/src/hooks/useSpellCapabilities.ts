import { useSpellCapabilities as useSharedSpellCapabilities } from '@open20/ui';
import type { SpellCapabilities } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { resolveDeps } from '@/core/content-resolver';
import { useMemo } from 'react';
import type { Spell } from 'open20-core';

export type { SpellCapabilities };

export function useSpellCapabilities(spell: Spell | null | undefined): SpellCapabilities {
  const activeCharacter = useCharacterStore((s) => s.activeCharacter);
  const deps = useMemo(
    () => (activeCharacter ? resolveDeps(activeCharacter) : { classes: {} }),
    [activeCharacter],
  );
  return useSharedSpellCapabilities(spell, activeCharacter, deps);
}
