import { useEffect, useCallback, useRef } from 'react';
import {
  STORAGE_KEY_PREFIX,
  VIEW_PERSIST_DEBOUNCE_MS,
  STORED_BOUNDS_EPS_PX,
  getSectionLayoutRectForCull,
} from '../utils/seatingGridUtils';

/**
 * Custom hook for layout calculations, initial view setup, storage, and section navigation.
 */
export function useSeatingGridLayout(
  bounds,
  viewportSize,
  totalSeats,
  storageKey,
  sections,
  seatDisplayCoords,
  zoom,
  pan,
  setZoom,
  setPan,
  clampPan,
  setHasInitialViewApplied,
  userHasInteractedRef,
  prevBoundsRef,
  logViewGeometry
) {
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  const viewPersistTimeoutRef = useRef(null);
  const appliedDeepLinkRef = useRef(false);

  const computeResetPlacement = useCallback(
    (vp) => {
      const pad = 40;
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

  const handleResetView = useCallback((vp, shouldInstantReset = false) => {
    const { z, nextPan, rawPan } = computeResetPlacement(vp);
    logViewGeometry('after-reset-click', {
      viewport: vp,
      bounds: { minX: bounds.minX, minY: bounds.minY, width: bounds.width, height: bounds.height },
      zoom: z,
      pan: nextPan,
      computedPanBeforeClamp: rawPan,
      totalSeats,
      instant: shouldInstantReset,
    });
    setZoom(z);
    setPan(nextPan);
    setHasInitialViewApplied(true);
  }, [computeResetPlacement, bounds, totalSeats, logViewGeometry, setZoom, setPan, setHasInitialViewApplied]);

  const handleZoomToPoint = useCallback(
    (layoutCenterX, layoutCenterY, zoomLevel, vp) => {
      const z = Math.max(0.9, Math.min(2, zoomLevel));
      const px = vp.width / 2 - layoutCenterX * z;
      const py = vp.height / 2 - layoutCenterY * z;
      const nextPan = clampPan({ x: px, y: py }, z, bounds, vp);
      const prevPan = panRef.current;
      const prevZoom = zoomRef.current;
      const panDelta = Math.hypot(nextPan.x - prevPan.x, nextPan.y - prevPan.y);
      const zoomDelta = Math.abs(z - prevZoom);
      if (panDelta < 1.5 && zoomDelta < 0.01) return;
      setZoom(z);
      setPan(nextPan);
      userHasInteractedRef.current = true;
    },
    [bounds, clampPan, setZoom, setPan, userHasInteractedRef]
  );

  const handleZoomToSection = useCallback(
    (sectionId, rowTitle, vp) => {
      const list = sections || [];
      const byIndex = /^\d+$/.test(String(sectionId)) ? list[parseInt(sectionId, 10)] : null;
      const section = byIndex || list.find((s) => s.id === sectionId || String(s.id) === String(sectionId));
      if (!section || bounds.width <= 0 || bounds.height <= 0) return;
      const layoutRect = getSectionLayoutRectForCull(section, seatDisplayCoords, bounds);
      const sx = (Number(section.x) || 0) - bounds.minX;
      let centerX = layoutRect.sx + layoutRect.sw / 2;
      let centerY = layoutRect.sy + layoutRect.sh / 2;
      if (rowTitle && section.rows?.length) {
        const row = section.rows.find((r) => (r.title || '').toUpperCase() === String(rowTitle).toUpperCase());
        if (row?.seats?.length) {
          const first = row.seats[0];
          const last = row.seats[row.seats.length - 1];
          const df = seatDisplayCoords.get(first.id);
          const dl = seatDisplayCoords.get(last.id);
          const rx =
            ((df?.x ?? (Number(first?.x) || 0)) + (dl?.x ?? (Number(last?.x) || 0))) / 2;
          const ry =
            ((df?.y ?? (Number(first?.y) || 0)) + (dl?.y ?? (Number(last?.y) || 0))) / 2;
          centerX = sx + rx;
          centerY = sy + ry;
        }
      }
      const z = Math.max(0.9, Math.min(2, (vp.width * 0.85) / layoutRect.sw));
      handleZoomToPoint(centerX, centerY, z, vp);
    },
    [sections, bounds, seatDisplayCoords, handleZoomToPoint]
  );

  // Initial view setup and session restore
  useEffect(() => {
    if (!viewportSize || bounds.width <= 0 || bounds.height <= 0) return;
    const boundsChanged =
      prevBoundsRef.current.width !== bounds.width || prevBoundsRef.current.height !== bounds.height;
    if (boundsChanged) {
      prevBoundsRef.current = { width: bounds.width, height: bounds.height };
      userHasInteractedRef.current = false;
      setHasInitialViewApplied(false);
    }
    if (userHasInteractedRef.current) return;
    if (storageKey && typeof window !== 'undefined') {
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
            logViewGeometry('initial-render-restored-from-storage', {
              viewport: viewportSize,
              bounds: { minX: bounds.minX, minY: bounds.minY, width: bounds.width, height: bounds.height },
              zoom: z,
              pan: restored,
              rawStoredPan: { x: data.pan.x, y: data.pan.y },
              totalSeats,
              storageKey,
            });
            setZoom(z);
            setPan(restored);
            userHasInteractedRef.current = true;
            setHasInitialViewApplied(true);
            return;
          }
        }
      } catch (_) {}
    }
    const pad = 40;
    const scaleW = (viewportSize.width - pad * 2) / bounds.width;
    const scaleH = (viewportSize.height - pad * 2) / bounds.height;
    const fitScale = Math.min(scaleW, scaleH);
    const maxZoom = totalSeats <= 40 ? 1.4 : totalSeats <= 80 ? 1.2 : 1;
    const z = Math.max(0.15, Math.min(fitScale, maxZoom));
    const px = (viewportSize.width - bounds.width * z) / 2;
    const py = pad;
    const nextPan = clampPan({ x: px, y: py }, z, bounds, viewportSize);
    logViewGeometry('initial-render-auto-fit', {
      viewport: viewportSize,
      bounds: { minX: bounds.minX, minY: bounds.minY, width: bounds.width, height: bounds.height },
      zoom: z,
      pan: nextPan,
      computedPanBeforeClamp: { x: px, y: py },
      totalSeats,
    });
    setZoom(z);
    setPan(nextPan);
    setHasInitialViewApplied(true);
  }, [bounds, viewportSize, totalSeats, storageKey, clampPan, logViewGeometry, setZoom, setPan, setHasInitialViewApplied]);

  // Session storage persistence
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    if (viewPersistTimeoutRef.current) clearTimeout(viewPersistTimeoutRef.current);
    viewPersistTimeoutRef.current = setTimeout(() => {
      viewPersistTimeoutRef.current = null;
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
    return () => {
      if (viewPersistTimeoutRef.current) clearTimeout(viewPersistTimeoutRef.current);
    };
  }, [storageKey, zoom, pan, bounds.width, bounds.height]);

  // Pan clamping when zoom changes
  useEffect(() => {
    if (!viewportSize || bounds.width <= 0 || bounds.height <= 0) return;
    setPan((p) => {
      const c = clampPan(p, zoom, bounds, viewportSize);
      if (c.x === p.x && c.y === p.y) return p;
      return c;
    });
  }, [zoom, viewportSize, bounds.width, bounds.height, clampPan, setPan]);

  return {
    computeResetPlacement,
    handleResetView,
    handleZoomToPoint,
    handleZoomToSection,
    appliedDeepLinkRef,
  };
}
