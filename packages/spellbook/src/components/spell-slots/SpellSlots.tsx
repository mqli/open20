import { Divider, SlotPips, Text, SectionHeader, SpellSlotIcon } from '@open20/ui';
import type { SpellLevel } from 'open20-core/types';

const SPELL_LEVEL_LABELS = [
  'Cantrip',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
];

interface SpellSlot {
  total: number;
  used: number;
}

interface SpellSlotsProps {
  slots: Record<number, SpellSlot>;
  pactMagicSlots?: { total: number; used: number; level: number } | null;
  onConsumeSlot: (level: SpellLevel) => void;
  onRecoverSlot: (level: SpellLevel) => void;
  onConsumePactSlot?: () => void;
  onRecoverPactSlot?: () => void;
  density?: 'default' | 'compact';
  showLabels?: boolean;
  isMulticlass?: boolean;
}

export function SpellSlots({
  slots,
  pactMagicSlots,
  onConsumeSlot,
  onRecoverSlot,
  onConsumePactSlot,
  onRecoverPactSlot,
  density = 'default',
  showLabels = true,
  isMulticlass = false,
}: SpellSlotsProps) {
  const isCompact = density === 'compact';

  const slotEntries = Object.entries(slots)
    .map(([lvl, slot]) => ({ lvl: parseInt(lvl, 10) as SpellLevel, slot }))
    .filter(({ lvl, slot }) => lvl > 0 && slot.total > 0)
    .sort((a, b) => a.lvl - b.lvl);

  if (slotEntries.length === 0 && !pactMagicSlots) return null;

  if (isCompact) {
    return (
      <>
        {slotEntries.length > 0 && (
          <div className="flex items-center gap-1.5">
            {slotEntries.map(({ lvl, slot }) => (
              <>
                <Divider orientation="vertical" />
                <SlotPips
                  key={lvl}
                  total={slot.total}
                  used={slot.used}
                  onPipClick={(_index, isUsed) =>
                    isUsed ? onRecoverSlot(lvl) : onConsumeSlot(lvl)
                  }
                />
              </>
            ))}
          </div>
        )}

        {pactMagicSlots && onConsumePactSlot && onRecoverPactSlot && (
          <>
            <Divider orientation="vertical" />
            <Text variant="label" className="text-text-tertiary mr-0.5">
              Pact Lvl {pactMagicSlots.level}
            </Text>
            <SlotPips
              total={pactMagicSlots.total}
              used={pactMagicSlots.used}
              onPipClick={(_index, isUsed) => (isUsed ? onRecoverPactSlot() : onConsumePactSlot())}
            />
          </>
        )}
      </>
    );
  }

  return (
    <section>
      {showLabels && (
        <SectionHeader
          icon={<SpellSlotIcon size="xs" />}
          title="Spell Slots"
          action={isMulticlass ? <Text size="xs">(Combined)</Text> : undefined}
        />
      )}
      <div className="space-y-3">
        {slotEntries.map(({ lvl, slot }) => (
          <div key={lvl} className="flex items-center gap-3">
            <Text variant="label" className="w-10 shrink-0">
              {SPELL_LEVEL_LABELS[lvl]}
            </Text>
            <SlotPips
              total={slot.total}
              used={slot.used}
              onPipClick={(_index, isUsed) => (isUsed ? onRecoverSlot(lvl) : onConsumeSlot(lvl))}
            />
            <Text variant="caption" weight="bold" className="shrink-0 w-8 text-right">
              {slot.total - slot.used}/{slot.total}
            </Text>
          </div>
        ))}

        {pactMagicSlots && onConsumePactSlot && onRecoverPactSlot && (
          <div className="flex items-center gap-3">
            <Text variant="label" className="w-10 shrink-0">
              Pact {SPELL_LEVEL_LABELS[pactMagicSlots.level]}
            </Text>
            <SlotPips
              total={pactMagicSlots.total}
              used={pactMagicSlots.used}
              onPipClick={(_index, isUsed) => (isUsed ? onRecoverPactSlot() : onConsumePactSlot())}
            />
            <Text variant="caption" weight="bold" className="shrink-0 w-8 text-right">
              {pactMagicSlots.total - pactMagicSlots.used}/{pactMagicSlots.total}
            </Text>
          </div>
        )}
      </div>
    </section>
  );
}
