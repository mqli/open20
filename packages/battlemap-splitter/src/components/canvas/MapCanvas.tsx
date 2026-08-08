import { useRef, useCallback, useEffect, useState } from 'react';
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

  // ── Touch gesture state ──

  /** Pinch-to-zoom state */
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    startPanX: number;
    startPanY: number;
    /** Focal canvas point — the midpoint of two touches in canvas coords */
    focalCanvasX: number;
    focalCanvasY: number;
  }>({
    active: false,
    startDist: 0,
    startZoom: 1,
    startPanX: 0,
    startPanY: 0,
    focalCanvasX: 0,
    focalCanvasY: 0,
  });

  /** Track which finger IDs are active in the current pinch */
  const touchIdRef = useRef<{ id1: number | null; id2: number | null }>({ id1: null, id2: null });

  /** Prevent mouse events from double-firing on hybrid touch+pointer devices */
  const isTouchingRef = useRef(false);

  /** Pending tap (not yet confirmed as drag or tap) — stores mousedown-equivalent state */
  const touchDownRef = useRef<{
    x: number;
    y: number;
    mapX: number;
    mapY: number;
  }>({ x: 0, y: 0, mapX: 0, mapY: 0 });

  /** Detect touch-capable device for hint text */
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

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

  /** Convert map coordinate to canvas point (inverse of toMapCoord) */
  const mapToCanvasCoord = useCallback((mapX: number, mapY: number) => {
    const map = useMapStore.getState();
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const mapW = map.width * map.zoom;
    const mapH = map.height * map.zoom;
    const offX = (canvas.width - mapW) / 2 + map.panX;
    const offY = (canvas.height - mapH) / 2 + map.panY;
    return { x: mapX * map.zoom + offX, y: mapY * map.zoom + offY };
  }, []);

  /** Distance between two touch points */
  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /** Midpoint of two touch points in client coords */
  const getTouchCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

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

  // ── Touch Handlers ──

  /** Threshold (px) to distinguish tap from drag on touch devices */
  const DRAG_THRESHOLD = 5;

  /** Start a single-finger gesture: mirrors handleMouseDown left-button logic */
  const startSingleTouchDrag = useCallback(
    (canvasX: number, canvasY: number) => {
      if (calibrationMode) {
        const mapCoord = toMapCoord(canvasX, canvasY);
        calibrateRef.current = {
          active: true,
          startX: mapCoord.x,
          startY: mapCoord.y,
          endX: mapCoord.x,
          endY: mapCoord.y,
        };
        return;
      }

      const mapCoord = toMapCoord(canvasX, canvasY);
      const tileStore = useTileStore.getState();

      // Custom mode: check if tapping on a tile
      if (tileStore.mode === 'custom' && tileStore.tiles.length > 0) {
        const hit = hitTestTile(mapCoord.x, mapCoord.y, tileStore.tiles);
        if (hit) {
          tileStore.setSelectedTile(hit);
          tileDragRef.current = {
            active: true,
            lastX: mapCoord.x,
            lastY: mapCoord.y,
          };
          return;
        }
        // Tap on empty area — deselect and pan
        tileStore.setSelectedTile(null);
      }

      // On touch: single-finger always pans the map.
      // Grid offset is adjusted via GridPanel controls (no touch grid drag).
      const map = useMapStore.getState();
      dragRef.current = {
        active: true,
        startX: canvasX,
        startY: canvasY,
        startPanX: map.panX,
        startPanY: map.panY,
      };
    },
    [calibrationMode, toMapCoord],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      isTouchingRef.current = true;

      if (e.touches.length === 2) {
        // Two fingers → start pinch (cancel any in-progress single-finger drag)
        dragRef.current.active = false;
        gridDragRef.current.active = false;
        calibrateRef.current.active = false;
        tileDragRef.current.active = false;

        const dist = getTouchDist(e.touches);
        const center = getTouchCenter(e.touches);
        const canvasPoint = getCanvasPoint(center.x, center.y);
        const mapStore = useMapStore.getState();

        pinchRef.current = {
          active: true,
          startDist: dist,
          startZoom: mapStore.zoom,
          startPanX: mapStore.panX,
          startPanY: mapStore.panY,
          focalCanvasX: canvasPoint.x,
          focalCanvasY: canvasPoint.y,
        };
        touchIdRef.current = {
          id1: e.touches[0].identifier,
          id2: e.touches[1].identifier,
        };
        return;
      }

      // One finger — store start point, don't activate drag until movement exceeds threshold
      if (e.touches.length === 1) {
        const canvasPoint = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        const mapCoord = toMapCoord(canvasPoint.x, canvasPoint.y);
        touchDownRef.current = {
          x: canvasPoint.x,
          y: canvasPoint.y,
          mapX: mapCoord.x,
          mapY: mapCoord.y,
        };
      }
    },
    [getCanvasPoint, toMapCoord],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      // Pinch zoom
      if (e.touches.length === 2 && pinchRef.current.active) {
        const dist = getTouchDist(e.touches);
        const scale = dist / pinchRef.current.startDist;
        const newZoom = Math.max(0.1, Math.min(5, pinchRef.current.startZoom * scale));

        // Focal-point zoom: keep the map point under the pinch center fixed
        const mapStore = useMapStore.getState();
        mapStore.setZoom(newZoom);
        const center = getTouchCenter(e.touches);
        const canvasPoint = getCanvasPoint(center.x, center.y);
        const mapCoord = toMapCoord(canvasPoint.x, canvasPoint.y);
        const newPos = mapToCanvasCoord(mapCoord.x, mapCoord.y);
        mapStore.setPan(
          pinchRef.current.startPanX + (canvasPoint.x - newPos.x),
          pinchRef.current.startPanY + (canvasPoint.y - newPos.y),
        );
        return;
      }

      // Single-finger drag — activate if movement exceeds threshold
      if (e.touches.length === 1) {
        const canvasPoint = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        const dx = canvasPoint.x - touchDownRef.current.x;
        const dy = canvasPoint.y - touchDownRef.current.y;

        // Check if any drag is already active (started by a previous move event)
        const anyDragActive =
          dragRef.current.active ||
          gridDragRef.current.active ||
          calibrateRef.current.active ||
          tileDragRef.current.active;

        if (!anyDragActive && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
          return; // still within tap threshold
        }

        // Activate drag on first move past threshold
        if (!anyDragActive) {
          startSingleTouchDrag(touchDownRef.current.x, touchDownRef.current.y);

          // After activation, map starts panning — skip the first delta to avoid jump
          if (dragRef.current.active) {
            dragRef.current.startX = canvasPoint.x;
            dragRef.current.startY = canvasPoint.y;
            return;
          }
        }

        // Delegate to existing mouse-move logic (but with touch coordinates)
        if (calibrateRef.current.active) {
          const mapCoord = toMapCoord(canvasPoint.x, canvasPoint.y);
          const rawEndX = mapCoord.x;
          const rawEndY = mapCoord.y;

          if (calibrateMode === 'manual') {
            const mx = rawEndX - calibrateRef.current.startX;
            const my = rawEndY - calibrateRef.current.startY;
            const size = Math.max(Math.abs(mx), Math.abs(my));
            const sx = mx >= 0 ? size : -size;
            const sy = my >= 0 ? size : -size;
            calibrateRef.current.endX = calibrateRef.current.startX + sx;
            calibrateRef.current.endY = calibrateRef.current.startY + sy;
          } else {
            calibrateRef.current.endX = rawEndX;
            calibrateRef.current.endY = rawEndY;
          }
          return;
        }

        if (tileDragRef.current.active) {
          const mapCoord = toMapCoord(canvasPoint.x, canvasPoint.y);
          const tileStore = useTileStore.getState();
          const sel = tileStore.selectedTile;
          if (sel) {
            const mdx = mapCoord.x - tileDragRef.current.lastX;
            const mdy = mapCoord.y - tileDragRef.current.lastY;
            tileStore.moveTile(sel.row, sel.col, mdx, mdy);
            tileDragRef.current.lastX = mapCoord.x;
            tileDragRef.current.lastY = mapCoord.y;
          }
          return;
        }

        if (dragRef.current.active) {
          const mdx = canvasPoint.x - dragRef.current.startX;
          const mdy = canvasPoint.y - dragRef.current.startY;
          useMapStore
            .getState()
            .setPan(dragRef.current.startPanX + mdx, dragRef.current.startPanY + mdy);
        }
      }
    },
    [getCanvasPoint, toMapCoord, mapToCanvasCoord, calibrateMode, startSingleTouchDrag],
  );

  const handleTouchEnd = useCallback(async () => {
    // If tile drag just ended, regenerate preview
    if (tileDragRef.current.active) {
      const tileStore = useTileStore.getState();
      const sel = tileStore.selectedTile;
      if (sel) {
        tileStore._regenerateTilePreview(sel.row, sel.col);
      }
    }

    dragRef.current.active = false;
    gridDragRef.current.active = false;
    tileDragRef.current.active = false;
    pinchRef.current.active = false;
    touchIdRef.current = { id1: null, id2: null };

    // Calibration completion — same logic as handleMouseUp
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
        isTouchingRef.current = false;
        return;
      }

      const { snapCorner, detectGridFromRegion } = await import('@/engine/gridCalibration');

      if (calibrateMode === 'manual') {
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

      imageDataRef.current = null;
      onCalibrateDone();
    }

    isTouchingRef.current = false;
  }, [onCalibrateDone, calibrateMode, ensureImageData]);

  // ── Mouse Handlers ──

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Skip if a touch gesture is in progress (hybrid devices like Surface)
      if (isTouchingRef.current) return;

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
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
          {isTouchDevice
            ? 'Drag to pan &middot; Pinch to zoom'
            : 'Right-click or Shift+Left-click + drag to pan &middot; Scroll to zoom'}
        </div>
      )}
    </div>
  );
}
