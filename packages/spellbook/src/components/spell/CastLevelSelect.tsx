import type { SpellLevel, SpellSlotEntry } from 'open20-core/types';
import { Select } from '@open20/ui';
import { useTranslation } from '@open20/ui';

const SPELL_LEVEL_LABELS = [
  'cantripLevel',
  'firstLevel',
  'secondLevel',
  'thirdLevel',
  'fourthLevel',
  'fifthLevel',
  'sixthLevel',
  'seventhLevel',
  'eighthLevel',
  'ninthLevel',
];

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
  const t = useTranslation();
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
              {t(SPELL_LEVEL_LABELS[lvl] as keyof typeof t)} ({remaining})
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
