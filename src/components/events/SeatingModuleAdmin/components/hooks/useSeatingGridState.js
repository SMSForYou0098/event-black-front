import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing zoom, pan, and drag state.
 * Isolated from component rendering to prevent unnecessary re-renders.
 */
export function useSeatingGridState(bounds, viewportSize, totalSeats) {
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [disableTransformTransition, setDisableTransformTransition] = useState(false);
  const [hasInitialViewApplied, setHasInitialViewApplied] = useState(false);

  // Refs for performance: avoid creating new state updates on every mouse move
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const isDraggingRef = useRef(isDragging);
  
  // Update refs whenever state changes
  zoomRef.current = zoom;
  panRef.current = pan;
  isDraggingRef.current = isDragging;

  const boundsRef = useRef(bounds);
  const viewportSizeRef = useRef({ width: 100, height: 100 });
  boundsRef.current = bounds;
  if (viewportSize) viewportSizeRef.current = viewportSize;

  /** Clamp pan so layout stays within viewport */
  const clampPan = useCallback((panVal, z, b, v) => {
    const w = b.width * z;
    const h = b.height * z;
    const minX = Math.min(0, v.width - w);
    const maxX = Math.max(0, v.width - w);
    const minY = Math.min(0, v.height - h);
    const maxY = Math.max(0, v.height - h);
    return {
      x: Math.max(minX, Math.min(maxX, panVal.x)),
      y: Math.max(minY, Math.min(maxY, panVal.y)),
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2, z * 1.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.2, z / 1.25));
  }, []);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    setIsDragging,
    disableTransformTransition,
    setDisableTransformTransition,
    hasInitialViewApplied,
    setHasInitialViewApplied,
    // Refs
    zoomRef,
    panRef,
    isDraggingRef,
    boundsRef,
    viewportSizeRef,
    // Methods
    clampPan,
    handleZoomIn,
    handleZoomOut,
  };
}

/**
 * Custom hook for managing view geometry and animations.
 */
export function useViewGeometry(bounds, totalSeats) {
  const userHasInteractedRef = useRef(false);
  const prevBoundsRef = useRef({ width: 0, height: 0 });
  const viewPersistTimeoutRef = useRef(null);
  const appliedDeepLinkRef = useRef(false);

  const logViewGeometry = useCallback((phase, payload) => {
    console.log(`[SeatingGrid] ${phase}`, payload);
  }, []);

  return {
    userHasInteractedRef,
    prevBoundsRef,
    viewPersistTimeoutRef,
    appliedDeepLinkRef,
    logViewGeometry,
  };
}
