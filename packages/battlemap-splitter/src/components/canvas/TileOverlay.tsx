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
  /** Tile rotation in degrees (0, 90, 180, 270) */
  rotation: 0 | 90 | 180 | 270;
  /** Custom-mode user drag offset X in source pixels */
  userOffsetX: number;
  /** Custom-mode user drag offset Y in source pixels */
  userOffsetY: number;
}

export interface SelectedTileInfo {
  row: number;
  col: number;
}

/**
 * Get the effective (user-offset) position of a tile in source pixels.
 */
export function effectiveTilePos(tile: TileDrawInfo): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  return {
    x: tile.srcX + tile.userOffsetX,
    y: tile.srcY + tile.userOffsetY,
    w: tile.srcW,
    h: tile.srcH,
  };
}

/**
 * Compute the axis-aligned bounding box of a potentially rotated tile.
 * For rotation 0/180: AABB = tile rect itself.
 * For rotation 90/270: width and height swap, center stays the same.
 */
export function tileAABB(tile: TileDrawInfo): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const { x, y, w, h } = effectiveTilePos(tile);
  if (tile.rotation === 90 || tile.rotation === 270) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    return { x: cx - h / 2, y: cy - w / 2, w: h, h: w };
  }
  return { x, y, w, h };
}

export function drawTiles(
  ctx: CanvasRenderingContext2D,
  tiles: TileDrawInfo[][],
  selectedTile?: SelectedTileInfo | null,
) {
  ctx.save();
  ctx.lineWidth = 2;

  for (const row of tiles) {
    for (const tile of row) {
      const { x, y, w, h } = effectiveTilePos(tile);
      const isSelected = selectedTile?.row === tile.row && selectedTile?.col === tile.col;

      // Skip deselected tiles — only show selected and empty tiles
      if (!tile.selected && !tile.isEmpty) continue;

      if (tile.isEmpty) {
        // Dim empty tiles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.strokeRect(x, y, w, h);
        continue;
      }

      // Draw with rotation if needed
      if (tile.rotation !== 0) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.translate(cx, cy);
        ctx.rotate((tile.rotation * Math.PI) / 180);
        // After rotation, the rect is drawn from (-w/2, -h/2) to (w/2, h/2)
        const rw = tile.rotation === 90 || tile.rotation === 270 ? h : w;
        const rh = tile.rotation === 90 || tile.rotation === 270 ? w : h;

        // Draw tile highlight
        if (tile.selected) {
          ctx.fillStyle = 'rgba(50, 200, 100, 0.15)';
          ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
          ctx.strokeStyle = 'rgba(50, 200, 100, 0.6)';
        } else {
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        }

        if (isSelected) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
          ctx.lineWidth = 3;
        }

        ctx.strokeRect(-rw / 2, -rh / 2, rw, rh);

        // Draw label
        const label = `R${tile.row + 1}C${tile.col + 1}`;
        const fontSize = Math.max(11, Math.min(16, Math.min(rw, rh) / 8));
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = tile.selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);

        ctx.restore();
      } else {
        // No rotation — existing drawing logic
        if (tile.selected) {
          ctx.fillStyle = 'rgba(50, 200, 100, 0.15)';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = isSelected ? 'rgba(59, 130, 246, 0.9)' : 'rgba(50, 200, 100, 0.6)';
        } else {
          ctx.strokeStyle = isSelected ? 'rgba(59, 130, 246, 0.9)' : 'rgba(200, 200, 200, 0.5)';
        }

        if (isSelected) {
          ctx.lineWidth = 3;
        }
        ctx.strokeRect(x, y, w, h);
        if (isSelected) {
          ctx.lineWidth = 2;
        }

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
  }

  ctx.restore();
}

/**
 * Hit-test: returns the tile at the given map coordinates, or null.
 * Supports rotated tiles via AABB test.
 */
export function hitTestTile(
  mx: number,
  my: number,
  tiles: TileDrawInfo[][],
): { row: number; col: number } | null {
  // Check from last to first (reverse draw order) so overlapping tiles
  // return the topmost one
  for (let ri = tiles.length - 1; ri >= 0; ri--) {
    const row = tiles[ri];
    for (let ci = row.length - 1; ci >= 0; ci--) {
      const tile = row[ci];
      if (tile.isEmpty || !tile.selected) continue;
      const bb = tileAABB(tile);
      if (mx >= bb.x && mx <= bb.x + bb.w && my >= bb.y && my <= bb.y + bb.h) {
        return { row: tile.row, col: tile.col };
      }
    }
  }
  return null;
}
