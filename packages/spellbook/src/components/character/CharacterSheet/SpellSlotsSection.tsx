import { Flame } from 'lucide-react';
import { SectionHeader, SlotPips, Text } from '@open20/ui';
import type { SpellLevel } from 'open20-core/types';

const SPELL_LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

interface SlotEntry {
  lvl: SpellLevel;
  slot: { total: number; used: number };
}

interface SpellSlotsSectionProps {
  slotEntries: SlotEntry[];
  isMulticlass: boolean;
  onConsumeSlot: (level: SpellLevel) => void;
  onRecoverSlot: (level: SpellLevel) => void;
}

export function SpellSlotsSection({
  slotEntries, isMulticlass, onConsumeSlot, onRecoverSlot,
}: SpellSlotsSectionProps) {
  if (slotEntries.length === 0) return null;

  return (
    <section>
      <SectionHeader
        icon={<Flame className="w-3 h-3" />}
        title="Spell Slots"
        action={isMulticlass ? <Text size="xs">(Combined)</Text> : undefined}
      />
      <div className="space-y-3">
        {slotEntries.map(({ lvl, slot }) => (
          <div key={lvl} className="flex items-center gap-3">
            <Text variant="label" className="w-10 flex-shrink-0">
              {SPELL_LEVEL_LABELS[lvl]}
            </Text>
            <SlotPips
              total={slot.total}
              used={slot.used}
              onPipClick={(_index, isUsed) => isUsed ? onRecoverSlot(lvl) : onConsumeSlot(lvl)}
            />
            <Text variant="caption" weight="bold" className="flex-shrink-0 w-8 text-right">
              {slot.total - slot.used}/{slot.total}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
