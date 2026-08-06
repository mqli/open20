import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperConfigPanel } from '@/components/panels/PaperConfigPanel';
import { GridConfigPanel } from '@/components/panels/GridConfigPanel';
import { usePaperStore } from '@/stores/paperStore';
import { useGridStore } from '@/stores/gridStore';
import { Upload, Download, ChevronDown } from 'lucide-react';

type Flyout = null | 'paper' | 'grid';

interface ToolbarProps {
  onUploadClick?: () => void;
  onExportClick?: () => void;
}

export function Toolbar({ onUploadClick, onExportClick }: ToolbarProps) {
  const [flyout, setFlyout] = useState<Flyout>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const preset = usePaperStore((s) => s.preset);
  const cellPx = useGridStore((s) => s.cellPx);

  const closeFlyout = useCallback(() => setFlyout(null), []);

  // Close on Escape
  useEffect(() => {
    if (!flyout) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFlyout();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flyout, closeFlyout]);

  // Close when clicking outside
  useEffect(() => {
    if (!flyout) return;
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        closeFlyout();
      }
    };
    // Delay to avoid the click that opened it immediately closing it
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [flyout, closeFlyout]);

  const toggleFlyout = (name: Flyout) => {
    setFlyout(flyout === name ? null : name);
  };

  return (
    <div
      ref={toolbarRef}
      className="relative bg-bg-secondary border-b border-border-primary shrink-0"
    >
      {/* Header bar */}
      <div className="h-10 flex items-center gap-2 px-3">
        <span className="text-sm font-semibold text-text-primary shrink-0 select-none mr-1">
          Battlemap Splitter
        </span>

        {/* Paper pill */}
        <FlyoutPill
          label="Paper"
          value={preset}
          open={flyout === 'paper'}
          onClick={() => toggleFlyout('paper')}
          panel={<PaperConfigPanel />}
          width={360}
        />

        {/* Grid pill */}
        <FlyoutPill
          label="Grid"
          value={`${cellPx}px`}
          open={flyout === 'grid'}
          onClick={() => toggleFlyout('grid')}
          panel={<GridConfigPanel />}
          width={320}
        />

        <div className="flex-1" />

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <Upload size={13} /> Upload
        </button>

        <button
          onClick={onExportClick}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-500 transition-colors"
        >
          <Download size={13} /> PDF
        </button>
      </div>
    </div>
  );
}

function FlyoutPill({
  label,
  value,
  open,
  onClick,
  panel,
  width = 280,
}: {
  label: string;
  value: string;
  open: boolean;
  onClick: () => void;
  panel: React.ReactNode;
  width?: number;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
          open
            ? 'border-primary-500 bg-primary-500/15 text-primary-400'
            : 'border-border-primary text-text-secondary hover:bg-bg-tertiary'
        }`}
      >
        <span className="text-text-disabled">{label}:</span>
        <span className="font-mono">{value}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50" style={{ width }}>
          <div
            className="bg-bg-secondary border border-border-primary rounded-xl shadow-2xl p-4 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}
