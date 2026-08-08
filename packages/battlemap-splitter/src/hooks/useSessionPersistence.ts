import { useEffect } from 'react';
import { useGridStore } from '@/stores/gridStore';
import { usePaperStore } from '@/stores/paperStore';

const PERSIST_KEY = 'battlemap-splitter-config';

interface PersistedConfig {
  grid: {
    cellPx: number;
    offsetX: number;
    offsetY: number;
    color: string;
    opacity: number;
    tileOverlayVisible: boolean;
  };
  paper: {
    preset: string;
    orientation: string;
    margin: number;
    marginTop: number | null;
    marginBottom: number | null;
    marginLeft: number | null;
    marginRight: number | null;
    overlap: number;
    outputDpi: number;
    scaleLocked: boolean;
    customW: number;
    customH: number;
  };
}

export function useSessionPersistence() {
  const grid = useGridStore();
  const paper = usePaperStore();

  // Restore on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (!raw) return;

      const config: PersistedConfig = JSON.parse(raw);

      if (config.grid) {
        grid.setCellPx(config.grid.cellPx);
        grid.setOffset(config.grid.offsetX, config.grid.offsetY);
        grid.setColor(config.grid.color);
        grid.setOpacity(config.grid.opacity);
        if (config.grid.tileOverlayVisible !== undefined) {
          useGridStore.setState({ tileOverlayVisible: config.grid.tileOverlayVisible });
        }
      }

      if (config.paper) {
        paper.setPreset(config.paper.preset as Parameters<typeof paper.setPreset>[0]);
        paper.setOrientation(
          config.paper.orientation as Parameters<typeof paper.setOrientation>[0],
        );
        paper.setMargin(config.paper.margin);
        if (config.paper.marginTop !== undefined) paper.setMarginTop(config.paper.marginTop);
        if (config.paper.marginBottom !== undefined)
          paper.setMarginBottom(config.paper.marginBottom);
        if (config.paper.marginLeft !== undefined) paper.setMarginLeft(config.paper.marginLeft);
        if (config.paper.marginRight !== undefined) paper.setMarginRight(config.paper.marginRight);
        paper.setOverlap(config.paper.overlap);
        paper.setOutputDpi(config.paper.outputDpi);
        paper.setScaleLocked(config.paper.scaleLocked);
        if (config.paper.customW)
          paper.setCustomDimensions(config.paper.customW, config.paper.customH);
      }
    } catch {
      // Invalid saved data — ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    const config: PersistedConfig = {
      grid: {
        cellPx: grid.cellPx,
        offsetX: grid.offsetX,
        offsetY: grid.offsetY,
        color: grid.color,
        opacity: grid.opacity,
        tileOverlayVisible: grid.tileOverlayVisible,
      },
      paper: {
        preset: paper.preset,
        orientation: paper.orientation,
        margin: paper.margin,
        marginTop: paper.marginTop,
        marginBottom: paper.marginBottom,
        marginLeft: paper.marginLeft,
        marginRight: paper.marginRight,
        overlap: paper.overlap,
        outputDpi: paper.outputDpi,
        scaleLocked: paper.scaleLocked,
        customW: paper.customW,
        customH: paper.customH,
      },
    };

    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(config));
    } catch {
      // Storage full or unavailable
    }
  }, [
    grid.cellPx,
    grid.offsetX,
    grid.offsetY,
    grid.color,
    grid.opacity,
    grid.tileOverlayVisible,
    paper.preset,
    paper.orientation,
    paper.margin,
    paper.marginTop,
    paper.marginBottom,
    paper.marginLeft,
    paper.marginRight,
    paper.overlap,
    paper.outputDpi,
    paper.scaleLocked,
    paper.customW,
    paper.customH,
  ]);
}
