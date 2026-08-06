import { create } from 'zustand';

interface MapState {
  /** Source image — always a same-origin blob: URL to avoid CORS canvas tainting */
  imageUrl: string | null;
  /** Cached dimensions from the loaded image */
  width: number;
  height: number;

  /** View transform */
  zoom: number;
  panX: number;
  panY: number;

  /** Actions */
  loadImageFromFile: (file: File) => Promise<void>;
  loadImageFromUrl: (url: string) => Promise<void>;
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  fitToScreen: () => void;
  clear: () => void;
}

function loadImage(src: string): Promise<{ image: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ image: img, url: img.src });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

const DEFAULT_CORS_PROXY = 'https://corsproxy.io/?';

export const useMapStore = create<MapState>((set, get) => ({
  imageUrl: null,
  width: 0,
  height: 0,
  zoom: 1,
  panX: 0,
  panY: 0,

  loadImageFromFile: async (file: File) => {
    // Revoke previous blob URL if any
    const prev = get().imageUrl;
    if (prev?.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }

    const blobUrl = URL.createObjectURL(file);
    const { image } = await loadImage(blobUrl);

    set({
      imageUrl: blobUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  loadImageFromUrl: async (url: string) => {
    // Try to fetch through CORS proxy to get a same-origin blob URL
    let imageUrl: string;

    try {
      const proxyUrl = DEFAULT_CORS_PROXY + encodeURIComponent(url);
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      imageUrl = URL.createObjectURL(blob);
    } catch {
      // Fallback: load directly (canvas will be tainted, auto-detect disabled)
      console.warn('CORS proxy failed, loading image directly — auto-detect will be unavailable');
      imageUrl = url;
    }

    // Revoke previous blob URL
    const prev = get().imageUrl;
    if (prev?.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }

    const { image } = await loadImage(imageUrl);

    set({
      imageUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  setZoom: (z: number) => set({ zoom: Math.max(0.1, Math.min(5, z)) }),

  setPan: (x: number, y: number) => set({ panX: x, panY: y }),

  fitToScreen: () => {
    // Default: zoom to 1, center. Components with viewport dimensions
    // should call setZoom/setPan directly with computed fit values.
    set({ zoom: 1, panX: 0, panY: 0 });
  },

  clear: () => {
    const prev = get().imageUrl;
    if (prev?.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }
    set({
      imageUrl: null,
      width: 0,
      height: 0,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },
}));
