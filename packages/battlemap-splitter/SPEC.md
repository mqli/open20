# Battlemap Splitter — Specification

> Browser-based React SPA for splitting tabletop battle maps into printable tiles.

---

## 1. Overview

A standalone React application that lets users upload a battle map image, configure
a grid overlay to match the map's built-in grid, select paper size, preview the
tiling layout, pick which tiles to print, and download a printable PDF.

### 1.1 Target Users

Tabletop RPG GMs who find battle maps online (5etools, Patreon, etc.) and need to
print them at correct scale across multiple sheets of paper.

### 1.2 Core Principle

**One grid square = one physical inch (25.4 mm).** The app must preserve this
physical scale regardless of the source image's DPI. The grid cell size in pixels
(`cellPx`) IS the source DPI — because 1 cell = 1 inch, `cellPx` pixels map to
25.4 mm on paper.

---

## 2. Feature List

### 2.1 Battlemap Input

| Priority | Feature           | Description                                                                                                                                                                                                                                                                                                                       |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | File Upload       | Drag-and-drop or file-picker for image files (PNG, JPG, WebP, AVIF)                                                                                                                                                                                                                                                               |
| P0       | URL Import        | Paste a URL to load a remote image. Because cross-origin images taint the canvas (breaking `getImageData` for auto-detect and tile extraction), the app must fetch the image through a CORS proxy and re-host it as a same-origin Blob URL. Provide a built-in proxy fallback or document the limitation if proxy is unavailable. |
| P1       | Clipboard Paste   | Paste an image directly from clipboard                                                                                                                                                                                                                                                                                            |
| P2       | Image Adjustments | Brightness/contrast sliders (for faded PDF maps)                                                                                                                                                                                                                                                                                  |

### 2.2 Grid Calibration

This is the **most critical UX** — the user must be able to visually align a
grid overlay with the map's built-in grid.

| Priority | Feature                 | Description                                                                                                                                          |
| -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Grid Overlay Toggle     | Show/hide the grid overlay on the map preview                                                                                                        |
| P0       | Grid Resize             | Drag grid lines or use a slider to adjust grid cell size (in pixels)                                                                                 |
| P0       | Grid Offset             | Drag the entire grid to align with the map (X/Y offset)                                                                                              |
| P0       | Grid Color              | Toggle between visible colors (blue, red, white, yellow)                                                                                             |
| P0       | DPI Display             | Show the computed DPI = `cellPx` (since 1 cell = 1 inch = 25.4 mm)                                                                                   |
| P0       | Direct DPI Input        | Numeric input field to set `cellPx` directly (many users know their map's DPI — e.g., 70 for 5etools, 72 for Dungeondraft, 100/150 for Patreon maps) |
| P1       | Snap-to-Lines           | Detect dark grid lines in the image and snap the overlay to them                                                                                     |
| P1       | Grid Auto-Detect        | Button to run the autocorrelation algorithm (see Section 5.2)                                                                                        |
| P1       | Grid Visibility         | Opacity slider for the overlay                                                                                                                       |
| P2       | Multi-Point Calibration | Click on 3 corners of known grid squares to auto-compute DPI                                                                                         |

**Calibration UX Flow:**

1. User enables grid overlay
2. User sees the overlay — likely misaligned with the map's grid
3. User adjusts cell size (pixels) until overlay cell count roughly matches, or enters a known DPI value
4. User drags the overlay to align it perfectly
5. Optional: user clicks "Auto-Detect" to let the algorithm try
6. **Acceptance**: when the overlay grid lines visually match the map's grid
   lines exactly

### 2.3 Paper & Tiling Configuration

| Priority | Feature           | Description                                                     |
| -------- | ----------------- | --------------------------------------------------------------- |
| P0       | Paper Size        | Presets: A4, US Letter, A3, Tabloid + custom dimensions (mm)    |
| P0       | Orientation       | Auto (optimal) + forced Portrait/Landscape                      |
| P0       | Margins           | Uniform margin in mm (default 8mm); optional per-edge override  |
| P0       | Overlap           | Tile-to-tile overlap in mm (default 5mm)                        |
| P0       | Scale Lock        | Enforce 1 grid square = 25.4 mm (unlock for custom print scale) |
| P0       | Tile Grid Preview | Overlay showing how the map is split into paper-sized tiles     |
| P1       | Per-Edge Margins  | Individual top/bottom/left/right margin controls                |
| P1       | Page Label Format | Configurable label format (row/col numbering)                   |

**Orientation Auto-Detect Algorithm:**

When orientation is set to `auto`, the app evaluates both portrait and landscape
layouts and picks the better one using this decision rule:

1. Compute tile grid for portrait: `(p_cols, p_rows, p_pages)`
2. Compute tile grid for landscape: `(l_cols, l_rows, l_pages)`
3. Decision:
   - If `l_pages < p_pages` → landscape
   - If `l_pages > p_pages` → portrait
   - If tied: compute waste percentage for each; if one has ≥1% less waste → choose it
   - If still tied → portrait (more natural for assembly)

This matches the Python `calc_grid` evaluation logic.

**Tiling Preview UX:**

- Shows a semi-transparent tile grid overlay on the map
- Each tile shows its row/column label
- Hover highlights a tile
- Tiles that map to blank areas (no map content) are dimmed (see Section 5.5 for empty-tile detection)

### 2.4 Tile Selection

| Priority | Feature            | Description                                               |
| -------- | ------------------ | --------------------------------------------------------- |
| P0       | Click to Toggle    | Click individual tiles to include/exclude from PDF        |
| P0       | Select All / None  | Bulk toggle buttons                                       |
| P0       | Drag Select        | Click-and-drag to select a rectangular region of tiles    |
| P1       | Selection Presets  | Save/load tile selection sets (for recurring layouts)     |
| P1       | Tile Count Display | "12 of 24 tiles selected"                                 |
| P1       | Context Menu       | Right-click tile: "Select row", "Select column", "Invert" |

### 2.5 PDF Generation

| Priority | Feature          | Description                                                                                                                                                                                                                       |
| -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Download PDF     | Generate and download printable PDF with selected tiles                                                                                                                                                                           |
| P0       | Tile Labels      | Each page includes the tile label (`MapName R1C2/3×4`) and a scale verification indicator (`1格 = 25.4mm @ {DPI} DPI`) at the bottom, for assembly and print verification                                                         |
| P0       | Crop Marks       | L-shaped crop marks at tile corners                                                                                                                                                                                               |
| P0       | Dashed Cut Lines | Dashed guide lines along all four edges of the content area, to guide scissors                                                                                                                                                    |
| P0       | DPI Setting      | Output resolution (default 150 DPI)                                                                                                                                                                                               |
| P0       | Assembly Guide   | Optional first or last page showing: (a) scaled-down full map preview with tile grid overlay, (b) row/column labels overlaid on each tile, (c) printing and assembly instructions, (d) map metadata (dimensions, DPI, grid scale) |
| P1       | Grayscale Option | Convert map to grayscale for B&W laser printers                                                                                                                                                                                   |
| P1       | Ink Saver        | Reduce opacity of dark areas (for toner efficiency)                                                                                                                                                                               |
| P2       | PDF Preview      | Render the PDF pages in-browser before download                                                                                                                                                                                   |

**Assembly Guide Placement:** The guide is appended as the first page of the PDF.
This makes it easy to discard without re-ordering — users print pages 2+ for the
actual tiles.

**Per-Page Labels:** Each tile page includes at its bottom margin:

- Map name (if provided) + orientation tag (`横排` if landscape)
- Tile coordinate: `R{row}C{col}/{total_rows}×{total_cols}`
- Scale verification: `1格 = 25.4mm @ {grid_dpi} DPI`
- This mirrors `generate_battlemaps.py` lines 377-390

### 2.6 Persistence & Sharing

| Priority | Feature       | Description                                                                                                                                             |
| -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Session State | Save all settings to localStorage (grid config, paper config, tile selections — but NOT the image blob, which is too large; re-upload image on restore) |
| P1       | Export Config | Download a `.json` config file that can be re-imported                                                                                                  |
| P2       | Share URL     | Encode state into a shareable URL hash                                                                                                                  |

---

## 3. Component Tree

```
App
├── Toolbar
│   ├── PaperConfigPanel          (paper size, orientation, margins, overlap)
│   ├── GridConfigPanel           (cell px / DPI input, offset, color, opacity, auto-detect button)
│   └── ActionBar                 (generate PDF, reset, export config)
├── Workspace (main area)
│   ├── MapCanvas                 (renders map + grid overlay + tile overlay)
│   │   ├── GridOverlay           (calibration grid, draggable/resizable)
│   │   └── TileOverlay           (paper-size split grid, clickable tiles)
│   ├── ToolPalette               (zoom in/out, fit-to-screen, toggle overlays)
│   └── TileSidebar               (tile list, select/deselect, tile count)
├── StatusBar                     (DPI display, map dimensions in mm, scale info)
└── Dialogs
    ├── UploadDialog              (file drop, URL input, clipboard paste)
    ├── ExportDialog              (PDF generation progress, download)
    └── SettingsDialog            (default paper size, default DPI, language)
```

---

## 4. State Architecture (Zustand Stores)

### 4.1 `mapStore`

```ts
interface MapState {
  // Source image — stored as blob URL so canvas won't taint
  imageUrl: string | null;
  // Cached dimensions from the loaded image
  width: number; // image.naturalWidth
  height: number; // image.naturalHeight

  // View transform (zoom/pan for the canvas viewport)
  zoom: number; // 0.1 - 5.0
  panX: number;
  panY: number;

  // Actions
  loadImageFromFile: (file: File) => Promise<void>;
  loadImageFromUrl: (url: string) => Promise<void>;
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  fitToScreen: () => void;
  clear: () => void;
}
```

**Design notes:**

- `imageUrl` is always a same-origin `blob:` URL (local file upload) or a proxy-fetched blob URL (remote URL import). This avoids CORS canvas tainting.
- `width`/`height` are cached from the `HTMLImageElement` on load — avoids storing the element in state.
- Components that need the actual `HTMLImageElement` for canvas drawing create it imperatively from `imageUrl`.

### 4.2 `gridStore`

```ts
interface GridState {
  // Calibration grid (the grid that matches the map's built-in grid)
  cellPx: number; // pixels per grid square — IS the source DPI (1 cell = 1 inch)
  offsetX: number; // horizontal offset in px
  offsetY: number; // vertical offset in px
  visible: boolean;
  tileOverlayVisible: boolean; // whether the tile split overlay is visible
  color: string; // rgba
  opacity: number; // 0 - 1

  // Actions
  setCellPx: (px: number) => void;
  adjustCellPx: (delta: number) => void;
  setOffset: (x: number, y: number) => void;
  toggleVisibility: () => void;
  toggleTileOverlay: () => void;
  setColor: (color: string) => void;
  setOpacity: (op: number) => void;
  reset: () => void;
}
```

**Design notes:**

- `cellPx` IS the effective DPI. No separate `gridDpi` field — they are the same value.
  Wherever the code needs "DPI", use `gridStore.getState().cellPx`.
- `autoDetect()` is async — it reads `mapStore.imageUrl`, loads the image, runs the
  autocorrelation algorithm, and calls `setCellPx()` + `setOffset()` on success.

### 4.3 `paperStore`

```ts
type PaperPreset =
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

interface PaperState {
  preset: PaperPreset;
  customW: number; // mm
  customH: number; // mm
  orientation: 'portrait' | 'landscape'; // best orientation evaluated on image load
  margin: number; // mm (uniform default); per-edge overrides below
  marginTop: number | null; // null = use `margin`
  marginBottom: number | null;
  marginLeft: number | null;
  marginRight: number | null;
  overlap: number; // mm
  outputDpi: number; // output PDF DPI
  scaleLocked: boolean; // enforce 1 cell = 25.4 mm

  // Resolved margin getters + paper dimension getters
  getMarginTop: () => number;
  getMarginBottom: () => number;
  getMarginLeft: () => number;
  getMarginRight: () => number;
  getPaperWidth: () => number;
  getPaperHeight: () => number;

  // … setters for each field
}
```

**Design notes:**

- `margin` is the uniform default. Per-edge fields override when non-null.
- Actual per-edge margins are resolved at read time: `marginTop ?? margin`.

### 4.4 `tileStore`

```ts
interface TileInfo {
  row: number;
  col: number;
  selected: boolean;
  isEmpty: boolean; // tile has negligible map content (see Section 5.5)
  // Source pixel region (populated by recalculate)
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
  // Content area on paper in mm
  contentW: number;
  contentH: number;
  // Thumbnail preview data URL (generated during empty tile detection)
  previewUrl?: string;
}

interface TileState {
  tiles: TileInfo[][]; // 2D array [row][col]
  tileCols: number;
  tileRows: number;
  orientation: 'portrait' | 'landscape'; // from computeTileGrid result

  // Derived (computed by selectors, not stored separately)
  // selectedCount: number ��� tiles.flat().filter(t => t.selected).length
  // allSelected: boolean ← tiles.every(t => t.selected)

  // Actions
  recalculate: () => void; // reads gridStore.cellPx + paperStore state
  toggleTile: (row: number, col: number) => void;
  selectAll: () => void;
  selectNone: () => void;
  selectRect: (r1: number, c1: number, r2: number, c2: number) => void;
  detectEmptyTiles: () => Promise<void>; // async, samples pixel data
}
```

**Design notes:**

- `selectedCount` and `allSelected` are derived via selectors, not stored as fields.
  This eliminates the sync maintenance problem.
- `recalculate()` reads `gridStore.getState().cellPx` and `paperStore.getState().*`
  to compute the tile grid dimensions and source regions. This is explicitly
  cross-store — implementers must call `useNestedStore.getState()` for each dependency.
- `detectEmptyTiles()` is async and throttled — it runs on recalculation, not on
  individual tile toggle (see Section 5.5).

### 4.5 Store Defaults

| Store        | Field                 | Default                  | Notes                                                                |
| ------------ | --------------------- | ------------------------ | -------------------------------------------------------------------- |
| `mapStore`   | `imageUrl`            | `null`                   | No image on cold start                                               |
| `mapStore`   | `width`/`height`      | `0`                      | Set on image load                                                    |
| `mapStore`   | `zoom`                | `1`                      | 100% (image pixel → screen pixel at 1:1)                             |
| `mapStore`   | `panX`/`panY`         | `0`                      | Top-left origin                                                      |
| `gridStore`  | `cellPx`              | `143`                    | Common DPI for battle maps (approx 5.6 px/mm)                        |
| `gridStore`  | `offsetX`/`offsetY`   | `0`                      | Grid origin at image top-left                                        |
| `gridStore`  | `visible`             | `false`                  | Grid hidden by default; shown after calibration                      |
| `gridStore`  | `tileOverlayVisible`  | `false`                  | Tile split overlay hidden by default                                 |
| `gridStore`  | `color`               | `rgba(239, 68, 68, 0.8)` | Red (Tailwind red-500), 80% opacity                                  |
| `gridStore`  | `opacity`             | `0.8`                    |                                                                      |
| `paperStore` | `preset`              | `A4`                     | Most common paper worldwide                                          |
| `paperStore` | `orientation`         | `portrait`               | Best orientation evaluated on image load via evaluateBestOrientation |
| `paperStore` | `margin`              | `15`                     | mm; minimum 15mm to provide room for tile labels                     |
| `paperStore` | `overlap`             | `5`                      | mm; balances alignment ease vs. paper waste                          |
| `paperStore` | `outputDpi`           | `150`                    | Balances quality vs. file size                                       |
| `paperStore` | `scaleLocked`         | `true`                   | Enforce 1 cell = 25.4 mm by default                                  |
| `tileStore`  | `tiles`               | `[]`                     | Empty until first `recalculate()`                                    |
| `tileStore`  | `tileCols`/`tileRows` | `0`                      |                                                                      |

**Initial tile selection:** After `recalculate()`, all non-empty tiles are selected
by default. `detectEmptyTiles()` runs immediately after, setting `isEmpty` on
blank tiles and deselecting them. The user then fine-tunes with click/drag selection.

### 4.6 Error & Loading States

| State                  | Trigger                                    | UI Behavior                                                                     |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| Image loading          | File upload / URL import                   | Spinner overlay on canvas; "Loading map..." text                                |
| Image load failure     | Bad file format, network error, CORS block | Error toast: "Could not load image: [reason]"                                   |
| Auto-detect failure    | `autoDetect()` returns null                | Toast: "Could not detect grid — try manual calibration"                         |
| Auto-detect running    | `autoDetect()` in progress                 | Spinner on the auto-detect button; canvas dimmed                                |
| Tile recalculation     | `recalculate()` running (large maps)       | "Calculating tiles..." badge in TileSidebar                                     |
| PDF generation         | `usePdfGenerator` in progress              | ExportDialog with progress: "Generating page 5 of 24..."                        |
| PDF generation failure | OOM for very large maps                    | Error toast with suggestion: "Try reducing output DPI or selecting fewer tiles" |
| No image loaded        | PDF/calibration attempted before upload    | Disabled buttons with tooltip explanation                                       |

All errors use a toast notification system. Critical errors (image load failure)
render an inline state in the canvas area. Async operations show inline spinners
on the triggering element, not full-screen blockers.

---

## 5. Core Algorithm Flow

### 5.1 Tiling Calculation

Direct port of `calc_grid` from `generate_battlemaps.py` lines 225-242.

Given:

- Map physical size in mm: `mapW_mm = imageW_px / cellPx * 25.4`
- Content area per page: `contentW_mm = paperW_mm - marginLeft - marginRight`
- Overlap deducted from effective content: `effW = contentW_mm - overlap`
- Number of columns: `cols = ceil((mapW_mm - overlap) / effW)`
- Slice width: `sliceW_mm = (mapW_mm + (cols - 1) * overlap) / cols`
- If `sliceW_mm > contentW_mm + 1mm`, increment `cols` and recalculate (fit-adjustment)
- Same logic for rows
- Source pixel region for tile (row, col):
  - `srcX = col * sliceW_mm / 25.4 * cellPx - (overlap / 25.4 * cellPx if col > 0)`, clamped to [0, imageW]
  - `srcY = row * sliceH_mm / 25.4 * cellPx - (overlap / 25.4 * cellPx if row > 0)`, clamped to [0, imageH]
  - `srcW = sliceW_mm / 25.4 * cellPx`, clamped to image bounds
  - `srcH = sliceH_mm / 25.4 * cellPx`, clamped to image bounds

**Debouncing:** Tile recalculation is triggered on grid/paper state changes but
debounced at 150ms. During slider drag, the grid overlay updates live but tiles
recalculate only on drag-end. A "calculating..." indicator is shown during
recalculation for very large maps (>50 tiles).

### 5.2 Grid Auto-Detection

This is a TypeScript port of the Python `detect_grid_dpi` function, using Canvas
`getImageData` instead of `numpy`/`scipy`.

The implementation breaks down into three phases:

#### Phase A: Content Region Detection (Variance Method)

The Python script finds the content region BEFORE profiling — this is critical for
maps with large blank borders (common in scanned maps). The JS port must do the same:

1. Convert image to grayscale via Canvas: draw image, call `getImageData()`
2. Compute row variance: for each row, `var(row_pixels)`. Threshold: rows with `variance > 10` are "content rows".
3. Compute column variance: same approach for columns.
4. Extract content bounds: `[r0, r1, c0, c1]` from the first and last content rows/columns.
5. If content region is too small (<100 rows or cols), abort detection (return null).

#### Phase B: Profile Extraction & Autocorrelation

1. Extract horizontal profile: average the center 120 rows of the **content region** (not the full image):
   - `ch_start = max(0, contentMidRow - 60)`, `ch_end = min(contentHeight, contentMidRow + 60)`
   - Average all rows in this band → 1D array of length `contentWidth`
2. Extract vertical profile: average the center 120 columns of the content region.
3. Run autocorrelation on each profile (direct O(n²) implementation):
   - Subtract mean from profile (zero-center)
   - Compute autocorrelation: `corr[k] = Σ profile[i] * profile[i + k]` for `k ∈ [0, n)`
   - Use only the right half (`k >= 0`)

#### Phase C: Peak Detection & Scoring

1. Find all significant local maxima in the autocorrelation, starting at `k = 5` (avoid DC):
   - Peak at `k` iff `corr[k] > corr[k-1] && corr[k] > corr[k+1]` AND `corr[k] > mean(|corr|) * 1.5`
2. Score each peak:
   - Base score = peak strength (`corr[k]`)
   - ×1.5 if within 10px of known DPI values (70, 100, 150, 60)
   - ×0.5 if gap < 25px (likely noise/aliasing)
3. Select highest-scoring peak for H and V profiles.

#### Phase D: Fallback Chain

The final DPI selection follows this fallback chain (matching Python lines 152-171):

```
if (h_spacing && v_spacing):
    avg = (h_spacing + v_spacing) / 2
    if 30 <= avg <= 300 AND |h_spacing - v_spacing| < avg * 0.5:
        if avg < 45: return DEFAULT (70)  // likely aliasing
        else: return avg
else if (h_spacing && 30 <= h_spacing <= 300):
    if h_spacing < 45: return DEFAULT (70)
    else: return h_spacing
else if (v_spacing && 30 <= v_spacing <= 300):
    if v_spacing < 45: return DEFAULT (70)
    else: return v_spacing
else:
    return null  // detection failed → caller falls back to DEFAULT (70)
```

#### Transparency Handling

Before auto-detection, the image MUST be composited onto a white background.
Canvas's `getImageData()` returns premultiplied alpha by default — transparent
pixels are `(0,0,0,0)`, which when converted to grayscale become black. This
would corrupt the variance and profile calculations. Always draw the source
image onto a white-filled canvas before extracting pixel data.

#### Performance Notes

- For images up to ~6000px wide, direct O(n²) autocorrelation is acceptable (~36M ops per direction).
- For larger images, sub-sample the profile by factor 2 or 4 before autocorrelation.
- The canvas used for analysis should be downscaled — full-resolution analysis is unnecessary. Scale the image so `max(width, height) <= 2048` before starting detection.

### 5.3 PDF Generation

Use jsPDF to generate the output. Critical configuration:

- **jsPDF default DPI is 72.** The app's output DPI is 150 by default. This means
  all pixel-to-mm conversions in jsPDF must use the configured `outputDpi`:
  - `mm = px / outputDpi * 25.4`
  - `px = mm / 25.4 * outputDpi`
- jsPDF page size is set in mm: `new jsPDF({ unit: 'mm', format: [w_mm, h_mm] })`
- Images are added with explicit width/height in mm (not pixels):
  - `doc.addImage(tileDataUrl, 'JPEG', x_mm, y_mm, w_mm, h_mm)`
- Crop marks and dashed cut lines are drawn with jsPDF's line drawing API in mm coordinates.

**Pipeline for each selected tile:**

1. Crop the source region from the original image using an off-screen canvas
2. Scale the crop to output DPI: `outputPx = sourcePx * (outputDpi / cellPx)`
3. Convert scaled tile canvas to JPEG data URL (quality 0.92)
4. Create jsPDF page at the configured paper size
5. Add the tile image centered in the content area
6. Draw L-shaped crop marks at the four corners of the tile content
7. Draw dashed cut lines along the four edges
8. Draw tile label and scale indicator at the bottom margin
9. Append to PDF document

**Assembly guide page** (first page of PDF):

1. Scale the full map to fit within 170×220mm (like the Python script)
2. Draw the scaled preview centered on the page
3. Overlay the tile grid (red lines) and row/column labels
4. Add title ("拼接指南 / Assembly Guide")
5. Add map metadata and printing instructions
6. Prepending as page 1 means users can skip printing it (print pages 2+)

### 5.4 Canvas Rendering

The main `MapCanvas` renders using `requestAnimationFrame`, throttled to changes
in any of the four stores:

1. Clear canvas to white
2. Apply viewport transform (translate + scale for zoom/pan)
3. Draw the source image (from `mapStore.imageUrl`, via an `HTMLImageElement`)
4. If grid visible (`gridStore.visible`): draw calibration grid overlay
   - Lines at `offsetX + n * cellPx` (the offset means the grid is draggable)
   - Color and opacity from `gridStore`
   - Only draw lines visible in the current viewport (clip to visible range)
5. Draw tile overlay from `tileStore.tiles[][]`:
   - Each tile region: highlighted if selected, dimmed if not
   - Row/column labels centered in each tile
   - Semi-transparent overlay for non-selected tiles

**Performance:**

- The canvas viewport scales the image down, so `drawImage` renders at viewport
  resolution — but the source image is still decoded at full resolution in memory.
  For very large maps (>8000px dimension), suggest the user first downscale in
  an external tool.
- The analysis canvas (for auto-detect) should work on a downscaled copy (see 5.2).

### 5.5 Empty Tile Detection

After tiling recalculation, `detectEmptyTiles()` determines which tiles have
negligible map content (to dim them in the preview and auto-deselect them).

**Approach:**

1. For each tile, crop the source region to a small off-screen canvas (downscale to ~100px thumbnail)
2. Compute the average pixel variance of the thumbnail
3. If variance < threshold (e.g., 5.0 for 0-255 grayscale), mark as `isEmpty = true`
4. New empty tiles are auto-deselected; non-empty tiles remain selected by default

**Performance:** This runs once after recalculation, with a short debounce.
For a 50-tile grid, sampling 50 thumbnails is fast (<200ms). For very large
grids (>100 tiles), sample a random subset first and interpolate.

---

## 6. Dependencies

### New dependencies to add

| Package     | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `jspdf`     | PDF generation (pure JS, no WASM, works in browser) |
| (none else) | Canvas API handles all image processing             |

### Workspace dependencies

```
@open20/battlemap-splitter → @open20/ui (for shared components)
@open20/battlemap-splitter → @open20/config (for tsconfig/eslint/vite helpers)
```

No dependency on `open20-core` — this app has its own pure calculation engine in `src/engine/`.

---

## 7. Non-Goals (Out of Scope for v1)

- Server-side rendering or backend API
- SVG export
- Vector map support
- Multi-language PDF labels
- Interactive 3D map viewer
- Fog-of-war or GM layer features
- Integration with VTT platforms (Foundry, Roll20)
- Mobile-first responsive layout (desktop-first is fine — this tool targets
  desktop GMs preparing print materials at their desk)

---

## 8. Browser Compatibility

| Feature               | Required                                  |
| --------------------- | ----------------------------------------- |
| Canvas 2D             | Yes (baseline)                            |
| Canvas getImageData   | Yes (for auto-detect and tile extraction) |
| URL.createObjectURL   | Yes (baseline)                            |
| Drag & Drop API       | Yes (baseline)                            |
| Clipboard API (paste) | Optional, graceful fallback               |
| SharedArrayBuffer     | No                                        |

**URL Import Note:** Cross-origin images loaded via `<img>` taint the canvas. The
`loadImageFromUrl` action must fetch the image through a CORS proxy (like
`https://corsproxy.io/?<url>` or a self-hosted equivalent) and convert it to a
same-origin Blob URL. This is the only way to get `getImageData()` access for
auto-detection and tile extraction. If no proxy is configured, URL import works
but with degraded functionality (manual calibration only, no auto-detect).

---

## 9. File Structure

```
packages/battlemap-splitter/
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── eslint.config.js
├── index.html
├── SPEC.md                     # This file
├── AGENTS.md                   # Package-specific conventions
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # App frame: header + sidebar + workspace
│   │   │   ├── Toolbar.tsx        # Top bar: PaperConfigPanel + GridConfigPanel + ActionBar
│   │   │   └── StatusBar.tsx      # Bottom bar: DPI display, map dimensions, scale info
│   │   ├── canvas/
│   │   │   ├── MapCanvas.tsx      # Main canvas element + render loop
│   │   │   ├── GridOverlay.tsx    # Calibration grid (driven by gridStore)
│   │   │   ├── TileOverlay.tsx    # Paper-size split grid (driven by tileStore)
│   │   │   └── ToolPalette.tsx    # Zoom controls, fit-to-screen, overlay toggles
│   │   ├── panels/
│   │   │   ├── PaperConfigPanel.tsx
│   │   │   ├── GridConfigPanel.tsx
│   │   │   └── TileSidebar.tsx
│   │   └── dialogs/
│   │       ├── UploadDialog.tsx
│   │       ├── ExportDialog.tsx
│   │       └── SettingsDialog.tsx
│   ├── stores/
│   │   ├── mapStore.ts
│   │   ├── gridStore.ts
│   │   ├── paperStore.ts
│   │   └── tileStore.ts
│   ├── hooks/
│   │   ├── useCanvasRenderer.ts
│   │   ├── useGridDetection.ts
│   │   ├── usePdfGenerator.ts
│   │   └── useDragDrop.ts
│   ├── engine/
│   │   ├── gridDetect.ts        # Pure TS port of detect_grid_dpi
│   │   ├── tiling.ts            # Tile calculation engine
│   │   └── pdfGenerator.ts      # PDF assembly logic
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── mmToPx.ts
│       └── colors.ts
└── __tests__/
    ├── engine/
    │   ├── gridDetect.test.ts
    │   └── tiling.test.ts
    └── stores/
        ├── mapStore.test.ts
        └── tileStore.test.ts
```

### Cross-Store Interaction Summary

| Caller                         | Reads From                                                                        | When                                          |
| ------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------- |
| `gridStore.autoDetect()`       | `mapStore.imageUrl` (to load image for analysis)                                  | User clicks "Auto-Detect"                     |
| `tileStore.recalculate()`      | `gridStore.cellPx` + `paperStore.*`                                               | Any grid/paper state change (debounced 150ms) |
| `tileStore.detectEmptyTiles()` | `mapStore.imageUrl` + `tileStore.tiles[][]`                                       | After `recalculate()` completes               |
| `MapCanvas` render loop        | All four stores (via selectors)                                                   | Every `requestAnimationFrame`                 |
| `usePdfGenerator`              | `mapStore.imageUrl` + `gridStore.cellPx` + `paperStore.*` + `tileStore.tiles[][]` | User clicks "Download PDF"                    |

All cross-store reads use `useNestedStore.getState()` (Zustand's static accessor).
