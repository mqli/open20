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
      <div className="w-64 bg-bg-secondary border-l border-border-primary p-4">
        <div className="text-xs text-text-disabled text-center mt-8">Upload a map to see tiles</div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-bg-secondary border-l border-border-primary flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border-primary">
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

      {/* Tile list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tiles.map((row) =>
          row.map(
            (tile) =>
              !tile.isEmpty && (
                <label
                  key={`${tile.row}-${tile.col}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                    tile.selected
                      ? 'bg-primary-600/20 text-text-primary'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={tile.selected}
                    onChange={() => toggleTile(tile.row, tile.col)}
                    className="accent-primary-600"
                  />
                  <span className="flex-1">
                    R{tile.row + 1}C{tile.col + 1}
                  </span>
                  <span className="text-text-disabled tabular-nums">
                    {tile.srcW}×{tile.srcH}px
                  </span>
                </label>
              ),
          ),
        )}
      </div>
    </div>
  );
}
