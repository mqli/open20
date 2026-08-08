import { X, Sparkles, MousePointer2, Hand } from 'lucide-react';
import { useState } from 'react';
import type { CalibrateMode } from '@/types';

interface CanvasAlertProps {
  /** Show calibration instruction alert */
  calibrationMode: boolean;
  calibrateMode: CalibrateMode;
  /** Show custom tile mode instruction alert */
  customMode: boolean;
  onDismissCalibration: () => void;
  onDismissCustom: () => void;
}

export function CanvasAlert({
  calibrationMode,
  calibrateMode,
  customMode,
  onDismissCalibration,
  onDismissCustom,
}: CanvasAlertProps) {
  const [dismissedCalibration, setDismissedCalibration] = useState(false);
  const [dismissedCustom, setDismissedCustom] = useState(false);

  const showCalibration = calibrationMode && !dismissedCalibration;
  const showCustom = customMode && !dismissedCustom;

  if (!showCalibration && !showCustom) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2 max-w-md w-[calc(100%-2rem)]">
      {showCalibration && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg shadow-lg border bg-bg-secondary border-border-primary text-text-primary">
          {calibrateMode === 'smart' ? (
            <Sparkles size={16} className="shrink-0 mt-0.5 text-primary-400" />
          ) : (
            <MousePointer2 size={16} className="shrink-0 mt-0.5 text-primary-400" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary">
              {calibrateMode === 'smart' ? 'Smart Calibration' : 'Manual Calibration'}
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
              {calibrateMode === 'manual'
                ? 'Draw a rectangle covering exactly 2\u00d72 grid squares.'
                : 'Roughly select a region containing 2\u00d72 grid squares.'}
            </p>
            <p className="text-[10px] text-text-disabled mt-1 leading-snug">
              Pick an area with clear, unobstructed grid lines for best results.
              {calibrateMode === 'smart' &&
                ' Not accurate? Switch to Manual and draw the grid precisely.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDismissedCalibration(true);
              onDismissCalibration();
            }}
            className="p-0.5 rounded hover:bg-bg-tertiary transition-colors shrink-0 text-text-disabled"
            aria-label="Dismiss calibration guide"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {showCustom && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg shadow-lg border bg-bg-secondary border-border-primary text-text-primary">
          <Hand size={16} className="shrink-0 mt-0.5 text-primary-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary">Custom Tile Mode</p>
            <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
              Drag tiles to reposition, press{' '}
              <kbd className="px-1 py-0.5 text-[10px] rounded bg-bg-tertiary border border-border-primary font-mono text-text-secondary">
                R
              </kbd>{' '}
              to rotate, or use the controls in the sidebar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDismissedCustom(true);
              onDismissCustom();
            }}
            className="p-0.5 rounded hover:bg-bg-tertiary transition-colors shrink-0 text-text-disabled"
            aria-label="Dismiss custom tile guide"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
