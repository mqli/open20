// Deprecated: Use ui/SlotPips instead
// This file is kept for backward compatibility

import { SlotPips } from '@/components/ui/SlotPips';

interface SpellSlotPipsProps {
  level: number;
  total: number;
  used: number;
  onConsume: (level: number) => void;
  onRecover: (level: number) => void;
}

export function SpellSlotPips({ level, total, used, onConsume, onRecover }: SpellSlotPipsProps) {
  return (
    <SlotPips
      total={total}
      used={used}
      onPipClick={(_index, isUsed) => isUsed ? onRecover(level) : onConsume(level)}
    />
  );
}
