import { describe, it, expect, beforeEach } from 'vitest';
import { useTileStore } from '@/stores/tileStore';
import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';

function setupMapWithImage(width = 700, height = 700) {
  // Set up map store with a valid image URL (fake blob)
  const blob = new Blob(['dummy data'], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  useMapStore.setState({ imageUrl: url, width, height, zoom: 1, panX: 0, panY: 0 });
  return url;
}

/** Helper to create a tile with all required fields */
function makeTile(
  overrides: Partial<ReturnType<typeof useTileStore.getState>['tiles'][0][0]> = {},
) {
  return {
    row: 0,
    col: 0,
    selected: false,
    isEmpty: false,
    srcX: 0,
    srcY: 0,
    srcW: 100,
    srcH: 100,
    contentW: 194,
    contentH: 269,
    rotation: 0 as const,
    perTileOrientation: undefined as 'portrait' | 'landscape' | undefined,
    userOffsetX: 0,
    userOffsetY: 0,
    ...overrides,
  };
}

describe('tileStore', () => {
  beforeEach(() => {
    useTileStore.setState({
      tiles: [],
      tileCols: 0,
      tileRows: 0,
      orientation: 'portrait',
      calibrationFeet: 5,
      mode: 'auto',
      selectedTile: null,
    });
    useMapStore.getState().clear();
    useGridStore.getState().reset();
  });

  describe('initial state', () => {
    it('starts with empty tiles and portrait orientation', () => {
      const state = useTileStore.getState();
      expect(state.tiles).toEqual([]);
      expect(state.tileCols).toBe(0);
      expect(state.tileRows).toBe(0);
      expect(state.orientation).toBe('portrait');
    });
  });

  describe('recalculate', () => {
    it('returns empty tiles when no image is loaded', () => {
      useTileStore.getState().recalculate();
      const state = useTileStore.getState();
      expect(state.tiles).toEqual([]);
      expect(state.tileCols).toBe(0);
      expect(state.tileRows).toBe(0);
    });

    it('computes tile grid when image is loaded', () => {
      // 500×500 at 70 DPI = ~7 squares = ~181mm × ~181mm
      // A4 content area (portrait): 194 × 269mm → fits in 1×1 tile
      setupMapWithImage(500, 500);
      useTileStore.getState().recalculate();

      const state = useTileStore.getState();
      expect(state.tileCols).toBe(1);
      expect(state.tileRows).toBe(1);
      expect(state.tiles.length).toBe(1);
      expect(state.tiles[0].length).toBe(1);
      expect(state.tiles[0][0].selected).toBe(true);
    });

    it('creates multiple columns for wide maps', () => {
      setupMapWithImage(5600, 700);
      useTileStore.getState().recalculate();

      const state = useTileStore.getState();
      expect(state.tileCols).toBeGreaterThan(1);
      // All tiles should have source info
      for (const row of state.tiles) {
        for (const tile of row) {
          expect(tile.srcW).toBeGreaterThan(0);
          expect(tile.srcH).toBeGreaterThan(0);
        }
      }
    });

    it('10ft calibration produces more tiles than 5ft', () => {
      // At 5ft: cellPx=70 → 2100px / 70 * 25.4 = 762mm
      // At 10ft: effectiveCellPx = 70 * (5/10) = 35 → 2100px / 35 * 25.4 = 1524mm
      // Twice the physical size → roughly 4× the tiles
      setupMapWithImage(2100, 2100);
      useGridStore.getState().setCellPx(70);

      // 5ft mode (default)
      useTileStore.setState({ calibrationFeet: 5 });
      useTileStore.getState().recalculate();
      const tilesAt5ft = useTileStore.getState().tiles.flat().length;

      // 10ft mode
      useTileStore.setState({ calibrationFeet: 10 });
      useTileStore.getState().recalculate();
      const tilesAt10ft = useTileStore.getState().tiles.flat().length;

      expect(tilesAt10ft).toBeGreaterThan(tilesAt5ft);
    });

    it('responds to grid DPI changes', () => {
      // Higher DPI = smaller physical map → fewer tiles for the same map
      useGridStore.getState().setCellPx(50);
      setupMapWithImage(1400, 1400);
      // At 50 DPI: 1400/50*25.4 = 711mm → A4 portrait (180mm content) → ceil((711-5)/175) = 5 cols
      useTileStore.getState().recalculate();
      const colsAt50 = useTileStore.getState().tileCols;
      expect(colsAt50).toBeGreaterThan(2);

      // At 150 DPI: 1400/150*25.4 = 237mm → ceil((237-5)/175) = 2 cols
      useGridStore.getState().setCellPx(150);
      useTileStore.getState().recalculate();
      const colsAt150 = useTileStore.getState().tileCols;
      expect(colsAt150).toBeLessThan(colsAt50);
    });
  });

  describe('tile selection', () => {
    it('toggleTile toggles selection', () => {
      // Set up a single tile
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
      });

      useTileStore.getState().toggleTile(0, 0);
      expect(useTileStore.getState().tiles[0][0].selected).toBe(true);

      useTileStore.getState().toggleTile(0, 0);
      expect(useTileStore.getState().tiles[0][0].selected).toBe(false);
    });

    it('toggleTile ignores out-of-bounds indices', () => {
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
      });

      useTileStore.getState().toggleTile(5, 5);
      expect(useTileStore.getState().tiles[0][0].selected).toBe(false);
    });

    it('selectAll selects all tiles', () => {
      useTileStore.setState({
        tiles: [[makeTile({ col: 0 }), makeTile({ col: 1, srcX: 100 })]],
        tileCols: 2,
        tileRows: 1,
      });

      useTileStore.getState().selectAll();
      const tiles = useTileStore.getState().tiles;
      for (const row of tiles) {
        for (const tile of row) {
          expect(tile.selected).toBe(true);
        }
      }
    });

    it('selectNone deselects all tiles', () => {
      useTileStore.setState({
        tiles: [
          [makeTile({ col: 0, selected: true }), makeTile({ col: 1, srcX: 100, selected: true })],
        ],
        tileCols: 2,
        tileRows: 1,
      });

      useTileStore.getState().selectNone();
      const tiles = useTileStore.getState().tiles;
      for (const row of tiles) {
        for (const tile of row) {
          expect(tile.selected).toBe(false);
        }
      }
    });

    it('selectRect selects a rectangular region', () => {
      // 3x3 grid
      const tiles = Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) =>
          makeTile({ row: r, col: c, srcX: c * 100, srcY: r * 100 }),
        ),
      );
      useTileStore.setState({ tiles, tileCols: 3, tileRows: 3 });

      useTileStore.getState().selectRect(0, 0, 1, 1);

      const state = useTileStore.getState();
      // Top-left 2x2 should be selected
      expect(state.tiles[0][0].selected).toBe(true);
      expect(state.tiles[0][1].selected).toBe(true);
      expect(state.tiles[1][0].selected).toBe(true);
      expect(state.tiles[1][1].selected).toBe(true);
      // Others should not
      expect(state.tiles[0][2].selected).toBe(false);
      expect(state.tiles[1][2].selected).toBe(false);
      expect(state.tiles[2][0].selected).toBe(false);
      expect(state.tiles[2][1].selected).toBe(false);
      expect(state.tiles[2][2].selected).toBe(false);
    });
  });

  describe('calibrationFeet', () => {
    it('defaults to 5', () => {
      expect(useTileStore.getState().calibrationFeet).toBe(5);
    });

    it('setCalibrationFeet updates to 10', () => {
      useTileStore.getState().setCalibrationFeet(10);
      expect(useTileStore.getState().calibrationFeet).toBe(10);
    });

    it('setCalibrationFeet accepts 5', () => {
      useTileStore.getState().setCalibrationFeet(10);
      useTileStore.getState().setCalibrationFeet(5);
      expect(useTileStore.getState().calibrationFeet).toBe(5);
    });
  });

  describe('tileMode', () => {
    it('defaults to auto', () => {
      expect(useTileStore.getState().mode).toBe('auto');
    });

    it('setMode changes mode', () => {
      useTileStore.getState().setMode('custom');
      expect(useTileStore.getState().mode).toBe('custom');
    });

    it('setMode clears selectedTile', () => {
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
        selectedTile: { row: 0, col: 0 },
        mode: 'custom',
      });
      useTileStore.getState().setMode('auto');
      expect(useTileStore.getState().selectedTile).toBeNull();
    });

    it('switching custom to auto triggers recalculate', () => {
      setupMapWithImage(500, 500);
      useTileStore.setState({ mode: 'custom', tiles: [[makeTile()]], tileCols: 1, tileRows: 1 });
      useTileStore.getState().setMode('auto');
      // After recalculate, tiles should be recomputed
      expect(useTileStore.getState().tileCols).toBeGreaterThanOrEqual(1);
    });
  });

  describe('selectedTile', () => {
    it('setSelectedTile updates selected tile', () => {
      useTileStore.getState().setSelectedTile({ row: 1, col: 2 });
      expect(useTileStore.getState().selectedTile).toEqual({ row: 1, col: 2 });
    });

    it('setSelectedTile clears selection', () => {
      useTileStore.getState().setSelectedTile({ row: 0, col: 0 });
      useTileStore.getState().setSelectedTile(null);
      expect(useTileStore.getState().selectedTile).toBeNull();
    });
  });

  describe('moveTile', () => {
    it('moves tile by delta', () => {
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
      });
      useTileStore.getState().moveTile(0, 0, 10, -5);
      const tile = useTileStore.getState().tiles[0][0];
      expect(tile.userOffsetX).toBe(10);
      expect(tile.userOffsetY).toBe(-5);
    });

    it('accumulates multiple moves', () => {
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
      });
      useTileStore.getState().moveTile(0, 0, 10, 0);
      useTileStore.getState().moveTile(0, 0, 5, 3);
      const tile = useTileStore.getState().tiles[0][0];
      expect(tile.userOffsetX).toBe(15);
      expect(tile.userOffsetY).toBe(3);
    });

    it('ignores out-of-bounds tile', () => {
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
      });
      expect(() => useTileStore.getState().moveTile(5, 5, 10, 10)).not.toThrow();
    });
  });

  describe('rotateTile', () => {
    it('rotates 0 → 90', () => {
      useTileStore.setState({
        tiles: [[makeTile({ srcW: 100, srcH: 80, contentW: 194, contentH: 269 })]],
        tileCols: 1,
        tileRows: 1,
      });
      useTileStore.getState().rotateTile(0, 0);
      const tile = useTileStore.getState().tiles[0][0];
      expect(tile.rotation).toBe(90);
      // Width and height should swap
      expect(tile.srcW).toBe(80);
      expect(tile.srcH).toBe(100);
      expect(tile.contentW).toBe(269);
      expect(tile.contentH).toBe(194);
    });

    it('rotates 270 → 0 (wrap around)', () => {
      useTileStore.setState({
        tiles: [[makeTile({ rotation: 270, srcW: 100, srcH: 80, contentW: 194, contentH: 269 })]],
        tileCols: 1,
        tileRows: 1,
      });
      useTileStore.getState().rotateTile(0, 0);
      const tile = useTileStore.getState().tiles[0][0];
      expect(tile.rotation).toBe(0);
    });

    it('full rotation cycle returns to original dimensions', () => {
      useTileStore.setState({
        tiles: [[makeTile({ srcW: 100, srcH: 80, contentW: 194, contentH: 269 })]],
        tileCols: 1,
        tileRows: 1,
      });
      // Rotate 4 times
      for (let i = 0; i < 4; i++) {
        useTileStore.getState().rotateTile(0, 0);
      }
      const tile = useTileStore.getState().tiles[0][0];
      expect(tile.rotation).toBe(0);
      expect(tile.srcW).toBe(100);
      expect(tile.srcH).toBe(80);
    });
  });

  describe('setPerTileOrientation', () => {
    it('sets per-tile orientation', () => {
      useTileStore.setState({
        tiles: [[makeTile()]],
        tileCols: 1,
        tileRows: 1,
      });
      useTileStore.getState().setPerTileOrientation(0, 0, 'landscape');
      expect(useTileStore.getState().tiles[0][0].perTileOrientation).toBe('landscape');
    });

    it('changes orientation back to portrait', () => {
      useTileStore.setState({
        tiles: [[makeTile({ perTileOrientation: 'landscape' })]],
        tileCols: 1,
        tileRows: 1,
      });
      useTileStore.getState().setPerTileOrientation(0, 0, 'portrait');
      expect(useTileStore.getState().tiles[0][0].perTileOrientation).toBe('portrait');
    });
  });
});
