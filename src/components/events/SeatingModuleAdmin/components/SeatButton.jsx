import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { PRIMARY } from '@/utils/consts';
import { getSeatStyle } from './utils/seatingGridUtils';

/**
 * Individual seat button component.
 * Memoized to prevent re-renders when parent updates.
 */
const SeatButton = React.memo(function SeatButton({
  seat,
  sectionId,
  rowId,
  rowTitle,
  isSelected,
  onClick,
  disabled,
  radius,
  layoutX,
  layoutY,
  isMobile,
  allowTooltipHover,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipHover, setTooltipHover] = useState(false);
  const showDelayRef = useRef(null);
  const style = getSeatStyle(seat, isSelected);
  const size = Math.max(28, (Number(radius) || 12) * 2);
  const seatLabel = seat.label ?? seat.number;
  const rowPrefix = String(rowTitle ?? '').trim();
  const seatText = String(seatLabel ?? '').trim();
  const shouldPrefixRow =
    Boolean(rowPrefix) && Boolean(seatText) && !seatText.toUpperCase().startsWith(rowPrefix.toUpperCase());
  const seatDisplayName = `${shouldPrefixRow ? rowPrefix : ''}${seatText}`;
  const cx = layoutX !== undefined ? layoutX : (Number(seat.x) || 0);
  const cy = layoutY !== undefined ? layoutY : (Number(seat.y) || 0);
  const left = cx - size / 2;
  const top = cy - size / 2;

  const handleMouseEnter = () => {
    if (isMobile) return;
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
  const handleTooltipMouseEnter = () => {
    if (!allowTooltipHover) return;
    setTooltipHover(true);
  };
  const handleTooltipMouseLeave = () => {
    setTooltipHover(false);
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onClick(seat, sectionId, rowId);
  };

  const visible = !isMobile && (showTooltip || (allowTooltipHover && tooltipHover));
  const statusText = seat.status;
  const statusClass =
    statusText === 'available'
      ? 'text-success'
      : statusText === 'reserved'
        ? 'text-warning'
        : 'text-white-50';

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
        aria-label={
          seat.status === 'hold' || seat.status === 'locked'
            ? `Seat ${seatDisplayName}, on hold`
            : `Seat ${seatDisplayName}${isSelected ? ' selected' : ''}`
        }
      >
        {seat.status === 'booked' ? (
          '✕'
        ) : seat.status === 'hold' || seat.status === 'locked' ? (
          <Clock
            size={Math.max(14, Math.round(size * 0.52))}
            strokeWidth={2.5}
            aria-hidden
            className="shrink-0"
          />
        ) : (
          seatLabel
        )}
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
          <div className="fw-bold mb-1">Seat {seatDisplayName}</div>
          {seat.ticket ? (
            <>
              <div className="text-white-50">{seat.ticket.name}</div>
              <div className="mt-1" style={{ color: PRIMARY }}>₹{seat.ticket.price}</div>
            </>
          ) : (
            <div className="text-secondary">Unavailable</div>
          )}
          <div className={`small mt-1 ${statusClass}`}>{statusText}</div>
        </div>
      )}
    </div>
  );
});

export default SeatButton;
