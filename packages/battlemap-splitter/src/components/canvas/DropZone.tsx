import { useCallback, useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useTileStore } from '@/stores/tileStore';
import { useGridStore } from '@/stores/gridStore';
import { usePaperStore } from '@/stores/paperStore';
import { evaluateBestOrientation } from '@/engine/tiling';
import { Upload, Loader2 } from 'lucide-react';

const ACCEPTED_TYPES = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

export function DropZone() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadImage = useMapStore((s) => s.loadImageFromFile);

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        await loadImage(file);
        // Evaluate best orientation and auto-detect grid
        const mapState = useMapStore.getState();
        const paperState = usePaperStore.getState();
        const gridState = useGridStore.getState();
        const best = evaluateBestOrientation(mapState.width, mapState.height, gridState.cellPx, {
          widthMm: paperState.getPaperWidth(),
          heightMm: paperState.getPaperHeight(),
          marginLeft: paperState.getMarginLeft(),
          marginRight: paperState.getMarginRight(),
          marginTop: paperState.getMarginTop(),
          marginBottom: paperState.getMarginBottom(),
          overlapMm: paperState.overlap,
        });
        paperState.setOrientation(best);
        gridState.autoDetect().catch(() => {
          // Grid detection may fail silently (cross-origin images, etc.)
        });
        setTimeout(() => useTileStore.getState().recalculate(), 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setLoading(false);
      }
    },
    [loadImage],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-none transition-colors ${
          dragging
            ? 'border-primary-400 bg-primary-400/10'
            : 'border-bg-tertiary hover:border-text-disabled'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-text-secondary" />
            <span className="text-sm text-text-secondary">Loading map...</span>
          </div>
        ) : (
          <>
            <Upload size={40} className="text-text-disabled" />
            <div className="text-center space-y-1">
              <p className="text-sm text-text-primary font-medium">Drop your battle map here</p>
              <p className="text-xs text-text-disabled">
                PNG, JPG, WebP, AVIF — or click to browse
              </p>
            </div>
            <label className="text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:bg-bg-tertiary cursor-pointer transition-colors">
              Browse files
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={onFileChange}
                className="hidden"
              />
            </label>
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-md">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
