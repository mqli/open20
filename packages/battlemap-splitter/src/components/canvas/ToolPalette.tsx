import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';
import { ZoomIn, ZoomOut, Maximize, Grid3x3, LayoutGrid } from 'lucide-react';

export function ToolPalette() {
  const zoom = useMapStore((s) => s.zoom);
  const setZoom = useMapStore((s) => s.setZoom);
  const setPan = useMapStore((s) => s.setPan);
  const imageW = useMapStore((s) => s.width);
  const imageH = useMapStore((s) => s.height);

  const gridVisible = useGridStore((s) => s.visible);
  const toggleGrid = useGridStore((s) => s.toggleVisibility);
  const tileOverlayVisible = useGridStore((s) => s.tileOverlayVisible);
  const toggleTileOverlay = useGridStore((s) => s.toggleTileOverlay);

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);

  const handleFitToScreen = () => {
    if (!imageW) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const fit = Math.min(rect.width / imageW, rect.height / imageH) * 0.9;
    setZoom(Math.max(0.1, Math.min(5, fit)));
    setPan(0, 0);
  };

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-0.5 bg-bg-secondary rounded-lg shadow-lg p-1 border border-border-primary">
      <ToolButton title="Zoom in" onClick={handleZoomIn}>
        <ZoomIn size={16} />
      </ToolButton>
      <ToolButton title="Zoom out" onClick={handleZoomOut}>
        <ZoomOut size={16} />
      </ToolButton>
      <ToolButton title="Fit to screen" onClick={handleFitToScreen}>
        <Maximize size={16} />
      </ToolButton>
      <div className="mx-1 border-t border-border-primary" />
      <ToolButton
        title="Toggle calibration grid overlay on the map"
        active={gridVisible}
        onClick={toggleGrid}
      >
        <Grid3x3 size={16} />
      </ToolButton>
      <ToolButton
        title="Toggle tile split overlay on the map"
        active={tileOverlayVisible}
        onClick={toggleTileOverlay}
      >
        <LayoutGrid size={16} />
      </ToolButton>
      <div className="flex items-center justify-center h-7 text-xs text-text-secondary tabular-nums">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

function ToolButton({
  children,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
        active !== false ? 'text-text-primary hover:bg-bg-tertiary' : 'text-text-disabled'
      }`}
    >
      {children}
    </button>
  );
}
