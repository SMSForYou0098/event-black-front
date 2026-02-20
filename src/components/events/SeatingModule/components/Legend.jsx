import React from 'react';
import { THEME, SEAT_COLORS } from './constants';

const Legend = () => {
    const legendItems = [
        { color: SEAT_COLORS.available, label: 'Available' },
        { color: SEAT_COLORS.selected, label: 'Selected' },
        { color: SEAT_COLORS.hold, label: 'Locked' },
        { color: SEAT_COLORS.booked, label: 'Booked' },
    ];

    return (
        <div className="booking-legend">
            {legendItems.map((item) => (
                <div key={item.label} className="booking-legend-item">
                    <div
                        className="booking-legend-color"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="booking-legend-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default Legend;
