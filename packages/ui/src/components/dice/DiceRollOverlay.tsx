import { useRollStore, type RollResult, type RollResultRow } from '@/stores/rollStore';
import { Dices, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { IconButton } from '@/components/base/IconButton/index';
import { Surface } from '@/components/base/Surface/index';
import { Text } from '@/components/base/Text/index';

/** Format a modifier breakdown as e.g. "WIS +3 | PB +2". */
function formatComponents(components: RollResult['components']): string | null {
  if (!components || components.length === 0) return null;
  return components.map((c) => `${c.source} ${c.value >= 0 ? '+' : ''}${c.value}`).join(' | ');
}

/** Detect `prefers-reduced-motion` so we can disable the shake/transition. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/** A single modifier-breakdown line, rendered under an expression. */
function ComponentBreakdown({ components }: { components: RollResult['components'] }) {
  const text = formatComponents(components);
  if (!text) return null;
  return (
    <Text as="p" size="xs" weight="medium" color="tertiary" className="tabular-nums">
      {text}
    </Text>
  );
}

/** One stacked row of a weapon-attack roll (attack row, then damage row). */
function WeaponRow({ row }: { row: RollResultRow }) {
  return (
    <div className="flex flex-col">
      <Text
        as="span"
        size="xs"
        weight="black"
        color="accent"
        className="uppercase tracking-[0.15em]"
      >
        {row.label}
      </Text>
      <div className="flex items-baseline gap-2">
        <Text as="span" className="text-2xl font-black tabular-nums">
          {row.total}
        </Text>
        <Text as="span" size="xs" weight="medium" color="tertiary">
          {row.expression}
        </Text>
      </div>
      <ComponentBreakdown components={row.components} />
    </div>
  );
}

/**
 * Floating overlay that surfaces the most recent dice roll from
 * {@link useRollStore}. Supports single rolls, weapon-attack dual-row mode,
 * modifier breakdowns, and critical hit/miss states with a non-color glyph
 * (🎯 / 💥) in addition to color. Respects `prefers-reduced-motion`.
 *
 * Reads the roll store internally and takes no props.
 */
export function DiceRollOverlay() {
  const { latestRoll } = useRollStore();
  const [dismissedRollId, setDismissedRollId] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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
  const isWeaponMode = latestRoll.mode === 'weapon-attack' && !!latestRoll.rows?.length;

  // Non-color crit indicators (NFR-01): glyph + color, not color alone.
  const critGlyph = latestRoll.isCritical ? '🎯' : latestRoll.isCriticalMiss ? '💥' : null;
  const totalColorClass = latestRoll.isCritical
    ? 'text-success'
    : latestRoll.isCriticalMiss
      ? 'text-danger'
      : '';

  const motionClasses = prefersReducedMotion ? '' : 'transition-all duration-500 ease-out';
  const visibilityClasses = isVisible
    ? 'translate-y-0 opacity-100'
    : `${prefersReducedMotion ? '' : 'translate-y-12'} opacity-0 pointer-events-none`;
  const diceMotionClasses = prefersReducedMotion
    ? ''
    : 'transform rotate-3 hover:rotate-0 transition-transform';

  return (
    <div
      role="status"
      aria-live="polite"
      onPointerDown={(e) => {
        // Stop native pointerdown from bubbling to document, so Radix's
        // DismissableLayer doesn't treat this as an "outside click" and
        // close the underlying Sheet/Dialog.
        e.nativeEvent.stopPropagation();
      }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-100 pointer-events-auto ${motionClasses} ${visibilityClasses}`}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-linear-to-r from-primary-600 to-info rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>

        <Surface
          variant="primary"
          padding="lg"
          shadow="xl"
          className="relative rounded-2xl flex items-center gap-6 min-w-[320px]"
        >
          <div
            className={`w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-inner ${diceMotionClasses}`}
          >
            {critGlyph ? (
              <span className="text-3xl leading-none" aria-hidden="true">
                {critGlyph}
              </span>
            ) : (
              <Dices className="w-8 h-8" />
            )}
          </div>

          <div className="flex-1">
            {isWeaponMode ? (
              <div className="flex flex-col gap-3">
                <Text weight="black" color="accent" className="uppercase tracking-[0.2em]">
                  {latestRoll.label || 'Weapon Attack'}
                  {critGlyph ? (
                    <span className={`ml-2 ${totalColorClass}`}>{critGlyph}</span>
                  ) : null}
                </Text>
                {latestRoll.rows!.map((row, index) => (
                  <WeaponRow key={`${row.label}-${index}`} row={row} />
                ))}
              </div>
            ) : (
              <>
                <Text weight="black" color="accent" className="uppercase tracking-[0.2em] mb-1">
                  {latestRoll.label || 'Roll Result'}
                  {critGlyph ? (
                    <span className={`ml-2 ${totalColorClass}`}>{critGlyph}</span>
                  ) : null}
                </Text>
                <div className="flex items-baseline gap-2">
                  <Text as="span" className={`text-4xl font-black tabular-nums ${totalColorClass}`}>
                    {latestRoll.total}
                  </Text>
                  <Text as="span" size="xs" weight="medium" color="tertiary">
                    {latestRoll.expression}
                  </Text>
                </div>
                <ComponentBreakdown components={latestRoll.components} />
              </>
            )}
          </div>

          <IconButton
            variant="secondary"
            size="md"
            onClick={() => setDismissedRollId(latestRoll.id)}
            className="text-text-tertiary hover:text-primary-600 min-h-[44px] min-w-[44px]"
            aria-label="Dismiss roll result"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </Surface>
      </div>
    </div>
  );
}
