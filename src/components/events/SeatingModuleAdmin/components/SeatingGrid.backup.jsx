'use client';

import React, { useMemo, useCallback, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { IS_MOBILE } from '@/components/events/SeatingModule/components/constants';
import { useMyContext } from '@/Context/MyContextProvider';
import { detectDeviceOs, DEVICE_OS } from '@/utils/deviceOs';
import SeatButton from './SeatButton';
import SectionBlock from './SectionBlock';
import ZoomControls from './ZoomControls';
import { useSeatingGridState, useViewGeometry } from './hooks/useSeatingGridState';
import { useSeatingGridGestures } from './hooks/useSeatingGridGestures';
import { useSeatingGridLayout } from './hooks/useSeatingGridLayout';
import {
  getLayoutBounds,
  buildBookingSeatDisplayCoords,
  expandBoundsWithPaintedSeats,
  getSectionLayoutRectForCull,
  calculateTotalSeats,
} from './utils/seatingGridUtils';


const SeatingGrid = ({
  sections,
  selectedSeats,
  onSeatClick,
  onStandingSectionClick,
  stage,
  storageKey,
  scrollToSectionId,
  scrollToRowTitle,
}) => {
  const { isMobile } = useMyContext();
  const deviceOs = useMemo(() => detectDeviceOs(), []);
  const allowTooltipHover = deviceOs !== DEVICE_OS.ANDROID && deviceOs !== DEVICE_OS.IOS;
  const containerRef = useRef(null);
  const [containerReady, setContainerReady] = useState(false);
  /** null until container measured — avoids fitting/restoring session with a fake 400×400 viewport. */
  const [viewportSize, setViewportSize] = useState(null);
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  isDraggingRef.current = isDragging;
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;
  const pinchRef = useRef(null);
  const userHasInteractedRef = useRef(false);
  const prevBoundsRef = useRef({ width: 0, height: 0 });
  const pinchRafRef = useRef(null);
  const pendingPinchRef = useRef(null);
  const panRafRef = useRef(null);
  const pendingPanRef = useRef(null);
  const touchStartRef = useRef(null);
  const isPanningRef = useRef(false);
  const DRAG_THRESHOLD_PX = 10;
  const [disableTransformTransition, setDisableTransformTransition] = useState(false);
  const [hasInitialViewApplied, setHasInitialViewApplied] = useState(false);
  const viewPersistTimeoutRef = useRef(null);
  const appliedDeepLinkRef = useRef(false);

  const selectedSeatIds = useMemo(() => {
    const ids = new Set();
    (selectedSeats || []).forEach((ticket) => {
      (ticket.seats || []).forEach((s) => ids.add(s.seat_id));
    });
    return ids;
  }, [selectedSeats]);

  const { bounds, seatDisplayCoords } = useMemo(() => {
    const base = getLayoutBounds(stage, sections);
    const coords = buildBookingSeatDisplayCoords(sections);
    const expanded = expandBoundsWithPaintedSeats(base, sections, coords);
    return { bounds: expanded, seatDisplayCoords: coords };
  }, [stage, sections]);

  const boundsRef = useRef(bounds);
  const viewportSizeRef = useRef({ width: 100, height: 100 });
  boundsRef.current = bounds;
  if (viewportSize) viewportSizeRef.current = viewportSize;

  /** Clamp pan so the layout stays within the viewport (user cannot lose the layout off-screen). */
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

  const logViewGeometry = useCallback((phase, payload) => {
    // Debug helper to compare initial fit vs reset geometry in browser console.
    console.log(`[SeatingGrid] ${phase}`, payload);
  }, []);

  const visibleSections = useMemo(() => {
    if (!sections?.length) return [];
    if (!viewportSize) return sections;
    const pad = 50;
    const left = (-pan.x - pad) / zoom;
    const top = (-pan.y - pad) / zoom;
    const width = (viewportSize.width + pad * 2) / zoom;
    const height = (viewportSize.height + pad * 2) / zoom;
    return sections.filter((s) => {
      const { sx, sy, sw, sh } = getSectionLayoutRectForCull(s, seatDisplayCoords, bounds);
      return !(left > sx + sw || left + width < sx || top > sy + sh || top + height < sy);
    });
  }, [
    sections,
    bounds,
    seatDisplayCoords,
    pan.x,
    pan.y,
    zoom,
    viewportSize,
  ]);


  useEffect(() => {
    if (!containerRef.current || !sections?.length) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const next = { width: Math.max(100, width), height: Math.max(100, height) };
        viewportSizeRef.current = next;
        setViewportSize((prev) => {
          if (prev && prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });
      }
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    const initial = { width: Math.max(100, rect.width), height: Math.max(100, rect.height) };
    viewportSizeRef.current = initial;
    setViewportSize(initial);
    return () => ro.disconnect();
  }, [sections?.length, containerReady]);

  const totalSeats = useMemo(
    () =>
      (sections || []).reduce(
        (sum, s) => sum + (s.rows || []).reduce((rSum, r) => rSum + (r.seats || []).length, 0),
        0
      ),
    [sections]
  );

  const computeResetPlacement = useCallback((vp) => {
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
  }, [bounds, totalSeats, clampPan]);

  const applyResetPlacement = useCallback((vp, phase = 'after-reset-click', instant = false) => {
    const { z, nextPan, rawPan } = computeResetPlacement(vp);
    logViewGeometry(phase, {
      viewport: vp,
      bounds: { minX: bounds.minX, minY: bounds.minY, width: bounds.width, height: bounds.height },
      zoom: z,
      pan: nextPan,
      computedPanBeforeClamp: rawPan,
      totalSeats,
      instant,
    });
    if (instant) {
      setDisableTransformTransition(true);
    }
    setZoom(z);
    setPan(nextPan);
    setHasInitialViewApplied(true);
    if (instant) {
      // Re-enable transition after this immediate reset frame is committed.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDisableTransformTransition(false));
      });
    }
  }, [computeResetPlacement, bounds, totalSeats, logViewGeometry]);

  useLayoutEffect(() => {
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
          if (!boundsStale &&
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
      } catch (_) { }
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
  }, [bounds, viewportSize, totalSeats, storageKey, clampPan, logViewGeometry]);

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
      } catch (_) { }
    }, VIEW_PERSIST_DEBOUNCE_MS);
    return () => {
      if (viewPersistTimeoutRef.current) clearTimeout(viewPersistTimeoutRef.current);
    };
  }, [storageKey, zoom, pan, bounds.width, bounds.height]);

  useEffect(() => {
    if (!viewportSize || bounds.width <= 0 || bounds.height <= 0) return;
    setPan((p) => {
      const c = clampPan(p, zoom, bounds, viewportSize);
      if (c.x === p.x && c.y === p.y) return p;
      return c;
    });
  }, [zoom, viewportSize, bounds.width, bounds.height, clampPan]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2, z * 1.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.2, z / 1.25));
  }, []);

  const getCurrentViewport = useCallback(() => {
    const el = containerRef.current;
    return viewportSize ??
      (el
        ? {
          width: Math.max(100, el.getBoundingClientRect().width),
          height: Math.max(100, el.getBoundingClientRect().height),
        }
        : { width: 100, height: 100 });
  }, [viewportSize]);

  const LARGE_RESET_PAN_DELTA_PX = 280;
  const LARGE_RESET_ZOOM_DELTA = 0.45;
  const handleResetView = useCallback(() => {
    const vp = getCurrentViewport();
    const { z, nextPan } = computeResetPlacement(vp);
    const currentPan = panRef.current;
    const currentZoom = zoomRef.current;
    const panDelta = Math.hypot(nextPan.x - currentPan.x, nextPan.y - currentPan.y);
    const zoomDelta = Math.abs(z - currentZoom);
    const shouldInstantReset = panDelta > LARGE_RESET_PAN_DELTA_PX || zoomDelta > LARGE_RESET_ZOOM_DELTA;
    applyResetPlacement(vp, 'after-reset-click', shouldInstantReset);
  }, [applyResetPlacement, computeResetPlacement, getCurrentViewport]);

  const handleZoomToPoint = useCallback(
    (layoutCenterX, layoutCenterY, zoomLevel) => {
      const vp = viewportSizeRef.current;
      const z = Math.max(0.9, Math.min(2, zoomLevel));
      const px = vp.width / 2 - layoutCenterX * z;
      const py = vp.height / 2 - layoutCenterY * z;
      const nextPan = clampPan({ x: px, y: py }, z, bounds, vp);
      const prevPan = panRef.current;
      const prevZoom = zoomRef.current;
      const panDelta = Math.hypot(nextPan.x - prevPan.x, nextPan.y - prevPan.y);
      const zoomDelta = Math.abs(z - prevZoom);
      // Skip tiny auto-focus moves to avoid visual jitter.
      if (panDelta < 1.5 && zoomDelta < 0.01) return;
      setZoom(z);
      setPan(nextPan);
      userHasInteractedRef.current = true;
    },
    [bounds, clampPan]
  );

  const handleZoomToSection = useCallback(
    (sectionId, rowTitle) => {
      const list = sections || [];
      const byIndex = /^\d+$/.test(String(sectionId)) ? list[parseInt(sectionId, 10)] : null;
      const section = byIndex || list.find((s) => s.id === sectionId || String(s.id) === String(sectionId));
      if (!section || bounds.width <= 0 || bounds.height <= 0) return;
      const layoutRect = getSectionLayoutRectForCull(section, seatDisplayCoords, bounds);
      const sx = (Number(section.x) || 0) - bounds.minX;
      const sy = (Number(section.y) || 0) - bounds.minY;
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
      const el = containerRef.current;
      const vp = viewportSize ??
        (el
          ? {
            width: Math.max(100, el.getBoundingClientRect().width),
            height: Math.max(100, el.getBoundingClientRect().height),
          }
          : { width: 100, height: 100 });
      const z = Math.max(0.9, Math.min(2, (vp.width * 0.85) / layoutRect.sw));
      handleZoomToPoint(centerX, centerY, z);
    },
    [sections, bounds, viewportSize, seatDisplayCoords, handleZoomToPoint]
  );

  useEffect(() => {
    if (!sections?.length || !scrollToSectionId || appliedDeepLinkRef.current) return;
    if (bounds.width <= 0 || bounds.height <= 0) return;
    appliedDeepLinkRef.current = true;
    handleZoomToSection(scrollToSectionId, scrollToRowTitle || undefined);
  }, [sections?.length, scrollToSectionId, scrollToRowTitle, bounds.width, bounds.height, handleZoomToSection]);

  const ZOOM_THRESHOLD_FOR_AUTO_ZOOM = 0.75;
  const SEAT_ZOOM_LEVEL = 1.15;
  const AUTO_FOCUS_SAFE_ZONE_RATIO = 0.28;
  const handleSeatClickWithZoom = useCallback(
    async (seat, sectionId, rowId) => {
      const result = onSeatClick(seat, sectionId, rowId);
      const success = await Promise.resolve(result);
      if (success === false) return;
      if (sections?.length && bounds.width > 0 && bounds.height > 0) {
        const sec = sections.find((s) => s.id === sectionId || String(s.id) === String(sectionId));
        if (sec) {
          const sx = (Number(sec.x) || 0) - bounds.minX;
          const sy = (Number(sec.y) || 0) - bounds.minY;
          const disp = seatDisplayCoords.get(seat.id);
          const lx = disp ? disp.x : (Number(seat.x) || 0);
          const ly = disp ? disp.y : (Number(seat.y) || 0);
          const seatCenterX = sx + lx;
          const seatCenterY = sy + ly;
          const currentZoom = zoomRef.current;
          const currentPan = panRef.current;
          const vp = viewportSizeRef.current;
          const seatScreenX = seatCenterX * currentZoom + currentPan.x;
          const seatScreenY = seatCenterY * currentZoom + currentPan.y;
          const centerX = vp.width / 2;
          const centerY = vp.height / 2;
          const safeZoneX = vp.width * AUTO_FOCUS_SAFE_ZONE_RATIO;
          const safeZoneY = vp.height * AUTO_FOCUS_SAFE_ZONE_RATIO;
          const insideSafeZone =
            Math.abs(seatScreenX - centerX) <= safeZoneX &&
            Math.abs(seatScreenY - centerY) <= safeZoneY;

          // If already in the main focus area and zoom is good, avoid unnecessary auto-pan animation.
          if (insideSafeZone && currentZoom >= ZOOM_THRESHOLD_FOR_AUTO_ZOOM) return;

          if (currentZoom < ZOOM_THRESHOLD_FOR_AUTO_ZOOM) {
            handleZoomToPoint(seatCenterX, seatCenterY, SEAT_ZOOM_LEVEL);
          } else {
            handleZoomToPoint(seatCenterX, seatCenterY, currentZoom);
          }
        }
      }
    },
    [sections, bounds, seatDisplayCoords, onSeatClick, handleZoomToPoint]
  );

  const onPointerDown = useCallback(
    (e) => {
      if (e.target.closest('button')) return;
      if (e.pointerType === 'touch') return;
      userHasInteractedRef.current = true;
      setDisableTransformTransition(true);
      setIsDragging(true);
      lastPointer.current = { x: e.clientX, y: e.clientY };
    },
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      userHasInteractedRef.current = true;
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
  }, [sections?.length, containerReady, clampPan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const getTouchCenter = (touches) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });
    const getTouchDistance = (touches) =>
      Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);

    const onTouchStart = (e) => {
      userHasInteractedRef.current = true;
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
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        isPanningRef.current = false;
        setIsDragging(false);
      }
    };

    const applyPinchUpdate = () => {
      pinchRafRef.current = null;
      const pending = pendingPinchRef.current;
      if (!pending) return;
      pendingPinchRef.current = null;
      const b = boundsRef.current;
      const v = viewportSizeRef.current;
      const clamped = clampPan(
        { x: pending.panX, y: pending.panY },
        pending.zoom,
        b,
        v
      );
      setZoom(pending.zoom);
      setPan(clamped);
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
        pinchRef.current = {
          centerX,
          centerY,
          distance,
          zoom: newZoom,
          pan: { x: newPanX, y: newPanY },
        };
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
            lastPointer.current = { x: cx, y: cy };
            e.preventDefault();
          }
        }
        if (isPanningRef.current) {
          e.preventDefault();
          const dx = cx - lastPointer.current.x;
          const dy = cy - lastPointer.current.y;
          lastPointer.current = { x: cx, y: cy };
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
        if (pinchRafRef.current !== null) {
          cancelAnimationFrame(pinchRafRef.current);
          pinchRafRef.current = null;
        }
        if (panRafRef.current !== null) {
          cancelAnimationFrame(panRafRef.current);
          panRafRef.current = null;
        }
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
  }, [sections?.length, containerReady, clampPan]);

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
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
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
  }, [clampPan]);

  if (!sections || sections.length === 0) {
    return (
      <div className="p-5 text-center text-white-50 rounded-3 d-flex flex-column align-items-center gap-3">
        <LayoutGrid size={48} className="opacity-50" strokeWidth={1.5} />
        <div>
          <p className="mb-0 fw-medium">No seating layout</p>
          <p className="small mb-0 mt-1 opacity-75">Layout not loaded or this event has no sections yet.</p>
        </div>
      </div>
    );
  }

  const stageSx = stage ? (stage.x || 0) - bounds.minX : 0;
  const stageSy = stage ? (stage.y || 0) - bounds.minY : 0;
  const stageW = stage ? (stage.width || 800) : 0;
  const stageH = stage ? (stage.height || 50) : 0;

  const overlayStyle = {
    position: 'absolute',
    pointerEvents: 'auto',
  };

  const setContainerRef = useCallback((node) => {
    containerRef.current = node;
    setContainerReady((prev) => (node ? true : prev));
  }, []);

  return (
    <div
      ref={setContainerRef}
      onPointerDown={onPointerDown}
      className="custom-dark-bg rounded-3 overflow-hidden position-relative user-select-none w-100"
      style={{
        minHeight: IS_MOBILE ? '65vh' : 490,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      {/* Layout layer: uses full viewport; pan/zoom applied here */}
      <div
        className="position-absolute user-select-none"
        style={{
          left: 0,
          top: 0,
          width: bounds.width,
          height: bounds.height,
          opacity: hasInitialViewApplied ? 1 : 0,
          transformOrigin: '0 0',
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          willChange: 'transform',
          transition: !hasInitialViewApplied || disableTransformTransition
            ? 'none'
            : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
          pointerEvents: 'auto',
        }}
      >
        {stage && stageW > 0 && (
          <div
            className="position-absolute d-flex align-items-center justify-content-center pt-2 user-select-none text-white"
            style={{
              left: stageSx,
              top: stageSy,
              width: stageW,
              height: stageH,
              borderTop: `3px solid ${PRIMARY}`,
              fontSize: 13,
              letterSpacing: 4,
            }}
          >
            {stage.name || 'SCREEN'}
          </div>
        )}
        {visibleSections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClickWithZoom}
            onStandingSectionClick={onStandingSectionClick}
            bounds={bounds}
            seatDisplayCoords={seatDisplayCoords}
            isMobile={isMobile}
            allowTooltipHover={allowTooltipHover}
          />
        ))}
      </div>

      {/* Legend + Go to section: bottom center on desktop, bottom-left on mobile */}
      {/* <div
        className="p-2 px-2 rounded-3 small text-white user-select-none"
        style={{
          ...overlayStyle,
          opacity: hasInitialViewApplied ? 1 : 0,
          pointerEvents: hasInitialViewApplied ? 'auto' : 'none',
          bottom: 10,
          left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.65)',
          fontSize: '12px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div className="d-flex align-items-center gap-2 flex-nowrap">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.key} className="d-flex align-items-center gap-1 text-nowrap">
                <span className="rounded" style={{ width: 12, height: 12, ...SEAT_STYLES[item.styleKey] }} />
                {item.label}
              </span>
          ))}
        </div>
      </div> */}

      {/* Zoom / Reset: floating bottom-right */}
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
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn size={18} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36 }}
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut size={18} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center text-white"
          style={{ width: 36, height: 36 }}
          onClick={handleResetView}
          aria-label="Reset view"
        >
          <RotateCcw size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default SeatingGrid;
