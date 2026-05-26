import type { SpellLevel, SpellSlotEntry } from 'open20-core/types';
import { Select } from '@open20/ui';

const SPELL_LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

interface CastLevelSelectProps {
  selectedCastLevel: SpellLevel;
  onCastLevelChange: (level: SpellLevel) => void;
  availableCastLevels: SpellLevel[];
  spellSlots: Record<SpellLevel, SpellSlotEntry> | undefined;
  className: string;
}

export function CastLevelSelect({
  selectedCastLevel,
  onCastLevelChange,
  availableCastLevels,
  spellSlots,
  className,
}: CastLevelSelectProps) {
  return (
    <Select.Root
      value={String(selectedCastLevel)}
      onValueChange={(v) => onCastLevelChange(parseInt(v, 10) as SpellLevel)}
    >
      <Select.Trigger className={className} />
      <Select.Content>
        {availableCastLevels.map((lvl) => {
          const slot = spellSlots?.[lvl];
          const remaining = slot ? slot.total - slot.used : 0;
          return (
            <Select.Item key={lvl} value={String(lvl)}>
              {SPELL_LEVEL_LABELS[lvl]} ({remaining})
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
