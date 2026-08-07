/**
 * Grid Auto-Detection Engine
 *
 * Port of `detect_grid_dpi` from generate_battlemaps.py.
 * Uses Canvas getImageData + autocorrelation to detect the grid DPI
 * of a battle map image.
 *
 * The four phases:
 *   A. Content region detection via row/column variance
 *   B. Profile extraction (120-row band of content region) + autocorrelation
 *   C. Peak detection with scoring (proximity to known DPI, penalties for noise)
 *   D. Fallback chain (H+V agree → average; H-only; V-only; <45 fallback; null)
 *
 * All algorithmic functions are exported for unit testing. The main entry point
 * is `detectGridDpi()` which handles the Canvas I/O.
 */

import type { GridDetectResult } from '@/types';

const DEFAULT_DPI = 70;
const KNOWN_DPI_VALUES = [70, 100, 149.5, 150, 60];

export const VARIANCE_THRESHOLD = 10;
export const MIN_CONTENT_SIZE = 100;
export const PROFILE_BAND = 60;
export const PEAK_START = 5;
export const MAX_GAP = 300;
export const LOW_DPI_THRESHOLD = 45;
export const DOWNSCALE_MAX_DIM = 2048;
export const PEAK_STRENGTH_FACTOR = 1.5;
export const LOW_GAP_PENALTY = 0.5;
export const LOW_GAP_THRESHOLD = 25;
export const KNOWN_DPI_TOLERANCE = 10;

// ── Phase A: Content Region Detection ──

export interface GrayscaleData {
  /** RGBA pixel data (4 values per pixel) */
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Extract a grayscale value from an RGBA pixel.
 */
export function pixelGray(data: Uint8ClampedArray, idx: number): number {
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

/**
 * Compute row variance for each row in grayscale data.
 */
export function computeRowVariances(g: GrayscaleData): Float64Array {
  const { data, width, height } = g;
  const variances = new Float64Array(height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * width * 4;
    let sum = 0;
    let sumSq = 0;
    for (let x = 0; x < width; x++) {
      const gray = pixelGray(data, rowStart + x * 4);
      sum += gray;
      sumSq += gray * gray;
    }
    const mean = sum / width;
    variances[y] = sumSq / width - mean * mean;
  }
  return variances;
}

/**
 * Compute column variance for each column in grayscale data.
 */
export function computeColumnVariances(g: GrayscaleData): Float64Array {
  const { data, width, height } = g;
  const variances = new Float64Array(width);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    let sumSq = 0;
    for (let y = 0; y < height; y++) {
      const gray = pixelGray(data, (y * width + x) * 4);
      sum += gray;
      sumSq += gray * gray;
    }
    const mean = sum / height;
    variances[x] = sumSq / height - mean * mean;
  }
  return variances;
}

/**
 * Find content bounds from variance data.
 * Returns [firstIdx, lastIdx] of rows/cols with variance above threshold,
 * or null if the content region is too small.
 */
export function findContentBounds(
  variances: Float64Array,
  threshold: number,
  minSize: number,
): [number, number] | null {
  const indices: number[] = [];
  for (let i = 0; i < variances.length; i++) {
    if (variances[i] > threshold) indices.push(i);
  }
  if (indices.length < minSize) return null;
  return [indices[0], indices[indices.length - 1]];
}

// ── Phase B: Profile Extraction & Autocorrelation ──

/**
 * Extract a single row as a 1D grayscale profile.
 */
function extractRowProfile(g: GrayscaleData, y: number): Float64Array {
  const { data, width } = g;
  const profile = new Float64Array(width);
  const rowStart = y * width * 4;
  for (let x = 0; x < width; x++) {
    profile[x] = pixelGray(data, rowStart + x * 4);
  }
  return profile;
}

/**
 * Compute averaged autocorrelation across evenly-spaced rows from
 * the content region. This reinforces grid-line periodicity (consistent
 * across rows) while smoothing out border/artifact patterns.
 */
function averageAutocorrelation(
  g: GrayscaleData,
  contentR0: number,
  contentR1: number,
): Float64Array {
  const numRows = contentR1 - contentR0;
  const samples = Math.min(30, numRows);
  const step = Math.max(1, Math.floor(numRows / samples));
  const corrLen = Math.min(g.width, MAX_GAP + 1);
  const accCorr = new Float64Array(corrLen);
  let count = 0;

  for (let i = contentR0; i < contentR1; i += step) {
    const profile = extractRowProfile(g, i);
    const corr = autocorrelate(profile);
    for (let j = 0; j < corrLen; j++) {
      accCorr[j] += corr[j];
    }
    count++;
  }

  if (count === 0) return new Float64Array(corrLen);

  for (let j = 0; j < corrLen; j++) {
    accCorr[j] /= count;
  }
  return accCorr;
}
/**
 * Extract a 1D profile by averaging a band of columns from the content region.
 */
export function extractVerticalProfile(
  g: GrayscaleData,
  contentC0: number,
  contentC1: number,
): Float64Array {
  const { data, width, height } = g;
  const contentWidth = contentC1 - contentC0;
  const cvStart = Math.max(0, Math.floor(contentWidth / 2) - PROFILE_BAND);
  const cvEnd = Math.min(contentWidth, Math.floor(contentWidth / 2) + PROFILE_BAND);
  const bandSize = cvEnd - cvStart;

  if (bandSize <= 0) return new Float64Array(height);

  const profile = new Float64Array(height);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = contentC0 + cvStart; x < contentC0 + cvEnd; x++) {
      sum += pixelGray(data, (y * width + x) * 4);
    }
    profile[y] = sum / bandSize;
  }
  return profile;
}

/**
 * Compute autocorrelation of a 1D profile.
 * Returns the right half (k >= 0), limited to MAX_GAP.
 */
export function autocorrelate(profile: Float64Array): Float64Array {
  const n = profile.length;

  // Zero-center
  let mean = 0;
  for (let i = 0; i < n; i++) mean += profile[i];
  mean /= n;

  const corrLen = Math.min(n, MAX_GAP + 1);
  const corr = new Float64Array(corrLen);

  for (let k = 0; k < corrLen; k++) {
    let sum = 0;
    for (let i = 0; i < n - k; i++) {
      sum += (profile[i] - mean) * (profile[i + k] - mean);
    }
    corr[k] = sum / (n - k);
  }

  return corr;
}

// ── Phase C: Peak Detection ──

export interface Peak {
  gap: number;
  strength: number;
}

/**
 * Find all significant local maxima in an autocorrelation array.
 */
export function findPeaks(
  corr: Float64Array,
  meanAbs: number,
  start: number,
  maxGap: number,
): Peak[] {
  const peaks: Peak[] = [];
  const limit = Math.min(maxGap, corr.length - 1);
  for (let i = start; i < limit; i++) {
    if (
      corr[i] > corr[i - 1] &&
      corr[i] > corr[i + 1] &&
      corr[i] > meanAbs * PEAK_STRENGTH_FACTOR
    ) {
      peaks.push({ gap: i, strength: corr[i] });
    }
  }
  return peaks;
}

/**
 * Score a peak — higher is better.
 * Penalizes peaks far from known DPI values and very small gaps.
 */
export function scorePeak(p: Peak): number {
  let score = p.strength;

  // Find the closest known DPI value
  let minDist = Infinity;
  for (const known of KNOWN_DPI_VALUES) {
    const dist = Math.abs(p.gap - known);
    if (dist < minDist) minDist = dist;
  }

  // Bonus for proximity: 2x if within 10px, 1.5x within 30px, 1x within 60px, 0.5x otherwise
  if (minDist < KNOWN_DPI_TOLERANCE) {
    score *= 2.0;
  } else if (minDist < 30) {
    score *= 1.5;
  } else if (minDist < 60) {
    score *= 1.0;
  } else {
    score *= 0.5; // penalty for peaks far from any known DPI
  }

  if (p.gap < LOW_GAP_THRESHOLD) {
    score *= LOW_GAP_PENALTY;
  }
  return score;
}

/**
 * Count how many harmonic multiples exist among detected peaks for a given gap.
 */
function harmonicCount(gap: number, allGaps: number[]): number {
  let count = 0;
  for (const other of allGaps) {
    if (other <= gap) continue;
    const ratio = other / gap;
    const nearest = Math.round(ratio);
    if (nearest >= 2 && nearest <= 4 && Math.abs(ratio - nearest) < 0.15) {
      count++;
    }
  }
  return count;
}

/**
 * Find the best grid spacing from a pre-computed autocorrelation array.
 */
function findGridSpacingFromCorr(corr: Float64Array): number | null {
  let meanAbs = 0;
  for (let i = 0; i < corr.length; i++) meanAbs += Math.abs(corr[i]);
  meanAbs /= corr.length;

  const peaks = findPeaks(corr, meanAbs, PEAK_START, MAX_GAP);
  if (peaks.length === 0) return null;

  const peakGaps = peaks.map((p) => p.gap);

  // Require at least 2 harmonic multiples — real grids have harmonics
  const withHarmonics = peaks.filter((p) => harmonicCount(p.gap, peakGaps) >= 2);
  const candidates = withHarmonics.length > 0 ? withHarmonics : peaks;

  candidates.sort((a, b) => scorePeak(b) - scorePeak(a));
  return candidates[0].gap;
}

/**
 * Find the best grid spacing from autocorrelation peaks.
 * Peaks are in the coordinate space of the input profile.
 */
export function findGridSpacing(profile: Float64Array): number | null {
  return findGridSpacingFromCorr(autocorrelate(profile));
}

// ── Phase D: Fallback Chain ──

/**
 * Select final DPI from horizontal and vertical spacing candidates.
 * Implements the fallback chain exactly matching the Python script.
 */
export function selectDpi(hSpacing: number | null, vSpacing: number | null): number | null {
  // Both detected and agree within 50%
  if (hSpacing !== null && vSpacing !== null) {
    const avg = Math.round((hSpacing + vSpacing) / 2);
    if (avg >= 30 && avg <= MAX_GAP && Math.abs(hSpacing - vSpacing) < avg * 0.5) {
      return avg < LOW_DPI_THRESHOLD ? DEFAULT_DPI : avg;
    }
  }

  // H only
  if (hSpacing !== null && hSpacing >= 30 && hSpacing <= MAX_GAP) {
    return hSpacing < LOW_DPI_THRESHOLD ? DEFAULT_DPI : hSpacing;
  }

  // V only
  if (vSpacing !== null && vSpacing >= 30 && vSpacing <= MAX_GAP) {
    return vSpacing < LOW_DPI_THRESHOLD ? DEFAULT_DPI : vSpacing;
  }

  return null;
}

/**
 * Full auto-detect pipeline (pure algorithm, no Canvas).
 * Takes pre-extracted GrayscaleData and returns detected grid.
 */
export function detectGridDpiFromData(g: GrayscaleData): GridDetectResult | null {
  // Phase A: Content region
  const rowVars = computeRowVariances(g);
  const colVars = computeColumnVariances(g);
  const rowBounds = findContentBounds(rowVars, VARIANCE_THRESHOLD, MIN_CONTENT_SIZE);
  const colBounds = findContentBounds(colVars, VARIANCE_THRESHOLD, MIN_CONTENT_SIZE);

  if (!rowBounds || !colBounds) return null;

  // Phase B: Horizontal profile — average AC across multiple rows
  const hCorr = averageAutocorrelation(g, rowBounds[0], rowBounds[1]);
  const vProfile = extractVerticalProfile(g, colBounds[0], colBounds[1]);

  // Phase C+D: Grid spacing + fallback
  const hSpacing = findGridSpacingFromCorr(hCorr);
  const vSpacing = findGridSpacing(vProfile);
  const dpi = selectDpi(hSpacing, vSpacing);

  if (dpi === null) return null;

  return {
    cellPx: dpi,
    offsetX: colBounds[0],
    offsetY: rowBounds[0],
  };
}

// ── Canvas I/O (browser-only) ──

/**
 * Draw an image onto a white-filled canvas and extract grayscale pixel data.
 * Returns the scale factor used for downscaling so the caller can convert
 * detected coordinates back to original image space.
 */
export function extractGrayscaleDataFromImage(img: HTMLImageElement): {
  g: GrayscaleData;
  scale: number;
} {
  const canvas = document.createElement('canvas');

  const scale = Math.min(1, DOWNSCALE_MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {
    g: { data: imageData.data, width: canvas.width, height: canvas.height },
    scale,
  };
}

/**
 * Auto-detect the grid DPI of a battle map image.
 * Browser entry point — extracts pixel data from the image element,
 * then delegates to the pure algorithm. Compensates for any performance
 * downscaling by converting results back to original image coordinates.
 */
export function detectGridDpi(img: HTMLImageElement): GridDetectResult | null {
  const { g, scale } = extractGrayscaleDataFromImage(img);
  const result = detectGridDpiFromData(g);
  if (!result) return null;

  // Convert from scaled coordinates back to original image coordinates
  const invScale = 1 / scale;
  return {
    cellPx: Math.round(result.cellPx * invScale),
    offsetX: Math.round(result.offsetX * invScale),
    offsetY: Math.round(result.offsetY * invScale),
  };
}
