// Deprecated: Use @open20/ui SlotPips instead
// This file is kept for backward compatibility

import { SlotPips } from '@open20/ui';

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
