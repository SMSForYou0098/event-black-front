import React, { useMemo } from 'react';
import SeatButton from './SeatButton';
import { getBackgroundWithOpacity } from '@/components/setting/elements/getBackgroundWithOpacity';

/**
 * Gap placeholder component for visual spacing between seats.
 */
function GapPlaceholder({ seat, radius, layoutX, layoutY }) {
  const size = Math.max(28, (Number(radius) || 12) * 2);
  const x = layoutX !== undefined ? layoutX : (Number(seat.x) || 0);
  const y = layoutY !== undefined ? layoutY : (Number(seat.y) || 0);
  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
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

/**
 * Section block containing seats or standing area.
 * Memoized to prevent re-renders.
 */
const SectionBlock = React.memo(function SectionBlock({
  section,
  selectedSeatIds,
  onSeatClick,
  onStandingSectionClick,
  bounds,
  seatDisplayCoords,
  isMobile,
  allowTooltipHover,
}) {
  // Calculate section position and dimensions
  const sx = (Number(section.x) || 0) - bounds.minX;
  const sy = (Number(section.y) || 0) - bounds.minY;
  const sw = Number(section.width) || 600;
  const sh = Number(section.height) || 250;

  // Check if section is standing or seating
  const isStanding = section.type?.toLowerCase() === 'standing';
  const rows = section.rows || [];

  // For standing sections, build the ticket from seatStatusMap (full data) merged with section.ticket (selection_limit)
  const standingTicket = useMemo(() => {
    if (!isStanding) return null;
    const seatStatusTickets = Object.values(section.seatStatusMap || {});
    const ticketCatId = section.ticketCategory;

    let fullTicket = null;
    if (ticketCatId) {
      fullTicket = seatStatusTickets.find(t => String(t.id) === String(ticketCatId));
    } else if (section.ticket && section.ticket.id) {
      fullTicket = seatStatusTickets.find(t => String(t.id) === String(section.ticket.id));
    }

    if (!fullTicket) {
      fullTicket = section.ticket;
    }

    if (!fullTicket) return null;

    return {
      ...fullTicket,
      selection_limit: section.ticket?.selection_limit || fullTicket.selection_limit,
    };
  }, [isStanding, section]);

  // For standing section styling
  const standingStyle = useMemo(() => {
    if (!isStanding) return null;
    if (section.status === 'disabled' || !standingTicket) {
      return {
        background: '#1f2937',
        border: '1px solid rgba(255,255,255,0.1)',
        textColor: 'rgba(255,255,255,0.8)',
      };
    }
    const color = section.color || 'rgba(255,255,255,0.2)';
    const textColor = section.color || '#ffffff';
    return {
      background: section.color ? getBackgroundWithOpacity(section.color, 0.12) : 'rgba(255,255,255,0.03)',
      border: `2px dashed ${color}`,
      textColor: textColor,
    };
  }, [isStanding, section.status, section.color, standingTicket]);

  return (
    <div
      className="position-absolute user-select-none"
      style={{
        left: sx,
        top: sy,
        width: sw,
        height: sh,
        pointerEvents: 'none',
      }}
    >
      {/* Background for Standing section to make it distinct */}
      {isStanding && (
        <div
          className="position-absolute rounded-3"
          style={{
            inset: 0,
            border: standingStyle.border,
            background: standingStyle.background,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Section name and price */}
      <div
        className="position-absolute fw-bold text-center user-select-none"
        style={{
          left: 0,
          top: isStanding ? sh / 2 - 20 : 0,
          width: sw,
          fontSize: 24,
          pointerEvents: 'none',
          zIndex: 2,
          color: isStanding ? standingStyle.textColor : '#ffffff',
        }}
      >
        {section.name || ''}
        {isStanding && standingTicket && section.status !== 'disabled' && (
          <div className="small fw-normal mt-1" style={{ opacity: section.status === 'disabled' ? 0.3 : 0.75 }}>
            ₹{standingTicket.price} • {standingTicket.remaining_count > 0 ? 'Available' : 'Sold Out'}
          </div>
        )}
      </div>

      {/* For standing section interactive area */}
      {isStanding && standingTicket ? (
        <div
          className="position-absolute"
          style={{
            left: 0,
            top: 0,
            width: sw,
            height: sh,
            pointerEvents: 'auto',
          }}
        >
          {/* Standing section — open quantity picker on click */}
          <button
            type="button"
            className="w-100 h-100 border-0 bg-transparent p-0"
            onClick={(e) => {
              e.stopPropagation();
              if (section.status === 'disabled' || standingTicket.sold_out || !standingTicket.status) return;
              onStandingSectionClick?.(section, standingTicket);
            }}
            disabled={section.status === 'disabled' || standingTicket.sold_out || !standingTicket.status}
            style={{
              cursor: (section.status === 'disabled' || standingTicket.sold_out || !standingTicket.status) ? 'not-allowed' : 'pointer',
              borderRadius: 8,
              transition: 'all 0.2s',
              background: 'transparent'
            }}
          />
        </div>
      ) : (
        // For seating section (individual seats)
        rows.flatMap((row) =>
          (row.seats || []).map((seat) => {
            if (seat.type === 'blank') {
              const disp = seatDisplayCoords?.get(seat.id);
              const lx = disp ? disp.x : undefined;
              const ly = disp ? disp.y : undefined;
              return (
                <div key={seat.id} className="position-absolute" style={{ left: 0, top: 0, pointerEvents: 'none' }}>
                  <GapPlaceholder seat={seat} radius={seat.radius} layoutX={lx} layoutY={ly} />
                </div>
              );
            }
            const isSelected = selectedSeatIds.has(seat.id);
            const disabled =
              seat.status === 'booked' ||
              seat.status === 'reserved' ||
              seat.status === 'disabled' ||
              seat.status === 'hold' ||
              seat.status === 'locked' ||
              !seat.ticket;
            const disp = seatDisplayCoords?.get(seat.id);
            const lx = disp ? disp.x : undefined;
            const ly = disp ? disp.y : undefined;

            return (
              <div key={seat.id} className="position-absolute" style={{ left: 0, top: 0, pointerEvents: 'auto' }}>
                <SeatButton
                  seat={seat}
                  sectionId={section.id}
                  rowId={row.id}
                  rowTitle={row.title || ''}
                  isSelected={isSelected}
                  onClick={onSeatClick}
                  disabled={disabled}
                  radius={seat.radius}
                  layoutX={lx}
                  layoutY={ly}
                  isMobile={isMobile}
                  allowTooltipHover={allowTooltipHover}
                />
              </div>
            );
          })
        )
      )}
    </div>
  );
});

export default SectionBlock;
