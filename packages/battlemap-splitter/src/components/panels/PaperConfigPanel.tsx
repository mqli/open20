import { usePaperStore } from '@/stores/paperStore';
import type { PaperPreset } from '@/types';

const PRESETS: { value: PaperPreset; label: string; dims: string }[] = [
  { value: 'A4', label: 'A4', dims: '210×297mm' },
  { value: 'LETTER', label: 'US Letter', dims: '215.9×279.4mm' },
  { value: 'A3', label: 'A3', dims: '297×420mm' },
  { value: 'TABLOID', label: 'Tabloid', dims: '279.4×431.8mm' },
];

export function PaperConfigPanel() {
  const preset = usePaperStore((s) => s.preset);
  const orientation = usePaperStore((s) => s.orientation);
  const margin = usePaperStore((s) => s.margin);
  const overlap = usePaperStore((s) => s.overlap);
  const outputDpi = usePaperStore((s) => s.outputDpi);
  const scaleLocked = usePaperStore((s) => s.scaleLocked);

  const setPreset = usePaperStore((s) => s.setPreset);
  const setOrientation = usePaperStore((s) => s.setOrientation);
  const setMargin = usePaperStore((s) => s.setMargin);
  const setOverlap = usePaperStore((s) => s.setOverlap);
  const setOutputDpi = usePaperStore((s) => s.setOutputDpi);
  const setScaleLocked = usePaperStore((s) => s.setScaleLocked);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        Paper &amp; Printing
      </h3>

      {/* Paper size */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Paper Size</label>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Select the paper you will print on. This determines how many tiles your map is split into.
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                preset === p.value
                  ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                  : 'border-border-primary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              <span className="font-medium">{p.label}</span>
              <span className="ml-1.5 text-[10px] text-text-disabled">{p.dims}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Orientation</label>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Auto picks the layout that uses the fewest pages. You can force portrait or landscape.
        </p>
        <div className="flex gap-1.5">
          {(['auto', 'portrait', 'landscape'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrientation(o)}
              className={`px-3 py-1.5 text-xs rounded-md border capitalize transition-colors ${
                orientation === o
                  ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                  : 'border-border-primary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border-primary" />

      {/* Margin */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-primary">Page Margin</label>
          <span className="text-xs font-mono text-primary-400">{margin}mm</span>
        </div>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Blank space around the edge of each page. Most printers can&apos;t print to the very edge
          (full bleed).
        </p>
        <input
          type="range"
          value={margin}
          onChange={(e) => setMargin(+e.target.value)}
          min={0}
          max={30}
          className="w-full accent-primary-600"
        />
      </div>

      {/* Overlap */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-primary">Tile Overlap</label>
          <span className="text-xs font-mono text-primary-400">{overlap}mm</span>
        </div>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Each tile includes extra content from its neighbors. Makes it easier to align and tape
          pages together.
        </p>
        <input
          type="range"
          value={overlap}
          onChange={(e) => setOverlap(+e.target.value)}
          min={0}
          max={20}
          className="w-full accent-primary-600"
        />
      </div>

      <div className="border-t border-border-primary" />

      {/* Output DPI + scale lock */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-text-primary">PDF Resolution</label>
            <p className="text-[11px] text-text-disabled">
              Output quality of the generated PDF. Higher = sharper but larger file. Does not affect
              tile sizing.
            </p>
          </div>
          <input
            type="number"
            value={outputDpi}
            onChange={(e) => setOutputDpi(+e.target.value || 150)}
            min={72}
            max={600}
            className="w-16 px-2 py-1 text-xs bg-bg-tertiary border border-border-primary rounded text-text-primary text-right"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={scaleLocked}
            onChange={(e) => setScaleLocked(e.target.checked)}
            className="accent-primary-600"
          />
          <span>
            <strong>Scale lock:</strong> 1 grid square = 25.4mm (1 inch). Uncheck to print at custom
            scale.
          </span>
        </label>
      </div>
    </div>
  );
}
