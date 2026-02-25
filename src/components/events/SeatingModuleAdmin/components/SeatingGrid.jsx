'use client';

import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { PRIMARY } from '@/utils/consts';
import { IS_MOBILE } from '@/components/events/SeatingModule/components/constants';

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
  const statusText = seat.status === 'booked' ? 'Booked' : isSelected ? 'Selected' : 'Available';

  return (
    <div
      style={{ position: 'absolute', left, top, width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
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
          fontSize: Math.max(10, size * 0.45),
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
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
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '100%',
            transform: 'translateX(-50%) translateY(-8px)',
            whiteSpace: 'nowrap',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(20,20,20,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            fontSize: 12,
            color: '#fff',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Seat {rowTitle}{seatLabel}</div>
          {seat.ticket ? (
            <>
              <div style={{ color: 'rgba(255,255,255,0.85)' }}>{seat.ticket.name}</div>
              <div style={{ color: PRIMARY, marginTop: 2 }}>₹{seat.ticket.price}</div>
            </>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Unavailable</div>
          )}
          <div
            style={{
              fontSize: 11,
              marginTop: 4,
              color:
                statusText === 'Available'
                  ? 'var(--bs-success, #198754)'
                  : 'rgba(255,255,255,0.5)',
            }}
          >
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

  const noSelect = { userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' };

  return (
    <div
      style={{
        position: 'absolute',
        left: sx,
        top: sy,
        width: sw,
        height: sh,
        pointerEvents: 'none',
        ...noSelect,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          width: sw,
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          pointerEvents: 'none',
          ...noSelect,
        }}
      >
        {section.name || 'Section'}
      </div>
      {(section.rows || []).flatMap((row) =>
        (row.seats || []).map((seat) => {
          if (seat.type === 'blank') {
            return (
              <div key={seat.id} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
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
            <div key={seat.id} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'auto' }}>
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

const SeatingGrid = ({ sections, selectedSeats, onSeatClick, stage }) => {
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
    const pad = 40;
    const scaleW = (viewportSize.width - pad * 2) / bounds.width;
    const scaleH = (viewportSize.height - pad * 2) / bounds.height;
    const fitScale = Math.min(scaleW, scaleH);
    const maxZoom = totalSeats <= 40 ? 1.4 : totalSeats <= 80 ? 1.2 : 1;
    const z = Math.max(0.15, Math.min(fitScale, maxZoom));
    const px = (viewportSize.width - bounds.width * z) / 2;
    const py = (viewportSize.height - bounds.height * z) / 2;
    setZoom(z);
    setPan({ x: px, y: py });
  }, [bounds.width, bounds.height, viewportSize.width, viewportSize.height, totalSeats]);

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
    setZoom(z);
    setPan({
      x: (viewportSize.width - bounds.width * z) / 2,
      y: (viewportSize.height - bounds.height * z) / 2,
    });
  }, [bounds.width, bounds.height, viewportSize, totalSeats]);

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
      setPan({ x: newPanX, y: newPanY });
    };
    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  }, [sections?.length, containerReady]);

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
      setZoom(pending.zoom);
      setPan({ x: pending.panX, y: pending.panY });
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
          setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
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
  }, [sections?.length, containerReady]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
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
  }, []);

  if (!sections || sections.length === 0) {
    return (
      <div style={{ padding: 24, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
        No seating layout loaded.
      </div>
    );
  }

  const stageSx = stage ? (stage.x || 0) - bounds.minX : 0;
  const stageSy = stage ? (stage.y || 0) - bounds.minY : 0;
  const stageW = stage ? (stage.width || 800) : 0;
  const stageH = stage ? (stage.height || 50) : 0;

  const noSelectStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };

  const overlayStyle = {
    position: 'absolute',
    pointerEvents: 'auto',
    ...noSelectStyle,
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
      style={{
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        minHeight: IS_MOBILE ? 350 : 490,
        width: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        ...noSelectStyle,
      }}
    >
      {/* Layout layer: uses full viewport; pan/zoom applied here */}
      <div
        style={{
          position: 'absolute',
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
          ...noSelectStyle,
        }}
      >
        {stage && stageW > 0 && (
          <div
            style={{
              position: 'absolute',
              left: stageSx,
              top: stageSy,
              width: stageW,
              height: stageH,
              borderTop: `3px solid ${PRIMARY}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 14,
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: 4,
              ...noSelectStyle,
            }}
          >
            {stage.name || 'SCREEN'}
          </div>
        )}
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={onSeatClick}
            bounds={bounds}
          />
        ))}
      </div>

      {/* Legend: floating bottom-left */}
      <div
        style={{
          ...overlayStyle,
          bottom: 10,
          left: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, ...SEAT_STYLES.available }} />
          Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, ...SEAT_STYLES.selected }} />
          Selected
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, ...SEAT_STYLES.booked }} />
          Booked
        </span>
      </div>

      {/* Zoom / Reset: floating bottom-right */}
      <div
        style={{
          ...overlayStyle,
          bottom: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          padding: 6,
          borderRadius: 10,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: PRIMARY,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ZoomIn size={18} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: PRIMARY,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ZoomOut size={18} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          aria-label="Reset view"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(40,40,40,0.95)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RotateCcw size={18} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};

export default SeatingGrid;
