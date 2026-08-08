import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperConfigPanel } from '@/components/panels/PaperConfigPanel';
import { PaperSizePanel } from '@/components/panels/PaperSizePanel';
import { usePaperStore } from '@/stores/paperStore';
import { ChevronDown } from 'lucide-react';

type Flyout = null | 'size' | 'print';

export function Toolbar() {
  const [flyout, setFlyout] = useState<Flyout>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const preset = usePaperStore((s) => s.preset);

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

        {/* Paper size pill */}
        <FlyoutPill
          label="Size"
          value={preset}
          open={flyout === 'size'}
          onClick={() => toggleFlyout('size')}
          panel={<PaperSizePanel />}
          width={300}
        />

        {/* Print settings pill */}
        <FlyoutPill
          label="Print"
          value="Settings"
          open={flyout === 'print'}
          onClick={() => toggleFlyout('print')}
          panel={<PaperConfigPanel />}
          width={400}
        />

        {/* X (Twitter) link */}
        <a
          href="https://x.com/open20dnd"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto p-1.5 rounded-md text-text-disabled hover:text-text-secondary hover:bg-bg-tertiary transition-colors"
          title="@open20dnd"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
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
