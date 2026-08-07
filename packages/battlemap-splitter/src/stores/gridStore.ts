import { create } from 'zustand';
import { detectGridDpi } from '@/engine/gridDetect';
import { useMapStore } from './mapStore';

interface GridState {
  /** Pixels per grid square — IS the source DPI (1 cell = 1 inch) */
  cellPx: number;
  /** Horizontal offset in px */
  offsetX: number;
  /** Vertical offset in px */
  offsetY: number;
  /** Whether the calibration grid overlay is visible */
  visible: boolean;
  /** Grid line color (rgba) */
  color: string;
  /** Grid line opacity (0-1) */
  opacity: number;
  /** Whether the tile split overlay is visible */
  tileOverlayVisible: boolean;

  /** Actions */
  setCellPx: (px: number) => void;
  setOffset: (x: number, y: number) => void;
  toggleVisibility: () => void;
  toggleTileOverlay: () => void;
  setColor: (color: string) => void;
  setOpacity: (op: number) => void;
  autoDetect: () => Promise<boolean>;
  reset: () => void;
}

export const useGridStore = create<GridState>((set) => ({
  cellPx: 143,
  offsetX: 0,
  offsetY: 0,
  visible: true,
  tileOverlayVisible: true,
  color: 'rgba(255, 0, 0, 0.8)',
  opacity: 0.8,

  setCellPx: (px: number) => set({ cellPx: Math.max(10, px) }),

  setOffset: (x: number, y: number) => set({ offsetX: x, offsetY: y }),

  toggleVisibility: () => set((state) => ({ visible: !state.visible })),

  toggleTileOverlay: () => set((state) => ({ tileOverlayVisible: !state.tileOverlayVisible })),

  setColor: (color: string) => set({ color }),

  setOpacity: (op: number) => set({ opacity: Math.max(0, Math.min(1, op)) }),

  autoDetect: async () => {
    const imageUrl = useMapStore.getState().imageUrl;
    if (!imageUrl) return false;

    // Load image and run detection
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed during auto-detect'));
      });

      const result = detectGridDpi(img);
      if (result) {
        set({
          cellPx: result.cellPx,
          offsetX: result.offsetX,
          offsetY: result.offsetY,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  reset: () =>
    set({
      cellPx: 149.5,
      offsetX: 0,
      offsetY: 0,
      visible: true,
      tileOverlayVisible: true,
      color: 'rgba(255, 0, 0, 0.8)',
      opacity: 0.8,
    }),
}));
