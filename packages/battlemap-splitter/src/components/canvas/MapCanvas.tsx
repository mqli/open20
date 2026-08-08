import { useRef, useCallback, useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';
import { useTileStore } from '@/stores/tileStore';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { DropZone } from './DropZone';
import { CanvasAlert } from './CanvasAlert';
import { hitTestTile } from './TileOverlay';
import type { CalibrateMode } from '@/types';

interface MapCanvasProps {
  calibrationMode: boolean;
  calibrateMode: CalibrateMode;
  customTileMode: boolean;
  onCalibrateDone: () => void;
}

export function MapCanvas({
  calibrationMode,
  calibrateMode,
  customTileMode,
  onCalibrateDone,
}: MapCanvasProps) {
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

  /** Tile drag state for custom mode */
  const tileDragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
  }>({ active: false, lastX: 0, lastY: 0 });

  /** Cached full-image ImageData for snap detection (extracted on demand) */
  const imageDataRef = useRef<ImageData | null>(null);

  // Sync image ref with store
  useEffect(() => {
    const unsub = useMapStore.subscribe((state) => {
      if (state.imageUrl) {
        const img = new Image();
        img.src = state.imageUrl;
        img.onload = () => {
          imageRef.current = img;
          // Clear cached ImageData when image changes
          imageDataRef.current = null;
        };
      } else {
        imageRef.current = null;
        imageDataRef.current = null;
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

  useCanvasRenderer(canvasRef, {
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

  /** Convert canvas point to map coordinate */
  const toMapCoord = useCallback((canvasX: number, canvasY: number) => {
    const map = useMapStore.getState();
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const mapW = map.width * map.zoom;
    const mapH = map.height * map.zoom;
    const offX = (canvas.width - mapW) / 2 + map.panX;
    const offY = (canvas.height - mapH) / 2 + map.panY;
    return {
      x: (canvasX - offX) / map.zoom,
      y: (canvasY - offY) / map.zoom,
    };
  }, []);

  /** Extract full ImageData from the current image (cached in ref) */
  const ensureImageData = useCallback(() => {
    if (imageDataRef.current) return imageDataRef.current;

    const img = imageRef.current;
    if (!img) return null;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = img.naturalWidth;
    offCanvas.height = img.naturalHeight;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    imageDataRef.current = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    return imageDataRef.current;
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
        const mapCoord = toMapCoord(x, y);
        calibrateRef.current = {
          active: true,
          startX: mapCoord.x,
          startY: mapCoord.y,
          endX: mapCoord.x,
          endY: mapCoord.y,
        };
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
        const mapCoord = toMapCoord(x, y);
        const tileStore = useTileStore.getState();

        // Custom mode: check if clicking on a tile
        if (tileStore.mode === 'custom' && tileStore.tiles.length > 0) {
          const hit = hitTestTile(mapCoord.x, mapCoord.y, tileStore.tiles);
          if (hit) {
            tileStore.setSelectedTile(hit);
            // Start tile drag
            tileDragRef.current = {
              active: true,
              lastX: mapCoord.x,
              lastY: mapCoord.y,
            };
            return;
          }
          // Click on empty area — deselect
          tileStore.setSelectedTile(null);
          return;
        }

        // Auto mode: left click — start grid drag (if grid visible)
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
    [getCanvasPoint, toMapCoord, calibrationMode],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getCanvasPoint(e.clientX, e.clientY);

      if (calibrateRef.current.active) {
        const mapCoord = toMapCoord(x, y);
        const rawEndX = mapCoord.x;
        const rawEndY = mapCoord.y;

        // Manual mode: constrain to 1:1 square
        if (calibrateMode === 'manual') {
          const dx = rawEndX - calibrateRef.current.startX;
          const dy = rawEndY - calibrateRef.current.startY;
          const size = Math.max(Math.abs(dx), Math.abs(dy));
          const sx = dx >= 0 ? size : -size;
          const sy = dy >= 0 ? size : -size;
          calibrateRef.current.endX = calibrateRef.current.startX + sx;
          calibrateRef.current.endY = calibrateRef.current.startY + sy;
        } else {
          // Smart mode: free-form rectangle
          calibrateRef.current.endX = rawEndX;
          calibrateRef.current.endY = rawEndY;
        }
        return;
      }

      // Tile drag in custom mode
      if (tileDragRef.current.active) {
        const mapCoord = toMapCoord(x, y);
        const tileStore = useTileStore.getState();
        const sel = tileStore.selectedTile;
        if (sel) {
          const dx = mapCoord.x - tileDragRef.current.lastX;
          const dy = mapCoord.y - tileDragRef.current.lastY;
          tileStore.moveTile(sel.row, sel.col, dx, dy);
          tileDragRef.current.lastX = mapCoord.x;
          tileDragRef.current.lastY = mapCoord.y;
        }
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
    [getCanvasPoint, toMapCoord, calibrateMode],
  );

  const handleMouseUp = useCallback(async () => {
    // If tile drag just ended, regenerate preview for the dragged tile
    if (tileDragRef.current.active) {
      const tileStore = useTileStore.getState();
      const sel = tileStore.selectedTile;
      if (sel) {
        // Regenerate preview with updated userOffset
        tileStore._regenerateTilePreview(sel.row, sel.col);
      }
    }

    dragRef.current.active = false;
    gridDragRef.current.active = false;
    tileDragRef.current.active = false;

    if (calibrateRef.current.active) {
      calibrateRef.current.active = false;
      const c = calibrateRef.current;
      let x = Math.min(c.startX, c.endX);
      let y = Math.min(c.startY, c.endY);
      let w = Math.abs(c.endX - c.startX);
      let h = Math.abs(c.endY - c.startY);

      if (w <= 5 || h <= 5) {
        imageDataRef.current = null;
        onCalibrateDone();
        return;
      }

      // Dynamic import: grid calibration engine only needed on first calibration
      const { snapCorner, detectGridFromRegion } = await import('@/engine/gridCalibration');

      if (calibrateMode === 'manual') {
        // Manual mode: snap 4 corners with vote algorithm, compute cellPx from 2×2 rect
        const imgData = ensureImageData();
        if (imgData) {
          const x2 = x + w;
          const y2 = y + h;

          const tl = snapCorner(imgData, x, y);
          const tr = snapCorner(imgData, x2, y);
          const bl = snapCorner(imgData, x, y2);
          const br = snapCorner(imgData, x2, y2);

          x = Math.min(tl.x, tr.x, bl.x, br.x);
          y = Math.min(tl.y, tr.y, bl.y, br.y);
          w = Math.abs(Math.max(tl.x, tr.x, bl.x, br.x) - x);
          h = Math.abs(Math.max(tl.y, tr.y, bl.y, br.y) - y);
        }

        const cellPx = Math.floor((w / 2 + h / 2) / 2);
        const grid = useGridStore.getState();
        grid.setCellPx(Math.max(10, cellPx));
        grid.setOffset(Math.round(x % cellPx), Math.round(y % cellPx));
        useGridStore.setState({ visible: true, tileOverlayVisible: true });
      } else {
        // Smart mode: use projection-based detection on the selected region
        const imgData = ensureImageData();
        if (imgData) {
          const result = detectGridFromRegion(imgData, x, y, w, h, true);
          if (result) {
            const grid = useGridStore.getState();
            grid.setCellPx(Math.max(10, result.cellPx));
            grid.setOffset(result.offsetX, result.offsetY);
            useGridStore.setState({ visible: true, tileOverlayVisible: true });
          }
        }
      }

      // Clear cached ImageData
      imageDataRef.current = null;
      onCalibrateDone();
    }
  }, [onCalibrateDone, calibrateMode, ensureImageData]);

  // Keyboard: R to rotate selected tile in custom mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        const tileStore = useTileStore.getState();
        if (tileStore.mode === 'custom' && tileStore.selectedTile) {
          tileStore.rotateTile(tileStore.selectedTile.row, tileStore.selectedTile.col);
          tileStore._regenerateTilePreview(tileStore.selectedTile.row, tileStore.selectedTile.col);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
      {imageUrl && (
        <CanvasAlert
          calibrationMode={calibrationMode}
          calibrateMode={calibrateMode}
          customMode={customTileMode}
          onDismissCalibration={() => {}}
          onDismissCustom={() => {}}
        />
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
