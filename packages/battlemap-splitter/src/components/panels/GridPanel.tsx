import { useGridStore } from '@/stores/gridStore';
import { useMapStore } from '@/stores/mapStore';
import { Ruler, Grid3x3, X, Eye, EyeOff, MousePointer2, Sparkles, Minus, Plus } from 'lucide-react';
import type { CalibrateMode } from '@/types';

interface GridPanelProps {
  calibrationMode: boolean;
  calibrateMode: CalibrateMode;
  onToggleCalibration: () => void;
  onSetCalibrateMode: (mode: CalibrateMode) => void;
}

const COLORS = [
  { value: 'rgba(239, 68, 68, 0.8)', label: 'Red' },
  { value: 'rgba(59, 130, 246, 0.8)', label: 'Blue' },
  { value: 'rgba(255, 255, 255, 0.8)', label: 'White' },
  { value: 'rgba(250, 204, 21, 0.8)', label: 'Yellow' },
] as const;

export function GridPanel({
  calibrationMode,
  calibrateMode,
  onToggleCalibration,
  onSetCalibrateMode,
}: GridPanelProps) {
  const imageUrl = useMapStore((s) => s.imageUrl);
  const mapWidth = useMapStore((s) => s.width);
  const mapHeight = useMapStore((s) => s.height);

  const cellPx = useGridStore((s) => s.cellPx);
  const gridVisible = useGridStore((s) => s.visible);
  const color = useGridStore((s) => s.color);
  const opacity = useGridStore((s) => s.opacity);
  const toggleGrid = useGridStore((s) => s.toggleVisibility);
  const setColor = useGridStore((s) => s.setColor);
  const setOpacity = useGridStore((s) => s.setOpacity);
  const adjustCellPx = useGridStore((s) => s.adjustCellPx);

  const squaresW = cellPx > 0 ? Math.floor(mapWidth / cellPx) : 0;
  const squaresH = cellPx > 0 ? Math.floor(mapHeight / cellPx) : 0;

  // Don't show panel if no image loaded
  if (!imageUrl) return null;

  return (
    <div className="absolute top-4 left-[316px] z-20">
      <div className="w-72 bg-bg-secondary border border-border-primary rounded-lg shadow-lg p-3.5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Grid Calibration
          </h3>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => adjustCellPx(-1)}
              className="w-5 h-5 flex items-center justify-center rounded text-text-disabled hover:bg-bg-tertiary hover:text-text-secondary transition-colors"
              title="Decrease DPI"
            >
              <Minus size={12} />
            </button>
            <span className="text-xs font-mono text-primary-400 tabular-nums w-10 text-center">
              {cellPx}
            </span>
            <button
              type="button"
              onClick={() => adjustCellPx(1)}
              className="w-5 h-5 flex items-center justify-center rounded text-text-disabled hover:bg-bg-tertiary hover:text-text-secondary transition-colors"
              title="Increase DPI"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Calibrate button */}
        <button
          type="button"
          onClick={onToggleCalibration}
          className={`w-full flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium transition-colors ${
            calibrationMode
              ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
              : 'bg-primary-500/10 text-primary-400 border border-primary-500/25 hover:bg-primary-500/20'
          }`}
        >
          {calibrationMode ? (
            <>
              <X size={16} />
              Cancel
            </>
          ) : (
            <>
              <Ruler size={16} />
              Calibrate Grid
            </>
          )}
        </button>

        {/* Calibrate mode selector (always visible) */}
        <div className="flex rounded-md border border-border-primary overflow-hidden h-8">
          <button
            type="button"
            onClick={() => onSetCalibrateMode('smart')}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              calibrateMode === 'smart'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-text-disabled hover:bg-bg-tertiary'
            }`}
            title="Auto-detect grid from rough selection"
          >
            <Sparkles size={12} />
            Smart
          </button>
          <button
            type="button"
            onClick={() => onSetCalibrateMode('manual')}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-medium transition-colors border-l border-border-primary ${
              calibrateMode === 'manual'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-text-disabled hover:bg-bg-tertiary'
            }`}
            title="Manually draw precise 2×2 rectangle"
          >
            <MousePointer2 size={12} />
            Manual
          </button>
        </div>

        {/* Grid overlay toggle */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-disabled leading-snug">Overlay</p>
          <button
            type="button"
            onClick={toggleGrid}
            className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] transition-colors w-full ${
              gridVisible
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'border border-border-primary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            <Grid3x3 size={12} />
            Grid
            {gridVisible ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
        </div>

        {/* Color + Opacity */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-text-disabled leading-snug">
            Grid {squaresW}&times;{squaresH} squares
          </p>
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                title={c.label}
                className={`w-5 h-5 rounded-full border-2 transition-transform shrink-0 ${
                  color === c.value
                    ? 'border-primary-400 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.value.replace(/[\d.]+\)$/, '1)') }}
              />
            ))}
            <span className="text-[10px] text-text-disabled shrink-0 leading-none">Opacity</span>
            <input
              type="range"
              value={opacity}
              onChange={(e) => setOpacity(+e.target.value)}
              min={0.1}
              max={1}
              step={0.05}
              title={`Grid opacity: ${Math.round(opacity * 100)}%`}
              className="flex-1 accent-primary-600 h-3 min-w-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
