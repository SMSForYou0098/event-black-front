import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for handling all gesture events: wheel, touch, pinch, and pointer drag.
 * These event listeners are expensive, so we isolate them for potential lazy-loading.
 */
export function useSeatingGridGestures(
  containerRef,
  zoom,
  pan,
  bounds,
  viewportSize,
  isDragging,
  setZoom,
  setPan,
  clampPan,
  setIsDragging,
  setDisableTransformTransition,
  sections,
  containerReady
) {
  // Refs for pending updates (batched with RAF)
  const panRafRef = useRef(null);
  const pendingPanRef = useRef(null);
  const pinchRafRef = useRef(null);
  const pendingPinchRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef(null);
  const isPanningRef = useRef(false);
  const pinchRef = useRef(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const isDraggingRef = useRef(isDragging);
  const boundsRef = useRef(bounds);
  const viewportSizeRef = useRef(viewportSize);

  // Sync refs
  zoomRef.current = zoom;
  panRef.current = pan;
  isDraggingRef.current = isDragging;
  boundsRef.current = bounds;
  if (viewportSize) viewportSizeRef.current = viewportSize;

  const DRAG_THRESHOLD_PX = 10;

  // Wheel event: zoom with mouse wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const z = zoomRef.current;
      const p = panRef.current;
      const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      const newZoom = Math.max(0.2, Math.min(2, z * factor));
      const newPanX = px - (px - p.x) / z * newZoom;
      const newPanY = py - (py - p.y) / z * newZoom;
      setZoom(newZoom);
      setPan(clampPan({ x: newPanX, y: newPanY }, newZoom, boundsRef.current, viewportSizeRef.current));
    };

    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  }, [sections?.length, containerReady, setZoom, setPan, clampPan]);

  // Pointer Down: desktop drag initiation
  const onPointerDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    if (e.pointerType === 'touch') return;
    setDisableTransformTransition(true);
    setIsDragging(true);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, [setDisableTransformTransition, setIsDragging]);

  // Pointer Move: desktop drag
  useEffect(() => {
    const applyPanUpdate = () => {
      panRafRef.current = null;
      const pending = pendingPanRef.current;
      if (!pending) return;
      pendingPanRef.current = null;
      setPan((p) => {
        const next = { x: p.x + pending.dx, y: p.y + pending.dy };
        return clampPan(next, zoomRef.current, boundsRef.current, viewportSizeRef.current);
      });
    };

    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      const prev = pendingPanRef.current;
      pendingPanRef.current = { dx: (prev?.dx || 0) + dx, dy: (prev?.dy || 0) + dy };
      if (panRafRef.current === null) {
        panRafRef.current = requestAnimationFrame(applyPanUpdate);
      }
    };

    const onUp = () => {
      if (panRafRef.current !== null) {
        cancelAnimationFrame(panRafRef.current);
        panRafRef.current = null;
      }
      if (pendingPanRef.current) {
        setPan((p) => {
          const pending = pendingPanRef.current;
          if (!pending) return p;
          const next = { x: p.x + pending.dx, y: p.y + pending.dy };
          return clampPan(next, zoomRef.current, boundsRef.current, viewportSizeRef.current);
        });
        pendingPanRef.current = null;
      }
      setDisableTransformTransition(false);
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointerleave', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointerleave', onUp);
      if (panRafRef.current !== null) {
        cancelAnimationFrame(panRafRef.current);
        panRafRef.current = null;
      }
    };
  }, [setPan, clampPan, setDisableTransformTransition, setIsDragging]);

  // Touch events: single touch drag + two-finger pinch zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getTouchCenter = (touches) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });

    const getTouchDistance = (touches) =>
      Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);

    const applyPinchUpdate = () => {
      pinchRafRef.current = null;
      const pending = pendingPinchRef.current;
      if (!pending) return;
      pendingPinchRef.current = null;
      const b = boundsRef.current;
      const v = viewportSizeRef.current;
      const clamped = clampPan({ x: pending.panX, y: pending.panY }, pending.zoom, b, v);
      setZoom(pending.zoom);
      setPan(clamped);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        setDisableTransformTransition(true);
        isPanningRef.current = false;
        touchStartRef.current = null;
        setIsDragging(false);
        const rect = el.getBoundingClientRect();
        const c = getTouchCenter(e.touches);
        pinchRef.current = {
          centerX: c.x - rect.left,
          centerY: c.y - rect.top,
          distance: getTouchDistance(e.touches),
          zoom: zoomRef.current,
          pan: { ...panRef.current },
        };
      } else if (e.touches.length === 1) {
        pinchRef.current = null;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isPanningRef.current = false;
        setIsDragging(false);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const c = getTouchCenter(e.touches);
        const centerX = c.x - rect.left;
        const centerY = c.y - rect.top;
        const distance = getTouchDistance(e.touches);
        const prev = pinchRef.current;
        if (prev.distance <= 0) return;
        const ratio = distance / prev.distance;
        const newZoom = Math.max(0.2, Math.min(2, prev.zoom * ratio));
        const newPanX = centerX - ((prev.centerX - prev.pan.x) / prev.zoom) * newZoom;
        const newPanY = centerY - ((prev.centerY - prev.pan.y) / prev.zoom) * newZoom;
        pinchRef.current = { centerX, centerY, distance, zoom: newZoom, pan: { x: newPanX, y: newPanY } };
        pendingPinchRef.current = { zoom: newZoom, panX: newPanX, panY: newPanY };
        if (pinchRafRef.current === null) {
          pinchRafRef.current = requestAnimationFrame(applyPinchUpdate);
        }
      } else if (e.touches.length === 1) {
        const start = touchStartRef.current;
        const cx = e.touches[0].clientX;
        const cy = e.touches[0].clientY;
        if (start && !isPanningRef.current) {
          const dist = Math.hypot(cx - start.x, cy - start.y);
          if (dist > DRAG_THRESHOLD_PX) {
            isPanningRef.current = true;
            setDisableTransformTransition(true);
            setIsDragging(true);
            lastPointerRef.current = { x: cx, y: cy };
            e.preventDefault();
          }
        }
        if (isPanningRef.current) {
          e.preventDefault();
          const dx = cx - lastPointerRef.current.x;
          const dy = cy - lastPointerRef.current.y;
          lastPointerRef.current = { x: cx, y: cy };
          const prev = pendingPanRef.current;
          pendingPanRef.current = { dx: (prev?.dx || 0) + dx, dy: (prev?.dy || 0) + dy };
          if (panRafRef.current === null) {
            panRafRef.current = requestAnimationFrame(() => {
              panRafRef.current = null;
              const pending = pendingPanRef.current;
              if (!pending) return;
              pendingPanRef.current = null;
              setPan((p) => {
                const next = { x: p.x + pending.dx, y: p.y + pending.dy };
                return clampPan(next, zoomRef.current, boundsRef.current, viewportSizeRef.current);
              });
            });
          }
        }
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        setDisableTransformTransition(false);
        if (pinchRafRef.current !== null) cancelAnimationFrame(pinchRafRef.current);
        if (panRafRef.current !== null) cancelAnimationFrame(panRafRef.current);
        pinchRafRef.current = null;
        panRafRef.current = null;
        pendingPinchRef.current = null;
        pendingPanRef.current = null;
        pinchRef.current = null;
        touchStartRef.current = null;
        isPanningRef.current = false;
      }
      if (e.touches.length === 0) setIsDragging(false);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [sections?.length, containerReady, clampPan, setZoom, setPan, setIsDragging, setDisableTransformTransition]);

  return { onPointerDown };
}
