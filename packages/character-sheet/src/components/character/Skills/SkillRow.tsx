// SkillRow.tsx (T-104)
// Single skill row: proficiency icon, name, right-aligned bold bonus,
// roll IconButton. Reads derived values as props; emits roll callback.
//
// Proficiency states (NFR-01 — color + shape):
//   ○ Circle   — not proficient (secondary)
//   ▣ CircleDot — proficient (primary-600)
//   ★ Star     — expertise (warning)

import { Circle, CircleDot, Star, Dices } from 'lucide-react';
import type { SkillName, SkillEntry } from 'open20-core/types';
import { IconButton, Text, cn } from '@open20/ui';

import type { RollModifierType } from '@/core/roll-adapter';

export interface SkillRowProps {
  skill: SkillName;
  bonus: number;
  skillEntry: SkillEntry;
  onRoll: (skill: SkillName, rollModifier: RollModifierType) => void;
}

function fmtBonus(n: number): string {
  return n >= 0 ? `+${n}` : `−${Math.abs(n)}`;
}

function ProficiencyIcon({ skillEntry }: { skillEntry: SkillEntry }) {
  if (skillEntry.expertise) {
    return <Star className="h-4 w-4 text-warning" aria-hidden="true" />;
  }
  if (skillEntry.proficient) {
    return <CircleDot className="h-4 w-4 text-primary-600" aria-hidden="true" />;
  }
  return <Circle className="h-4 w-4 text-text-secondary" aria-hidden="true" />;
}

export function SkillRow({ skill, bonus, skillEntry, onRoll }: SkillRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      {/* Left: proficiency icon + name */}
      <div className="flex items-center gap-2 min-w-0">
        <ProficiencyIcon skillEntry={skillEntry} />
        <Text variant="body" className="truncate">
          {skill}
        </Text>
      </div>

      {/* Right: bonus + roll button */}
      <div className="flex items-center gap-2 shrink-0">
        <Text
          variant="body"
          weight="bold"
          className={cn('tabular-nums', bonus < 0 ? 'text-danger' : undefined)}
        >
          {fmtBonus(bonus)}
        </Text>
        <IconButton
          onClick={() => onRoll(skill, 'none')}
          aria-label={`Roll ${skill}`}
          variant="secondary"
        >
          <Dices className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
