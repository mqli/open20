import { usePaperStore } from '@/stores/paperStore';
import type { PaperPreset } from '@/types';

const PRESETS: { value: PaperPreset; label: string; dims: string }[] = [
  { value: 'A4', label: 'A4', dims: '210×297mm' },
  { value: 'A3', label: 'A3', dims: '297×420mm' },
  { value: 'A2', label: 'A2', dims: '420×594mm' },
  { value: 'A1', label: 'A1', dims: '594×841mm' },
  { value: 'LETTER', label: 'US Letter', dims: '215.9×279.4mm' },
  { value: 'LEGAL', label: 'US Legal', dims: '215.9×355.6mm' },
  { value: 'TABLOID', label: 'Tabloid (11×17)', dims: '279.4×431.8mm' },
  { value: 'B4', label: 'B4 (JIS)', dims: '257×364mm' },
  { value: 'B5', label: 'B5 (JIS)', dims: '182×257mm' },
  { value: 'CUSTOM', label: 'Custom', dims: '' },
];

export function PaperSizePanel() {
  const preset = usePaperStore((s) => s.preset);
  const customW = usePaperStore((s) => s.customW);
  const customH = usePaperStore((s) => s.customH);
  const setPreset = usePaperStore((s) => s.setPreset);
  const setCustomDimensions = usePaperStore((s) => s.setCustomDimensions);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        Paper Size
      </h3>

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

      {preset === 'CUSTOM' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-text-disabled">Width (mm)</label>
            <input
              type="number"
              value={customW}
              onChange={(e) => setCustomDimensions(+e.target.value || 210, customH)}
              min={50}
              max={5000}
              className="w-full mt-1 px-2 py-1.5 text-xs bg-bg-tertiary border border-border-primary rounded text-text-primary"
            />
          </div>
          <span className="mt-5 text-text-disabled text-sm">x</span>
          <div className="flex-1">
            <label className="text-xs text-text-disabled">Height (mm)</label>
            <input
              type="number"
              value={customH}
              onChange={(e) => setCustomDimensions(customW, +e.target.value || 297)}
              min={50}
              max={5000}
              className="w-full mt-1 px-2 py-1.5 text-xs bg-bg-tertiary border border-border-primary rounded text-text-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
