import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { IS_MOBILE } from '@/components/events/SeatingModule/components/constants';

/**
 * Zoom and Reset controls overlay component.
 * Displays bottom-right on desktop, adjusted on mobile.
 */
const ZoomControls = React.memo(function ZoomControls({
  hasInitialViewApplied,
  onZoomIn,
  onZoomOut,
  onResetView,
}) {
  const overlayStyle = {
    position: 'absolute',
    pointerEvents: 'auto',
  };

  return (
    <div
      className="d-flex flex-column gap-2 align-items-center p-2 rounded-3 user-select-none"
      style={{
        ...overlayStyle,
        opacity: hasInitialViewApplied ? 1 : 0,
        pointerEvents: hasInitialViewApplied ? 'auto' : 'none',
        bottom: IS_MOBILE ? 66 : 12,
        right: IS_MOBILE ? 5 : 12,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <button
        type="button"
        className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
        style={{ width: 36, height: 36 }}
        onClick={onZoomIn}
        aria-label="Zoom in"
      >
        <ZoomIn size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
        style={{ width: 36, height: 36 }}
        onClick={onZoomOut}
        aria-label="Zoom out"
      >
        <ZoomOut size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center text-white"
        style={{ width: 36, height: 36 }}
        onClick={onResetView}
        aria-label="Reset view"
      >
        <RotateCcw size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
});

export default ZoomControls;
