import { useTileStore } from '@/stores/tileStore';
import { usePaperStore, PRESET_DIMENSIONS } from '@/stores/paperStore';
import { useGridStore } from '@/stores/gridStore';
import type { PaperPreset } from '@/types';
import {
  Upload,
  Download,
  CheckSquare,
  Square,
  RotateCw,
  PanelLeft,
  PanelTop,
  LayoutGrid,
  Eye,
  EyeOff,
} from 'lucide-react';

function getPaperDims(
  preset: PaperPreset,
  customW: number,
  customH: number,
  orientation: 'portrait' | 'landscape',
): { w: number; h: number } {
  const dims = preset === 'CUSTOM' ? { w: customW, h: customH } : PRESET_DIMENSIONS[preset];
  return {
    w: orientation === 'landscape' ? dims.h : dims.w,
    h: orientation === 'landscape' ? dims.w : dims.h,
  };
}

interface TileSidebarProps {
  onUploadClick: () => void;
  onExportClick: () => void;
}

export function TileSidebar({ onUploadClick, onExportClick }: TileSidebarProps) {
  const tiles = useTileStore((s) => s.tiles);
  const tileCols = useTileStore((s) => s.tileCols);
  const calibrationFeet = useTileStore((s) => s.calibrationFeet);
  const mode = useTileStore((s) => s.mode);
  const selectedTile = useTileStore((s) => s.selectedTile);
  const setMode = useTileStore((s) => s.setMode);
  const tileOverlayVisible = useGridStore((s) => s.tileOverlayVisible);
  const toggleTileOverlay = useGridStore((s) => s.toggleTileOverlay);
  const toggleTile = useTileStore((s) => s.toggleTile);
  const selectAll = useTileStore((s) => s.selectAll);
  const selectNone = useTileStore((s) => s.selectNone);
  const rotateTile = useTileStore((s) => s.rotateTile);
  const setPerTileOrientation = useTileStore((s) => s.setPerTileOrientation);

  // Paper/margin specs for printable-area overlay
  const margin = usePaperStore((s) => s.margin);
  const marginTop = usePaperStore((s) => s.marginTop);
  const marginBottom = usePaperStore((s) => s.marginBottom);
  const marginLeft = usePaperStore((s) => s.marginLeft);
  const marginRight = usePaperStore((s) => s.marginRight);
  const preset = usePaperStore((s) => s.preset);
  const customW = usePaperStore((s) => s.customW);
  const customH = usePaperStore((s) => s.customH);
  const orientation = usePaperStore((s) => s.orientation);

  const { w: paperW, h: paperH } = getPaperDims(preset, customW, customH, orientation);
  const paperAspectRatio = paperW / paperH;
  const marginLeftMm = marginLeft ?? margin;
  const marginTopMm = marginTop ?? margin;
  const marginRightMm = marginRight ?? margin;
  const marginBottomMm = marginBottom ?? margin;

  const selectedCount = tiles.flat().filter((t) => t.selected && !t.isEmpty).length;
  const totalCount = tiles.flat().filter((t) => !t.isEmpty).length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  // Empty state: no tiles (no image loaded or recalibrated)
  if (tiles.length === 0) {
    return (
      <div className="absolute top-4 left-4 z-10 max-md:left-2 max-md:right-2 max-md:top-[calc(1rem+env(safe-area-inset-top,0px))]">
        <div className="w-72 max-md:w-full bg-bg-secondary border border-border-primary rounded-lg shadow-lg p-4 max-md:p-2">
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
            Tiles
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            Upload a battle map image to start. After calibrating the grid, your map will be split
            into printable tiles.
          </p>
          <button
            type="button"
            onClick={onUploadClick}
            className="w-full flex items-center justify-center gap-2 h-9 max-md:h-7 rounded-md text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/20 transition-colors"
          >
            <Upload size={16} />
            Upload Map Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 bottom-4 z-10 max-md:left-2 max-md:right-2 max-md:bottom-auto max-md:w-auto max-md:top-[calc(1rem+env(safe-area-inset-top,0px))]">
      <div className="w-72 bg-bg-secondary border border-border-primary rounded-lg shadow-lg flex flex-col h-full max-md:w-full max-md:h-auto">
        {/* Header */}
        <div className="p-3 max-md:p-2 border-b border-border-primary flex items-center gap-1.5 max-md:justify-between">
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Tiles
          </h3>
          <button
            type="button"
            onClick={onUploadClick}
            className="flex items-center gap-1 h-5 px-1.5 rounded text-[10px] border border-primary-500/25 text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
          >
            <Upload size={11} />
            Change
          </button>

          {/* Compact-only toggles merged into header (same line) */}
          <div className="hidden max-md:flex max-md:items-center max-md:gap-1">
            <button
              type="button"
              onClick={() => useTileStore.getState().setCalibrationFeet(5)}
              className={`h-5 px-1.5 rounded text-[10px] font-medium transition-colors ${
                calibrationFeet === 5
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-text-disabled hover:bg-bg-tertiary'
              }`}
            >
              5ft
            </button>
            <button
              type="button"
              onClick={() => useTileStore.getState().setCalibrationFeet(10)}
              className={`h-5 px-1.5 rounded text-[10px] font-medium transition-colors ${
                calibrationFeet === 10
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-text-disabled hover:bg-bg-tertiary'
              }`}
            >
              10ft
            </button>
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`h-5 px-1.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'auto'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-text-disabled hover:bg-bg-tertiary'
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`h-5 px-1.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'custom'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-text-disabled hover:bg-bg-tertiary'
              }`}
              title="Drag tiles to reposition, R to rotate"
            >
              Custom
            </button>
          </div>
        </div>

        {/* Body (desktop-only; mobile toggle controls are in header) */}
        <div className="p-3 space-y-2 hidden md:block">
          {/* ft toggle + Auto/Custom mode toggle (desktop only; merged into header on mobile) */}
          <div className="hidden md:flex md:gap-1">
            <div className="flex rounded-md border border-border-primary overflow-hidden h-7 flex-1">
              <button
                type="button"
                onClick={() => useTileStore.getState().setCalibrationFeet(5)}
                className={`flex-1 text-[10px] font-medium transition-colors ${
                  calibrationFeet === 5
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-text-disabled hover:bg-bg-tertiary'
                }`}
              >
                5 ft
              </button>
              <button
                type="button"
                onClick={() => useTileStore.getState().setCalibrationFeet(10)}
                className={`flex-1 text-[10px] font-medium transition-colors border-l border-border-primary ${
                  calibrationFeet === 10
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-text-disabled hover:bg-bg-tertiary'
                }`}
              >
                10 ft
              </button>
            </div>

            <div className="flex rounded-md border border-border-primary overflow-hidden h-7 flex-1">
              <button
                type="button"
                onClick={() => setMode('auto')}
                className={`flex-1 text-[10px] font-medium transition-colors ${
                  mode === 'auto'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-text-disabled hover:bg-bg-tertiary'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`flex-1 text-[10px] font-medium transition-colors border-l border-border-primary ${
                  mode === 'custom'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-text-disabled hover:bg-bg-tertiary'
                }`}
                title="Drag tiles to reposition, R to rotate"
              >
                Custom
              </button>
            </div>
          </div>

          {/* Tile overlay toggle (desktop only; mobile in ToolPalette) */}
          <button
            type="button"
            onClick={toggleTileOverlay}
            className={`flex items-center justify-center gap-1 h-7 rounded text-[10px] transition-colors w-full hidden md:flex ${
              tileOverlayVisible
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'border border-border-primary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            <LayoutGrid size={12} />
            Tile Overlay
            {tileOverlayVisible ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
        </div>

        {/* Custom mode: selected tile controls */}
        {mode === 'custom' && selectedTile && (
          <div className="px-3 pt-2 pb-1 space-y-1.5 border-b border-border-primary max-md:px-2">
            <p className="text-[10px] text-text-disabled">
              Selected: R{selectedTile.row + 1}C{selectedTile.col + 1}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => rotateTile(selectedTile.row, selectedTile.col)}
                className="flex items-center gap-1 py-1 px-2 max-md:py-0.5 max-md:px-1.5 rounded text-[10px] border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                <RotateCw size={10} />
                Rotate
              </button>
              <button
                type="button"
                onClick={() => {
                  const tile = tiles[selectedTile.row]?.[selectedTile.col];
                  const current = tile?.perTileOrientation;
                  setPerTileOrientation(
                    selectedTile.row,
                    selectedTile.col,
                    current === 'landscape' ? 'portrait' : 'landscape',
                  );
                }}
                className="flex items-center gap-1 py-1 px-2 max-md:py-0.5 max-md:px-1.5 rounded text-[10px] border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
              >
                {(() => {
                  const tile = tiles[selectedTile.row]?.[selectedTile.col];
                  return tile?.perTileOrientation === 'landscape' ? (
                    <>
                      <PanelTop size={10} />
                      Landscape
                    </>
                  ) : (
                    <>
                      <PanelLeft size={10} />
                      Portrait
                    </>
                  );
                })()}
              </button>
            </div>
          </div>
        )}

        {/* Select all + tile count + Export (merged on mobile) */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between max-md:px-2">
          <button
            type="button"
            onClick={allSelected ? selectNone : selectAll}
            className="flex items-center justify-center gap-1 py-1 px-2 max-md:py-0.5 max-md:px-1.5 rounded text-[10px] border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            {allSelected ? <Square size={12} /> : <CheckSquare size={12} />}
            {allSelected ? 'None' : 'All'}
          </button>
          <span className="text-xs text-text-secondary tabular-nums">
            {selectedCount > 0
              ? `${selectedCount} of ${totalCount} selected`
              : `${totalCount} tiles`}
          </span>
          {/* Mobile-only inline export */}
          <button
            type="button"
            onClick={onExportClick}
            disabled={selectedCount === 0}
            className="hidden max-md:flex items-center justify-center gap-1 py-0.5 px-1.5 rounded text-[10px] font-medium bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={10} />
            Export
          </button>
        </div>

        {/* Tile thumbnails */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 max-md:flex-none max-md:overflow-x-auto max-md:overflow-y-hidden max-md:flex max-md:gap-1 max-md:px-2 max-md:pb-2 max-md:h-16">
          <div
            className="grid gap-2 max-md:flex max-md:gap-1"
            style={{
              gridTemplateColumns: `repeat(${tileCols}, 1fr)`,
            }}
          >
            {tiles.map((row) =>
              row.map((tile) => {
                // Position the tile image within the paper-sized thumbnail
                // Apply user offset so custom-mode moved tiles show the correct crop region
                const imageTop = (tile.row * tile.srcH + tile.userOffsetY) / paperH;
                const imageLeft = (tile.col * tile.srcW + tile.userOffsetX) / paperW;
                const sliceW = Math.min(tile.srcW, paperW - imageLeft);
                const sliceH = Math.min(tile.srcH, paperH - imageTop);

                const imageClip = {
                  top: `${(imageTop / paperH) * 100}%`,
                  left: `${(imageLeft / paperW) * 100}%`,
                  width: `${((sliceW / paperW) * 100).toFixed(2)}%`,
                  height: `${((sliceH / paperH) * 100).toFixed(2)}%`,
                };

                return (
                  <button
                    key={`${tile.row}-${tile.col}`}
                    type="button"
                    onClick={() => toggleTile(tile.row, tile.col)}
                    title={`R${tile.row + 1}C${tile.col + 1} (${tile.srcW}\u00d7${tile.srcH}px)${tile.rotation ? ` \u21bb${tile.rotation}\u00b0` : ''}`}
                    style={{ aspectRatio: String(paperAspectRatio) }}
                    className={`rounded overflow-hidden border-2 transition-colors bg-bg-tertiary relative max-md:w-14 max-md:h-14 max-md:shrink-0 max-md:aspect-auto ${
                      mode === 'custom' &&
                      selectedTile?.row === tile.row &&
                      selectedTile?.col === tile.col
                        ? 'border-blue-500 ring-1 ring-blue-500/30'
                        : tile.selected
                          ? 'border-primary-500 ring-1 ring-primary-500/30'
                          : 'border-transparent hover:border-border-primary'
                    }`}
                  >
                    {!tile.selected ? (
                      <div
                        className="absolute bg-black"
                        style={{
                          top: imageClip.top,
                          left: imageClip.left,
                          width: imageClip.width,
                          height: imageClip.height,
                        }}
                      />
                    ) : tile.previewUrl ? (
                      <img
                        src={tile.previewUrl}
                        alt={`R${tile.row + 1}C${tile.col + 1}`}
                        className="absolute"
                        style={{
                          top: imageClip.top,
                          left: imageClip.left,
                          width: imageClip.width,
                          height: imageClip.height,
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        className="absolute flex items-center justify-center text-[10px] text-text-disabled"
                        style={{
                          top: imageClip.top,
                          left: imageClip.left,
                          width: imageClip.width,
                          height: imageClip.height,
                        }}
                      >
                        R{tile.row + 1}C{tile.col + 1}
                      </div>
                    )}

                    {/* Margin overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        top: `${(marginTopMm / paperH) * 100}%`,
                        left: `${(marginLeftMm / paperW) * 100}%`,
                        right: `${(marginRightMm / paperW) * 100}%`,
                        bottom: `${(marginBottomMm / paperH) * 100}%`,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                      }}
                    />
                  </button>
                );
              }),
            )}
          </div>
        </div>

        {/* Fixed bottom: Export (desktop only; mobile merged into Select-all row) */}
        <div className="p-3 border-t border-border-primary max-md:hidden">
          <button
            type="button"
            onClick={onExportClick}
            disabled={selectedCount === 0}
            className="w-full flex items-center justify-center gap-2 h-9 max-md:h-7 rounded-md text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {selectedCount > 0
              ? `Export ${selectedCount} Tile${selectedCount !== 1 ? 's' : ''}`
              : 'Export Tiles'}
          </button>
        </div>
      </div>
    </div>
  );
}
