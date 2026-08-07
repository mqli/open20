import { usePaperStore } from '@/stores/paperStore';

export function PaperConfigPanel() {
  const orientation = usePaperStore((s) => s.orientation);
  const margin = usePaperStore((s) => s.margin);
  const overlap = usePaperStore((s) => s.overlap);
  const outputDpi = usePaperStore((s) => s.outputDpi);
  const scaleLocked = usePaperStore((s) => s.scaleLocked);

  const setOrientation = usePaperStore((s) => s.setOrientation);
  const setMargin = usePaperStore((s) => s.setMargin);
  const setOverlap = usePaperStore((s) => s.setOverlap);
  const setOutputDpi = usePaperStore((s) => s.setOutputDpi);
  const setScaleLocked = usePaperStore((s) => s.setScaleLocked);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        Print Settings
      </h3>

      {/* Orientation */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Orientation</label>
        <p className="text-[11px] text-text-disabled leading-relaxed">
          Portrait prints pages in portrait layout; landscape uses a wider layout. The best
          orientation is picked automatically when you upload a map.
        </p>
        <div className="flex gap-1.5">
          {(['portrait', 'landscape'] as const).map((o) => (
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
