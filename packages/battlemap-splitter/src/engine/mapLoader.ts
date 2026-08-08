/**
 * Shared map-loading logic — evaluates best paper orientation after
 * loading a map image, then triggers tile recalculation.
 *
 * Used by both DropZone (initial upload) and UploadDialog (file/URL import).
 */

import { evaluateBestOrientation } from './tiling';
import { useMapStore } from '@/stores/mapStore';
import { usePaperStore } from '@/stores/paperStore';
import { useGridStore } from '@/stores/gridStore';
import { useTileStore } from '@/stores/tileStore';

/**
 * After a map image has been loaded into mapStore, evaluate the best
 * paper orientation for the current map dimensions + paper settings,
 * then trigger a tile recalculation.
 */
export function evaluateAndRecalculate(): void {
  const mapState = useMapStore.getState();
  const paperState = usePaperStore.getState();
  const gridState = useGridStore.getState();
  const tileState = useTileStore.getState();

  const effectiveCellPx = gridState.cellPx * (5 / tileState.calibrationFeet);

  const best = evaluateBestOrientation(mapState.width, mapState.height, effectiveCellPx, {
    widthMm: paperState.getPaperWidth(),
    heightMm: paperState.getPaperHeight(),
    marginLeft: paperState.getMarginLeft(),
    marginRight: paperState.getMarginRight(),
    marginTop: paperState.getMarginTop(),
    marginBottom: paperState.getMarginBottom(),
    overlapMm: paperState.overlap,
  });

  paperState.setOrientation(best);

  // Defer tile recalculation to let the orientation update settle
  setTimeout(() => useTileStore.getState().recalculate(), 100);
}
