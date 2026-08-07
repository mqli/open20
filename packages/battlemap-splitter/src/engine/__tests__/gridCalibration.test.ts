import { describe, it, expect, beforeAll } from 'vitest';
import {
  findNearestIntersection,
  snapCorner,
  detectGridFromRegion,
  pixelGrayAt,
} from '@/engine/gridCalibration';

/**
 * Polyfill ImageData for happy-dom test environment.
 * happy-dom does not ship with ImageData, so we provide a minimal
 * implementation backed by Uint8ClampedArray.
 *
 * Uses a loose type assertion to avoid the strict ArrayBuffer vs
 * SharedArrayBuffer incompatibility between lib.dom and test types.
 */
beforeAll(() => {
  const ImageDataPolyfill = function (
    this: { data: Uint8ClampedArray; width: number; height: number },
    dataOrWidth: Uint8ClampedArray | number,
    heightOrSw?: number,
    settingsOrHeight?: number,
  ) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = heightOrSw ?? 0;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = heightOrSw ?? 0;
      this.height = settingsOrHeight ?? 0;
    }
  } as unknown as typeof ImageData;

  globalThis.ImageData = ImageDataPolyfill;
});

/**
 * Create a synthetic ImageData with a grid pattern.
 * Grid lines are dark (gray=40), background is light (gray=200).
 *
 * @param gridPx - spacing between grid lines in pixels
 * @param gridCount - number of grid cells in each direction
 * @param lineWidth - width of grid lines in pixels
 */
function createGridImageData(gridPx: number, gridCount: number, lineWidth = 3): ImageData {
  const size = gridCount * gridPx;
  const data = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const localX = x % gridPx;
      const localY = y % gridPx;
      const onGrid =
        localX < lineWidth ||
        localX >= gridPx - lineWidth ||
        localY < lineWidth ||
        localY >= gridPx - lineWidth;
      const gray = onGrid ? 40 : 200;
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255;
    }
  }
  return new globalThis.ImageData(data, size, size) as unknown as ImageData;
}

describe('pixelGrayAt', () => {
  it('returns the average of RGB channels', () => {
    const data = new Uint8ClampedArray([100, 150, 200, 255]);
    expect(pixelGrayAt(data, 1, 0, 0)).toBeCloseTo(150, 0);
  });
});

describe('findNearestIntersection', () => {
  it('finds a grid intersection near the center of a clear grid', () => {
    const gridPx = 50;
    const img = createGridImageData(gridPx, 6);

    // Query near intersection at (50, 50)
    const result = findNearestIntersection(img, 52, 48);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(50, 0);
    expect(result!.y).toBeCloseTo(50, 0);
    expect(result!.confidence).toBeGreaterThan(0.3);
  });

  it('finds the nearest intersection when multiple are in range', () => {
    const gridPx = 50;
    const img = createGridImageData(gridPx, 6);

    // Query at (75, 75) — nearest intersection is (100, 100) or (50, 50)
    const result = findNearestIntersection(img, 75, 75);
    expect(result).not.toBeNull();
    // Nearest should be either (50,50) or (100,100)
    const nearestX = Math.abs(result!.x - 75) < Math.abs(result!.x - 50) ? 100 : 50;
    expect(result!.x).toBe(nearestX);
    expect(result!.y).toBe(nearestX); // square grid
  });

  it('returns null when no grid is present (uniform image)', () => {
    const size = 200;
    const data = new Uint8ClampedArray(size * size * 4);
    // All bright pixels
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200;
      data[i + 1] = 200;
      data[i + 2] = 200;
      data[i + 3] = 255;
    }
    const img = new ImageData(data, size, size);
    const result = findNearestIntersection(img, 100, 100);
    expect(result).toBeNull();
  });

  it('handles query point at negative coordinates by clamping to image bounds', () => {
    const img = createGridImageData(50, 4);
    // Algorithm clamps the search window to image bounds,
    // so it should find the nearest intersection from the clamped region
    const result = findNearestIntersection(img, -10, -10);
    // Should find something near (0, 0) since window is clamped
    expect(result).not.toBeNull();
    expect(result!.x).toBeLessThanOrEqual(10);
    expect(result!.y).toBeLessThanOrEqual(10);
  });

  it('finds intersection at the edge of the image', () => {
    const gridPx = 50;
    const img = createGridImageData(gridPx, 4);

    // Query near the edge — may snap to the first detected grid line
    const result = findNearestIntersection(img, 5, 5);
    expect(result).not.toBeNull();
    // At the edge, the first detectable grid line may be at offset 0-3 px
    expect(result!.x).toBeLessThanOrEqual(5);
    expect(result!.y).toBeLessThanOrEqual(5);
  });

  it('respects custom darkThreshold config', () => {
    const gridPx = 50;
    const img = createGridImageData(gridPx, 6);

    // With very low threshold, nothing should be detected as dark
    const result = findNearestIntersection(img, 50, 50, { darkThreshold: 10 });
    expect(result).toBeNull();
  });

  it('respects custom radius config', () => {
    const gridPx = 100;
    const img = createGridImageData(gridPx, 4);

    // With small radius, the intersection at (100,100) is too far from (50,50)
    const result = findNearestIntersection(img, 50, 50, { radius: 30 });
    // Nearest intersection at (100,100) is 70px away > 30 radius
    expect(result).toBeNull();
  });

  it('finds intersection on a sparse grid (large spacing)', () => {
    const gridPx = 100;
    const img = createGridImageData(gridPx, 4, 4);

    const result = findNearestIntersection(img, 98, 102, { radius: 80 });
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(100, 0);
    expect(result!.y).toBeCloseTo(100, 0);
  });
});

describe('snapCorner', () => {
  it('snaps to the nearest intersection when found', () => {
    const gridPx = 50;
    const img = createGridImageData(gridPx, 6);

    const result = snapCorner(img, 53, 47);
    expect(result.x).toBeCloseTo(50, 0);
    expect(result.y).toBeCloseTo(50, 0);
  });

  it('returns original coordinates when no intersection is found', () => {
    const size = 200;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200;
      data[i + 1] = 200;
      data[i + 2] = 200;
      data[i + 3] = 255;
    }
    const img = new ImageData(data, size, size);

    const result = snapCorner(img, 100, 100);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
  });
});

// ── Projection-based grid detection tests ──

/**
 * Create a synthetic ImageData with a grid pattern (no offset).
 * Grid lines are dark (gray=40), background is light (gray=200).
 * Grid lines are centered at gridPx intervals (lineWidth pixels wide).
 */
function createGridRegionImage(
  width: number,
  height: number,
  gridPx: number,
  lineWidth = 3,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const localX = x % gridPx;
      const localY = y % gridPx;
      const onGrid =
        localX < lineWidth ||
        localX >= gridPx - lineWidth ||
        localY < lineWidth ||
        localY >= gridPx - lineWidth;
      const gray = onGrid ? 40 : 200;
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255;
    }
  }
  return new globalThis.ImageData(data, width, height) as unknown as ImageData;
}

describe('detectGridFromRegion', () => {
  it('detects grid lines and computes cellPx from a 2×2 region', () => {
    const gridPx = 50;
    const img = createGridRegionImage(200, 200, gridPx);

    // Select a region containing roughly 2×2 grid cells (100×100 area)
    const result = detectGridFromRegion(img, 25, 25, 100, 100);
    expect(result).not.toBeNull();
    expect(result!.cellPx).toBeCloseTo(gridPx, 0);
    // offset should be near 0 for a grid aligned at 0
    expect(result!.offsetX).toBeLessThan(gridPx);
    expect(result!.offsetY).toBeLessThan(gridPx);
  });

  it('detects grid from a larger region with more cells', () => {
    const gridPx = 60;
    const img = createGridRegionImage(300, 300, gridPx);

    // Select a 3×3 area (180×180)
    const result = detectGridFromRegion(img, 30, 30, 180, 180);
    expect(result).not.toBeNull();
    expect(result!.cellPx).toBeCloseTo(gridPx, 0);
  });

  it('returns null when region is too small', () => {
    const img = createGridRegionImage(100, 100, 50);

    const result = detectGridFromRegion(img, 0, 0, 10, 10);
    expect(result).toBeNull();
  });

  it('returns null for a uniform (no-grid) image', () => {
    const size = 200;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200;
      data[i + 1] = 200;
      data[i + 2] = 200;
      data[i + 3] = 255;
    }
    const img = new ImageData(data, size, size);

    const result = detectGridFromRegion(img, 0, 0, size, size);
    expect(result).toBeNull();
  });

  it('clamps region to image bounds', () => {
    const gridPx = 50;
    const img = createGridRegionImage(150, 150, gridPx);

    // Region extends beyond image
    const result = detectGridFromRegion(img, -10, -10, 200, 200);
    expect(result).not.toBeNull();
    expect(result!.cellPx).toBeCloseTo(gridPx, 0);
  });

  it('works with a sparse grid (large spacing)', () => {
    const gridPx = 100;
    const img = createGridRegionImage(400, 400, gridPx, 4);

    // Select 2×2 region
    const result = detectGridFromRegion(img, 50, 50, 200, 200);
    expect(result).not.toBeNull();
    expect(result!.cellPx).toBeCloseTo(gridPx, 0);
  });
});
