import { SlotPips, Text } from '@open20/ui';
import { cn } from '@open20/ui';

const LEVEL_LABELS: Record<string, string> = {
  Cantrip: 'Cantrip',
  '1': '1st',
  '2': '2nd',
  '3': '3rd',
};

function levelLabel(level: number | 'Cantrip'): string {
  if (level === 'Cantrip') return 'Cantrip';
  return LEVEL_LABELS[String(level)] ?? `${level}th`;
}

export interface SpellSlotRowProps {
  level: number | 'Cantrip';
  total: number;
  used: number;
  className?: string;
}

export function SpellSlotRow({ level, total, used, className }: SpellSlotRowProps) {
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
        <SlotPips total={total} used={used} size="md" />
      )}

      <Text variant="bodySm" color="secondary" className="ml-auto tabular-nums">
        {level === 'Cantrip' ? '—' : `${available} / ${total}`}
      </Text>
    </div>
  );
}
