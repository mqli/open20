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
const LABEL_HEIGHT_MM = 12;
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
  /** Whether tiles are in landscape orientation */
  isLandscape: boolean;
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
 * Returns a JPEG data URL.
 */
function cropAndScaleTile(
  img: HTMLImageElement,
  tile: TileSpec,
  cellPx: number,
  outputDpi: number,
): string {
  const canvas = document.createElement('canvas');

  // Content area on paper in mm
  const contentW = srcPxToMm(tile.srcW, cellPx);
  const contentH = srcPxToMm(tile.srcH, cellPx);

  // Output pixels
  canvas.width = mmToOutputPx(contentW, outputDpi);
  canvas.height = mmToOutputPx(contentH, outputDpi);

  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw cropped region, scaled to output DPI
  ctx.drawImage(img, tile.srcX, tile.srcY, tile.srcW, tile.srcH, 0, 0, canvas.width, canvas.height);

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
) {
  const orientTag = isLandscape ? ' (横排)' : '';
  const label = `${mapLabel}${orientTag}  R${row + 1}C${col + 1}/${totalRows}×${totalCols}`;
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
 */
function generateAssemblyGuide(img: HTMLImageElement, cols: number, rows: number): string {
  // Scale preview to fit within 170×220mm on the page
  const previewMaxW = 170;
  const previewMaxH = 220;
  const scale = Math.min(previewMaxW / img.naturalWidth, previewMaxH / img.naturalHeight);
  const prevW = Math.round(img.naturalWidth * scale);
  const prevH = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = prevW;
  canvas.height = prevH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, prevW, prevH);

  // Draw tile grid overlay
  const cellW = prevW / cols;
  const cellH = prevH / rows;

  ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
  ctx.lineWidth = 2;

  // Grid lines
  for (let row = 0; row <= rows; row++) {
    const y = Math.round(row * cellH);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(prevW, y);
    ctx.stroke();
  }
  for (let col = 0; col <= cols; col++) {
    const x = Math.round(col * cellW);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, prevH);
    ctx.stroke();
  }

  // Row/col labels
  ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = (col + 0.5) * cellW;
      const cy = (row + 0.5) * cellH;
      ctx.fillText(`R${row + 1}C${col + 1}`, cx, cy);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.9);
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
    const guideUrl = generateAssemblyGuide(img, totalCols, totalRows);

    const contentW = config.paperW - config.marginLeft - config.marginRight;
    const contentH = config.paperH - config.marginTop - config.marginBottom;

    // Scale guide to fit content area
    const guideScale = Math.min(contentW / 170, contentH / 220);
    const guideW = 170 * guideScale;
    const guideH = 220 * guideScale;
    const guideX = (config.paperW - guideW) / 2;
    const guideY = config.marginTop + 30;

    doc.addImage(guideUrl, 'JPEG', guideX, guideY, guideW, guideH);

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`拼接指南 — ${config.mapLabel}`, config.paperW / 2, 20, { align: 'center' });

    // Info
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `${totalCols} 列 × ${totalRows} 行 = ${totalCols * totalRows} 张 A4, 1格=25.4mm`,
      config.paperW / 2,
      28,
      { align: 'center' },
    );

    // Instructions
    const instY = guideY + guideH + 15;
    const instructions = [
      `打印所有 ${totalCols * totalRows} 张，使用 A4 纸，100% 比例，无缩放。`,
      '沿 L 形裁剪标记裁切每张纸。',
      '按 R行C列 编号排列，重叠区对齐图案。',
      '用透明胶带从背面拼接。',
      '',
      `网格尺度：1格 = 25.4mm (1英寸), 源图 ${config.cellPx} DPI。`,
    ];
    for (let i = 0; i < instructions.length; i++) {
      doc.text(instructions[i], config.marginLeft + 5, instY + i * 6);
    }

    if (tiles.length > 0) {
      doc.addPage();
    }
  }

  // Generate tile pages
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];

    config.onProgress?.(i + 1, tiles.length);

    // Crop and scale the tile
    const tileUrl = cropAndScaleTile(img, tile, config.cellPx, config.outputDpi);

    // Content area on paper
    const tileContentW = srcPxToMm(tile.srcW, config.cellPx);
    const tileContentH = srcPxToMm(tile.srcH, config.cellPx);

    // Content area available on page (minus label)
    const availW = config.paperW - config.marginLeft - config.marginRight;
    const availH = config.paperH - config.marginTop - config.marginBottom - LABEL_HEIGHT_MM;

    // Center the tile in the content area
    const tileX = config.marginLeft + (availW - tileContentW) / 2;
    const tileY = config.marginTop + (availH - tileContentH) / 2;

    // Draw the tile image
    try {
      doc.addImage(tileUrl, 'JPEG', tileX, tileY, tileContentW, tileContentH);
    } catch {
      // Fallback: if JPEG fails, try as PNG
      // Recreate canvas for PNG
      const pngCanvas = document.createElement('canvas');
      pngCanvas.width = mmToOutputPx(tileContentW, config.outputDpi);
      pngCanvas.height = mmToOutputPx(tileContentH, config.outputDpi);
      const pngCtx = pngCanvas.getContext('2d')!;
      pngCtx.drawImage(
        img,
        tile.srcX,
        tile.srcY,
        tile.srcW,
        tile.srcH,
        0,
        0,
        pngCanvas.width,
        pngCanvas.height,
      );
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
      config.paperW,
      config.paperH,
      config.marginBottom,
      config.isLandscape,
    );

    if (i < tiles.length - 1) {
      doc.addPage();
    }
  }

  config.onProgress?.(tiles.length, tiles.length);

  return doc.output('blob');
}
