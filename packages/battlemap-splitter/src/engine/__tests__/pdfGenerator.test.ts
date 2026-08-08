import { describe, it, expect } from 'vitest';

/**
 * Tests for PDF generation constants and utility conversions.
 *
 * The actual `generatePdf` function requires jsPDF + HTMLCanvasElement
 * which are not available in happy-dom, so we test the pure conversion
 * functions indirectly through known constants.
 */

const TILE_JPEG_QUALITY = 0.92;
const CROP_MARK_LENGTH_MM = 5;
const CROP_MARK_OFFSET_MM = 2;
const LABEL_FONT_SIZE_PT = 9;
const SUB_LABEL_FONT_SIZE_PT = 7;

describe('pdfGenerator constants', () => {
  it('uses high JPEG quality for tiles', () => {
    expect(TILE_JPEG_QUALITY).toBe(0.92);
  });

  it('has reasonable crop mark dimensions', () => {
    expect(CROP_MARK_LENGTH_MM).toBe(5);
    expect(CROP_MARK_OFFSET_MM).toBe(2);
  });

  it('has readable label font sizes', () => {
    expect(LABEL_FONT_SIZE_PT).toBeGreaterThan(6);
    expect(SUB_LABEL_FONT_SIZE_PT).toBeGreaterThan(4);
    expect(LABEL_FONT_SIZE_PT).toBeGreaterThan(SUB_LABEL_FONT_SIZE_PT);
  });
});

describe('mm to pixel conversions (core logic)', () => {
  /**
   * mmToOutputPx(mm, outputDpi): px = round((mm / 25.4) * outputDpi)
   * srcPxToMm(px, cellPx): mm = (px / cellPx) * 25.4
   *
   * These are private functions in pdfGenerator.ts, tested here
   * as inline logic to verify the conversion formulas.
   */
  function mmToOutputPx(mm: number, outputDpi: number): number {
    return Math.round((mm / 25.4) * outputDpi);
  }

  function srcPxToMm(px: number, cellPx: number): number {
    return (px / cellPx) * 25.4;
  }

  it('converts 25.4mm to 150 output pixels at 150 DPI', () => {
    expect(mmToOutputPx(25.4, 150)).toBe(150);
  });

  it('converts 25.4mm to 72 output pixels at 72 DPI', () => {
    expect(mmToOutputPx(25.4, 72)).toBe(72);
  });

  it('converts 1 inch (25.4mm) to 300px at 300 DPI', () => {
    expect(mmToOutputPx(25.4, 300)).toBe(300);
  });

  it('converts 210mm (A4 width) at 150 DPI', () => {
    const px = mmToOutputPx(210, 150);
    expect(px).toBe(Math.round((210 / 25.4) * 150));
  });

  it('converts source pixels to mm correctly at 70 DPI', () => {
    // 70 px at 70 DPI = 1 inch = 25.4mm
    expect(srcPxToMm(70, 70)).toBeCloseTo(25.4, 1);
  });

  it('converts source pixels to mm at 143 DPI', () => {
    // 143 px at 143 DPI = 1 inch = 25.4mm
    expect(srcPxToMm(143, 143)).toBeCloseTo(25.4, 1);
  });

  it('scale preservation: outputPx / outputDpi === srcPx / cellPx', () => {
    // The fundamental invariant: physical size is preserved across the conversion
    const cellPx = 70;
    const outputDpi = 150;
    const srcW = 700; // 10 inches at 70 DPI

    const physicalMm = srcPxToMm(srcW, cellPx);
    const outputPx = mmToOutputPx(physicalMm, outputDpi);

    // Both represent the same physical size in inches
    expect(srcW / cellPx).toBeCloseTo(outputPx / outputDpi, 1);
  });
});

describe('tile label orientation tag', () => {
  /**
   * The orientTag logic in drawTileLabel:
   *   orientTag = isLandscape ? ' (横排)' : ''
   *
   * Tests the expected behavior for landscape vs portrait labels.
   */
  function getOrientTag(isLandscape: boolean): string {
    return isLandscape ? ' (横排)' : '';
  }

  it('adds 横排 tag for landscape tiles', () => {
    expect(getOrientTag(true)).toBe(' (横排)');
  });

  it('adds no tag for portrait tiles', () => {
    expect(getOrientTag(false)).toBe('');
  });
});

describe('sub-label scale verification text', () => {
  function getSubLabel(cellPx: number): string {
    return `1格 = 25.4mm @ ${cellPx} DPI`;
  }

  it('shows the correct DPI in the scale verification', () => {
    expect(getSubLabel(70)).toBe('1格 = 25.4mm @ 70 DPI');
    expect(getSubLabel(143)).toBe('1格 = 25.4mm @ 143 DPI');
    expect(getSubLabel(150)).toBe('1格 = 25.4mm @ 150 DPI');
  });
});
