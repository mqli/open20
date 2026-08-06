/**
 * Grid overlay drawing functions.
 * Draws a calibration grid on the canvas to help users align
 * the overlay with the map's built-in grid.
 */

export interface GridDrawState {
  cellPx: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  mapW: number,
  mapH: number,
  grid: GridDrawState,
) {
  ctx.save();
  ctx.globalAlpha = grid.opacity;
  ctx.strokeStyle = grid.color;
  ctx.lineWidth = 1;

  const startX = grid.offsetX % grid.cellPx;
  const startY = grid.offsetY % grid.cellPx;

  // Vertical lines
  for (let x = startX; x <= mapW; x += grid.cellPx) {
    if (x < 0) continue;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, mapH);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = startY; y <= mapH; y += grid.cellPx) {
    if (y < 0) continue;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(mapW, y);
    ctx.stroke();
  }

  ctx.restore();
}
