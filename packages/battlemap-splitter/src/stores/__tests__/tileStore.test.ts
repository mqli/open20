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

describe('tileStore', () => {
  beforeEach(() => {
    useTileStore.setState({ tiles: [], tileCols: 0, tileRows: 0 });
    useMapStore.getState().clear();
    useGridStore.getState().reset();
  });

  describe('initial state', () => {
    it('starts with empty tiles', () => {
      const state = useTileStore.getState();
      expect(state.tiles).toEqual([]);
      expect(state.tileCols).toBe(0);
      expect(state.tileRows).toBe(0);
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

    it('responds to grid DPI changes', () => {
      setupMapWithImage(1400, 1400);
      // At 70 DPI: 1400/70*25.4 = 508mm × 508mm → multiple tiles
      useTileStore.getState().recalculate();
      const colsAt70 = useTileStore.getState().tileCols;

      // At 100 DPI: 1400/100*25.4 = 355.6mm × 355.6mm → may need fewer tiles
      useGridStore.getState().setCellPx(100);
      useTileStore.getState().recalculate();
      const colsAt100 = useTileStore.getState().tileCols;

      // Higher DPI = smaller physical size = could need same or fewer tiles
      expect(colsAt100).toBeLessThanOrEqual(colsAt70);
    });
  });

  describe('tile selection', () => {
    it('toggleTile toggles selection', () => {
      // Set up a single tile
      useTileStore.setState({
        tiles: [
          [
            {
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
            },
          ],
        ],
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
        tiles: [
          [
            {
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
            },
          ],
        ],
        tileCols: 1,
        tileRows: 1,
      });

      useTileStore.getState().toggleTile(5, 5);
      expect(useTileStore.getState().tiles[0][0].selected).toBe(false);
    });

    it('selectAll selects all tiles', () => {
      useTileStore.setState({
        tiles: [
          [
            {
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
            },
            {
              row: 0,
              col: 1,
              selected: false,
              isEmpty: false,
              srcX: 100,
              srcY: 0,
              srcW: 100,
              srcH: 100,
              contentW: 194,
              contentH: 269,
            },
          ],
        ],
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
          [
            {
              row: 0,
              col: 0,
              selected: true,
              isEmpty: false,
              srcX: 0,
              srcY: 0,
              srcW: 100,
              srcH: 100,
              contentW: 194,
              contentH: 269,
            },
            {
              row: 0,
              col: 1,
              selected: true,
              isEmpty: false,
              srcX: 100,
              srcY: 0,
              srcW: 100,
              srcH: 100,
              contentW: 194,
              contentH: 269,
            },
          ],
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
        Array.from({ length: 3 }, (_, c) => ({
          row: r,
          col: c,
          selected: false,
          isEmpty: false,
          srcX: c * 100,
          srcY: r * 100,
          srcW: 100,
          srcH: 100,
          contentW: 194,
          contentH: 269,
        })),
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
});
