import { useState, useEffect } from 'react';
import { MapCanvas } from '@/components/canvas/MapCanvas';
import { ToolPalette } from '@/components/canvas/ToolPalette';
import { Toolbar } from '@/components/layout/Toolbar';
import { StatusBar } from '@/components/layout/StatusBar';
import { ToastContainer } from '@/components/layout/ToastContainer';
import { TileSidebar } from '@/components/panels/TileSidebar';
import { UploadDialog } from '@/components/dialogs/UploadDialog';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useTileRecalc } from '@/hooks/useTileRecalc';
import { useMapStore } from '@/stores/mapStore';
import { showToast } from '@/utils/toast';

export function AppShell() {
  const [showUpload, setShowUpload] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationSquares, setCalibrationSquares] = useState(1);

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
      <Toolbar
        onUploadClick={() => setShowUpload(true)}
        onExportClick={() => setShowExport(true)}
      />

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex flex-col">
          <MapCanvas
            calibrationMode={calibrationMode}
            calibrationSquares={calibrationSquares}
            onCalibrateDone={() => setCalibrationMode(false)}
          />
          <ToolPalette
            calibrationMode={calibrationMode}
            calibrationSquares={calibrationSquares}
            onToggleCalibration={() => {
              setCalibrationMode((v) => !v);
            }}
            onCycleSquares={() => {
              setCalibrationSquares((s) => (s === 1 ? 2 : 1));
            }}
          />
        </div>
        <TileSidebar />
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Dialogs */}
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
