import { Upload, Download } from 'lucide-react';
import { useTileStore } from '@/stores/tileStore';
import { useGridStore } from '@/stores/gridStore';
import { usePaperStore } from '@/stores/paperStore';
import type { PaperPreset } from '@/types';

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
  onUploadClick?: () => void;
  onExportClick?: () => void;
}

export function TileSidebar({ onUploadClick, onExportClick }: TileSidebarProps) {
  const tiles = useTileStore((s) => s.tiles);
  const tileCols = useTileStore((s) => s.tileCols);
  const tileRows = useTileStore((s) => s.tileRows);
  const toggleTile = useTileStore((s) => s.toggleTile);
  const selectAll = useTileStore((s) => s.selectAll);
  const selectNone = useTileStore((s) => s.selectNone);

  // Paper/margin specs for printable-area overlay
  const cellPx = useGridStore((s) => s.cellPx);
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

  if (tiles.length === 0) {
    return (
      <div className="absolute top-4 left-4 w-64 bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-4 flex flex-col items-center gap-3">
        <div className="text-xs text-text-disabled text-center">Upload a map to see tiles</div>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <Upload size={13} /> Upload
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 bottom-4 w-72 bg-bg-secondary rounded-lg shadow-lg border border-border-primary flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border-primary shrink-0">
        <h3 className="text-sm font-semibold text-text-primary">Tiles</h3>
        <div className="text-xs text-text-secondary mt-1">
          {selectedCount} of {totalCount} selected ({tileCols}×{tileRows})
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={selectAll}
            className="flex-1 text-xs px-2 py-1 rounded border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            All
          </button>
          <button
            onClick={selectNone}
            className="flex-1 text-xs px-2 py-1 rounded border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            None
          </button>
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
            title="Upload map"
          >
            <Upload size={12} />
          </button>
          <button
            onClick={onExportClick}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary-600 text-white hover:bg-primary-500 transition-colors"
            title="Export PDF"
          >
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Tile grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {tiles.map((row) =>
            row.map((tile) => {
              if (tile.isEmpty) return null;

              // Printable area on paper (mm) — matches PDF generator (includes label reservation)
              const availW = paperW - marginLeftMm - marginRightMm;
              const availH = paperH - marginTopMm - marginBottomMm;

              // Tile image size on paper (mm) — converted from source pixels
              const sliceW = (tile.srcW / cellPx) * 25.4;
              const sliceH = (tile.srcH / cellPx) * 25.4;

              // Centering gap within printable area
              const gapX = Math.max(0, (availW - sliceW) / 2);
              const gapY = Math.max(0, (availH - sliceH) / 2);

              // Image position relative to paper edges (mm)
              const imageLeft = marginLeftMm + gapX;
              const imageTop = marginTopMm + gapY;

              // Image inset as % of paper
              const imageStyle = {
                left: `${(imageLeft / paperW) * 100}%`,
                top: `${(imageTop / paperH) * 100}%`,
                right: `${(imageLeft / paperW) * 100}%`,
                bottom: `${(imageTop / paperH) * 100}%`,
              };

              // Margin overlay (printable area boundary only)
              const marginStyle = {
                top: `${(marginTopMm / paperH) * 100}%`,
                left: `${(marginLeftMm / paperW) * 100}%`,
                right: `${(marginRightMm / paperW) * 100}%`,
                bottom: `${(marginBottomMm / paperH) * 100}%`,
              };

              // Handle right/bottom insets for the image correctly
              const imageClip = {
                top: imageStyle.top,
                left: imageStyle.left,
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
                  {/* Tile image positioned on the paper */}
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

                  {/* Margin overlay — darkens non-printable paper edges */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      ...marginStyle,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                    }}
                  />
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
