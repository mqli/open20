/**
 * PDF Generation Engine
 *
 * Assembles a printable PDF from selected battle map tiles.
 * Uses jsPDF with explicit DPI configuration — jsPDF's default is 72 DPI,
 * so all px↔mm conversions use the configured outputDpi.
 */

import { jsPDF } from 'jspdf';
import type { TileInfo } from '@/types';

const TILE_JPEG_QUALITY = 0.92;
const CROP_MARK_LENGTH_MM = 5;
const CROP_MARK_OFFSET_MM = 2;
const LABEL_FONT_SIZE_PT = 9;
const SUB_LABEL_FONT_SIZE_PT = 7;

interface PdfGenerationConfig {
  /** Paper size in mm */
  paperW: number;
  paperH: number;
  /** Margins in mm */
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  /** Output DPI for px↔mm conversion */
  outputDpi: number;
  /** Tile-to-tile overlap in mm (informational) */
  overlapMm: number;
  /** Grid cell px (the source DPI) */
  cellPx: number;
  /** Map label for page headers */
  mapLabel: string;
  /** Global orientation fallback (used when tile has no per-tile orientation) */
  globalOrientation: 'portrait' | 'landscape';
  /** Generate assembly guide as first page */
  includeGuide: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

interface TileSpec {
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
  row: number;
  col: number;
  contentW: number;
  contentH: number;
  /** Tile rotation in degrees */
  rotation: 0 | 90 | 180 | 270;
  /** Per-tile paper orientation. undefined = follow global */
  perTileOrientation?: 'portrait' | 'landscape';
  /** Custom-mode user drag offset X in source pixels */
  userOffsetX: number;
  /** Custom-mode user drag offset Y in source pixels */
  userOffsetY: number;
}

/**
 * Convert mm to output pixels at the configured DPI.
 */
function mmToOutputPx(mm: number, outputDpi: number): number {
  return Math.round((mm / 25.4) * outputDpi);
}

/**
 * Convert source pixels to mm given the source DPI (cellPx).
 * 1 inch = 25.4mm = cellPx pixels
 */
function srcPxToMm(px: number, cellPx: number): number {
  return (px / cellPx) * 25.4;
}

/**
 * Crop a source region from an image and scale to output DPI.
 * Supports rotation. Returns a JPEG data URL.
 */
function cropAndScaleTile(
  img: HTMLImageElement,
  tile: TileSpec,
  cellPx: number,
  outputDpi: number,
): string {
  const canvas = document.createElement('canvas');

  // Apply user offset to source crop region
  const srcX = tile.srcX + tile.userOffsetX;
  const srcY = tile.srcY + tile.userOffsetY;

  // Content area on paper in mm
  const contentW = srcPxToMm(tile.srcW, cellPx);
  const contentH = srcPxToMm(tile.srcH, cellPx);

  // Output pixels
  const isRotated90 = tile.rotation === 90 || tile.rotation === 270;
  canvas.width = mmToOutputPx(isRotated90 ? contentH : contentW, outputDpi);
  canvas.height = mmToOutputPx(isRotated90 ? contentW : contentH, outputDpi);

  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (tile.rotation !== 0) {
    // Rotate around canvas center
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((tile.rotation * Math.PI) / 180);
    // Draw the source region centered; width/height may be swapped
    const drawW = mmToOutputPx(contentW, outputDpi);
    const drawH = mmToOutputPx(contentH, outputDpi);
    ctx.drawImage(img, srcX, srcY, tile.srcW, tile.srcH, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Draw cropped region, scaled to output DPI
    ctx.drawImage(img, srcX, srcY, tile.srcW, tile.srcH, 0, 0, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/jpeg', TILE_JPEG_QUALITY);
}

/**
 * Draw L-shaped crop marks at the four corners of a tile content area.
 * Coordinates in mm.
 */
function drawCropMarks(doc: jsPDF, x: number, y: number, w: number, h: number) {
  const L = CROP_MARK_LENGTH_MM;
  const off = CROP_MARK_OFFSET_MM;

  doc.setLineWidth(0.2);
  doc.setDrawColor(0, 0, 0);

  // Top-left
  doc.line(x - off, y - off - L, x - off, y - off);
  doc.line(x - off - L, y - off, x - off, y - off);
  // Top-right
  doc.line(x + w + off, y - off - L, x + w + off, y - off);
  doc.line(x + w + off, y - off, x + w + off + L, y - off);
  // Bottom-left
  doc.line(x - off, y + h + off, x - off, y + h + off + L);
  doc.line(x - off - L, y + h + off, x - off, y + h + off);
  // Bottom-right
  doc.line(x + w + off, y + h + off, x + w + off, y + h + off + L);
  doc.line(x + w + off, y + h + off, x + w + off + L, y + h + off);
}

/**
 * Draw dashed cut lines around the content area.
 */
function drawCutLines(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setLineWidth(0.1);
  doc.setDrawColor(180, 180, 180);

  const dashLen = 3;
  const gapLen = 2;
  const segLen = dashLen + gapLen;

  // Top edge
  for (let px = x; px < x + w; px += segLen) {
    doc.line(px, y, Math.min(px + dashLen, x + w), y);
  }
  // Bottom edge
  for (let px = x; px < x + w; px += segLen) {
    doc.line(px, y + h, Math.min(px + dashLen, x + w), y + h);
  }
  // Left edge
  for (let py = y; py < y + h; py += segLen) {
    doc.line(x, py, x, Math.min(py + dashLen, y + h));
  }
  // Right edge
  for (let py = y; py < y + h; py += segLen) {
    doc.line(x + w, py, x + w, Math.min(py + dashLen, y + h));
  }
}

/**
 * Draw tile label and scale indicator at the bottom of the page.
 */
function drawTileLabel(
  doc: jsPDF,
  row: number,
  col: number,
  totalRows: number,
  totalCols: number,
  mapLabel: string,
  cellPx: number,
  paperW: number,
  paperH: number,
  marginBottom: number,
  isLandscape: boolean,
  rotation: number,
) {
  const orientTag = isLandscape ? ' (横排)' : '';
  const rotateTag = rotation !== 0 ? ` ↻${rotation}°` : '';
  const label = `${mapLabel}${orientTag}  R${row + 1}C${col + 1}/${totalRows}×${totalCols}${rotateTag}`;
  const subLabel = `1格 = 25.4mm @ ${cellPx} DPI`;

  const labelY = paperH - marginBottom + 8;
  const subLabelY = paperH - marginBottom + 20;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(LABEL_FONT_SIZE_PT);
  doc.text(label, paperW / 2, labelY, { align: 'center' });

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(SUB_LABEL_FONT_SIZE_PT);
  doc.text(subLabel, paperW / 2, subLabelY, { align: 'center' });
}

/**
 * Generate the assembly guide page.
 * Creates a scaled-down map preview with tile grid overlay.
 * In custom mode, tiles may have user offsets — individual tile rectangles
 * are drawn instead of a uniform grid.
 */
function drawAssemblyGuidePage(
  img: HTMLImageElement,
  cols: number,
  rows: number,
  doc: jsPDF,
  config: PdfGenerationConfig,
  tiles?: TileInfo[],
): void {
  const pw = config.paperW;
  const ph = config.paperH;
  const ml = config.marginLeft;
  const mr = config.marginRight;
  const mt = config.marginTop;
  const mb = config.marginBottom;

  // ── Title ──
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('Tile Assembly Guide', pw / 2, mt + 8, { align: 'center' });

  // ── Info ──
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const info = `${cols} x ${rows} = ${cols * rows} pages | 1 cell = 25.4mm | Source ${config.cellPx} DPI`;
  doc.text(info, pw / 2, mt + 17, { align: 'center' });

  // ── Map preview ──
  const previewY = mt + 24;
  const previewMaxW = pw - ml - mr;
  const previewMaxH = ph - previewY - mb - 40;

  const scale = Math.min(previewMaxW / img.naturalWidth, previewMaxH / img.naturalHeight);
  const prevW = img.naturalWidth * scale;
  const prevH = img.naturalHeight * scale;
  const prevX = (pw - prevW) / 2;

  // Render map as crisp 2x preview on a canvas
  const pCanvas = document.createElement('canvas');
  pCanvas.width = Math.round(prevW * 2);
  pCanvas.height = Math.round(prevH * 2);
  const pCtx = pCanvas.getContext('2d')!;
  pCtx.drawImage(img, 0, 0, pCanvas.width, pCanvas.height);
  doc.addImage(pCanvas.toDataURL('image/jpeg', 0.85), 'JPEG', prevX, previewY, prevW, prevH);

  // ── Tile grid overlay ──
  const hasCustomOffsets = tiles && tiles.some((t) => t.userOffsetX !== 0 || t.userOffsetY !== 0);

  if (hasCustomOffsets && tiles) {
    // Custom mode: draw individual tile rectangles at user-offset positions
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 40, 40);
    doc.setFontSize(8);
    doc.setTextColor(200, 40, 40);

    for (const tile of tiles) {
      const x = prevX + (tile.srcX + tile.userOffsetX) * scale;
      const y = previewY + (tile.srcY + tile.userOffsetY) * scale;
      const w = tile.srcW * scale;
      const h = tile.srcH * scale;

      doc.rect(x, y, w, h);

      // Rotation indicator
      const rotLabel = tile.rotation !== 0 ? ` ↻${tile.rotation}°` : '';
      doc.text(`R${tile.row + 1}C${tile.col + 1}${rotLabel}`, x + w / 2, y + h / 2, {
        align: 'center',
        baseline: 'middle',
      });
    }
  } else {
    // Auto mode: uniform grid
    const cellW = prevW / cols;
    const cellH = prevH / rows;

    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 40, 40);

    for (let r = 0; r <= rows; r++)
      doc.line(prevX, previewY + r * cellH, prevX + prevW, previewY + r * cellH);
    for (let c = 0; c <= cols; c++)
      doc.line(prevX + c * cellW, previewY, prevX + c * cellW, previewY + prevH);

    // Labels
    doc.setFontSize(12);
    doc.setTextColor(200, 40, 40);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        doc.text(`R${r + 1}C${c + 1}`, prevX + (c + 0.5) * cellW, previewY + (r + 0.5) * cellH, {
          align: 'center',
          baseline: 'middle',
        });
      }
    }
  }

  // ── Instructions ──
  const instY = previewY + prevH + 10;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);

  const steps = [
    `1. Print all ${cols * rows} pages at 100% scale (no "fit to page").`,
    '2. Cut along the L-shaped crop marks on each page.',
    '3. Arrange by tile labels shown above (R1C1, R1C2...).',
    '4. Align overlap areas and tape together from the back.',
    '5. Verify: one grid square = exactly 25.4mm (1 inch).',
  ];
  for (let i = 0; i < steps.length; i++) doc.text(steps[i], ml, instY + i * 5);
}

/**
 * Generate the complete PDF from selected tiles.
 *
 * @returns {Promise<Blob>} PDF blob
 */
export async function generatePdf(
  img: HTMLImageElement,
  tiles: TileInfo[],
  totalRows: number,
  totalCols: number,
  config: PdfGenerationConfig,
): Promise<Blob> {
  const doc = new jsPDF({
    unit: 'mm',
    format: [config.paperW, config.paperH],
  });

  // Assembly guide (first page)
  if (config.includeGuide) {
    drawAssemblyGuidePage(img, totalCols, totalRows, doc, config, tiles);
    if (tiles.length > 0) {
      doc.addPage();
    }
  }

  // Generate tile pages
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];

    config.onProgress?.(i + 1, tiles.length);

    // Determine paper orientation for this tile
    const tileOrientation = tile.perTileOrientation ?? config.globalOrientation;
    const isLandscape = tileOrientation === 'landscape';

    // Build tile spec for cropping
    const spec: TileSpec = {
      srcX: tile.srcX,
      srcY: tile.srcY,
      srcW: tile.srcW,
      srcH: tile.srcH,
      row: tile.row,
      col: tile.col,
      contentW: tile.contentW,
      contentH: tile.contentH,
      rotation: tile.rotation,
      perTileOrientation: tile.perTileOrientation,
      userOffsetX: tile.userOffsetX,
      userOffsetY: tile.userOffsetY,
    };

    // Crop and scale the tile
    const tileUrl = cropAndScaleTile(img, spec, config.cellPx, config.outputDpi);

    // Content area on paper in mm — use effective dimensions (accounting for rotation)
    const isRotated = tile.rotation === 90 || tile.rotation === 270;
    const tileContentW = srcPxToMm(isRotated ? tile.srcH : tile.srcW, config.cellPx);
    const tileContentH = srcPxToMm(isRotated ? tile.srcW : tile.srcH, config.cellPx);

    // Content area available on page (minus label)
    // If per-tile orientation differs from global, swap paper dimensions for this page
    let paperW = config.paperW;
    let paperH = config.paperH;
    if (isLandscape !== (config.globalOrientation === 'landscape')) {
      // Swap paper dimensions for this tile's orientation
      paperW = config.paperH;
      paperH = config.paperW;
    }

    // Set page size for this tile
    if (i > 0 || config.includeGuide) {
      // If we already added pages, we need to handle per-page sizing
      // jsPDF doesn't support per-page size changes easily in the same doc
      // For now, keep the same page size; orientation is indicated in the label
    }

    const availW = paperW - config.marginLeft - config.marginRight;
    const availH = paperH - config.marginTop - config.marginBottom;

    // Center the tile in the content area
    const tileX = config.marginLeft + (availW - tileContentW) / 2;
    const tileY = config.marginTop + (availH - tileContentH) / 2;

    // Draw the tile image
    try {
      doc.addImage(tileUrl, 'JPEG', tileX, tileY, tileContentW, tileContentH);
    } catch {
      // Fallback: if JPEG fails, try as PNG
      const pngCanvas = document.createElement('canvas');
      const pngW = mmToOutputPx(tileContentW, config.outputDpi);
      const pngH = mmToOutputPx(tileContentH, config.outputDpi);
      pngCanvas.width = pngW;
      pngCanvas.height = pngH;
      const pngCtx = pngCanvas.getContext('2d')!;
      pngCtx.fillStyle = '#ffffff';
      pngCtx.fillRect(0, 0, pngW, pngH);
      const pngSrcX = tile.srcX + tile.userOffsetX;
      const pngSrcY = tile.srcY + tile.userOffsetY;
      if (tile.rotation !== 0) {
        pngCtx.save();
        pngCtx.translate(pngW / 2, pngH / 2);
        pngCtx.rotate((tile.rotation * Math.PI) / 180);
        pngCtx.drawImage(
          img,
          pngSrcX,
          pngSrcY,
          tile.srcW,
          tile.srcH,
          -pngW / 2,
          -pngH / 2,
          pngW,
          pngH,
        );
        pngCtx.restore();
      } else {
        pngCtx.drawImage(img, pngSrcX, pngSrcY, tile.srcW, tile.srcH, 0, 0, pngW, pngH);
      }
      const pngDataUrl = pngCanvas.toDataURL('image/png');
      doc.addImage(pngDataUrl, 'PNG', tileX, tileY, tileContentW, tileContentH);
    }

    // Crop marks
    drawCropMarks(doc, tileX, tileY, tileContentW, tileContentH);

    // Dashed cut lines
    drawCutLines(doc, tileX, tileY, tileContentW, tileContentH);

    // Tile label
    drawTileLabel(
      doc,
      tile.row,
      tile.col,
      totalRows,
      totalCols,
      config.mapLabel,
      config.cellPx,
      paperW,
      paperH,
      config.marginBottom,
      isLandscape,
      tile.rotation,
    );

    if (i < tiles.length - 1) {
      doc.addPage();
    }
  }

  config.onProgress?.(tiles.length, tiles.length);

  return doc.output('blob');
}
