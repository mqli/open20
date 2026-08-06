import { useCallback, useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useGridStore } from '@/stores/gridStore';
import { usePaperStore } from '@/stores/paperStore';
import { useTileStore } from '@/stores/tileStore';
import { generatePdf } from '@/engine/pdfGenerator';

interface PdfProgress {
  current: number;
  total: number;
  phase: 'generating' | 'complete' | 'error';
  error?: string;
}

export function usePdfGenerator() {
  const [progress, setProgress] = useState<PdfProgress | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const generate = useCallback(async () => {
    const map = useMapStore.getState();
    const grid = useGridStore.getState();
    const paper = usePaperStore.getState();
    const tileStore = useTileStore.getState();

    if (!map.imageUrl) {
      setProgress({ current: 0, total: 0, phase: 'error', error: 'No image loaded' });
      return;
    }

    // Collect selected non-empty tiles
    const selectedTiles = tileStore.tiles.flat().filter((t) => t.selected && !t.isEmpty);

    if (selectedTiles.length === 0) {
      setProgress({ current: 0, total: 0, phase: 'error', error: 'No tiles selected' });
      return;
    }

    setProgress({ current: 0, total: selectedTiles.length, phase: 'generating' });

    try {
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = map.imageUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for PDF generation'));
      });

      const pdfBlob = await generatePdf(
        img,
        selectedTiles,
        tileStore.tileRows,
        tileStore.tileCols,
        {
          paperW: paper.getPaperWidth(),
          paperH: paper.getPaperHeight(),
          marginLeft: paper.getMarginLeft(),
          marginRight: paper.getMarginRight(),
          marginTop: paper.getMarginTop(),
          marginBottom: paper.getMarginBottom(),
          outputDpi: paper.outputDpi,
          overlapMm: paper.overlap,
          cellPx: grid.cellPx,
          mapLabel: 'Battle Map',
          isLandscape: false, // TODO: get from tile grid orientation
          includeGuide: true,
          onProgress: (current, total) => {
            setProgress({ current, total, phase: 'generating' });
          },
        },
      );

      setBlob(pdfBlob);
      setProgress({
        current: selectedTiles.length,
        total: selectedTiles.length,
        phase: 'complete',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF generation failed';
      // Check for OOM
      if (message.includes('memory') || message.includes('allocation')) {
        setProgress({
          current: 0,
          total: selectedTiles.length,
          phase: 'error',
          error: 'Not enough memory. Try selecting fewer tiles or reducing output DPI.',
        });
      } else {
        setProgress({ current: 0, total: selectedTiles.length, phase: 'error', error: message });
      }
    }
  }, []);

  const download = useCallback(() => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'battlemap-tiles.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [blob]);

  const reset = useCallback(() => {
    setBlob(null);
    setProgress(null);
  }, []);

  return { progress, blob, generate, download, reset };
}
