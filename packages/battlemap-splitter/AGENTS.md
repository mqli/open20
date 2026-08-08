# @open20/battlemap-splitter — Agent Context

Browser-based React SPA for splitting tabletop battle maps into printable PDF tiles at correct scale (1 grid square = 25.4mm / 1 inch). Ported from the original `generate_battlemaps.py` Python script.

See `SPEC.md` for the full specification.

## Tech Stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- Zustand for state management
- jsPDF for PDF generation
- Canvas 2D API for all image processing and overlay rendering
- Lucide React for icons

## Architecture

```
src/
├── engine/              Pure TS — no React, no DOM
│   ├── gridDetect.ts    Autocorrelation-based grid DPI auto-detection
���   ├── tiling.ts        Direct port of Python calc_grid — tile computation
│   └── pdfGenerator.ts  jsPDF pipeline — crop/scale tiles, crop marks, labels, assembly guide
├── stores/              Zustand stores
│   ├── mapStore.ts      Image URL (blob), dimensions, zoom/pan
│   ├── gridStore.ts     Calibration grid (cellPx, offset, color, auto-detect)
│   ├── paperStore.ts    Paper config (size, orientation, margins, overlap, DPI)
│   └── tileStore.ts     Tile grid, selection, empty detection, auto-recalc
├── hooks/               React hooks
│   ├── useCanvasRenderer.ts   requestAnimationFrame render loop
│   ├── useDragDrop.ts         Drag-and-drop file handling
│   ├── usePdfGenerator.ts     PDF generation with progress tracking
│   ├── useSessionPersistence.ts  localStorage save/restore for grid + paper
│   └── useTileRecalc.ts       Subscribes to grid/paper changes → triggers tile recalculation
├── components/
│   ├── canvas/          Canvas-based components
│   │   ├── MapCanvas.tsx     Canvas + ResizeObserver + zoom/pan/tile-click interaction
│   │   ├── GridOverlay.tsx   drawGrid() — calibration grid lines
│   │   ├── TileOverlay.tsx   drawTiles() + hitTestTile() — paper split overlay
│   │   ├── ToolPalette.tsx   Zoom controls, fit-to-screen, grid toggle
│   │   └── DropZone.tsx      Full-bleed drag-and-drop upload area
│   ├── layout/          App shell components
│   │   ├── AppShell.tsx      Root layout with toolbar, canvas, sidebar, status bar
│   │   ├── Toolbar.tsx       Header bar with separate Paper/Grid flyout panels
│   │   ├── StatusBar.tsx     Image dimensions, map size, DPI, tile count
│   │   └── ToastContainer.tsx  Toast notification system
│   ├── panels/          Config panels (shown in flyouts)
│   │   ├── PaperConfigPanel.tsx  Paper size, orientation, margins, overlap, output DPI
│   │   ├── GridConfigPanel.tsx   Grid DPI, visibility, color, opacity, auto-detect
│   │   └── TileSidebar.tsx   Tile list with checkboxes, select all/none
│   └── dialogs/         Modal dialogs
│       ├── UploadDialog.tsx      File upload + URL import via CORS proxy
│       ├── ExportDialog.tsx      PDF generation progress + download
│       └── SettingsDialog.tsx    Default paper/DPI preferences
├── types/
│   └── index.ts         Shared types: GridDetectResult, PaperConfig, TileInfo, TileGrid
├── utils/
│   └── toast.ts         Toast notification system
└── test/
    └── setup.ts         vitest setup (localStorage mock)
```

## Key Design Decisions

- **Canvas buffer = CSS pixels 1:1** — no DPR scaling (simpler, works correctly; can add retina later)
- **Absolute inset-0 on canvas** — fills parent regardless of flexbox height computation
- **ResizeObserver** — reliable canvas sizing that works with flex layout settling
- **Cross-store subscriptions in useTileRecalc hook** — paper/grid changes trigger tile recalculation with 200ms debounce
- **Known-DPI proximity scoring** — auto-detect uses tiered scoring (2x/1.5x/1x/0.5x) based on distance from known DPI values
- **Downscale compensation** — auto-detect downsamples images for performance, then scales results back to original coordinates
- **jsPDF dynamically imported** — loaded on demand in `usePdfGenerator.ts` when user clicks Export (saves ~392KB from initial bundle)
- **React.lazy code splitting** — ExportDialog, UploadDialog, GridPanel are lazy-loaded with Suspense; gridCalibration engine (snapCorner, detectGridFromRegion) dynamically imported in MapCanvas.handleMouseUp

## Performance

### Build Configuration

- `build.target: 'es2020'` — modern browser target, no transpilation overhead
- `build.modulePreload.polyfill: false` — all modern browsers support native module preload
- `build.cssMinify: true` — explicit (default), CSS minified by esbuild
- `build.rollupOptions.output.manualChunks` — React split to vendor-react chunk for caching

### Preconnect Hints

- `index.html` has `<link rel="preconnect" href="https://static.cloudflareinsights.com" crossorigin>` for Cloudflare analytics

### Bundle Splits

| Chunk              | Size (gzip)     | When loaded                                   |
| ------------------ | --------------- | --------------------------------------------- |
| Main entry (index) | 230 KB (72 KB)  | Always                                        |
| vendor-react       | 12 KB (4 KB)    | Always                                        |
| ExportDialog       | 5 KB (2 KB)     | Click "Export"                                |
| UploadDialog       | 6 KB (2 KB)     | Click "Upload"                                |
| GridPanel          | 10 KB (3 KB)    | Image loaded                                  |
| gridCalibration    | 6 KB (3 KB)     | First calibration                             |
| pdfGenerator       | 392 KB (129 KB) | Click "Export" (jsPDF + html2canvas + purify) |

## Key Rules

- All image processing uses Canvas API (no external image libraries)
- PDF generation uses jsPDF
- Canvas 2D context drawing for overlays, not SVG/DOM
- Cross-store reads use `getState()` — documented in SPEC.md
- Follow naming conventions in root AGENTS.md
- Default grid DPI: 149.5 (common for 5etools maps)
- Default paper: A4, 8mm margins, 5mm overlap, 150 DPI output
