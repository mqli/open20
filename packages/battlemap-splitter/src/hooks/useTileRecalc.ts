import { useEffect, useRef } from 'react';
import { usePaperStore } from '@/stores/paperStore';
import { useGridStore } from '@/stores/gridStore';
import { useTileStore } from '@/stores/tileStore';

/**
 * Subscribe to paper and grid store changes that affect tile
 * computation, and trigger tile recalculation.
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

    // Only fire when fields that affect tile computation change
    const unsubPaper = usePaperStore.subscribe((state, prevState) => {
      if (
        state.preset !== prevState.preset ||
        state.customW !== prevState.customW ||
        state.customH !== prevState.customH ||
        state.orientation !== prevState.orientation ||
        state.margin !== prevState.margin ||
        state.marginTop !== prevState.marginTop ||
        state.marginBottom !== prevState.marginBottom ||
        state.marginLeft !== prevState.marginLeft ||
        state.marginRight !== prevState.marginRight ||
        state.overlap !== prevState.overlap
      ) {
        debouncedRecalc();
      }
    });

    // cellPx is the only grid field that affects tile geometry
    const unsubGrid = useGridStore.subscribe((state, prevState) => {
      if (state.cellPx !== prevState.cellPx) {
        debouncedRecalc();
      }
    });

    return () => {
      unsubPaper();
      unsubGrid();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [recalculate]);
}
