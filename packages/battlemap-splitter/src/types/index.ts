/** Calibrate mode: manual 2x2 draw vs smart region analysis */
export type CalibrateMode = 'manual' | 'smart';

/** Result of projection-based grid detection on a region of the image */
export interface GridDetectResult {
  cellPx: number;
  offsetX: number;
  offsetY: number;
}

/** Configuration for the grid snap algorithm */
export interface SnapWindowConfig {
  /** Search radius in image pixels (default: 60) */
  radius: number;
  /** Gray value threshold below which pixels are considered "dark" grid lines (0-255, default: 100) */
  darkThreshold: number;
}

/** Result of a local grid intersection search */
export interface IntersectionResult {
  /** Intersection X coordinate (image pixels) */
  x: number;
  /** Intersection Y coordinate (image pixels) */
  y: number;
  /** Detection confidence (0-1) */
  confidence: number;
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
  /** Tile rotation in degrees (0, 90, 180, 270). 90/270 swaps srcW and srcH */
  rotation: 0 | 90 | 180 | 270;
  /** Per-tile paper orientation override. undefined = follow global setting */
  perTileOrientation?: 'portrait' | 'landscape';
  /** Custom-mode user drag offset X in source pixels (relative to auto-computed srcX) */
  userOffsetX: number;
  /** Custom-mode user drag offset Y in source pixels (relative to auto-computed srcY) */
  userOffsetY: number;
}

/** Tiling mode: auto (uniform grid) or custom (user-positioned tiles) */
export type TileMode = 'auto' | 'custom';

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
