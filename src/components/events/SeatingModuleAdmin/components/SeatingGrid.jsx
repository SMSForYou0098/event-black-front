'use client';

import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, LayoutGrid } from 'lucide-react';
import { PRIMARY } from '@/utils/consts';
import { IS_MOBILE } from '@/components/events/SeatingModule/components/constants';
import { useMyContext } from '@/Context/MyContextProvider';

/**
 * HTML/CSS seating chart using same coordinates as admin canvas (API: x, y, width, height, radius).
 * Sections appear at section.x, section.y (side-by-side etc. as in canvas).
 * Seats at seat.x, seat.y inside each section. Zoom + pan for large halls.
 */
const SEAT_STYLES = {
  available: {
    background: 'transparent',
    border: `2px solid ${PRIMARY}`,
    color: '#fff',
    cursor: 'pointer',
  },
  selected: {
    background: PRIMARY,
    border: `2px solid ${PRIMARY}`,
    color: '#fff',
    cursor: 'pointer',
  },
  booked: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'not-allowed',
  },
  disabled: {
    background: '#1f2937',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
  },
  noTicket: {
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.25)',
    cursor: 'not-allowed',
  },
};

function getSeatStyle(seat, isSelected) {
  if (!seat.ticket) return SEAT_STYLES.noTicket;
  if (seat.status === 'booked') return SEAT_STYLES.booked;
  if (seat.status === 'disabled') return SEAT_STYLES.disabled;
  if (seat.status === 'hold' || seat.status === 'locked') return SEAT_STYLES.booked;
  if (isSelected || seat.status === 'selected') return SEAT_STYLES.selected;
  return SEAT_STYLES.available;
}

function getLayoutBounds(stage, sections) {
  if (!sections || sections.length === 0) {
    const w = stage ? stage.width + (stage.x || 0) : 1000;
    const h = stage ? stage.height + (stage.y || 0) : 600;
    return { minX: 0, minY: 0, width: w, height: h };
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  if (stage) {
    minX = Math.min(minX, stage.x, (stage.x || 0) + (stage.width || 800));
    minY = Math.min(minY, stage.y, (stage.y || 0) + (stage.height || 50));
    maxX = Math.max(maxX, stage.x, (stage.x || 0) + (stage.width || 800));
    maxY = Math.max(maxY, stage.y, (stage.y || 0) + (stage.height || 50));
  }
  sections.forEach((s) => {
    const sx = Number(s.x) || 0, sy = Number(s.y) || 0;
    const sw = Number(s.width) || 600, sh = Number(s.height) || 250;
    minX = Math.min(minX, sx);
    minY = Math.min(minY, sy);
    maxX = Math.max(maxX, sx + sw);
    maxY = Math.max(maxY, sy + sh);
  });
  if (minX === Infinity) minX = 0;
  if (minY === Infinity) minY = 0;
  if (maxX === -Infinity) maxX = 1000;
  if (maxY === -Infinity) maxY = 600;
  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/** Renders a visual gap between seats (type: "blank") — dashed outline, no number, non-interactive. */
function GapPlaceholder({ seat, radius }) {
  const size = Math.max(28, (Number(radius) || 12) * 2);
  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        position: 'absolute',
        left: (Number(seat.x) || 0) - size / 2,
        top: (Number(seat.y) || 0) - size / 2,
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: 6,
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    />
  );
}

function SeatButton({ seat, rowTitle, isSelected, onClick, disabled, radius }) {
  const { toTitleCase } = useMyContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipHover, setTooltipHover] = useState(false);
  const showDelayRef = useRef(null);
  const style = getSeatStyle(seat, isSelected);
  const size = Math.max(28, (Number(radius) || 12) * 2);
  const seatLabel = seat.label ?? seat.number;
  const left = (Number(seat.x) || 0) - size / 2;
  const top = (Number(seat.y) || 0) - size / 2;

  const handleMouseEnter = () => {
    showDelayRef.current = window.setTimeout(() => setShowTooltip(true), 400);
  };
  const handleMouseLeave = () => {
    if (showDelayRef.current) {
      clearTimeout(showDelayRef.current);
      showDelayRef.current = null;
    }
    setShowTooltip(false);
    setTooltipHover(false);
  };
  const handleTooltipMouseEnter = () => setTooltipHover(true);
  const handleTooltipMouseLeave = () => {
    setTooltipHover(false);
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onClick(seat, seat.sectionId, seat.rowId);
  };

  const visible = showTooltip || tooltipHover;

  // const statusText = seat.status === 'booked' ? 'Booked' : isSelected ? 'Selected' : 'Available';
  // const statusText = toTitleCase(seat.status);
  const statusText = (seat.status);

  return (
    <div
      style={{ position: 'absolute', left, top, width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="d-flex align-items-center justify-content-center p-0 user-select-none"
        onClick={handleClick}
        disabled={disabled}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: 6,
          fontSize: Math.max(9, size * 0.36),
          fontWeight: 600,
          lineHeight: 1,
          textAlign: 'center',
          ...style,
        }}
        aria-pressed={isSelected}
        aria-label={`Seat ${rowTitle}${seatLabel}${isSelected ? ' selected' : ''}`}
      >
        {seat.status === 'booked' ? '✕' : seatLabel}
      </button>
      {visible && (seat.ticket || seat.status === 'booked') && (
        <div
          role="tooltip"
          className="position-absolute small text-white rounded p-2 px-3 text-nowrap border shadow"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            left: '50%',
            bottom: '100%',
            transform: 'translateX(-50%) translateY(-8px)',
            background: 'rgba(20,20,20,0.95)',
            borderColor: 'rgba(255,255,255,0.12)',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <div className="fw-bold mb-1">Seat {rowTitle}{seatLabel}</div>
          {seat.ticket ? (
            <>
              <div className="text-white-50">{seat.ticket.name}</div>
              <div className="mt-1" style={{ color: PRIMARY }}>₹{seat.ticket.price}</div>
            </>
          ) : (
            <div className="text-secondary">Unavailable</div>
          )}
          <div className={`small mt-1 ${statusText === 'Available' ? 'text-success' : 'text-white-50'}`}>
            {statusText}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionBlock({ section, selectedSeatIds, onSeatClick, bounds }) {
  const sx = (Number(section.x) || 0) - bounds.minX;
  const sy = (Number(section.y) || 0) - bounds.minY;
  const sw = Number(section.width) || 600;
  const sh = Number(section.height) || 250;

  return (
    <div
      className="position-absolute user-select-none"
      style={{ left: sx, top: sy, width: sw, height: sh, pointerEvents: 'none' }}
    >
      <div
        className="position-absolute text-white fw-bold text-center user-select-none"
        style={{ left: 0, top: 12, width: sw, fontSize: 14, pointerEvents: 'none' }}
      >
        {section.name || 'Section'}
      </div>
      {(section.rows || []).flatMap((row) =>
        (row.seats || []).map((seat) => {
          if (seat.type === 'blank') {
            return (
              <div key={seat.id} className="position-absolute" style={{ left: 0, top: 0, pointerEvents: 'none' }}>
                <GapPlaceholder seat={seat} radius={seat.radius} />
              </div>
            );
          }
          const seatWithIds = { ...seat, sectionId: section.id, rowId: row.id };
          const isSelected = selectedSeatIds.has(seat.id);
          const disabled =
            seat.status === 'booked' ||
            seat.status === 'disabled' ||
            seat.status === 'hold' ||
            seat.status === 'locked' ||
            !seat.ticket;

          return (
            <div key={seat.id} className="position-absolute" style={{ left: 0, top: 0, pointerEvents: 'auto' }}>
              <SeatButton
                seat={seatWithIds}
                rowTitle={row.title || ''}
                isSelected={isSelected}
                onClick={onSeatClick}
                disabled={disabled}
                radius={seat.radius}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

const STORAGE_KEY_PREFIX = 'seatingView_';
const VIEW_PERSIST_DEBOUNCE_MS = 500;

const SeatingGrid = ({
  sections,
  selectedSeats,
  onSeatClick,
  stage,
  storageKey,
  scrollToSectionId,
  scrollToRowTitle,
}) => {
  const containerRef = useRef(null);
  const [containerReady, setContainerReady] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 400, height: 400 });
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
  const touchStartRef = useRef(null);
  const isPanningRef = useRef(false);
  const DRAG_THRESHOLD_PX = 10;
  const [disableTransformTransition, setDisableTransformTransition] = useState(false);
  const viewPersistTimeoutRef = useRef(null);
  const appliedDeepLinkRef = useRef(false);

  const selectedSeatIds = useMemo(() => {
    const ids = new Set();
    (selectedSeats || []).forEach((ticket) => {
      (ticket.seats || []).forEach((s) => ids.add(s.seat_id));
    });
    return ids;
  }, [selectedSeats]);

  const bounds = useMemo(
    () => getLayoutBounds(stage, sections),
    [stage, sections]
  );

  const boundsRef = useRef(bounds);
  const viewportSizeRef = useRef(viewportSize);
  boundsRef.current = bounds;
  viewportSizeRef.current = viewportSize;

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

  const visibleSections = useMemo(() => {
    if (!sections?.length) return [];
    const pad = 50;
    const left = (-pan.x - pad) / zoom;
    const top = (-pan.y - pad) / zoom;
    const width = (viewportSize.width + pad * 2) / zoom;
    const height = (viewportSize.height + pad * 2) / zoom;
    return sections.filter((s) => {
      const sx = (Number(s.x) || 0) - bounds.minX;
      const sy = (Number(s.y) || 0) - bounds.minY;
      const sw = Number(s.width) || 600;
      const sh = Number(s.height) || 250;
      return !(left > sx + sw || left + width < sx || top > sy + sh || top + height < sy);
    });
  }, [sections, bounds.minX, bounds.minY, pan.x, pan.y, zoom, viewportSize.width, viewportSize.height]);


  useEffect(() => {
    if (!containerRef.current || !sections?.length) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setViewportSize((prev) => {
          const next = { width: Math.max(100, width), height: Math.max(100, height) };
          if (prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });
      }
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setViewportSize({ width: Math.max(100, rect.width), height: Math.max(100, rect.height) });
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

  useEffect(() => {
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const boundsChanged =
      prevBoundsRef.current.width !== bounds.width || prevBoundsRef.current.height !== bounds.height;
    if (boundsChanged) {
      prevBoundsRef.current = { width: bounds.width, height: bounds.height };
      userHasInteractedRef.current = false;
    }
    if (userHasInteractedRef.current) return;
    if (storageKey && typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          if (typeof data.zoom === 'number' && data.pan && typeof data.pan.x === 'number' && typeof data.pan.y === 'number') {
            const z = Math.max(0.2, Math.min(2, data.zoom));
            const restored = clampPan({ x: data.pan.x, y: data.pan.y }, z, bounds, viewportSize);
            setZoom(z);
            setPan(restored);
            userHasInteractedRef.current = true;
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
    setZoom(z);
    setPan(clampPan({ x: px, y: py }, z, bounds, viewportSize));
  }, [bounds, viewportSize, totalSeats, storageKey, clampPan]);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    if (viewPersistTimeoutRef.current) clearTimeout(viewPersistTimeoutRef.current);
    viewPersistTimeoutRef.current = setTimeout(() => {
      viewPersistTimeoutRef.current = null;
      try {
        sessionStorage.setItem(
          STORAGE_KEY_PREFIX + storageKey,
          JSON.stringify({ zoom, pan })
        );
      } catch (_) { }
    }, VIEW_PERSIST_DEBOUNCE_MS);
    return () => {
      if (viewPersistTimeoutRef.current) clearTimeout(viewPersistTimeoutRef.current);
    };
  }, [storageKey, zoom, pan]);

  useEffect(() => {
    if (bounds.width <= 0 || bounds.height <= 0) return;
    setPan((p) => {
      const c = clampPan(p, zoom, bounds, viewportSize);
      if (c.x === p.x && c.y === p.y) return p;
      return c;
    });
  }, [zoom, viewportSize.width, viewportSize.height, bounds.width, bounds.height, clampPan]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2, z * 1.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.2, z / 1.25));
  }, []);

  const handleResetView = useCallback(() => {
    const pad = 40;
    const scaleW = (viewportSize.width - pad * 2) / bounds.width;
    const scaleH = (viewportSize.height - pad * 2) / bounds.height;
    const fitScale = Math.min(scaleW, scaleH);
    const maxZoom = totalSeats <= 40 ? 1.4 : totalSeats <= 80 ? 1.2 : 1;
    const z = Math.max(0.15, Math.min(fitScale, maxZoom));
    const px = (viewportSize.width - bounds.width * z) / 2;
    const py = pad;
    setZoom(z);
    setPan(clampPan({ x: px, y: py }, z, bounds, viewportSize));
  }, [bounds, viewportSize, totalSeats, clampPan]);

  const handleZoomToPoint = useCallback(
    (layoutCenterX, layoutCenterY, zoomLevel) => {
      const z = Math.max(0.9, Math.min(2, zoomLevel));
      const px = viewportSize.width / 2 - layoutCenterX * z;
      const py = viewportSize.height / 2 - layoutCenterY * z;
      setZoom(z);
      setPan(clampPan({ x: px, y: py }, z, bounds, viewportSize));
      userHasInteractedRef.current = true;
    },
    [viewportSize, bounds, clampPan]
  );

  const handleZoomToSection = useCallback(
    (sectionId, rowTitle) => {
      const list = sections || [];
      const byIndex = /^\d+$/.test(String(sectionId)) ? list[parseInt(sectionId, 10)] : null;
      const section = byIndex || list.find((s) => s.id === sectionId || String(s.id) === String(sectionId));
      if (!section || bounds.width <= 0 || bounds.height <= 0) return;
      const sx = (Number(section.x) || 0) - bounds.minX;
      const sy = (Number(section.y) || 0) - bounds.minY;
      const sw = Number(section.width) || 600;
      let centerX = sx + sw / 2;
      let centerY = sy + (Number(section.height) || 250) / 2;
      if (rowTitle && section.rows?.length) {
        const row = section.rows.find((r) => (r.title || '').toUpperCase() === String(rowTitle).toUpperCase());
        if (row?.seats?.length) {
          const first = row.seats[0];
          const last = row.seats[row.seats.length - 1];
          const rx = ((Number(first?.x) || 0) + (Number(last?.x) || 0)) / 2;
          const ry = ((Number(first?.y) || 0) + (Number(last?.y) || 0)) / 2;
          centerX = sx + rx;
          centerY = sy + ry;
        }
      }
      const z = Math.max(0.9, Math.min(2, (viewportSize.width * 0.85) / sw));
      handleZoomToPoint(centerX, centerY, z);
    },
    [sections, bounds, viewportSize, handleZoomToPoint]
  );

  useEffect(() => {
    if (!sections?.length || !scrollToSectionId || appliedDeepLinkRef.current) return;
    if (bounds.width <= 0 || bounds.height <= 0) return;
    appliedDeepLinkRef.current = true;
    handleZoomToSection(scrollToSectionId, scrollToRowTitle || undefined);
  }, [sections?.length, scrollToSectionId, scrollToRowTitle, bounds.width, bounds.height, handleZoomToSection]);

  const ZOOM_THRESHOLD_FOR_AUTO_ZOOM = 0.75;
  const SEAT_ZOOM_LEVEL = 1.15;
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
          const seatCenterX = sx + (Number(seat.x) || 0);
          const seatCenterY = sy + (Number(seat.y) || 0);
          const currentZoom = zoomRef.current;
          if (currentZoom < ZOOM_THRESHOLD_FOR_AUTO_ZOOM) {
            handleZoomToPoint(seatCenterX, seatCenterY, SEAT_ZOOM_LEVEL);
          } else {
            handleZoomToPoint(seatCenterX, seatCenterY, currentZoom);
          }
        }
      }
    },
    [sections, bounds, onSeatClick, handleZoomToPoint]
  );

  const onPointerDown = useCallback(
    (e) => {
      if (e.target.closest('button')) return;
      if (e.pointerType === 'touch') return;
      userHasInteractedRef.current = true;
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
          setPan((p) => {
            const next = { x: p.x + dx, y: p.y + dy };
            const container = containerRef.current;
            const v = container ? (() => { const r = container.getBoundingClientRect(); return { width: Math.max(100, r.width), height: Math.max(100, r.height) }; })() : viewportSizeRef.current;
            return clampPan(next, zoomRef.current, boundsRef.current, v);
          });
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
        pendingPinchRef.current = null;
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
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setPan((p) => {
        const next = { x: p.x + dx, y: p.y + dy };
        const el = containerRef.current;
        const v = el ? (() => { const r = el.getBoundingClientRect(); return { width: Math.max(100, r.width), height: Math.max(100, r.height) }; })() : viewportSizeRef.current;
        return clampPan(next, zoomRef.current, boundsRef.current, v);
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointerleave', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointerleave', onUp);
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
    <motion.div
      ref={setContainerRef}
      onPointerDown={onPointerDown}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
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
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: disableTransformTransition
            ? 'none'
            : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
            bounds={bounds}
          />
        ))}
      </div>

      {/* Legend + Go to section: bottom center on desktop, bottom-left on mobile */}
      <div
        className="d-flex flex-wrap gap-3 align-items-center p-2 px-2 rounded-3 small text-white user-select-none"
        style={{
          ...overlayStyle,
          width: '240px',
          bottom: 10,
          left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.65)',
          fontSize: '12px',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span className="d-flex align-items-center gap-1">
          <span className="rounded" style={{ width: 12, height: 12, ...SEAT_STYLES.available }} />
          Available
        </span>
        <span className="d-flex align-items-center gap-1">
          <span className="rounded" style={{ width: 12, height: 12, ...SEAT_STYLES.selected }} />
          Selected
        </span>
        <span className="d-flex align-items-center gap-1">
          <span className="rounded" style={{ width: 12, height: 12, ...SEAT_STYLES.booked }} />
          Booked
        </span>
        {/* {sections.length > 1 && (
          <select
            className="form-select form-select-sm text-white border-secondary ms-2 small"
            style={{ width: 'auto', fontSize: '0.7rem', backgroundColor: 'transparent' }}
            aria-label="Go to section"
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                handleZoomToSection(v);
                e.target.value = '';
              }
            }}
          >
            <option value="">Go to section…</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.id}</option>
            ))}
          </select>
        )} */}
      </div>

      {/* Zoom / Reset: floating bottom-right */}
      <div
        className="d-flex flex-column gap-2 align-items-center p-2 rounded-3 user-select-none"
        style={{
          ...overlayStyle,
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
    </motion.div>
  );
};

export default SeatingGrid;
