import React, { memo } from 'react';
import { Group, Text } from 'react-konva';
import { THEME } from './constants';
import Seat from './Seat';

const Row = memo(({ row, selectedSeatIds, onSeatClick, onSeatHover, onSeatLeave, sectionId, currentUserId, canvasScale }) => {
    if (!row.seats || row.seats.length === 0) return null;

    const firstSeatY = row.seats[0]?.y ?? 50;

    return (
        <Group>
            <Text
                x={10}
                y={firstSeatY - 5}
                text={row.title}
                fontSize={13}
                fill={THEME.textSecondary}
                fontStyle="600"
                listening={false}
                perfectDrawEnabled={false}
            />

            {row.seats.map((seat, index) => {
                if (!seat || typeof seat.x !== 'number' || typeof seat.y !== 'number') {
                    return null;
                }

                return (
                    <Seat
                        key={`${sectionId}-${row.id}-${seat.id}-${index}`}
                        seat={seat}
                        isSelected={selectedSeatIds.has(seat.id)}
                        onClick={onSeatClick}
                        onHover={onSeatHover}
                        onLeave={onSeatLeave}
                        sectionId={sectionId}
                        rowId={row.id}
                        rowTitle={row.title}
                        currentUserId={currentUserId}
                        canvasScale={canvasScale}
                    />
                );
            })}
        </Group>
    );
}, (prevProps, nextProps) => {
    if (prevProps.row !== nextProps.row) return false;
    if (prevProps.canvasScale !== nextProps.canvasScale) return false;

    const prevHasSelected = prevProps.row.seats.some(s => prevProps.selectedSeatIds.has(s.id));
    const nextHasSelected = nextProps.row.seats.some(s => nextProps.selectedSeatIds.has(s.id));

    if (prevHasSelected !== nextHasSelected) return false;
    if (prevProps.selectedSeatIds !== nextProps.selectedSeatIds) {
        for (const seat of prevProps.row.seats) {
            if (prevProps.selectedSeatIds.has(seat.id) !== nextProps.selectedSeatIds.has(seat.id)) {
                return false;
            }
        }
    }

    return true;
});

Row.displayName = 'Row';

export default Row;
