'use client';

import React, { useMemo, useCallback, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { PRIMARY } from '@/utils/consts';
import { IS_MOBILE } from '@/components/events/SeatingModule/components/constants';
import { useMyContext } from '@/Context/MyContextProvider';
import { detectDeviceOs, DEVICE_OS } from '@/utils/deviceOs';
import { useSeatingGridState } from '../hooks/useSeatingGridState';
import { useSeatingGridLayout } from '../hooks/useSeatingGridLayout';
import { useSeatingGridGestures } from '../hooks/useSeatingGridGestures';
import { getLayoutBounds } from '../utils/seatingGridUtils';
import ZoomControls from './ZoomControls';
import SectionBlock from './SectionBlock';

/**
 * SeatingGrid - Refactored component
 * Now uses custom hooks for state, layout, and gestures
 * Sub-components extracted for better organization and performance
 */
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
  const [viewportSize, setViewportSize] = useState(null);

  // Clamp pan helper
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

  // Compute bounds and total seats first
  const initialBounds = useMemo(() => getLayoutBounds(stage, sections), [stage, sections]);
  const totalSeats = useMemo(
    () =>
      (sections || []).reduce(
        (sum, s) =>
          sum + (s.rows || []).reduce((rSum, r) => rSum + (r.seats || []).length, 0),
        0
      ),
    [sections]
  );

  // Use custom hooks for state, layout, and gestures
  const gridState = useSeatingGridState(initialBounds, totalSeats, viewportSize, storageKey, clampPan);

  const layoutData = useSeatingGridLayout(stage, sections, gridState.zoom, gridState.pan, viewportSize);

  const gestureHandlers = useSeatingGridGestures(
    containerRef,
    gridState.zoom,
    gridState.pan,
    layoutData.bounds,
    viewportSize,
    gridState.setZoom,
    gridState.setPan,
    gridState.setIsDragging,
    gridState.setDisableTransformTransition,
    gridState.zoomRef,
    gridState.panRef,
    gridState.isDraggingRef,
    clampPan,
    gridState.userHasInteractedRef
  );

  const selectedSeatIds = layoutData.getSelectedSeatIds(selectedSeats);

  // Handle viewport resize
  useEffect(() => {
    if (!containerRef.current || !sections?.length) return;
    const el = containerRef.current;
    const updateViewportSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const next = { width: Math.max(100, width), height: Math.max(100, height) };
        setViewportSize((prev) => {
          if (prev && prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });
      }
    };
    let ro = null;
    if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') {
      ro = new window.ResizeObserver(updateViewportSize);
      ro.observe(el);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateViewportSize);
    }
    updateViewportSize();
    return () => {
      if (ro) {
        ro.disconnect();
      } else if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateViewportSize);
      }
    };
  }, [sections?.length, containerReady]);

  // Initialize view on first render
  useLayoutEffect(() => {
    if (!viewportSize || layoutData.bounds.width <= 0 || layoutData.bounds.height <= 0) return;
    const boundsChanged =
      gridState.prevBoundsRef.current.width !== layoutData.bounds.width ||
      gridState.prevBoundsRef.current.height !== layoutData.bounds.height;
    if (boundsChanged) {
      gridState.prevBoundsRef.current = {
        width: layoutData.bounds.width,
        height: layoutData.bounds.height,
      };
      gridState.userHasInteractedRef.current = false;
      gridState.setHasInitialViewApplied(false);
    }
    if (gridState.userHasInteractedRef.current) return;

    // Try to restore from storage
    const restored = gridState.restoreViewFromStorage();
    if (restored) {
      gridState.setZoom(restored.z);
      gridState.setPan(restored.pan);
      gridState.userHasInteractedRef.current = true;
      gridState.setHasInitialViewApplied(true);
      return;
    }

    // Auto-fit initial view
    gridState.applyResetPlacement(viewportSize, false);
  }, [layoutData.bounds.width, layoutData.bounds.height, viewportSize, storageKey, totalSeats]);

  // Persist view to storage
  useEffect(() => {
    gridState.persistViewToStorage();
  }, [gridState.zoom, gridState.pan, layoutData.bounds.width, layoutData.bounds.height, storageKey]);

  // Clamp pan on zoom/viewport change
  useEffect(() => {
    if (!viewportSize || layoutData.bounds.width <= 0 || layoutData.bounds.height <= 0) return;
    gridState.setPan((p) => {
      const c = clampPan(p, gridState.zoom, layoutData.bounds, viewportSize);
      if (c.x === p.x && c.y === p.y) return p;
      return c;
    });
  }, [gridState.zoom, viewportSize, layoutData.bounds.width, layoutData.bounds.height, clampPan]);

  const handleZoomToPoint = useCallback(
    (layoutCenterX, layoutCenterY, zoomLevel) => {
      const vp = viewportSize || { width: 100, height: 100 };
      const z = Math.max(0.9, Math.min(2, zoomLevel));
      const px = vp.width / 2 - layoutCenterX * z;
      const py = vp.height / 2 - layoutCenterY * z;
      const nextPan = clampPan({ x: px, y: py }, z, layoutData.bounds, vp);
      const prevPan = gridState.panRef.current;
      const prevZoom = gridState.zoomRef.current;
      const panDelta = Math.hypot(nextPan.x - prevPan.x, nextPan.y - prevPan.y);
      const zoomDelta = Math.abs(z - prevZoom);
      if (panDelta < 1.5 && zoomDelta < 0.01) return;
      gridState.setZoom(z);
      gridState.setPan(nextPan);
      gridState.userHasInteractedRef.current = true;
    },
    [layoutData.bounds, viewportSize, clampPan, gridState]
  );

  const handleZoomToSection = useCallback(
    (sectionId, rowTitle) => {
      const list = sections || [];
      const byIndex = /^\d+$/.test(String(sectionId)) ? list[parseInt(sectionId, 10)] : null;
      const section = byIndex || list.find((s) => s.id === sectionId || String(s.id) === String(sectionId));
      if (!section || layoutData.bounds.width <= 0 || layoutData.bounds.height <= 0) return;
      const layoutRect = layoutData.getSectionRect(section);
      const sx = (Number(section.x) || 0) - layoutData.bounds.minX;
      const sy = (Number(section.y) || 0) - layoutData.bounds.minY;
      let centerX = layoutRect.sx + layoutRect.sw / 2;
      let centerY = layoutRect.sy + layoutRect.sh / 2;
      if (rowTitle && section.rows?.length) {
        const row = section.rows.find((r) => (r.title || '').toUpperCase() === String(rowTitle).toUpperCase());
        if (row?.seats?.length) {
          const first = row.seats[0];
          const last = row.seats[row.seats.length - 1];
          const df = layoutData.seatDisplayCoords.get(first.id);
          const dl = layoutData.seatDisplayCoords.get(last.id);
          const rx = ((df?.x ?? (Number(first?.x) || 0)) + (dl?.x ?? (Number(last?.x) || 0))) / 2;
          const ry = ((df?.y ?? (Number(first?.y) || 0)) + (dl?.y ?? (Number(last?.y) || 0))) / 2;
          centerX = sx + rx;
          centerY = sy + ry;
        }
      }
      const vp = viewportSize || { width: 100, height: 100 };
      const z = Math.max(0.9, Math.min(2, (vp.width * 0.85) / layoutRect.sw));
      handleZoomToPoint(centerX, centerY, z);
    },
    [sections, layoutData, viewportSize, handleZoomToPoint]
  );

  useEffect(() => {
    if (!sections?.length || !scrollToSectionId || gridState.appliedDeepLinkRef.current) return;
    if (layoutData.bounds.width <= 0 || layoutData.bounds.height <= 0) return;
    gridState.appliedDeepLinkRef.current = true;
    handleZoomToSection(scrollToSectionId, scrollToRowTitle || undefined);
  }, [sections?.length, scrollToSectionId, scrollToRowTitle, layoutData.bounds, handleZoomToSection, gridState]);

  const ZOOM_THRESHOLD_FOR_AUTO_ZOOM = 0.75;
  const SEAT_ZOOM_LEVEL = 1.15;
  const AUTO_FOCUS_SAFE_ZONE_RATIO = 0.28;

  const handleSeatClickWithZoom = useCallback(
    async (seat, sectionId, rowId) => {
      const result = onSeatClick(seat, sectionId, rowId);
      const success = await Promise.resolve(result);
      if (success === false) return;
      if (sections?.length && layoutData.bounds.width > 0 && layoutData.bounds.height > 0) {
        const sec = sections.find((s) => s.id === sectionId || String(s.id) === String(sectionId));
        if (sec) {
          const sx = (Number(sec.x) || 0) - layoutData.bounds.minX;
          const sy = (Number(sec.y) || 0) - layoutData.bounds.minY;
          const disp = layoutData.seatDisplayCoords.get(seat.id);
          const lx = disp ? disp.x : (Number(seat.x) || 0);
          const ly = disp ? disp.y : (Number(seat.y) || 0);
          const seatCenterX = sx + lx;
          const seatCenterY = sy + ly;
          const currentZoom = gridState.zoomRef.current;
          const currentPan = gridState.panRef.current;
          const vp = viewportSize || { width: 100, height: 100 };
          const seatScreenX = seatCenterX * currentZoom + currentPan.x;
          const seatScreenY = seatCenterY * currentZoom + currentPan.y;
          const centerX = vp.width / 2;
          const centerY = vp.height / 2;
          const safeZoneX = vp.width * AUTO_FOCUS_SAFE_ZONE_RATIO;
          const safeZoneY = vp.height * AUTO_FOCUS_SAFE_ZONE_RATIO;
          const insideSafeZone =
            Math.abs(seatScreenX - centerX) <= safeZoneX && Math.abs(seatScreenY - centerY) <= safeZoneY;
          if (insideSafeZone && currentZoom >= ZOOM_THRESHOLD_FOR_AUTO_ZOOM) return;
          if (currentZoom < ZOOM_THRESHOLD_FOR_AUTO_ZOOM) {
            handleZoomToPoint(seatCenterX, seatCenterY, SEAT_ZOOM_LEVEL);
          } else {
            handleZoomToPoint(seatCenterX, seatCenterY, currentZoom);
          }
        }
      }
    },
    [sections, layoutData, viewportSize, onSeatClick, handleZoomToPoint, gridState]
  );

  const setContainerRef = useCallback((node) => {
    containerRef.current = node;
    setContainerReady((prev) => (node ? true : prev));
  }, []);

  const handleResetViewClick = useCallback(() => {
    const vp = viewportSize || { width: 100, height: 100 };
    gridState.handleResetView(vp);
  }, [viewportSize, gridState]);

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

  const stageSx = stage ? (stage.x || 0) - layoutData.bounds.minX : 0;
  const stageSy = stage ? (stage.y || 0) - layoutData.bounds.minY : 0;
  const stageW = stage ? (stage.width || 800) : 0;
  const stageH = stage ? (stage.height || 50) : 0;

  return (
    <div
      ref={setContainerRef}
      onPointerDown={gestureHandlers.handlePointerDown}
      className="custom-dark-bg rounded-3 overflow-hidden position-relative user-select-none w-100"
      style={{
        minHeight: IS_MOBILE ? '65vh' : 490,
        cursor: gridState.isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      {/* Layout layer: uses full viewport; pan/zoom applied here */}
      <div
        className="position-absolute user-select-none"
        style={{
          left: 0,
          top: 0,
          width: layoutData.bounds.width,
          height: layoutData.bounds.height,
          opacity: gridState.hasInitialViewApplied ? 1 : 0,
          transformOrigin: '0 0',
          transform: `translate3d(${gridState.pan.x}px, ${gridState.pan.y}px, 0) scale(${gridState.zoom})`,
          willChange: 'transform',
          transition:
            !gridState.hasInitialViewApplied || gridState.disableTransformTransition
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
        {layoutData.visibleSections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClickWithZoom}
            onStandingSectionClick={onStandingSectionClick}
            bounds={layoutData.bounds}
            seatDisplayCoords={layoutData.seatDisplayCoords}
            isMobile={isMobile}
            allowTooltipHover={allowTooltipHover}
          />
        ))}
      </div>

      {/* Legend: bottom center (commented out for optional use) */}
      {/* <Legend hasInitialViewApplied={gridState.hasInitialViewApplied} /> */}

      {/* Zoom Controls + Reset: bottom-right */}
      <ZoomControls
        hasInitialViewApplied={gridState.hasInitialViewApplied}
        onZoomIn={gridState.handleZoomIn}
        onZoomOut={gridState.handleZoomOut}
        onResetView={handleResetViewClick}
      />
    </div>
  );
};

export default SeatingGrid;
