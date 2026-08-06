import { useState } from 'react';
import { useGridStore } from '@/stores/gridStore';
import { showToast } from '@/utils/toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const COLORS = [
  { label: 'Red', value: 'rgba(255, 0, 0, 0.8)' },
  { label: 'Blue', value: 'rgba(0, 100, 255, 0.8)' },
  { label: 'White', value: 'rgba(255, 255, 255, 0.8)' },
  { label: 'Yellow', value: 'rgba(255, 255, 0, 0.8)' },
];

export function GridConfigPanel() {
  const cellPx = useGridStore((s) => s.cellPx);
  const visible = useGridStore((s) => s.visible);
  const color = useGridStore((s) => s.color);
  const opacity = useGridStore((s) => s.opacity);
  const setCellPx = useGridStore((s) => s.setCellPx);
  const toggleVisibility = useGridStore((s) => s.toggleVisibility);
  const setColor = useGridStore((s) => s.setColor);
  const setOpacity = useGridStore((s) => s.setOpacity);
  const autoDetect = useGridStore((s) => s.autoDetect);
  const [detecting, setDetecting] = useState(false);

  const handleAutoDetect = async () => {
    setDetecting(true);
    try {
      const ok = await autoDetect();
      showToast(
        ok ? 'Grid auto-detected' : 'Could not detect grid — try manual calibration',
        ok ? 'success' : 'error',
      );
    } finally {
      setDetecting(false);
    }
  };

  // Scale reference is constant — content area (194×269mm) divided by cell size (25.4mm)
  // gives ~7.6 × 10.6 squares per A4 page regardless of source DPI.

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

        <button
          onClick={handleAutoDetect}
          disabled={detecting}
          className="w-full text-xs py-1.5 rounded-md border border-border-primary text-text-secondary hover:bg-bg-tertiary disabled:opacity-50 transition-colors"
        >
          {detecting ? <Loader2 size={12} className="animate-spin inline mr-1.5" /> : null}
          Auto-Detect Grid
        </button>
      </div>

      <div className="border-t border-border-primary" />

      {/* Scale reference */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-primary">Scale Reference</label>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          At this DPI, one A4 page contains approximately{' '}
          <strong className="text-text-secondary">7.6 × 10.6</strong> grid squares (194×269mm
          content area).
        </p>
      </div>

      <div className="border-t border-border-primary" />

      {/* Visibility */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-medium text-text-primary">Grid Overlay</label>
          <p className="text-[11px] text-text-disabled">
            Show/hide the calibration grid on the map
          </p>
        </div>
        <button
          onClick={toggleVisibility}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            visible
              ? 'border-primary-500 bg-primary-500/15 text-primary-400'
              : 'border-border-primary text-text-secondary'
          }`}
        >
          {visible ? <Eye size={12} /> : <EyeOff size={12} />}
          {visible ? 'Visible' : 'Hidden'}
        </button>
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
