/**
 * Tile overlay drawing functions.
 * Draws the paper-size split grid on the canvas, showing
 * how the map is divided into printable tiles.
 */

export interface TileDrawInfo {
  row: number;
  col: number;
  selected: boolean;
  isEmpty: boolean;
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
}

export function drawTiles(ctx: CanvasRenderingContext2D, tiles: TileDrawInfo[][]) {
  ctx.save();
  ctx.lineWidth = 2;

  for (const row of tiles) {
    for (const tile of row) {
      const { srcX: x, srcY: y, srcW: w, srcH: h } = tile;

      if (tile.isEmpty) {
        // Dim empty tiles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.strokeRect(x, y, w, h);
        continue;
      }

      // Draw tile highlight
      if (tile.selected) {
        ctx.fillStyle = 'rgba(50, 200, 100, 0.15)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(50, 200, 100, 0.6)';
      } else {
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      }

      ctx.strokeRect(x, y, w, h);

      // Draw label
      const label = `R${tile.row + 1}C${tile.col + 1}`;
      const fontSize = Math.max(11, Math.min(16, Math.min(w, h) / 8));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = tile.selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h / 2);
    }
  }

  ctx.restore();
}

/**
 * Hit-test: returns the tile at the given map coordinates, or null.
 */
export function hitTestTile(
  mx: number,
  my: number,
  tiles: TileDrawInfo[][],
): { row: number; col: number } | null {
  for (const row of tiles) {
    for (const tile of row) {
      if (
        mx >= tile.srcX &&
        mx <= tile.srcX + tile.srcW &&
        my >= tile.srcY &&
        my <= tile.srcY + tile.srcH
      ) {
        return { row: tile.row, col: tile.col };
      }
    }
  }
  return null;
}
