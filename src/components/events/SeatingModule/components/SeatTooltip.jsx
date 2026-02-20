import React from 'react';
import { THEME } from './constants';

const SeatTooltip = ({ hoveredSeat, dimensions }) => {
    if (!hoveredSeat) return null;

    return (
        <div
            className="booking-tooltip card-glassmorphism p-2 rounded-3"
            style={{
                top: Math.max(10, hoveredSeat.y - 100),
                left: Math.min(
                    Math.max(10, hoveredSeat.x - 30),
                    dimensions.width - 100
                ),
            }}
        >
            <div>
                <strong>
                    {hoveredSeat.rowTitle}{hoveredSeat.seat.number}
                </strong>

                {hoveredSeat.seat.ticket && (
                    <>
                        <br />
                        <span style={{ fontSize: 12, opacity: 0.8 }}>
                            {hoveredSeat.seat.ticket.name}
                        </span>
                        <br />
                        <strong style={{ color: THEME.primary }}>
                            ₹{hoveredSeat.seat.ticket.price}
                        </strong>
                    </>
                )}
            </div>
        </div>
    );
};

export default SeatTooltip;
