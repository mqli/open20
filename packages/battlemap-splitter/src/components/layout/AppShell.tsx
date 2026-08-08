import { useState, useEffect } from 'react';
import { MapCanvas } from '@/components/canvas/MapCanvas';
import { ToolPalette } from '@/components/canvas/ToolPalette';
import { Toolbar } from '@/components/layout/Toolbar';
import { StatusBar } from '@/components/layout/StatusBar';
import { ToastContainer } from '@/components/layout/ToastContainer';
import { TileSidebar } from '@/components/panels/TileSidebar';
import { GridPanel } from '@/components/panels/GridPanel';
import { UploadDialog } from '@/components/dialogs/UploadDialog';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useTileRecalc } from '@/hooks/useTileRecalc';
import { useMapStore } from '@/stores/mapStore';
import { showToast } from '@/utils/toast';
import type { CalibrateMode } from '@/types';

export function AppShell() {
  const [showUpload, setShowUpload] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrateMode, setCalibrateMode] = useState<CalibrateMode>('smart');

  useSessionPersistence();
  useTileRecalc();

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
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex flex-col">
          <MapCanvas
            calibrationMode={calibrationMode}
            calibrateMode={calibrateMode}
            onCalibrateDone={() => setCalibrationMode(false)}
          />
          <ToolPalette />
          <TileSidebar
            onUploadClick={() => setShowUpload(true)}
            onExportClick={() => setShowExport(true)}
          />
          <GridPanel
            calibrationMode={calibrationMode}
            calibrateMode={calibrateMode}
            onToggleCalibration={() => {
              setCalibrationMode((v) => !v);
            }}
            onSetCalibrateMode={setCalibrateMode}
          />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar calibrationMode={calibrationMode} />

      {/* Dialogs */}
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
