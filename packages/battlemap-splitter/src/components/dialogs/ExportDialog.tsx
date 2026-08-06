import { useEffect } from 'react';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { useTileStore } from '@/stores/tileStore';
import { Loader2, CheckCircle2, AlertCircle, Download, X } from 'lucide-react';

interface ExportDialogProps {
  onClose: () => void;
}

export function ExportDialog({ onClose }: ExportDialogProps) {
  const { progress, generate, download, reset } = usePdfGenerator();

  const selectedCount = useTileStore(
    (s) => s.tiles.flat().filter((t) => t.selected && !t.isEmpty).length,
  );

  // Start generation on mount
  useEffect(() => {
    generate();
  }, [generate]);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!progress) return null;

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={
        progress.phase === 'complete' || progress.phase === 'error' ? handleClose : undefined
      }
    >
      <div
        className="bg-bg-secondary rounded-xl shadow-2xl border border-border-primary w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <h2 className="text-base font-semibold text-text-primary">Export PDF</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-bg-tertiary text-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-4">
          {progress.phase === 'generating' && (
            <>
              <Loader2 size={40} className="animate-spin text-primary-400" />
              <div className="text-center">
                <p className="text-sm text-text-primary mb-1">Generating PDF...</p>
                <p className="text-xs text-text-secondary">
                  Page {progress.current} of {progress.total}
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-text-disabled">{percent}%</p>
            </>
          )}

          {progress.phase === 'complete' && (
            <>
              <CheckCircle2 size={40} className="text-green-400" />
              <div className="text-center">
                <p className="text-sm text-text-primary mb-1">PDF Ready</p>
                <p className="text-xs text-text-secondary">
                  {selectedCount} tiles, {progress.total} pages generated
                </p>
              </div>
              <button
                onClick={download}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-500 transition-colors"
              >
                <Download size={16} />
                Download PDF
              </button>
            </>
          )}

          {progress.phase === 'error' && (
            <>
              <AlertCircle size={40} className="text-red-400" />
              <div className="text-center">
                <p className="text-sm text-text-primary mb-1">Export Failed</p>
                <p className="text-xs text-red-400">{progress.error}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generate}
                  className="px-4 py-2 rounded-lg border border-border-primary text-text-secondary text-sm hover:bg-bg-tertiary transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
