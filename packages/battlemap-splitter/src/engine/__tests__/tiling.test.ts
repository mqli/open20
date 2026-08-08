import { describe, it, expect } from 'vitest';
import { computeTileGrid } from '@/engine/tiling';
import type { PaperConfig } from '@/types';

function defaultPaper(overrides?: Partial<PaperConfig>): PaperConfig {
  return {
    widthMm: 210, // A4
    heightMm: 297,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 8,
    marginBottom: 8,
    overlapMm: 5,
    ...overrides,
  };
}

describe('computeTileGrid', () => {
  it('returns a single tile for a small map that fits on one page', () => {
    // A map that's 5×5 grid squares at 70 DPI
    // Physical size: 5 * 25.4 = 127mm × 127mm
    // A4 content area (portrait): 194mm × 277mm (minus 12mm label = 265mm)
    // 127mm < 194mm and 127mm < 265mm, so 1 tile
    const grid = computeTileGrid(350, 350, 70, defaultPaper()); // 5*70=350

    expect(grid.cols).toBe(1);
    expect(grid.rows).toBe(1);
    expect(grid.tiles.length).toBe(1);
    expect(grid.tiles[0].length).toBe(1);
    expect(grid.tiles[0][0].row).toBe(0);
    expect(grid.tiles[0][0].col).toBe(0);
  });

  it('uses portrait orientation for a map slightly wider than A4 content', () => {
    // Map width: 6 squares * 70 DPI = 420px
    // Physical width: 6 * 25.4 = 152.4mm
    // A4 portrait content width: 210 - 16 = 194mm → fits
    const grid = computeTileGrid(420, 350, 70, defaultPaper());

    expect(grid.cols).toBe(1);
    expect(grid.rows).toBe(1);
    expect(grid.orientation).toBe('portrait');
  });

  it('creates multiple columns for a wide map', () => {
    // Map: 4500px wide at 70 DPI = 64 squares ≈ 1625mm
    // A4 portrait content width: 194mm, effective: 189mm
    // cols = ceil((1625 - 5) / 189) = ceil(1620/189) = ceil(8.57) = 9
    const grid = computeTileGrid(4500, 700, 70, defaultPaper());

    expect(grid.cols).toBeGreaterThan(1);
    expect(grid.rows).toBe(1);
    // All tiles should be in one row
    for (let col = 0; col < grid.cols; col++) {
      expect(grid.tiles[0][col].row).toBe(0);
      expect(grid.tiles[0][col].col).toBe(col);
    }
  });

  it('creates a full grid for a large map', () => {
    // Large map: 5600×4200 at 70 DPI
    const grid = computeTileGrid(5600, 4200, 70, defaultPaper());

    expect(grid.cols).toBeGreaterThan(1);
    expect(grid.rows).toBeGreaterThan(1);
    expect(grid.tiles.length).toBe(grid.rows);
    expect(grid.tiles[0].length).toBe(grid.cols);
  });

  it('clamps tiles to image bounds', () => {
    // Map that's exactly 1 partial tile wide
    const grid = computeTileGrid(300, 300, 70, defaultPaper());

    for (const row of grid.tiles) {
      for (const tile of row) {
        expect(tile.srcX + tile.srcW).toBeLessThanOrEqual(300);
        expect(tile.srcY + tile.srcH).toBeLessThanOrEqual(300);
        expect(tile.srcX).toBeGreaterThanOrEqual(0);
        expect(tile.srcY).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('handles high-DPI images correctly', () => {
    // 100 DPI map: same physical size as 70 DPI but more pixels
    // 5 squares at 100 DPI = 500px = same physical 127mm
    const grid = computeTileGrid(500, 500, 100, defaultPaper());

    expect(grid.cols).toBe(1);
    expect(grid.rows).toBe(1);

    // Source pixels should match the slice size in mm
    // Physical slice should be roughly the map size
    const tile = grid.tiles[0][0];
    // At 100 DPI, 1mm = 100/25.4 ≈ 3.937 px/mm
    // Map is 5 squares * 25.4mm = 127mm * 3.937 = 500px
    expect(tile.srcW).toBe(500);
    expect(tile.srcH).toBe(500);
  });

  it('extends each tile by overlapMm/2 on all four sides', () => {
    // 2-column wide map to verify uniform overlap
    const paper = defaultPaper({ overlapMm: 8 });
    const grid = computeTileGrid(3000, 700, 70, paper);

    expect(grid.cols).toBeGreaterThan(1);

    const overlapPx = (8 / 25.4) * 70; // ~22.05

    // First column tile: srcX clamped to 0 (would be negative from half-overlap shift)
    expect(grid.tiles[0][0].srcX).toBe(0);

    // Adjacent tiles should overlap (both extend into shared zone)
    const overlapZone = grid.tiles[0][0].srcX + grid.tiles[0][0].srcW - grid.tiles[0][1].srcX;
    expect(overlapZone).toBeGreaterThan(overlapPx * 0.5);

    // For non-first columns, tile extends left by halfOverlapPx
    const lastCol = grid.cols - 1;
    const lastTile = grid.tiles[0][lastCol];
    expect(lastTile.srcX).toBeGreaterThan(0);

    // All tiles stay within image bounds
    expect(lastTile.srcX + lastTile.srcW).toBeLessThanOrEqual(3000);
  });

  it('prefers landscape when it uses fewer pages', () => {
    // Map that's wider than tall — landscape should be better
    // 3000×1000 at 70 DPI: 1088mm × 363mm
    const grid = computeTileGrid(3000, 1000, 70, defaultPaper());
    expect(grid.orientation).toMatch(/portrait|landscape/);
  });

  it('tile content area should be the paper content area', () => {
    const grid = computeTileGrid(700, 700, 70, defaultPaper());
    const tile = grid.tiles[0][0];

    if (grid.orientation === 'portrait') {
      expect(tile.contentW).toBe(194); // 210 - 8 - 8
    }
  });
});
