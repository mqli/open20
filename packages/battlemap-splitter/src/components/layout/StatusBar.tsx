import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';
import { useTileStore } from '@/stores/tileStore';

interface StatusBarProps {
  calibrationMode: boolean;
}

export function StatusBar({ calibrationMode }: StatusBarProps) {
  const width = useMapStore((s) => s.width);
  const height = useMapStore((s) => s.height);
  const imageUrl = useMapStore((s) => s.imageUrl);
  const cellPx = useGridStore((s) => s.cellPx);
  const tileCols = useTileStore((s) => s.tileCols);
  const tileRows = useTileStore((s) => s.tileRows);
  const calibrationFeet = useTileStore((s) => s.calibrationFeet);

  if (!imageUrl) return null;

  const mapWMM = Math.round((width / cellPx) * 25.4);
  const mapHMM = Math.round((height / cellPx) * 25.4);
  const gridSquaresW = Math.floor(width / cellPx);
  const gridSquaresH = Math.floor(height / cellPx);

  return (
    <div className="h-5 bg-bg-tertiary border-t border-border-primary flex items-center gap-3 px-3 text-[11px] text-text-disabled shrink-0 overflow-hidden whitespace-nowrap pb-safe">
      {calibrationMode && (
        <span className="text-primary-400 font-medium shrink-0">
          Calibrating: draw a 2×2 rectangle across {calibrationFeet}ft squares on the map
        </span>
      )}
      <span className="shrink-0">
        Image: {width}×{height}px
      </span>
      <span className="truncate hidden sm:inline">
        Size: {mapWMM}×{mapHMM}mm ({gridSquaresW}×{gridSquaresH} squares)
      </span>
      <span className="shrink-0 hidden sm:inline">Grid: {cellPx} DPI (1 cell = 25.4mm)</span>
      {tileCols > 0 && (
        <span className="shrink-0">
          Tiles: {tileCols}×{tileRows} = {tileCols * tileRows} pages
        </span>
      )}
    </div>
  );
}
