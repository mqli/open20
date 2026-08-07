import { useCallback } from 'react';
import { useGridStore } from '@/stores/gridStore';
import { usePaperStore } from '@/stores/paperStore';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const COLORS = [
  { label: 'Red', value: 'rgba(255, 0, 0, 0.8)' },
  { label: 'Blue', value: 'rgba(0, 100, 255, 0.8)' },
  { label: 'White', value: 'rgba(255, 255, 255, 0.8)' },
  { label: 'Yellow', value: 'rgba(255, 255, 0, 0.8)' },
];

export function GridConfigPanel() {
  const cellPx = useGridStore((s) => s.cellPx);
  const offsetX = useGridStore((s) => s.offsetX);
  const offsetY = useGridStore((s) => s.offsetY);
  const color = useGridStore((s) => s.color);
  const opacity = useGridStore((s) => s.opacity);
  const setCellPx = useGridStore((s) => s.setCellPx);
  const setOffset = useGridStore((s) => s.setOffset);
  const setColor = useGridStore((s) => s.setColor);
  const setOpacity = useGridStore((s) => s.setOpacity);

  // Paper store — for dynamic scale reference
  const margin = usePaperStore((s) => s.margin);
  const getPaperWidth = usePaperStore((s) => s.getPaperWidth);
  const getPaperHeight = usePaperStore((s) => s.getPaperHeight);
  const paperW = getPaperWidth();
  const paperH = getPaperHeight();
  const contentW = paperW - 2 * margin;
  const contentH = paperH - 2 * margin;
  const squaresW = (contentW / 25.4).toFixed(1);
  const squaresH = (contentH / 25.4).toFixed(1);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      setOffset(offsetX + dx, offsetY + dy);
    },
    [offsetX, offsetY, setOffset],
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        Grid Calibration
      </h3>

      {/* DPI control */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-primary">Grid DPI</label>
          <span className="text-xs font-mono text-primary-400">{cellPx}</span>
        </div>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Pixels per grid square on the source image. One square = 25.4mm (1 inch) on paper. Adjust
          until the overlay grid lines match the map&apos;s built-in grid.
        </p>
        <input
          type="range"
          value={cellPx}
          onChange={(e) => setCellPx(+e.target.value)}
          min={20}
          max={300}
          className="w-full accent-primary-600"
        />
        <div className="flex justify-between text-[10px] text-text-disabled">
          <span>20</span>
          <span>300</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {[70, 100, 143, 150].map((dpi) => (
            <button
              key={dpi}
              onClick={() => setCellPx(dpi)}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                Math.abs(cellPx - dpi) < 1
                  ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                  : 'border-border-primary text-text-disabled hover:bg-bg-tertiary'
              }`}
            >
              {dpi}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border-primary" />

      {/* Grid offset */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Grid Offset</label>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Nudge the grid alignment if auto-detect is slightly off.
        </p>
        <div className="flex flex-col items-center gap-0.5">
          <NudgeButton onClick={() => nudge(0, -1)} title="Up">
            <ChevronUp size={14} />
          </NudgeButton>
          <div className="flex items-center gap-0.5">
            <NudgeButton onClick={() => nudge(-1, 0)} title="Left">
              <ChevronLeft size={14} />
            </NudgeButton>
            <span className="w-16 text-center text-xs text-text-secondary tabular-nums select-none">
              {offsetX},{offsetY}
            </span>
            <NudgeButton onClick={() => nudge(1, 0)} title="Right">
              <ChevronRight size={14} />
            </NudgeButton>
          </div>
          <NudgeButton onClick={() => nudge(0, 1)} title="Down">
            <ChevronDown size={14} />
          </NudgeButton>
        </div>
      </div>

      <div className="border-t border-border-primary" />

      {/* Scale reference */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-primary">Scale Reference</label>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          At this grid size, each page contains approximately{' '}
          <strong className="text-text-secondary">
            {squaresW} × {squaresH}
          </strong>{' '}
          grid squares ({contentW.toFixed(0)}×{contentH.toFixed(0)}mm content area with {margin}mm
          margins).
        </p>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Grid Color</label>
        <p className="text-[11px] text-text-disabled">
          Choose a color that contrasts with your map
        </p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              title={c.label}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c.value ? 'border-primary-400 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value.replace(/[\d.]+\)$/, '1)') }}
            />
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">
          Opacity — {Math.round(opacity * 100)}%
        </label>
        <p className="text-[11px] text-text-disabled">Adjust grid line transparency</p>
        <input
          type="range"
          value={opacity}
          onChange={(e) => setOpacity(+e.target.value)}
          min={0.1}
          max={1}
          step={0.05}
          className="w-full accent-primary-600"
        />
      </div>
    </div>
  );
}

function NudgeButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-md border border-border-primary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
    >
      {children}
    </button>
  );
}
