import { create } from 'zustand';
import { computeTileGrid } from '@/engine/tiling';
import { useGridStore } from './gridStore';
import { usePaperStore } from './paperStore';
import { useMapStore } from './mapStore';
import type { TileInfo as EngineTileInfo } from '@/types';

export interface TileInfo {
  row: number;
  col: number;
  selected: boolean;
  /** Tile has negligible map content */
  isEmpty: boolean;
  /** Source pixel region */
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
  /** Content area on paper in mm */
  contentW: number;
  contentH: number;
}

interface TileState {
  tiles: TileInfo[][];
  tileCols: number;
  tileRows: number;

  /** Actions */
  recalculate: () => void;
  toggleTile: (row: number, col: number) => void;
  selectAll: () => void;
  selectNone: () => void;
  selectRect: (r1: number, c1: number, r2: number, c2: number) => void;
  detectEmptyTiles: () => Promise<void>;
}

function engineTileToTileInfo(t: EngineTileInfo): TileInfo {
  return {
    row: t.row,
    col: t.col,
    selected: true, // All non-empty tiles selected by default
    isEmpty: false,
    srcX: t.srcX,
    srcY: t.srcY,
    srcW: t.srcW,
    srcH: t.srcH,
    contentW: t.contentW,
    contentH: t.contentH,
  };
}

export const useTileStore = create<TileState>((set, get) => ({
  tiles: [],
  tileCols: 0,
  tileRows: 0,

  recalculate: () => {
    // Cross-store reads
    const mapState = useMapStore.getState();
    const gridState = useGridStore.getState();
    const paperState = usePaperStore.getState();

    if (!mapState.imageUrl || mapState.width === 0) {
      set({ tiles: [], tileCols: 0, tileRows: 0 });
      return;
    }

    const grid = computeTileGrid(mapState.width, mapState.height, gridState.cellPx, {
      widthMm: paperState.getPaperWidth(),
      heightMm: paperState.getPaperHeight(),
      marginLeft: paperState.getMarginLeft(),
      marginRight: paperState.getMarginRight(),
      marginTop: paperState.getMarginTop(),
      marginBottom: paperState.getMarginBottom(),
      overlapMm: paperState.overlap,
    });

    const tiles: TileInfo[][] = grid.tiles.map((row) => row.map(engineTileToTileInfo));

    set({ tiles, tileCols: grid.cols, tileRows: grid.rows });

    // Trigger empty tile detection asynchronously
    get().detectEmptyTiles();
  },

  toggleTile: (row, col) =>
    set((state) => {
      const newTiles = state.tiles.map((r) => r.map((t) => ({ ...t })));
      if (newTiles[row]?.[col]) {
        newTiles[row][col].selected = !newTiles[row][col].selected;
      }
      return { tiles: newTiles };
    }),

  selectAll: () =>
    set((state) => ({
      tiles: state.tiles.map((row) => row.map((t) => ({ ...t, selected: true }))),
    })),

  selectNone: () =>
    set((state) => ({
      tiles: state.tiles.map((row) => row.map((t) => ({ ...t, selected: false }))),
    })),

  selectRect: (r1, c1, r2, c2) => {
    const minR = Math.max(0, Math.min(r1, r2));
    const maxR = Math.max(r1, r2);
    const minC = Math.max(0, Math.min(c1, c2));
    const maxC = Math.max(c1, c2);

    set((state) => ({
      tiles: state.tiles.map((row, ri) =>
        row.map((t, ci) => ({
          ...t,
          selected: ri >= minR && ri <= maxR && ci >= minC && ci <= maxC,
        })),
      ),
    }));
  },

  detectEmptyTiles: async () => {
    const mapState = useMapStore.getState();
    const { tiles } = get();

    if (!mapState.imageUrl || tiles.length === 0) return;

    // Sample a thumbnail of each tile to check if it's empty
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mapState.imageUrl;

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newTiles = await Promise.all(
        tiles.map(async (row) =>
          Promise.all(
            row.map(async (t) => {
              // Skip tiles that are too small
              if (t.srcW < 10 || t.srcH < 10) return { ...t, isEmpty: false };

              // Downscale to ~100px thumbnail for sampling
              const thumbW = 100;
              const thumbH = Math.round(thumbW * (t.srcH / t.srcW));
              canvas.width = thumbW;
              canvas.height = thumbH;

              ctx.drawImage(img, t.srcX, t.srcY, t.srcW, t.srcH, 0, 0, thumbW, thumbH);

              try {
                const imageData = ctx.getImageData(0, 0, thumbW, thumbH);
                const pixels = imageData.data;

                // Compute average variance of the thumbnail
                let sum = 0;
                let sumSq = 0;
                const count = thumbW * thumbH;
                for (let i = 0; i < pixels.length; i += 4) {
                  const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                  sum += gray;
                  sumSq += gray * gray;
                }
                const mean = sum / count;
                const variance = sumSq / count - mean * mean;

                return {
                  ...t,
                  isEmpty: variance < 5.0,
                  selected: variance >= 5.0, // Auto-deselect empty tiles
                };
              } catch {
                // Canvas tainted — can't check emptiness
                return { ...t, isEmpty: false };
              }
            }),
          ),
        ),
      );

      set({ tiles: newTiles });
    } catch {
      // Image load failed, keep current tiles
    }
  },
}));
