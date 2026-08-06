import { useRef, useEffect, useCallback, useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';
import { useTileStore } from '@/stores/tileStore';
import { drawGrid } from '@/components/canvas/GridOverlay';
import { drawTiles } from '@/components/canvas/TileOverlay';

export interface CanvasRendererOptions {
  onDraw?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export function useCanvasRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: CanvasRendererOptions = {},
) {
  const [isReady] = useState(true);
  const rafId = useRef<number>(0);
  const { onDraw } = options;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const map = useMapStore.getState();
    const grid = useGridStore.getState();
    const tileStore = useTileStore.getState();

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!map.imageUrl) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#888';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a battle map to begin', canvas.width / 2, canvas.height / 2);
      return;
    }

    ctx.save();

    // Viewport: center the image, apply zoom and pan
    const mapW = map.width * map.zoom;
    const mapH = map.height * map.zoom;
    const offsetX = (canvas.width - mapW) / 2 + map.panX;
    const offsetY = (canvas.height - mapH) / 2 + map.panY;

    ctx.translate(offsetX, offsetY);
    ctx.scale(map.zoom, map.zoom);

    // Draw base map
    if (onDraw) {
      onDraw(ctx, canvas);
    }

    // Draw grid overlay
    if (grid.visible) {
      drawGrid(ctx, map.width, map.height, {
        cellPx: grid.cellPx,
        offsetX: grid.offsetX,
        offsetY: grid.offsetY,
        color: grid.color,
        opacity: grid.opacity,
      });
    }

    // Draw tile overlay
    if (grid.tileOverlayVisible && tileStore.tiles.length > 0) {
      drawTiles(ctx, tileStore.tiles);
    }

    ctx.restore();
  }, [canvasRef, onDraw]);

  useEffect(() => {
    const loop = () => {
      render();
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [render]);

  return { isReady };
}
