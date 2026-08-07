import { create } from 'zustand';

interface GridState {
  /** Pixels per grid square */
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
  adjustCellPx: (delta: number) => void;
  setOffset: (x: number, y: number) => void;
  toggleVisibility: () => void;
  toggleTileOverlay: () => void;
  setColor: (color: string) => void;
  setOpacity: (op: number) => void;
  reset: () => void;
}

export const useGridStore = create<GridState>((set) => ({
  cellPx: 143,
  offsetX: 0,
  offsetY: 0,
  visible: false,
  tileOverlayVisible: false,
  color: 'rgba(239, 68, 68, 0.8)',
  opacity: 0.8,

  setCellPx: (px: number) => set({ cellPx: Math.max(10, px) }),

  adjustCellPx: (delta: number) => set((state) => ({ cellPx: Math.max(10, state.cellPx + delta) })),

  setOffset: (x: number, y: number) => set({ offsetX: x, offsetY: y }),

  toggleVisibility: () => set((state) => ({ visible: !state.visible })),

  toggleTileOverlay: () => set((state) => ({ tileOverlayVisible: !state.tileOverlayVisible })),

  setColor: (color: string) => set({ color }),

  setOpacity: (op: number) => set({ opacity: Math.max(0, Math.min(1, op)) }),

  reset: () =>
    set({
      cellPx: 143,
      offsetX: 0,
      offsetY: 0,
      visible: false,
      tileOverlayVisible: false,
      color: 'rgba(239, 68, 68, 0.8)',
      opacity: 0.8,
    }),
}));
