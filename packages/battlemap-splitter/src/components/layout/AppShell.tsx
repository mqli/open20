import { useState, useEffect, lazy, Suspense } from 'react';
import { MapCanvas } from '@/components/canvas/MapCanvas';
import { ToolPalette } from '@/components/canvas/ToolPalette';
import { Toolbar } from '@/components/layout/Toolbar';
import { StatusBar } from '@/components/layout/StatusBar';
import { ToastContainer } from '@/components/layout/ToastContainer';
import { TileSidebar } from '@/components/panels/TileSidebar';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useTileRecalc } from '@/hooks/useTileRecalc';
import { useMapStore } from '@/stores/mapStore';
import { useTileStore } from '@/stores/tileStore';
import { showToast } from '@/utils/toast';
import type { CalibrateMode } from '@/types';

const GridPanel = lazy(() =>
  import('@/components/panels/GridPanel').then((m) => ({ default: m.GridPanel })),
);
const UploadDialog = lazy(() =>
  import('@/components/dialogs/UploadDialog').then((m) => ({ default: m.UploadDialog })),
);
const ExportDialog = lazy(() =>
  import('@/components/dialogs/ExportDialog').then((m) => ({ default: m.ExportDialog })),
);

/** Minimal fallback: renders nothing — these are overlay panels that appear instantly */
function PanelFallback() {
  return null;
}

export function AppShell() {
  const [showUpload, setShowUpload] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrateMode, setCalibrateMode] = useState<CalibrateMode>('smart');

  useSessionPersistence();
  useTileRecalc();

  // Track custom tile mode for canvas alert
  const tileMode = useTileStore((s) => s.mode);
  const customTileMode = tileMode === 'custom';

  // Edge case: warn on very large images
  const width = useMapStore((s) => s.width);
  const height = useMapStore((s) => s.height);

  useEffect(() => {
    if (Math.max(width, height) > 8000) {
      showToast(
        'Image is very large (>8000px). Consider downscaling for better performance.',
        'info',
        5000,
      );
    }
  }, [width, height]);

  return (
    <div className="h-screen flex flex-col bg-bg-primary text-text-primary">
      {/* Toolbar */}
      <Toolbar />

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden max-md:overflow-y-auto">
        <div className="flex-1 relative flex flex-col">
          <MapCanvas
            calibrationMode={calibrationMode}
            calibrateMode={calibrateMode}
            customTileMode={customTileMode}
            onCalibrateDone={() => setCalibrationMode(false)}
          />
          <ToolPalette />
          <TileSidebar
            onUploadClick={() => setShowUpload(true)}
            onExportClick={() => setShowExport(true)}
          />
          <Suspense fallback={<PanelFallback />}>
            <GridPanel
              calibrationMode={calibrationMode}
              calibrateMode={calibrateMode}
              onToggleCalibration={() => {
                setCalibrationMode((v) => !v);
              }}
              onSetCalibrateMode={setCalibrateMode}
            />
          </Suspense>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar calibrationMode={calibrationMode} />

      {/* Dialogs */}
      {showUpload && (
        <Suspense fallback={<PanelFallback />}>
          <UploadDialog onClose={() => setShowUpload(false)} />
        </Suspense>
      )}
      {showExport && (
        <Suspense fallback={<PanelFallback />}>
          <ExportDialog onClose={() => setShowExport(false)} />
        </Suspense>
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
