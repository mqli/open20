export interface GridDetectResult {
  cellPx: number;
  offsetX: number;
  offsetY: number;
}

export interface PaperConfig {
  /** Paper width in mm */
  widthMm: number;
  /** Paper height in mm */
  heightMm: number;
  /** Left margin in mm */
  marginLeft: number;
  /** Right margin in mm */
  marginRight: number;
  /** Top margin in mm */
  marginTop: number;
  /** Bottom margin in mm */
  marginBottom: number;
  /** Overlap between tiles in mm */
  overlapMm: number;
}

export interface TileInfo {
  row: number;
  col: number;
  /** Source X in pixels */
  srcX: number;
  /** Source Y in pixels */
  srcY: number;
  /** Source width in pixels */
  srcW: number;
  /** Source height in pixels */
  srcH: number;
  /** Tile width on paper in mm (content area) */
  contentW: number;
  /** Tile height on paper in mm (content area) */
  contentH: number;
}

export interface TileGrid {
  cols: number;
  rows: number;
  tiles: TileInfo[][];
  orientation: 'portrait' | 'landscape';
}

export type PaperPreset =
  | 'A4'
  | 'LETTER'
  | 'LEGAL'
  | 'A3'
  | 'A2'
  | 'A1'
  | 'TABLOID'
  | 'B4'
  | 'B5'
  | 'CUSTOM';

export function paperPresetDimensions(preset: PaperPreset): { w: number; h: number } {
  switch (preset) {
    case 'A4':
      return { w: 210, h: 297 };
    case 'A3':
      return { w: 297, h: 420 };
    case 'A2':
      return { w: 420, h: 594 };
    case 'A1':
      return { w: 594, h: 841 };
    case 'LETTER':
      return { w: 215.9, h: 279.4 };
    case 'LEGAL':
      return { w: 215.9, h: 355.6 };
    case 'TABLOID':
      return { w: 279.4, h: 431.8 };
    case 'B4':
      return { w: 257, h: 364 };
    case 'B5':
      return { w: 182, h: 257 };
    case 'CUSTOM':
      return { w: 0, h: 0 };
  }
}
