import { usePaperStore } from '@/stores/paperStore';
import { useGridStore } from '@/stores/gridStore';
import type { PaperPreset } from '@/types';
import { X } from 'lucide-react';

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const preset = usePaperStore((s) => s.preset);
  const outputDpi = usePaperStore((s) => s.outputDpi);
  const cellPx = useGridStore((s) => s.cellPx);

  const setPreset = usePaperStore((s) => s.setPreset);
  const setOutputDpi = usePaperStore((s) => s.setOutputDpi);
  const setCellPx = useGridStore((s) => s.setCellPx);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary rounded-xl shadow-2xl border border-border-primary w-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <h2 className="text-base font-semibold text-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-tertiary text-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Default paper size */}
          <div>
            <label className="text-xs text-text-secondary">Default Paper Size</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as PaperPreset)}
              className="w-full mt-1 px-2 py-1.5 text-sm bg-bg-tertiary border border-border-primary rounded text-text-primary"
            >
              <option value="A4">A4</option>
              <option value="LETTER">US Letter</option>
              <option value="A3">A3</option>
              <option value="TABLOID">Tabloid</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {/* Default output DPI */}
          <div>
            <label className="text-xs text-text-secondary">Default Output DPI: {outputDpi}</label>
            <input
              type="range"
              value={outputDpi}
              onChange={(e) => setOutputDpi(Number(e.target.value))}
              min={72}
              max={600}
              step={1}
              className="w-full mt-1 accent-primary-600"
            />
          </div>

          {/* Default grid DPI */}
          <div>
            <label className="text-xs text-text-secondary">Default Grid DPI: {cellPx}</label>
            <input
              type="range"
              value={cellPx}
              onChange={(e) => setCellPx(Number(e.target.value))}
              min={20}
              max={200}
              step={1}
              className="w-full mt-1 accent-primary-600"
            />
          </div>

          {/* Session info */}
          <div className="pt-2 border-t border-border-primary">
            <p className="text-xs text-text-disabled">
              Paper and grid settings are saved automatically to your browser.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
