import { useTileStore } from '@/stores/tileStore';
import { usePaperStore } from '@/stores/paperStore';
import type { PaperPreset } from '@/types';
import { Upload, Download, CheckSquare, Square } from 'lucide-react';

const PAPER_DIMS: Record<Exclude<PaperPreset, 'CUSTOM'>, { w: number; h: number }> = {
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

function getPaperDims(
  preset: PaperPreset,
  customW: number,
  customH: number,
  orientation: 'portrait' | 'landscape',
): { w: number; h: number } {
  const dims = preset === 'CUSTOM' ? { w: customW, h: customH } : PAPER_DIMS[preset];
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
  const toggleTile = useTileStore((s) => s.toggleTile);
  const selectAll = useTileStore((s) => s.selectAll);
  const selectNone = useTileStore((s) => s.selectNone);

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
      <div className="absolute top-4 left-4 z-10">
        <div className="w-72 bg-bg-secondary border border-border-primary rounded-lg shadow-lg p-4">
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
            className="w-full flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/20 transition-colors"
          >
            <Upload size={16} />
            Upload Map Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 bottom-4 z-10">
      <div className="w-72 bg-bg-secondary border border-border-primary rounded-lg shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-border-primary flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Tiles
          </h3>
          <button
            type="button"
            onClick={onUploadClick}
            className="flex items-center gap-1 py-1 px-2 rounded text-[10px] border border-primary-500/25 text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
          >
            <Upload size={12} />
            Change
          </button>
        </div>

        {/* Select all + tile count */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <button
            type="button"
            onClick={allSelected ? selectNone : selectAll}
            className="flex items-center justify-center gap-1 py-1 px-2 rounded text-[10px] border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            {allSelected ? <Square size={12} /> : <CheckSquare size={12} />}
            {allSelected ? 'None' : 'All'}
          </button>
          <span className="text-xs text-text-secondary tabular-nums">
            {selectedCount > 0
              ? `${selectedCount} of ${totalCount} selected`
              : `${totalCount} tiles`}
          </span>
        </div>

        {/* Tile thumbnails */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${tileCols}, 1fr)`,
            }}
          >
            {tiles.map((row) =>
              row.map((tile) => {
                // Position the tile image within the paper-sized thumbnail
                const imageTop = (tile.row * tile.srcH) / paperH;
                const imageLeft = (tile.col * tile.srcW) / paperW;
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
                    title={`R${tile.row + 1}C${tile.col + 1} (${tile.srcW}\u00d7${tile.srcH}px)`}
                    style={{ aspectRatio: String(paperAspectRatio) }}
                    className={`rounded overflow-hidden border-2 transition-colors bg-bg-tertiary relative ${
                      tile.selected
                        ? 'border-primary-500 ring-1 ring-primary-500/30'
                        : 'border-transparent hover:border-border-primary'
                    }`}
                  >
                    {tile.previewUrl ? (
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

        {/* Fixed bottom: Export */}
        <div className="p-3 border-t border-border-primary">
          <button
            type="button"
            onClick={onExportClick}
            disabled={selectedCount === 0}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
