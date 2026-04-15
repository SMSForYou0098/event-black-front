import React, { useMemo } from 'react';
import SeatButton from './SeatButton';

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
  const sx = (Number(section.x) || 0) - bounds.minX;
  const sy = (Number(section.y) || 0) - bounds.minY;
  const sw = Number(section.width) || 600;
  const sh = Number(section.height) || 250;

  const isStanding = section.type === 'Standing';
  const rows = section.rows || [];

  // For standing sections, build the ticket from seatStatusMap (full data) merged with section.ticket (selection_limit)
  const standingTicket = useMemo(() => {
    if (!isStanding) return null;
    const seatStatusTickets = Object.values(section.seatStatusMap || {});
    const ticketCatId = section.ticketCategory;
    const fullTicket = ticketCatId
      ? seatStatusTickets.find(t => String(t.id) === String(ticketCatId))
      : seatStatusTickets[0];
    if (!fullTicket) return section.ticket || null;
    return {
      ...fullTicket,
      selection_limit: section.ticket?.selection_limit || fullTicket.selection_limit,
    };
  }, [isStanding, section]);

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
            border: '2px dashed rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.03)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        className="position-absolute text-white fw-bold text-center user-select-none"
        style={{
          left: 0,
          top: isStanding ? sh / 2 - 20 : 0,
          width: sw,
          fontSize: 24,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {section.name || 'Section'}
        {isStanding && standingTicket && (
          <div className="small fw-normal opacity-75 mt-1">
            ₹{standingTicket.price} • {standingTicket.remaining_count > 0 ? 'Available' : 'Sold Out'}
          </div>
        )}
      </div>

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
              if (standingTicket.sold_out || !standingTicket.status) return;
              onStandingSectionClick?.(section, standingTicket);
            }}
            disabled={standingTicket.sold_out || !standingTicket.status}
            style={{
              cursor: (standingTicket.sold_out || !standingTicket.status) ? 'not-allowed' : 'pointer',
              borderRadius: 8,
              transition: 'all 0.2s',
              background: 'transparent'
            }}
          />
        </div>
      ) : (
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
