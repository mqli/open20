import { useRollStore } from '@/stores/roll-store';
import { Dices, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IconButton, Surface, Text } from '@open20/ui';

export function DiceRollOverlay() {
  const { latestRoll } = useRollStore();
  const [dismissedRollId, setDismissedRollId] = useState<string | null>(null);

  // Reset dismissed state when latestRoll changes (new roll)
  useEffect(() => {
    if (!latestRoll) return;

    // Defer state update to avoid cascading renders
    const timer = setTimeout(() => {
      setDismissedRollId(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [latestRoll]);

  if (!latestRoll) return null;

  const isVisible = latestRoll.id !== dismissedRollId;

  const handleTransitionEnd = () => {
    // Animation complete - no state update needed
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-info rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

        <Surface variant="primary" padding="lg" shadow="xl" className="relative rounded-2xl flex items-center gap-6 min-w-[320px]">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-inner transform rotate-3 hover:rotate-0 transition-transform">
            <Dices className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <Text weight="black" color="accent" className="uppercase tracking-[0.2em] mb-1">
              {latestRoll.label || 'Roll Result'}
            </Text>
            <div className="flex items-baseline gap-2">
              <Text as="span" className="text-4xl font-black tabular-nums">
                {latestRoll.total}
              </Text>
              <Text as="span" size="xs" weight="medium" color="tertiary">
                {latestRoll.expression}
              </Text>
            </div>
          </div>

          <IconButton
            variant="secondary"
            size="sm"
            onClick={() => setDismissedRollId(latestRoll.id)}
            className="text-text-tertiary hover:text-primary-600"
          >
            <X />
          </IconButton>
        </Surface>
      </div>
    </div>
  );
}
