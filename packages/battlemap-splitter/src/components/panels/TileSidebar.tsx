import { Upload, Download } from 'lucide-react';
import { useTileStore } from '@/stores/tileStore';

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

              return (
                <button
                  key={`${tile.row}-${tile.col}`}
                  type="button"
                  onClick={() => toggleTile(tile.row, tile.col)}
                  title={`R${tile.row + 1}C${tile.col + 1} (${tile.srcW}\u00d7${tile.srcH}px)`}
                  className={`aspect-square rounded overflow-hidden border-2 transition-colors bg-bg-tertiary ${
                    tile.selected
                      ? 'border-primary-500 ring-1 ring-primary-500/30'
                      : 'border-transparent hover:border-border-primary'
                  }`}
                >
                  {tile.previewUrl ? (
                    <img
                      src={tile.previewUrl}
                      alt={`R${tile.row + 1}C${tile.col + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-text-disabled">
                      R{tile.row + 1}C{tile.col + 1}
                    </div>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
