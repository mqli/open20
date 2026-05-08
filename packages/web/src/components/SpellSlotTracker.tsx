import type { SpellSlotEntry } from '@/types/open20-core';

interface SpellSlotTrackerProps {
  slots: Record<number, SpellSlotEntry>;
  onConsume: (level: number) => void;
  onRecover: (level: number) => void;
}

export function SpellSlotTracker({ slots, onConsume, onRecover }: SpellSlotTrackerProps) {
  const hasSlots = Object.values(slots).some((slot) => slot.total > 0);
  if (!hasSlots) return null;

  return (
    <div className="space-y-3 py-2">
      {Object.entries(slots)
        .filter(([_, slot]) => slot.total > 0)
        .map(([level, slot]) => (
          <div key={level} className="flex items-center gap-3">
            <span className="text-sm font-medium w-10 shrink-0">L{level}</span>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: slot.total }).map((_, i) => {
                const used = i < slot.used;
                return (
                  <button
                    key={i}
                    onClick={() => (used ? onRecover(Number(level)) : onConsume(Number(level)))}
                    className={`w-8 h-8 rounded-full border-2 transition-resource touch-target ${
                      used
                        ? 'bg-[--color-text-muted] border-[--color-text-muted]'
                        : 'bg-[--color-accent-purple]/20 border-[--color-accent-purple] hover:bg-[--color-accent-purple]/30'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs text-[--color-text-secondary] shrink-0">
              ({slot.total - slot.used}/{slot.total})
            </span>
          </div>
        ))}
    </div>
  );
}
