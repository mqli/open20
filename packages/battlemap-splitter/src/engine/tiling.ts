/**
 * Tiling Calculation Engine
 *
 * Direct port of `calc_grid` from generate_battlemaps.py.
 * Computes how a battle map is split into printable tiles based on
 * paper size, margins, overlap, and grid scale.
 */

import type { PaperConfig, TileGrid, TileInfo } from '@/types';

const OVERLAP_MM = 5; // default overlap

/**
 * Tile content area dimensions (contentW, contentH) for a given paper + margins.
 */
function contentArea(paper: PaperConfig): { w: number; h: number } {
  return {
    w: paper.widthMm - paper.marginLeft - paper.marginRight,
    h: paper.heightMm - paper.marginTop - paper.marginBottom,
  };
}

interface CalcGridResult {
  cols: number;
  rows: number;
  pages: number;
  sliceW: number; // mm
  sliceH: number; // mm
  waste: number; // percentage
}

/**
 * Calculate tile grid dimensions for given map size and content area orientation.
 * Returns grid info including the slice dimensions in mm.
 */
function calcGrid(
  mapW: number,
  mapH: number,
  contentW: number,
  contentH: number,
  overlapMm: number,
): CalcGridResult {
  const effW = contentW - overlapMm;
  const effH = contentH - overlapMm;
  let cols = Math.max(1, Math.ceil((mapW - overlapMm) / effW));
  let rows = Math.max(1, Math.ceil((mapH - overlapMm) / effH));
  let sliceW = (mapW + (cols - 1) * overlapMm) / cols;
  let sliceH = (mapH + (rows - 1) * overlapMm) / rows;

  // Fit-adjust: if slice exceeds content area, add tiles
  while (sliceW > contentW + 1) {
    cols += 1;
    sliceW = (mapW + (cols - 1) * overlapMm) / cols;
  }
  while (sliceH > contentH + 1) {
    rows += 1;
    sliceH = (mapH + (rows - 1) * overlapMm) / rows;
  }

  const pages = cols * rows;
  const waste = (1 - (sliceW * sliceH * pages) / (contentW * contentH * pages)) * 100;

  return { cols, rows, pages, sliceW, sliceH, waste };
}

/**
 * Convert mm to source pixels given the grid DPI (cellPx).
 * 1 inch = 25.4 mm = cellPx pixels
 */
function mmToSrcPx(mm: number, cellPx: number): number {
  return (mm / 25.4) * cellPx;
}

/**
 * Evaluate which orientation (portrait or landscape) yields fewer pages for
 * the given map and paper configuration. Uses the same decision logic that
 * was previously part of computeTileGrid's "auto" mode.
 */
export function evaluateBestOrientation(
  imageW: number,
  imageH: number,
  cellPx: number,
  paper: PaperConfig,
  labelHeightMm = 12,
): 'portrait' | 'landscape' {
  const overlayMm = paper.overlapMm ?? OVERLAP_MM;

  const mapW = (imageW / cellPx) * 25.4;
  const mapH = (imageH / cellPx) * 25.4;

  const ca = contentArea(paper);
  const portraitCA = { w: ca.w, h: ca.h - labelHeightMm };
  const landscapeCA = { w: ca.h - labelHeightMm, h: ca.w };

  const portraitResult = calcGrid(mapW, mapH, portraitCA.w, portraitCA.h, overlayMm);
  const landscapeResult = calcGrid(mapW, mapH, landscapeCA.w, landscapeCA.h, overlayMm);

  if (landscapeResult.pages < portraitResult.pages) return 'landscape';
  if (
    landscapeResult.pages === portraitResult.pages &&
    landscapeResult.waste < portraitResult.waste - 1
  ) {
    return 'landscape';
  }
  return 'portrait';
}

/**
 * Compute the tile grid for a battle map.
 *
 * @param imageW - Source image width in pixels
 * @param imageH - Source image height in pixels
 * @param cellPx - Grid cell size in pixels (also the source DPI)
 * @param paper - Paper configuration (size, margins)
 * @param labelHeightMm - Height reserved for the label at the bottom of each page (default 12mm)
 * @returns TileGrid with 2D array of TileInfo
 */
export function computeTileGrid(
  imageW: number,
  imageH: number,
  cellPx: number,
  paper: PaperConfig,
  orientation: 'portrait' | 'landscape' = 'portrait',
  labelHeightMm = 12,
): TileGrid {
  const overlapMm = paper.overlapMm ?? OVERLAP_MM;

  // Map physical size in mm
  const mapW = (imageW / cellPx) * 25.4;
  const mapH = (imageH / cellPx) * 25.4;

  // Content area (portrait orientation)
  const ca = contentArea(paper);
  const portraitCA = { w: ca.w, h: ca.h - labelHeightMm };

  // Content area (landscape orientation) — width and height swapped
  // In landscape, the paper height becomes the content width, paper width becomes content height
  const landscapeCA = {
    w: ca.h - labelHeightMm, // taller edge minus label
    h: ca.w, // shorter edge
  };

  // Evaluate both orientations
  const portrait = calcGrid(mapW, mapH, portraitCA.w, portraitCA.h, overlapMm);
  const landscape = calcGrid(mapW, mapH, landscapeCA.w, landscapeCA.h, overlapMm);

  // Decision: use the specified orientation
  const useLandscape = orientation === 'landscape';
  let sliceW: number;
  let sliceH: number;
  let cols: number;
  let rows: number;

  if (useLandscape) {
    cols = landscape.cols;
    rows = landscape.rows;
    sliceW = landscape.sliceW;
    sliceH = landscape.sliceH;
  } else {
    cols = portrait.cols;
    rows = portrait.rows;
    sliceW = portrait.sliceW;
    sliceH = portrait.sliceH;
  }

  // Build 2D tile array
  const tiles: TileInfo[][] = [];

  for (let row = 0; row < rows; row++) {
    const tileRow: TileInfo[] = [];
    for (let col = 0; col < cols; col++) {
      // Source pixel region — each tile extends overlapMm/2 on every side
      // for printing alignment. Internal tiles overlap with adjacent tiles
      // by full overlapMm (halfOverlap from each side); edge tiles are
      // clamped to image bounds.
      const halfOverlapPx = mmToSrcPx(overlapMm / 2, cellPx);
      const overlapPx = mmToSrcPx(overlapMm, cellPx);

      let srcX = col * mmToSrcPx(sliceW, cellPx) - halfOverlapPx;
      let srcY = row * mmToSrcPx(sliceH, cellPx) - halfOverlapPx;

      let srcW = mmToSrcPx(sliceW, cellPx) + overlapPx;
      let srcH = mmToSrcPx(sliceH, cellPx) + overlapPx;

      // Clamp to image bounds
      const clampedX = Math.max(0, srcX);
      const clampedY = Math.max(0, srcY);
      srcW = Math.min(srcX + srcW, imageW) - clampedX;
      srcH = Math.min(srcY + srcH, imageH) - clampedY;
      srcX = clampedX;
      srcY = clampedY;

      // Content area in mm for this tile
      const contentW = useLandscape
        ? paper.heightMm - paper.marginTop - paper.marginBottom
        : paper.widthMm - paper.marginLeft - paper.marginRight;
      const contentH = useLandscape
        ? paper.widthMm - paper.marginLeft - paper.marginRight
        : paper.heightMm - paper.marginTop - paper.marginBottom;

      tileRow.push({
        row,
        col,
        srcX: Math.round(srcX),
        srcY: Math.round(srcY),
        srcW: Math.round(srcW),
        srcH: Math.round(srcH),
        contentW,
        contentH,
      });
    }
    tiles.push(tileRow);
  }

  return {
    cols,
    rows,
    tiles,
    orientation: useLandscape ? 'landscape' : 'portrait',
  };
}
