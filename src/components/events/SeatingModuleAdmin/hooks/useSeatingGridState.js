import { useState, useRef, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'seatingView_';
const VIEW_PERSIST_DEBOUNCE_MS = 500;
const STORED_BOUNDS_EPS_PX = 2;

export const useSeatingGridState = (bounds, totalSeats, viewportSize, storageKey, clampPan) => {
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [disableTransformTransition, setDisableTransformTransition] = useState(false);
  const [hasInitialViewApplied, setHasInitialViewApplied] = useState(false);

  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const isDraggingRef = useRef(false);
  const userHasInteractedRef = useRef(false);
  const prevBoundsRef = useRef({ width: 0, height: 0 });
  const viewPersistTimeoutRef = useRef(null);
  const appliedDeepLinkRef = useRef(false);

  zoomRef.current = zoom;
  panRef.current = pan;
  isDraggingRef.current = isDragging;

  const computeResetPlacement = useCallback(
    (vp) => {
      const pad = 0;
      const scaleW = (vp.width - pad * 2) / bounds.width;
      const scaleH = (vp.height - pad * 2) / bounds.height;
      const fitScale = Math.min(scaleW, scaleH);
      const maxZoom = totalSeats <= 40 ? 1.4 : totalSeats <= 80 ? 1.2 : 1;
      const z = Math.max(0.15, Math.min(fitScale, maxZoom));
      const px = (vp.width - bounds.width * z) / 2;
      const py = pad;
      return {
        z,
        nextPan: clampPan({ x: px, y: py }, z, bounds, vp),
        rawPan: { x: px, y: py },
      };
    },
    [bounds, totalSeats, clampPan]
  );

  const applyResetPlacement = useCallback(
    (vp, instant = false) => {
      const { z, nextPan } = computeResetPlacement(vp);
      if (instant) {
        setDisableTransformTransition(true);
      }
      setZoom(z);
      setPan(nextPan);
      setHasInitialViewApplied(true);
      if (instant) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setDisableTransformTransition(false));
        });
      }
    },
    [computeResetPlacement]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2, z * 1.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.2, z / 1.25));
  }, []);

  const handleResetView = useCallback(
    (vp) => {
      const { z, nextPan } = computeResetPlacement(vp);
      const currentPan = panRef.current;
      const currentZoom = zoomRef.current;
      const panDelta = Math.hypot(nextPan.x - currentPan.x, nextPan.y - currentPan.y);
      const zoomDelta = Math.abs(z - currentZoom);
      const shouldInstantReset = panDelta > 280 || zoomDelta > 0.45;
      applyResetPlacement(vp, shouldInstantReset);
    },
    [computeResetPlacement, applyResetPlacement]
  );

  const persistViewToStorage = useCallback(() => {
    if (!storageKey) return;
    if (viewPersistTimeoutRef.current) clearTimeout(viewPersistTimeoutRef.current);
    viewPersistTimeoutRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY_PREFIX + storageKey,
          JSON.stringify({
            zoom,
            pan,
            boundsW: bounds.width,
            boundsH: bounds.height,
          })
        );
      } catch (_) {}
    }, VIEW_PERSIST_DEBOUNCE_MS);
  }, [storageKey, zoom, pan, bounds.width, bounds.height]);

  const restoreViewFromStorage = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return null;
    try {
      const key = STORAGE_KEY_PREFIX + storageKey;
      const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        const bw = data.boundsW;
        const bh = data.boundsH;
        const hasStoredBounds = typeof bw === 'number' && typeof bh === 'number';
        const boundsStale =
          !hasStoredBounds ||
          Math.abs(bw - bounds.width) > STORED_BOUNDS_EPS_PX ||
          Math.abs(bh - bounds.height) > STORED_BOUNDS_EPS_PX;
        if (
          !boundsStale &&
          typeof data.zoom === 'number' &&
          data.pan &&
          typeof data.pan.x === 'number' &&
          typeof data.pan.y === 'number'
        ) {
          const z = Math.max(0.2, Math.min(2, data.zoom));
          const restored = clampPan({ x: data.pan.x, y: data.pan.y }, z, bounds, viewportSize);
          return { z, pan: restored };
        }
      }
    } catch (_) {}
    return null;
  }, [storageKey, bounds, viewportSize, clampPan]);

  const updateZoom = useCallback((z) => {
    setZoom(z);
    userHasInteractedRef.current = true;
  }, []);

  const updatePan = useCallback((p) => {
    setPan(p);
    userHasInteractedRef.current = true;
  }, []);

  return {
    // State
    zoom,
    pan,
    isDragging,
    disableTransformTransition,
    hasInitialViewApplied,
    // Refs
    zoomRef,
    panRef,
    isDraggingRef,
    userHasInteractedRef,
    prevBoundsRef,
    viewPersistTimeoutRef,
    appliedDeepLinkRef,
    // Setters
    setZoom,
    setPan,
    setIsDragging,
    setDisableTransformTransition,
    setHasInitialViewApplied,
    // Helpers
    computeResetPlacement,
    applyResetPlacement,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    persistViewToStorage,
    restoreViewFromStorage,
    updateZoom,
    updatePan,
  };
};
