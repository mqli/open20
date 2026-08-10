// CombatStatsBar.tsx (T-108)
// Composes CombatStatCards for AC / Initiative / Speed / PP / PB
// from character.combatStats. Initiative tap calls rollAdapter.rollInitiative.
// Desktop: horizontal row; Mobile: 2x2 grid.
// Leaves Inspiration slot (filled by T-219).

import { Shield, Swords, Footprints, Eye, Star, Sparkles } from 'lucide-react';
import type { AppCharacter } from '@/types';
import { cn } from '@open20/ui';
import { rollInitiative } from '@/core/roll-adapter';
import { CombatStatCard } from './CombatStatCard';

export interface CombatStatsBarProps {
  character: AppCharacter;
  /** Called when the Inspiration card is tapped. If omitted, the card is non-interactive. */
  onToggleInspiration?: () => void;
  className?: string;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function CombatStatsBar({ character, onToggleInspiration, className }: CombatStatsBarProps) {
  const { combatStats } = character;

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {/* AC — not rollable */}
      <CombatStatCard icon={Shield} label="AC" value={String(combatStats.AC)} />

      {/* Initiative — rollable */}
      <CombatStatCard
        icon={Swords}
        label="Init"
        value={fmt(combatStats.initiative)}
        onTap={() => rollInitiative(character)}
      />

      {/* Speed — not rollable */}
      <CombatStatCard icon={Footprints} label="Speed" value={`${combatStats.speed} ft`} />

      {/* Passive Perception — not rollable */}
      <CombatStatCard icon={Eye} label="PP" value={String(combatStats.passivePerception)} />

      {/* Proficiency Bonus — not rollable */}
      <CombatStatCard icon={Star} label="PB" value={fmt(combatStats.proficiencyBonus)} />

      {/* Inspiration — toggleable, filled primary-400 when active */}
      <CombatStatCard
        icon={Sparkles}
        label="Insp"
        value={character.inspiration ? 'ON' : '—'}
        iconClassName={character.inspiration ? 'text-primary-400' : undefined}
        onTap={onToggleInspiration}
      />
    </div>
  );
}
