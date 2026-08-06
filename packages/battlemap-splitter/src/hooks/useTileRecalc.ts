import { useEffect, useRef } from 'react';
import { usePaperStore } from '@/stores/paperStore';
import { useGridStore } from '@/stores/gridStore';
import { useTileStore } from '@/stores/tileStore';

/**
 * Subscribe to paper and grid store changes and trigger tile recalculation.
 * Debounced at 200ms to avoid recalculating on every slider tick.
 */
export function useTileRecalc() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recalculate = useTileStore((s) => s.recalculate);

  useEffect(() => {
    function debouncedRecalc() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        recalculate();
      }, 200);
    }

    // Subscribe to both stores — fires on every state change
    const unsubPaper = usePaperStore.subscribe(() => debouncedRecalc());
    const unsubGrid = useGridStore.subscribe(() => debouncedRecalc());

    return () => {
      unsubPaper();
      unsubGrid();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [recalculate]);
}
