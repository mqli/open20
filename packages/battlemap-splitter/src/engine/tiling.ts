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
  orientation: 'auto' | 'portrait' | 'landscape' = 'auto',
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

  // Decision: fewer pages wins; if tied, less waste wins (≥1% difference); else portrait
  let useLandscape = false;
  let sliceW: number;
  let sliceH: number;
  let cols: number;
  let rows: number;

  if (orientation === 'landscape') {
    useLandscape = true;
  } else if (orientation === 'portrait') {
    useLandscape = false;
  } else if (landscape.pages < portrait.pages) {
    useLandscape = true;
  } else if (landscape.pages === portrait.pages && landscape.waste < portrait.waste - 1) {
    useLandscape = true;
  }

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
      // Source pixel region
      let srcX = col * mmToSrcPx(sliceW, cellPx);
      let srcY = row * mmToSrcPx(sliceH, cellPx);

      // Apply overlap (shift back by overlap for non-first tiles)
      if (col > 0) {
        srcX -= mmToSrcPx(overlapMm, cellPx);
      }
      if (row > 0) {
        srcY -= mmToSrcPx(overlapMm, cellPx);
      }

      // Clamp to image bounds
      srcX = Math.max(0, Math.min(srcX, imageW));
      srcY = Math.max(0, Math.min(srcY, imageH));

      let srcW = mmToSrcPx(sliceW, cellPx);
      let srcH = mmToSrcPx(sliceH, cellPx);

      // Clamp width/height to image bounds
      if (srcX + srcW > imageW) {
        srcW = imageW - srcX;
      }
      if (srcY + srcH > imageH) {
        srcH = imageH - srcY;
      }

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
