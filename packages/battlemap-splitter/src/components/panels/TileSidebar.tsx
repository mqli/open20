import { useTileStore } from '@/stores/tileStore';

export function TileSidebar() {
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
      <div className="w-72 bg-bg-secondary border-l border-border-primary p-4">
        <div className="text-xs text-text-disabled text-center mt-8">Upload a map to see tiles</div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-bg-secondary border-l border-border-primary flex flex-col">
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
        </div>
      </div>

      {/* Tile list with previews */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {tiles.map((row) =>
          row.map((tile) => {
            if (tile.isEmpty) return null;

            const aspectRatio = tile.srcW / tile.srcH;

            return (
              <label
                key={`${tile.row}-${tile.col}`}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  tile.selected
                    ? 'bg-primary-600/20 text-text-primary ring-1 ring-primary-500/30'
                    : 'text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={tile.selected}
                  onChange={() => toggleTile(tile.row, tile.col)}
                  className="accent-primary-600 shrink-0"
                />

                {/* Thumbnail preview */}
                <div
                  className="shrink-0 rounded overflow-hidden border border-border-primary bg-bg-tertiary"
                  style={{ width: 48, height: 48 }}
                >
                  {tile.previewUrl ? (
                    <img
                      src={tile.previewUrl}
                      alt={`R${tile.row + 1}C${tile.col + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-text-disabled">
                      {Math.round(aspectRatio * 10) / 10}
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    R{tile.row + 1}C{tile.col + 1}
                  </div>
                  <div className="text-[10px] text-text-disabled tabular-nums">
                    {tile.srcW}×{tile.srcH}px
                  </div>
                </div>
              </label>
            );
          }),
        )}
      </div>
    </div>
  );
}
