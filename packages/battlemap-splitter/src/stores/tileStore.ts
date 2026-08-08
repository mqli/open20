import { create } from 'zustand';
import { computeTileGrid } from '@/engine/tiling';
import { useGridStore } from './gridStore';
import { usePaperStore } from './paperStore';
import { useMapStore } from './mapStore';
import type { TileInfo as EngineTileInfo, TileMode } from '@/types';

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
  /** Thumbnail preview data URL (generated during empty tile detection) */
  previewUrl?: string;
  /** Tile rotation in degrees (0, 90, 180, 270) */
  rotation: 0 | 90 | 180 | 270;
  /** Per-tile paper orientation override. undefined = follow global */
  perTileOrientation?: 'portrait' | 'landscape';
  /** Custom-mode user drag offset X in source pixels */
  userOffsetX: number;
  /** Custom-mode user drag offset Y in source pixels */
  userOffsetY: number;
}

/** Selected tile coordinates (for custom mode canvas interaction) */
export interface SelectedTile {
  row: number;
  col: number;
}

interface TileState {
  tiles: TileInfo[][];
  tileCols: number;
  tileRows: number;
  orientation: 'portrait' | 'landscape';
  /** Feet per grid square (5 or 10) — affects physical tile scaling */
  calibrationFeet: 5 | 10;
  /** Tiling mode: auto (uniform grid) or custom (user-positioned) */
  mode: TileMode;
  /** Currently selected tile in custom mode (null = no selection) */
  selectedTile: SelectedTile | null;

  /** Actions */
  reset: () => void;
  recalculate: () => void;
  toggleTile: (row: number, col: number) => void;
  selectAll: () => void;
  selectNone: () => void;
  selectRect: (r1: number, c1: number, r2: number, c2: number) => void;
  detectEmptyTiles: () => Promise<void>;
  setCalibrationFeet: (feet: 5 | 10) => void;
  setMode: (mode: TileMode) => void;
  setSelectedTile: (tile: SelectedTile | null) => void;
  moveTile: (row: number, col: number, deltaX: number, deltaY: number) => void;
  rotateTile: (row: number, col: number) => void;
  setPerTileOrientation: (row: number, col: number, orientation: 'portrait' | 'landscape') => void;
  /** Regenerate preview thumbnail for a specific tile (async, called after move/rotate) */
  _regenerateTilePreview: (row: number, col: number) => void;
}

function engineTileToTileInfo(t: EngineTileInfo): TileInfo {
  return {
    row: t.row,
    col: t.col,
    selected: true,
    isEmpty: false,
    previewUrl: undefined,
    srcX: t.srcX,
    srcY: t.srcY,
    srcW: t.srcW,
    srcH: t.srcH,
    contentW: t.contentW,
    contentH: t.contentH,
    rotation: 0,
    perTileOrientation: undefined,
    userOffsetX: 0,
    userOffsetY: 0,
  };
}

let emptyDetectAbortController: AbortController | null = null;

export const useTileStore = create<TileState>((set, get) => ({
  tiles: [],
  tileCols: 0,
  tileRows: 0,
  orientation: 'portrait',
  calibrationFeet: 5,
  mode: 'auto',
  selectedTile: null,

  reset: () => {
    // Abort any in-flight empty detection
    if (emptyDetectAbortController) {
      emptyDetectAbortController.abort();
      emptyDetectAbortController = null;
    }
    set({
      tiles: [],
      tileCols: 0,
      tileRows: 0,
      orientation: 'portrait',
      mode: 'auto',
      selectedTile: null,
    });
  },

  recalculate: () => {
    // Cross-store reads
    const mapState = useMapStore.getState();
    const gridState = useGridStore.getState();
    const paperState = usePaperStore.getState();

    if (!mapState.imageUrl || mapState.width === 0) {
      set({ tiles: [], tileCols: 0, tileRows: 0, selectedTile: null });
      return;
    }

    // In custom mode, preserve user offsets/orientation when recalculating
    // (triggered by mode switch back to auto, or explicit recalculate)
    const isCustom = get().mode === 'custom';
    const prevTiles = get().tiles;
    const prevTileMap = new Map<string, TileInfo>();
    if (isCustom) {
      for (const row of prevTiles) {
        for (const t of row) {
          prevTileMap.set(`${t.row},${t.col}`, t);
        }
      }
    }

    // Scale cellPx by calibration feet: 10ft grids are physically 2× wider,
    // so effective DPI is halved (1 cell = 50.8mm instead of 25.4mm)
    const effectiveCellPx = gridState.cellPx * (5 / get().calibrationFeet);

    const grid = computeTileGrid(
      mapState.width,
      mapState.height,
      effectiveCellPx,
      {
        widthMm: paperState.getPaperWidth(),
        heightMm: paperState.getPaperHeight(),
        marginLeft: paperState.getMarginLeft(),
        marginRight: paperState.getMarginRight(),
        marginTop: paperState.getMarginTop(),
        marginBottom: paperState.getMarginBottom(),
        overlapMm: paperState.overlap,
      },
      paperState.orientation,
    );

    const tiles: TileInfo[][] = grid.tiles.map((row) =>
      row.map((t) => {
        const base = engineTileToTileInfo(t);
        if (isCustom) {
          // Preserve user customizations from previous tiles with matching coords
          const prev = prevTileMap.get(`${t.row},${t.col}`);
          if (prev) {
            base.rotation = prev.rotation;
            base.perTileOrientation = prev.perTileOrientation;
            base.userOffsetX = prev.userOffsetX;
            base.userOffsetY = prev.userOffsetY;
            base.selected = prev.selected;
          }
        }
        return base;
      }),
    );

    set({
      tiles,
      tileCols: grid.cols,
      tileRows: grid.rows,
      orientation: grid.orientation,
    });

    // Abort any in-flight empty detection before starting a new one
    if (emptyDetectAbortController) {
      emptyDetectAbortController.abort();
    }
    emptyDetectAbortController = new AbortController();

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

  setCalibrationFeet: (feet: 5 | 10) => set({ calibrationFeet: feet }),

  setMode: (mode: TileMode) => {
    const prevMode = get().mode;
    set({ mode, selectedTile: null });

    // When switching from custom → auto, clear all user offsets and reset tiles
    if (prevMode === 'custom' && mode === 'auto') {
      get().recalculate();
    }
    // When switching from auto → custom, tiles are already from auto-grid;
    // just keep them as-is (user can now modify)
  },

  setSelectedTile: (tile) => set({ selectedTile: tile }),

  moveTile: (row, col, deltaX, deltaY) =>
    set((state) => {
      const newTiles = state.tiles.map((r) => r.map((t) => ({ ...t })));
      if (newTiles[row]?.[col]) {
        newTiles[row][col].userOffsetX += deltaX;
        newTiles[row][col].userOffsetY += deltaY;
      }
      return { tiles: newTiles };
    }),
  // Schedule async preview regeneration after moveTile updates the store
  _regenerateTilePreview: (row: number, col: number) => {
    const mapState = useMapStore.getState();
    if (!mapState.imageUrl) return;

    const tile = get().tiles[row]?.[col];
    if (!tile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mapState.imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const THUMB_MAX = 150;

      // For 90/270 rotation, the visual width/height are swapped
      const visualW = tile.rotation === 90 || tile.rotation === 270 ? tile.srcH : tile.srcW;
      const visualH = tile.rotation === 90 || tile.rotation === 270 ? tile.srcW : tile.srcH;

      const previewW = Math.min(
        THUMB_MAX,
        Math.round(THUMB_MAX * (visualW / Math.max(visualW, visualH))),
      );
      const previewH = Math.min(
        THUMB_MAX,
        Math.round(THUMB_MAX * (visualH / Math.max(visualW, visualH))),
      );
      canvas.width = previewW;
      canvas.height = previewH;

      // Use effective source position (with user offset)
      const srcX = tile.srcX + tile.userOffsetX;
      const srcY = tile.srcY + tile.userOffsetY;

      if (tile.rotation !== 0) {
        ctx.translate(previewW / 2, previewH / 2);
        ctx.rotate((tile.rotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          srcX,
          srcY,
          tile.srcW,
          tile.srcH,
          -previewW / 2,
          -previewH / 2,
          previewW,
          previewH,
        );
      } else {
        ctx.drawImage(img, srcX, srcY, tile.srcW, tile.srcH, 0, 0, previewW, previewH);
      }

      const previewUrl = canvas.toDataURL('image/jpeg', 0.5);

      set((state) => {
        const newTiles = state.tiles.map((r) => r.map((t) => ({ ...t })));
        if (newTiles[row]?.[col]) {
          newTiles[row][col].previewUrl = previewUrl;
        }
        return { tiles: newTiles };
      });
    };
  },

  rotateTile: (row, col) =>
    set((state) => {
      const newTiles = state.tiles.map((r) => r.map((t) => ({ ...t })));
      const tile = newTiles[row]?.[col];
      if (tile) {
        // Rotate 90° clockwise: 0→90→180→270→0
        tile.rotation = ((tile.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        // Swap srcW/srcH for 90/270 rotations
        if (tile.rotation === 90 || tile.rotation === 270) {
          const tmp = tile.srcW;
          tile.srcW = tile.srcH;
          tile.srcH = tmp;
          // Also swap contentW/contentH to reflect the rotation
          const tmpC = tile.contentW;
          tile.contentW = tile.contentH;
          tile.contentH = tmpC;
        }
      }
      return { tiles: newTiles };
    }),

  setPerTileOrientation: (row, col, orientation) =>
    set((state) => {
      const newTiles = state.tiles.map((r) => r.map((t) => ({ ...t })));
      if (newTiles[row]?.[col]) {
        newTiles[row][col].perTileOrientation = orientation;
      }
      return { tiles: newTiles };
    }),

  detectEmptyTiles: async () => {
    const signal = emptyDetectAbortController?.signal;

    const mapState = useMapStore.getState();
    const { tiles } = get();

    if (!mapState.imageUrl || tiles.length === 0) return;
    if (signal?.aborted) return;

    // Sample a thumbnail of each tile to check if it's empty
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mapState.imageUrl;

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
      });

      if (signal?.aborted) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Also generate preview thumbnails (separate canvas to avoid conflicts)
      const thumbCanvas = document.createElement('canvas');
      const thumbCtx = thumbCanvas.getContext('2d');
      const THUMB_MAX = 150;

      const newTiles = await Promise.all(
        tiles.map(async (row) =>
          Promise.all(
            row.map(async (t) => {
              // Aborted — return tile unchanged
              if (signal?.aborted) return t;
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
                  selected: variance >= 5.0,
                  previewUrl: generatePreview(),
                };

                function generatePreview(): string | undefined {
                  if (!thumbCtx || thumbCanvas.width === 0) return undefined;
                  try {
                    const visualW = t.rotation === 90 || t.rotation === 270 ? t.srcH : t.srcW;
                    const visualH = t.rotation === 90 || t.rotation === 270 ? t.srcW : t.srcH;
                    const previewW = Math.min(
                      THUMB_MAX,
                      Math.round(THUMB_MAX * (visualW / Math.max(visualW, visualH))),
                    );
                    const previewH = Math.min(
                      THUMB_MAX,
                      Math.round(THUMB_MAX * (visualH / Math.max(visualW, visualH))),
                    );
                    thumbCanvas.width = previewW;
                    thumbCanvas.height = previewH;

                    if (t.rotation !== 0) {
                      thumbCtx.save();
                      thumbCtx.translate(previewW / 2, previewH / 2);
                      thumbCtx.rotate((t.rotation * Math.PI) / 180);
                      thumbCtx.drawImage(
                        img,
                        t.srcX,
                        t.srcY,
                        t.srcW,
                        t.srcH,
                        -previewW / 2,
                        -previewH / 2,
                        previewW,
                        previewH,
                      );
                      thumbCtx.restore();
                    } else {
                      thumbCtx.drawImage(
                        img,
                        t.srcX,
                        t.srcY,
                        t.srcW,
                        t.srcH,
                        0,
                        0,
                        previewW,
                        previewH,
                      );
                    }
                    return thumbCanvas.toDataURL('image/jpeg', 0.5);
                  } catch {
                    return undefined;
                  }
                }
              } catch {
                // Canvas tainted — can't check emptiness or preview
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
