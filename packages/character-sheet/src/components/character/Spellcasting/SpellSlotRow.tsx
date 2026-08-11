import { SlotPips, Text } from '@open20/ui';
import { cn } from '@open20/ui';

/** Map spell levels 1-3 to ordinal labels; display 'Cantrip' and 'Pact' for special rows. */
function levelLabel(level: number | 'Cantrip' | 'Pact'): string {
  if (level === 'Cantrip') return 'Cantrip';
  if (level === 'Pact') return 'Pact';
  if (level === 1) return '1st';
  if (level === 2) return '2nd';
  if (level === 3) return '3rd';
  return `${level}th`;
}

export interface SpellSlotRowProps {
  level: number | 'Cantrip' | 'Pact';
  total: number;
  used: number;
  onPipClick?: (index: number, isUsed: boolean) => void;
  className?: string;
}

export function SpellSlotRow({ level, total, used, onPipClick, className }: SpellSlotRowProps) {
  const available = total - used;

  return (
    <div className={cn('flex items-center gap-3 py-1.5', className)}>
      <Text variant="bodySm" weight="medium" className="w-16 shrink-0 text-right tabular-nums">
        {levelLabel(level)}
      </Text>

      {level === 'Cantrip' ? (
        <Text variant="bodySm" color="secondary" className="w-8 text-center">
          ∞
        </Text>
      ) : total === 0 ? (
        <Text variant="bodySm" color="secondary" className="w-8 text-center">
          —
        </Text>
      ) : (
        <SlotPips total={total} used={used} size="md" onPipClick={onPipClick} />
      )}

      <Text variant="bodySm" color="secondary" className="ml-auto tabular-nums">
        {level === 'Cantrip' ? '—' : `${available} / ${total}`}
      </Text>
    </div>
  );
}
