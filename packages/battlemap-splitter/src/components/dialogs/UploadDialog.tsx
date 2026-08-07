import { useState, useRef, useCallback, useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useTileStore } from '@/stores/tileStore';
import { useGridStore } from '@/stores/gridStore';
import { usePaperStore } from '@/stores/paperStore';
import { evaluateBestOrientation } from '@/engine/tiling';
import { useDragDrop } from '@/hooks/useDragDrop';
import { Upload, Link, Clipboard, Loader2, X } from 'lucide-react';

const ACCEPTED_TYPES = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

interface UploadDialogProps {
  onClose: () => void;
}

export function UploadDialog({ onClose }: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState('');

  const loadImageFromFile = useMapStore((s) => s.loadImageFromFile);
  const loadImageFromUrl = useMapStore((s) => s.loadImageFromUrl);

  /** Evaluate and set the best orientation for the loaded map dimensions. */
  const evaluateOrientation = useCallback((imageW: number, imageH: number) => {
    const paperState = usePaperStore.getState();
    const gridState = useGridStore.getState();
    const best = evaluateBestOrientation(imageW, imageH, gridState.cellPx, {
      widthMm: paperState.getPaperWidth(),
      heightMm: paperState.getPaperHeight(),
      marginLeft: paperState.getMarginLeft(),
      marginRight: paperState.getMarginRight(),
      marginTop: paperState.getMarginTop(),
      marginBottom: paperState.getMarginBottom(),
      overlapMm: paperState.overlap,
    });
    paperState.setOrientation(best);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        await loadImageFromFile(file);
        // Evaluate best orientation and auto-detect grid
        const mapState = useMapStore.getState();
        evaluateOrientation(mapState.width, mapState.height);
        useGridStore
          .getState()
          .autoDetect()
          .catch(() => {
            // Grid detection may fail silently (cross-origin images, etc.)
          });
        // Trigger tile recalculation on successful load
        setTimeout(() => useTileStore.getState().recalculate(), 100);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        setLoading(false);
      }
    },
    [loadImageFromFile, evaluateOrientation, onClose],
  );

  const { dragBindings, isDragging } = useDragDrop({
    onFileDrop: handleFileSelect,
    accept: ACCEPTED_TYPES,
  });

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleUrlSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!urlValue.trim()) return;

      setLoading(true);
      setError(null);
      try {
        await loadImageFromUrl(urlValue.trim());
        // Evaluate best orientation and auto-detect grid
        const mapState = useMapStore.getState();
        evaluateOrientation(mapState.width, mapState.height);
        useGridStore
          .getState()
          .autoDetect()
          .catch(() => {
            // Grid detection may fail silently (cross-origin images, etc.)
          });
        setTimeout(() => useTileStore.getState().recalculate(), 100);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image from URL');
      } finally {
        setLoading(false);
      }
    },
    [urlValue, loadImageFromUrl, evaluateOrientation, onClose],
  );

  // Auto-focus URL input when switching tabs
  useEffect(() => {
    if (activeTab === 'url' && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [activeTab]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary rounded-xl shadow-2xl border border-border-primary w-[480px] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <h2 className="text-base font-semibold text-text-primary">Upload Battle Map</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-tertiary text-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-primary">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors ${
              activeTab === 'file'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Upload size={16} />
            File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors ${
              activeTab === 'url'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Link size={16} />
            URL
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {activeTab === 'file' ? (
            <div
              {...dragBindings}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary-400 bg-primary-400/10'
                  : 'border-border-primary hover:border-text-disabled'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin text-text-secondary" />
                  <span className="text-sm text-text-secondary">Loading image...</span>
                </div>
              ) : (
                <>
                  <Upload size={36} className="mx-auto mb-3 text-text-disabled" />
                  <p className="text-sm text-text-primary mb-1">Drag & drop your battle map here</p>
                  <p className="text-xs text-text-disabled">
                    PNG, JPG, WebP, AVIF — or click to browse
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary">Image URL</label>
                <input
                  ref={urlInputRef}
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com/map.png"
                  className="w-full mt-1 px-3 py-2 text-sm bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-500"
                />
              </div>
              <p className="text-xs text-text-disabled flex items-start gap-2">
                <Clipboard size={14} className="mt-0.5 shrink-0" />
                Remote images are fetched through a CORS proxy to enable grid auto-detection and
                tile extraction. If the proxy is unavailable, manual calibration will still work.
              </p>
              <button
                type="submit"
                disabled={!urlValue.trim() || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Link size={16} />
                    Load from URL
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
