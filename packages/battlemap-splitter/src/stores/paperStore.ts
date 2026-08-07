import { create } from 'zustand';
import type { PaperPreset } from '@/types';

interface PaperState {
  /** Paper size preset */
  preset: PaperPreset;
  /** Custom width in mm (only used when preset is CUSTOM) */
  customW: number;
  /** Custom height in mm (only used when preset is CUSTOM) */
  customH: number;
  /** Orientation */
  orientation: 'portrait' | 'landscape';
  /** Uniform margin in mm (default for all edges) */
  margin: number;
  /** Per-edge overrides (null = use uniform margin) */
  marginTop: number | null;
  marginBottom: number | null;
  marginLeft: number | null;
  marginRight: number | null;
  /** Tile-to-tile overlap in mm */
  overlap: number;
  /** Output PDF DPI */
  outputDpi: number;
  /** Enforce 1 cell = 25.4 mm */
  scaleLocked: boolean;

  /** Actions */
  setPreset: (preset: PaperPreset) => void;
  setCustomDimensions: (w: number, h: number) => void;
  setOrientation: (o: 'portrait' | 'landscape') => void;
  setMargin: (m: number) => void;
  setMarginTop: (m: number | null) => void;
  setMarginBottom: (m: number | null) => void;
  setMarginLeft: (m: number | null) => void;
  setMarginRight: (m: number | null) => void;
  setOverlap: (o: number) => void;
  setOutputDpi: (dpi: number) => void;
  setScaleLocked: (locked: boolean) => void;
  /** Get resolved per-edge margins (applies overrides on top of uniform) */
  getMarginTop: () => number;
  getMarginBottom: () => number;
  getMarginLeft: () => number;
  getMarginRight: () => number;
  /** Get the actual paper width and height in mm (applies preset dimensions + custom overrides) */
  getPaperWidth: () => number;
  getPaperHeight: () => number;
}

const PRESET_DIMENSIONS: Record<Exclude<PaperPreset, 'CUSTOM'>, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  A2: { w: 420, h: 594 },
  A1: { w: 594, h: 841 },
  LETTER: { w: 215.9, h: 279.4 },
  LEGAL: { w: 215.9, h: 355.6 },
  TABLOID: { w: 279.4, h: 431.8 },
  B4: { w: 257, h: 364 },
  B5: { w: 182, h: 257 },
};

export const usePaperStore = create<PaperState>((set, get) => ({
  preset: 'A4',
  customW: 210,
  customH: 297,
  orientation: 'portrait',
  margin: 8,
  marginTop: null,
  marginBottom: null,
  marginLeft: null,
  marginRight: null,
  overlap: 5,
  outputDpi: 150,
  scaleLocked: true,

  setPreset: (preset) => set({ preset }),

  setCustomDimensions: (w, h) => set({ customW: w, customH: h }),

  setOrientation: (o) => set({ orientation: o }),

  setMargin: (m) => set({ margin: Math.max(0, m) }),

  setMarginTop: (mt) => set({ marginTop: mt !== null ? Math.max(0, mt) : null }),
  setMarginBottom: (mb) => set({ marginBottom: mb !== null ? Math.max(0, mb) : null }),
  setMarginLeft: (ml) => set({ marginLeft: ml !== null ? Math.max(0, ml) : null }),
  setMarginRight: (mr) => set({ marginRight: mr !== null ? Math.max(0, mr) : null }),

  setOverlap: (o) => set({ overlap: Math.max(0, o) }),

  setOutputDpi: (dpi) => set({ outputDpi: Math.max(72, dpi) }),

  setScaleLocked: (locked) => set({ scaleLocked: locked }),

  getMarginTop: () => get().marginTop ?? get().margin,
  getMarginBottom: () => get().marginBottom ?? get().margin,
  getMarginLeft: () => get().marginLeft ?? get().margin,
  getMarginRight: () => get().marginRight ?? get().margin,

  getPaperWidth: () => {
    const state = get();
    if (state.preset === 'CUSTOM') return state.customW;
    return PRESET_DIMENSIONS[state.preset].w;
  },

  getPaperHeight: () => {
    const state = get();
    if (state.preset === 'CUSTOM') return state.customH;
    return PRESET_DIMENSIONS[state.preset].h;
  },
}));
