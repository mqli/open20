import { useRef, useCallback, useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { DropZone } from './DropZone';

interface MapCanvasProps {
  calibrationMode: boolean;
  onCalibrateDone: () => void;
}

export function MapCanvas({ calibrationMode, onCalibrateDone }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({ active: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  const gridDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({ active: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });

  const calibrateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }>({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 });

  // Sync image ref with store
  useEffect(() => {
    const unsub = useMapStore.subscribe((state) => {
      if (state.imageUrl) {
        const img = new Image();
        img.src = state.imageUrl;
        img.onload = () => {
          imageRef.current = img;
        };
      } else {
        imageRef.current = null;
      }
    });

    // Initial load
    const url = useMapStore.getState().imageUrl;
    if (url) {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        imageRef.current = img;
      };
    }

    return unsub;
  }, []);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }
  }, []);

  const { isReady } = useCanvasRenderer(canvasRef, {
    onDraw,
    calibrationMode,
    calibrateRef,
  });
  const imageUrl = useMapStore((s) => s.imageUrl);
  const imageW = useMapStore((s) => s.width);
  const imageH = useMapStore((s) => s.height);

  // Auto-zoom to fit when a new image is loaded
  useEffect(() => {
    if (!imageUrl || imageW === 0) return;

    // Wait for container to have dimensions
    const raf = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const scaleX = rect.width / imageW;
      const scaleY = rect.height / imageH;
      const fitZoom = Math.min(scaleX, scaleY) * 0.9; // 90% for a slight margin

      useMapStore.getState().setZoom(Math.max(0.1, Math.min(5, fitZoom)));
      useMapStore.getState().setPan(0, 0);
    });

    return () => cancelAnimationFrame(raf);
  }, [imageUrl, imageW, imageH]);

  // ── Mouse/Touch Handlers ──

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const store = useMapStore.getState();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, store.zoom * delta));
    store.setZoom(newZoom);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getCanvasPoint(e.clientX, e.clientY);

      if (calibrationMode && e.button === 0) {
        // Calibration mode: start drawing rect
        const map = useMapStore.getState();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mapW = map.width * map.zoom;
        const mapH = map.height * map.zoom;
        const offX = (canvas.width - mapW) / 2 + map.panX;
        const offY = (canvas.height - mapH) / 2 + map.panY;
        const mx = (x - offX) / map.zoom;
        const my = (y - offY) / map.zoom;

        calibrateRef.current = { active: true, startX: mx, startY: my, endX: mx, endY: my };
        return;
      }

      if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        // Right button or Shift+Left → pan
        const map = useMapStore.getState();
        dragRef.current = {
          active: true,
          startX: x,
          startY: y,
          startPanX: map.panX,
          startPanY: map.panY,
        };
      } else if (e.button === 0) {
        // Left click — start grid drag (if grid visible)
        const grid = useGridStore.getState();
        if (grid.visible) {
          gridDragRef.current = {
            active: true,
            startX: x,
            startY: y,
            startOffsetX: grid.offsetX,
            startOffsetY: grid.offsetY,
          };
        }
      }
    },
    [getCanvasPoint, calibrationMode],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getCanvasPoint(e.clientX, e.clientY);

      if (calibrateRef.current.active) {
        const map = useMapStore.getState();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mapW = map.width * map.zoom;
        const mapH = map.height * map.zoom;
        const offX = (canvas.width - mapW) / 2 + map.panX;
        const offY = (canvas.height - mapH) / 2 + map.panY;
        // Constrain to 1:1 square — use the larger axis delta
        const rawEndX = (x - offX) / map.zoom;
        const rawEndY = (y - offY) / map.zoom;
        const dx = rawEndX - calibrateRef.current.startX;
        const dy = rawEndY - calibrateRef.current.startY;
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        const sx = dx >= 0 ? size : -size;
        const sy = dy >= 0 ? size : -size;
        calibrateRef.current.endX = calibrateRef.current.startX + sx;
        calibrateRef.current.endY = calibrateRef.current.startY + sy;
        return;
      }

      if (dragRef.current.active) {
        const dx = x - dragRef.current.startX;
        const dy = y - dragRef.current.startY;
        useMapStore
          .getState()
          .setPan(dragRef.current.startPanX + dx, dragRef.current.startPanY + dy);
      }

      if (gridDragRef.current.active) {
        const map = useMapStore.getState();
        const grid = useGridStore.getState();
        // Convert screen pixel delta to map pixel delta
        const dx = (x - gridDragRef.current.startX) / map.zoom;
        const dy = (y - gridDragRef.current.startY) / map.zoom;
        grid.setOffset(
          gridDragRef.current.startOffsetX + dx,
          gridDragRef.current.startOffsetY + dy,
        );
      }
    },
    [getCanvasPoint],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
    gridDragRef.current.active = false;

    if (calibrateRef.current.active) {
      calibrateRef.current.active = false;
      const c = calibrateRef.current;
      const x = Math.min(c.startX, c.endX);
      const y = Math.min(c.startY, c.endY);
      const w = Math.abs(c.endX - c.startX);
      const h = Math.abs(c.endY - c.startY);
      // 2×2 grid: average of width/2 and height/2
      if (w > 5 && h > 5) {
        const cellPx = Math.floor((w / 2 + h / 2) / 2);
        const grid = useGridStore.getState();
        grid.setCellPx(Math.max(10, cellPx));
        // Align grid to the drawn rectangle origin
        grid.setOffset(Math.round(x % cellPx), Math.round(y % cellPx));
      }
      onCalibrateDone();
    }
  }, [onCalibrateDone]);

  // Resize canvas to fill container via ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (w === 0 || h === 0) return;

      // Only set pixel buffer — CSS sizing is handled by absolute positioning
      canvas.width = w;
      canvas.height = h;
    };

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);
    resizeCanvas();

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 bg-bg-primary overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80">
          <div className="text-text-secondary">Loading canvas...</div>
        </div>
      )}
      {!imageUrl && <DropZone />}
      {imageUrl && (
        <div className="absolute bottom-2 left-2 text-[10px] text-text-disabled/60 select-none pointer-events-none">
          Right-click or Shift+Left-click + drag to pan &middot; Scroll to zoom
        </div>
      )}
    </div>
  );
}
