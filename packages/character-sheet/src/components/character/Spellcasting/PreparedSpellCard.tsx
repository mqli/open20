// PreparedSpellCard.tsx (T-116)
// Single prepared/known spell row: name, level badge, school, concentration/ritual icons, Cast button.

import { Brain, Clock, Wand2 } from 'lucide-react';
import { Badge, IconButton, Text } from '@open20/ui';
import type { SpellLevel, SpellSchool } from 'open20-core';

export interface PreparedSpellCardProps {
  spellId: string;
  spellName: string;
  spellLevel: SpellLevel;
  spellSchool: SpellSchool;
  concentration: boolean;
  ritual: boolean;
  /** The highest available slot level for this spell (null if no slots available). */
  highestAvailableSlot: SpellLevel | null;
  onCast: (slotLevel: SpellLevel) => void;
}

const SCHOOL_ABBREV: Partial<Record<SpellSchool, string>> = {
  Abjuration: 'Abj',
  Conjuration: 'Con',
  Divination: 'Div',
  Enchantment: 'Enc',
  Evocation: 'Evo',
  Illusion: 'Ill',
  Necromancy: 'Nec',
  Transmutation: 'Trs',
};

export function PreparedSpellCard({
  spellName,
  spellLevel,
  spellSchool,
  concentration,
  ritual,
  highestAvailableSlot,
  onCast,
}: PreparedSpellCardProps) {
  const isCantrip = spellLevel === 0;
  const canCast = isCantrip || highestAvailableSlot !== null;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-bg-tertiary/50 transition-colors group">
      {/* Left: spell name + badges */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Text variant="bodySm" className="truncate">
          {spellName}
        </Text>

        {/* Level badge */}
        <Badge variant={isCantrip ? 'info' : 'secondary'} size="sm">
          {isCantrip ? 'Cantrip' : `Lv${spellLevel}`}
        </Badge>

        {/* School */}
        <Text variant="caption" color="secondary">
          {SCHOOL_ABBREV[spellSchool] ?? spellSchool}
        </Text>

        {/* Concentration icon */}
        {concentration && (
          <Brain className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-label="Concentration" />
        )}

        {/* Ritual icon */}
        {ritual && <Clock className="w-3.5 h-3.5 text-secondary shrink-0" aria-label="Ritual" />}
      </div>

      {/* Right: Cast button */}
      <IconButton
        size="sm"
        aria-label={`Cast ${spellName}`}
        disabled={!canCast}
        onClick={() => onCast(isCantrip ? 0 : highestAvailableSlot!)}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <Wand2 className="w-4 h-4" />
      </IconButton>
    </div>
  );
}
