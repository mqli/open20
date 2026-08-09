/**
 * Grid Snap Engine — Local grid intersection detection via pixel color analysis.
 *
 * Scans a window around a given map-pixel coordinate, extracts horizontal
 * and vertical grayscale profiles, detects dark/bright transitions that
 * indicate grid lines, and finds their intersection points.
 *
 * Pure algorithm with no React/DOM dependencies — independently testable.
 */

import type { IntersectionResult, SnapWindowConfig, GridDetectResult } from '@/types';

// ── Defaults ──

export const DEFAULT_SNAP_RADIUS = 60;
export const DEFAULT_DARK_THRESHOLD = 100;
/** Step between sampled rows/columns for performance */
export const PROFILE_STEP = 3;
/** Minimum length (px) of a dark run to count as a grid line */
export const MIN_DARK_RUN = 2;
/** Maximum gap between dark runs that we still merge into one line */
export const MERGE_GAP = 4;
/** Minimum contrast (gray difference) between dark line and surroundings */
export const MIN_CONTRAST = 30;

// ── Helpers ──

/**
 * Get grayscale value from RGBA ImageData at (x, y).
 */
export function pixelGrayAt(data: Uint8ClampedArray, width: number, x: number, y: number): number {
  const idx = (y * width + x) * 4;
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

/**
 * Extract a row profile (grayscale values) from the window region of ImageData.
 * Inlined pixel access for performance — avoids per-pixel function call overhead.
 */
function extractRowProfile(
  data: Uint8ClampedArray,
  imgW: number,
  windowX: number,
  windowY: number,
  windowW: number,
  row: number,
): Float64Array {
  const profile = new Float64Array(windowW);
  const y = windowY + row;
  const rowBase = y * imgW * 4;
  for (let i = 0; i < windowW; i++) {
    const idx = rowBase + (windowX + i) * 4;
    profile[i] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }
  return profile;
}

/**
 * Extract a column profile (grayscale values) from the window region.
 * Inlined pixel access for performance.
 */
function extractColProfile(
  data: Uint8ClampedArray,
  imgW: number,
  windowX: number,
  windowY: number,
  windowH: number,
  col: number,
): Float64Array {
  const profile = new Float64Array(windowH);
  const x = windowX + col;
  const colX4 = x * 4;
  for (let i = 0; i < windowH; i++) {
    const idx = (windowY + i) * imgW * 4 + colX4;
    profile[i] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  }
  return profile;
}

// ── Dark Run Detection ──

interface DarkRun {
  start: number;
  end: number;
  center: number;
  /** Average darkness (lower = darker) */
  avgGray: number;
}

/**
 * Find dark runs in a 1D grayscale profile.
 * A dark run is a contiguous segment where gray < darkThreshold.
 * Adjacent runs within MERGE_GAP are merged.
 */
function findDarkRuns(profile: Float64Array, darkThreshold: number): DarkRun[] {
  const runs: DarkRun[] = [];
  let inRun = false;
  let runStart = 0;
  let runSum = 0;
  let runCount = 0;

  for (let i = 0; i < profile.length; i++) {
    if (profile[i] < darkThreshold) {
      if (!inRun) {
        inRun = true;
        runStart = i;
        runSum = 0;
        runCount = 0;
      }
      runSum += profile[i];
      runCount++;
    } else {
      if (inRun) {
        inRun = false;
        if (runCount >= MIN_DARK_RUN) {
          runs.push({
            start: runStart,
            end: i - 1,
            center: runStart + runCount / 2,
            avgGray: runSum / runCount,
          });
        }
      }
    }
  }

  // Handle run at end of profile
  if (inRun && runCount >= MIN_DARK_RUN) {
    runs.push({
      start: runStart,
      end: profile.length - 1,
      center: runStart + runCount / 2,
      avgGray: runSum / runCount,
    });
  }

  // Merge nearby runs
  if (runs.length <= 1) return runs;

  const merged: DarkRun[] = [runs[0]];
  for (let i = 1; i < runs.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = runs[i];
    if (curr.start - prev.end <= MERGE_GAP) {
      // Merge
      const totalLen = curr.end - prev.start + 1;
      const totalSum =
        prev.avgGray * (prev.end - prev.start + 1) + curr.avgGray * (curr.end - curr.start + 1);
      prev.end = curr.end;
      prev.center = prev.start + totalLen / 2;
      prev.avgGray = totalSum / totalLen;
    } else {
      merged.push(curr);
    }
  }

  return merged;
}

// ── Line Position Voting ──

interface LineCandidate {
  position: number;
  votes: number;
  avgDarkness: number;
}

/**
 * Collect candidate vertical line positions from horizontal profile scans.
 * Scans rows at PROFILE_STEP intervals, finds dark runs, and votes for
 * their center X positions.
 */
function findVerticalLineCandidates(
  data: Uint8ClampedArray,
  imgW: number,
  windowX: number,
  windowY: number,
  windowW: number,
  windowH: number,
  darkThreshold: number,
): LineCandidate[] {
  const voteMap = new Map<number, { votes: number; darkSum: number; darkCount: number }>();

  for (let row = 0; row < windowH; row += PROFILE_STEP) {
    const profile = extractRowProfile(data, imgW, windowX, windowY, windowW, row);
    const runs = findDarkRuns(profile, darkThreshold);

    for (const run of runs) {
      const pos = Math.round(run.center);
      const existing = voteMap.get(pos);
      if (existing) {
        existing.votes++;
        existing.darkSum += run.avgGray;
        existing.darkCount++;
      } else {
        voteMap.set(pos, { votes: 1, darkSum: run.avgGray, darkCount: 1 });
      }
    }
  }

  const candidates: LineCandidate[] = [];
  for (const [pos, v] of voteMap) {
    // Require at least some votes (appears in multiple rows)
    const minVotes = Math.max(1, Math.floor(windowH / PROFILE_STEP / 4));
    if (v.votes >= minVotes) {
      candidates.push({
        position: pos,
        votes: v.votes,
        avgDarkness: v.darkSum / v.darkCount,
      });
    }
  }

  // Sort by position
  candidates.sort((a, b) => a.position - b.position);
  return candidates;
}

/**
 * Collect candidate horizontal line positions from vertical profile scans.
 */
function findHorizontalLineCandidates(
  data: Uint8ClampedArray,
  imgW: number,
  windowX: number,
  windowY: number,
  windowW: number,
  windowH: number,
  darkThreshold: number,
): LineCandidate[] {
  const voteMap = new Map<number, { votes: number; darkSum: number; darkCount: number }>();

  for (let col = 0; col < windowW; col += PROFILE_STEP) {
    const profile = extractColProfile(data, imgW, windowX, windowY, windowH, col);
    const runs = findDarkRuns(profile, darkThreshold);

    for (const run of runs) {
      const pos = Math.round(run.center);
      const existing = voteMap.get(pos);
      if (existing) {
        existing.votes++;
        existing.darkSum += run.avgGray;
        existing.darkCount++;
      } else {
        voteMap.set(pos, { votes: 1, darkSum: run.avgGray, darkCount: 1 });
      }
    }
  }

  const candidates: LineCandidate[] = [];
  for (const [pos, v] of voteMap) {
    const minVotes = Math.max(1, Math.floor(windowW / PROFILE_STEP / 4));
    if (v.votes >= minVotes) {
      candidates.push({
        position: pos,
        votes: v.votes,
        avgDarkness: v.darkSum / v.darkCount,
      });
    }
  }

  candidates.sort((a, b) => a.position - b.position);
  return candidates;
}

// ── Contrast Check ──

/**
 * Verify that a candidate line has sufficient contrast with its surroundings.
 * Checks pixels just outside the dark run to ensure it's a real line, not just
 * a uniformly dark region.
 *
 * @param imgH - full image height (passed from ImageData.height)
 */
function hasLineContrast(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  windowX: number,
  windowY: number,
  windowW: number,
  windowH: number,
  linePos: number,
  isVertical: boolean,
): boolean {
  const checkDist = 5; // px to look on each side of the candidate line
  let lineGray = 0;
  let surroundGray = 0;
  let lineCount = 0;
  let surroundCount = 0;

  if (isVertical) {
    const x = windowX + linePos;
    if (x - checkDist < 0 || x + checkDist >= imgW) return true; // edge, skip

    const sampleEnd = Math.min(windowY + windowH, imgH);
    for (let dy = windowY; dy < sampleEnd; dy += PROFILE_STEP) {
      lineGray += pixelGrayAt(data, imgW, x, dy);
      lineCount++;
      surroundGray += pixelGrayAt(data, imgW, x - checkDist, dy);
      surroundGray += pixelGrayAt(data, imgW, x + checkDist, dy);
      surroundCount += 2;
    }
  } else {
    const y = windowY + linePos;
    if (y - checkDist < 0 || y + checkDist >= imgH) return true; // edge, skip

    const sampleEnd = Math.min(windowX + windowW, imgW);
    for (let dx = windowX; dx < sampleEnd; dx += PROFILE_STEP) {
      lineGray += pixelGrayAt(data, imgW, dx, y);
      lineCount++;
      surroundGray += pixelGrayAt(data, imgW, dx, y - checkDist);
      surroundGray += pixelGrayAt(data, imgW, dx, y + checkDist);
      surroundCount += 2;
    }
  }

  if (lineCount === 0 || surroundCount === 0) return true;
  const contrast = surroundGray / surroundCount - lineGray / lineCount;
  return contrast >= MIN_CONTRAST;
}

// ── Main API ──

/**
 * Find the nearest grid intersection point to (centerX, centerY) in the image.
 *
 * Algorithm:
 * 1. Extract a search window (2*radius × 2*radius) around the center point
 * 2. Scan rows to find vertical line candidates (dark vertical strips)
 * 3. Scan columns to find horizontal line candidates (dark horizontal strips)
 * 4. Form intersection candidates from (vLine, hLine) pairs
 * 5. Pick the nearest intersection to the center point
 * 6. Apply contrast check to filter false positives
 *
 * Returns null if no confident intersection is found.
 */
export function findNearestIntersection(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  config?: Partial<SnapWindowConfig>,
): IntersectionResult | null {
  const radius = config?.radius ?? DEFAULT_SNAP_RADIUS;
  const darkThreshold = config?.darkThreshold ?? DEFAULT_DARK_THRESHOLD;

  const { data, width: imgW, height: imgH } = imageData;

  // Clamp window to image bounds
  const windowX = Math.max(0, Math.round(centerX) - radius);
  const windowY = Math.max(0, Math.round(centerY) - radius);
  const windowW = Math.min(2 * radius, imgW - windowX);
  const windowH = Math.min(2 * radius, imgH - windowY);

  if (windowW < 10 || windowH < 10) return null;

  // Find line candidates
  const vCandidates = findVerticalLineCandidates(
    data,
    imgW,
    windowX,
    windowY,
    windowW,
    windowH,
    darkThreshold,
  );
  const hCandidates = findHorizontalLineCandidates(
    data,
    imgW,
    windowX,
    windowY,
    windowW,
    windowH,
    darkThreshold,
  );

  if (vCandidates.length === 0 || hCandidates.length === 0) return null;

  // Filter by contrast
  const vFiltered = vCandidates.filter((c) =>
    hasLineContrast(data, imgW, imgH, windowX, windowY, windowW, windowH, c.position, true),
  );
  const hFiltered = hCandidates.filter((c) =>
    hasLineContrast(data, imgW, imgH, windowX, windowY, windowW, windowH, c.position, false),
  );

  if (vFiltered.length === 0 || hFiltered.length === 0) return null;

  // Find nearest intersection to center point
  const localCX = centerX - windowX;
  const localCY = centerY - windowY;

  let bestDist = Infinity;
  let bestX = 0;
  let bestY = 0;
  let bestConfidence = 0;

  for (const v of vFiltered) {
    for (const h of hFiltered) {
      const ix = v.position;
      const iy = h.position;
      const dx = ix - localCX;
      const dy = iy - localCY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < bestDist) {
        bestDist = dist;
        bestX = windowX + ix;
        bestY = windowY + iy;
        // Confidence: closer + more votes + darker = higher
        const distFactor = Math.max(0, 1 - dist / radius);
        const voteFactor = Math.min(1, (v.votes + h.votes) / 20);
        const darkFactor = Math.min(1, (510 - v.avgDarkness - h.avgDarkness) / 510);
        bestConfidence = distFactor * 0.4 + voteFactor * 0.3 + darkFactor * 0.3;
      }
    }
  }

  if (bestDist > radius) return null;

  return {
    x: bestX,
    y: bestY,
    confidence: Math.round(bestConfidence * 100) / 100,
  };
}

/**
 * Snap a single corner coordinate to the nearest grid intersection.
 * Wraps findNearestIntersection; returns the snapped coordinate or the
 * original if no intersection is found.
 */
export function snapCorner(
  imageData: ImageData,
  cornerX: number,
  cornerY: number,
  config?: Partial<SnapWindowConfig>,
): { x: number; y: number } {
  const result = findNearestIntersection(imageData, cornerX, cornerY, config);
  if (result && result.confidence > 0.2) {
    return { x: result.x, y: result.y };
  }
  return { x: cornerX, y: cornerY };
}

// ── Projection-based Grid Detection ──

/** Minimum cell size in pixels to consider as a valid grid spacing */
const MIN_CELL_PX = 20;
/** Gaussian sigma for smoothing the projection curve */
const SMOOTH_SIGMA = 2;
/** Minimum depth (gray difference) for a valley to be considered */
const MIN_VALLEY_DEPTH = 20;

/** Precomputed Gaussian kernel for SMOOTH_SIGMA */
const GAUSSIAN_KERNEL: number[] = (() => {
  const r = Math.ceil(SMOOTH_SIGMA * 2);
  const k: number[] = [];
  for (let i = -r; i <= r; i++) {
    k.push(Math.exp(-(i * i) / (2 * SMOOTH_SIGMA * SMOOTH_SIGMA)));
  }
  return k;
})();

/**
 * Simple Gaussian smoothing of a 1D array.
 * Convolves with a precomputed Gaussian kernel.
 */
function smoothProfile(profile: Float64Array): Float64Array {
  const kernelRadius = (GAUSSIAN_KERNEL.length - 1) / 2;
  const result = new Float64Array(profile.length);
  for (let i = 0; i < profile.length; i++) {
    let sum = 0;
    let weightSum = 0;
    for (let k = 0; k < GAUSSIAN_KERNEL.length; k++) {
      const idx = i + k - kernelRadius;
      if (idx >= 0 && idx < profile.length) {
        sum += profile[idx] * GAUSSIAN_KERNEL[k];
        weightSum += GAUSSIAN_KERNEL[k];
      }
    }
    result[i] = sum / weightSum;
  }
  return result;
}

/**
 * Compute an approximate upper percentile of a profile.
 * Uses a simple histogram-based approach for the 90th percentile.
 * This is more robust than global max for thresholding,
 * since a single bright outlier pixel won't skew the baseline.
 */
function profileBaseline(profile: Float64Array): number {
  const n = profile.length;
  if (n === 0) return 0;

  // Sort a copy to find the 90th percentile
  const sorted = new Float64Array(profile);
  sorted.sort();
  return sorted[Math.floor(n * 0.9)];
}

/**
 * Find local minima (valleys) in a 1D profile.
 *
 * Uses a two-pass approach:
 * 1. Compute baseline (90th percentile) and threshold = baseline - minDepth
 * 2. Find valley-bottom runs (contiguous pixels below the threshold)
 * 3. Pick the deepest point in each run as the valley center
 * 4. Filter by depth and spacing
 *
 * Returns indices sorted by position.
 */
function findValleys(profile: Float64Array, minDepth: number, maxCount: number): number[] {
  const baseline = profileBaseline(profile);
  const threshold = baseline - minDepth;

  // Find valley-bottom runs: contiguous regions where value is below the threshold
  const runs: { start: number; end: number; minVal: number; minIdx: number }[] = [];
  let inRun = false;
  let runStart = 0;
  let runMinVal = Infinity;
  let runMinIdx = 0;

  for (let i = 0; i < profile.length; i++) {
    const below = profile[i] <= threshold;
    if (below && !inRun) {
      inRun = true;
      runStart = i;
      runMinVal = profile[i];
      runMinIdx = i;
    } else if (below && inRun) {
      if (profile[i] < runMinVal) {
        runMinVal = profile[i];
        runMinIdx = i;
      }
    } else if (!below && inRun) {
      inRun = false;
      runs.push({ start: runStart, end: i - 1, minVal: runMinVal, minIdx: runMinIdx });
      runMinVal = Infinity;
    }
  }
  if (inRun) {
    runs.push({ start: runStart, end: profile.length - 1, minVal: runMinVal, minIdx: runMinIdx });
  }

  // Compute depth for each run and sort by depth
  const scored = runs.map((r) => ({
    index: r.minIdx,
    depth: baseline - r.minVal,
  }));

  scored.sort((a, b) => b.depth - a.depth);

  // Take top candidates with minimum spacing
  const picked: number[] = [];
  for (const v of scored) {
    if (picked.length >= maxCount) break;
    const tooClose = picked.some((p) => Math.abs(p - v.index) < MIN_CELL_PX);
    if (!tooClose) {
      picked.push(v.index);
    }
  }

  // Sort by position
  picked.sort((a, b) => a - b);
  return picked;
}

/**
 * Detect grid lines from a roughly-selected 2×2 region using grayscale projection.
 *
 * Algorithm:
 * 1. Extract the region's ImageData
 * 2. Horizontal projection: average gray per column → smooth → find 3 valleys = 3 vertical lines
 * 3. Vertical projection: average gray per row → smooth → find 3 valleys = 3 horizontal lines
 * 4. Compute cellPx from the average spacing between adjacent lines
 * 5. Compute offset from the first line position modulo cellPx
 *
 * Returns null if fewer than 3 valleys are found in either direction.
 */
export function detectGridFromRegion(
  imageData: ImageData,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  debug = false,
): GridDetectResult | null {
  const { data, width: imgW, height: imgH } = imageData;

  // Clamp region to image bounds
  const x0 = Math.max(0, Math.floor(rx));
  const y0 = Math.max(0, Math.floor(ry));
  const x1 = Math.min(imgW, Math.ceil(rx + rw));
  const y1 = Math.min(imgH, Math.ceil(ry + rh));
  const regionW = x1 - x0;
  const regionH = y1 - y0;

  if (regionW < MIN_CELL_PX * 2 || regionH < MIN_CELL_PX * 2) return null;

  // ── Horizontal projection (column averages) → find vertical lines ──
  const hProj = new Float64Array(regionW);
  for (let col = 0; col < regionW; col++) {
    let sum = 0;
    const x = x0 + col;
    for (let y = y0; y < y1; y++) {
      const idx = (y * imgW + x) * 4;
      sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
    hProj[col] = sum / regionH;
  }

  const hSmooth = smoothProfile(hProj);
  const vLines = findValleys(hSmooth, MIN_VALLEY_DEPTH, 3);

  // ── Vertical projection (row averages) → find horizontal lines ──
  const vProj = new Float64Array(regionH);
  for (let row = 0; row < regionH; row++) {
    let sum = 0;
    const y = y0 + row;
    const rowBase = y * imgW * 4;
    for (let x = x0; x < x1; x++) {
      const idx = rowBase + x * 4;
      sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    }
    vProj[row] = sum / regionW;
  }

  const vSmooth = smoothProfile(vProj);
  const hLines = findValleys(vSmooth, MIN_VALLEY_DEPTH, 3);

  if (debug) {
    const hBase = profileBaseline(hSmooth);
    const hThresh = hBase - MIN_VALLEY_DEPTH;
    const vBase = profileBaseline(vSmooth);
    const vThresh = vBase - MIN_VALLEY_DEPTH;
    debugPrintProfile(
      'Horizontal projection (vertical lines)',
      hProj,
      hSmooth,
      hThresh,
      vLines,
      x0,
    );
    debugPrintProfile(
      'Vertical projection (horizontal lines)',
      vProj,
      vSmooth,
      vThresh,
      hLines,
      y0,
    );
  }

  // ── Need at least 3 lines in each direction for 2×2 ──
  if (vLines.length < 3 || hLines.length < 3) {
    // Try with 2 lines — still useful for cellPx
    if (vLines.length < 2 || hLines.length < 2) {
      return null;
    }
  }

  // ── Convert from region-relative to absolute image coordinates ──
  const absVLines = vLines.map((l) => x0 + l);
  const absHLines = hLines.map((l) => y0 + l);

  // ── Compute cellPx from average spacing ──
  const vSpacings: number[] = [];
  for (let i = 1; i < absVLines.length; i++) {
    vSpacings.push(absVLines[i] - absVLines[i - 1]);
  }
  const hSpacings: number[] = [];
  for (let i = 1; i < absHLines.length; i++) {
    hSpacings.push(absHLines[i] - absHLines[i - 1]);
  }
  const allSpacings = [...vSpacings, ...hSpacings];
  const avgSpacing = allSpacings.reduce((a, b) => a + b, 0) / allSpacings.length;

  const cellPx = Math.max(MIN_CELL_PX, Math.round(avgSpacing * 10) / 10);

  // ── Compute offset: mean of (linePos % cellPx) across all detected lines ──
  const xOffsets = absVLines.map((l) => ((l % cellPx) + cellPx) % cellPx);
  const yOffsets = absHLines.map((l) => ((l % cellPx) + cellPx) % cellPx);
  const offsetX = Math.round(xOffsets.reduce((a, b) => a + b, 0) / xOffsets.length);
  const offsetY = Math.round(yOffsets.reduce((a, b) => a + b, 0) / yOffsets.length);

  if (debug) {
    console.log(
      `%c[Grid Detect] %c${regionW}×${regionH}px region | ` +
        `vLines=[${absVLines.join(', ')}] hLines=[${absHLines.join(', ')}] | ` +
        `cellPx=${cellPx} offset=(${offsetX}, ${offsetY})`,
      'color:#ffd700;font-weight:bold',
      'color:inherit',
    );
  }

  return { cellPx, offsetX, offsetY };
}

// ── Debug visualization ──

/**
 * Print an ASCII visualization of the projection curve to console.
 * Shows raw profile (dim), smoothed profile (bright), threshold line (dashed),
 * and detected valley positions (marked with ▼).
 */
function debugPrintProfile(
  title: string,
  _raw: Float64Array,
  smooth: Float64Array,
  threshold: number,
  valleys: number[],
  offset: number,
): void {
  const w = Math.min(smooth.length, 120); // max chart width
  const step = Math.max(1, Math.floor(smooth.length / w));

  // Downsample for display
  const sampled: number[] = [];
  for (let i = 0; i < w; i++) {
    let sum = 0;
    let count = 0;
    for (let j = 0; j < step && i * step + j < smooth.length; j++) {
      sum += smooth[i * step + j];
      count++;
    }
    sampled.push(sum / count);
  }

  const min = Math.min(...sampled);
  const max = Math.max(...sampled, threshold);
  const range = max - min || 1;
  const chartH = 12;

  // Build the chart
  const lines: string[] = [];
  lines.push(
    `\n%c${title}%c (${smooth.length}px, threshold=${Math.round(threshold)})`,
    'color:#ffd700;font-weight:bold',
    'color:inherit',
  );

  for (let row = chartH - 1; row >= 0; row--) {
    const gray = Math.round(min + (range * row) / (chartH - 1));
    let line = `${String(gray).padStart(3)} │`;
    for (let col = 0; col < w; col++) {
      const v = sampled[col];
      const normV = (v - min) / range;
      const normR = row / (chartH - 1);
      // Draw smoothed profile as block
      if (Math.abs(normV - normR) < 0.08) {
        line += '█';
      } else if (normV <= normR && normV > normR - 0.04) {
        line += '▄';
      } else if (normV >= normR && normV < normR + 0.04) {
        line += '▀';
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }

  // Threshold line
  const threshLabel = String(Math.round(threshold)).padStart(3);
  lines.push(`${threshLabel} ├${'─'.repeat(w)}`);

  // Valley markers
  const valleySet = new Set(valleys.map((v) => Math.round((v - offset) / step)));
  let markerLine = '   └';
  for (let col = 0; col < w; col++) {
    markerLine += valleySet.has(col) ? '▼' : ' ';
  }
  lines.push(markerLine);

  console.log(lines.join('\n'));
}
