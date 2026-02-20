import React, { memo } from 'react';
import { Group, Text } from 'react-konva';
import { THEME } from './constants';
import Row from './Row';

const Section = memo(({ section, selectedSeatIds, onSeatClick, onSeatHover, onSeatLeave, currentUserId, canvasScale }) => {
    return (
        <Group x={section.x} y={section.y}>
            <Text
                x={0}
                y={12}
                width={section.width}
                text={section.name}
                fontSize={14}
                fill={THEME.textPrimary}
                fontStyle="bold"
                align="center"
                listening={false}
                perfectDrawEnabled={false}
            />

            {section.rows.map(row => (
                <Row
                    key={row.id}
                    row={row}
                    selectedSeatIds={selectedSeatIds}
                    onSeatClick={onSeatClick}
                    onSeatHover={onSeatHover}
                    onSeatLeave={onSeatLeave}
                    sectionId={section.id}
                    currentUserId={currentUserId}
                    canvasScale={canvasScale}
                />
            ))}
        </Group>
    );
}, (prevProps, nextProps) => {
    if (prevProps.section !== nextProps.section) return false;
    if (prevProps.canvasScale !== nextProps.canvasScale) return false;

    if (prevProps.selectedSeatIds === nextProps.selectedSeatIds) return true;

    for (const row of prevProps.section.rows) {
        for (const seat of row.seats) {
            if (prevProps.selectedSeatIds.has(seat.id) !== nextProps.selectedSeatIds.has(seat.id)) {
                return false;
            }
        }
    }
    return true;
});

Section.displayName = 'Section';

export default Section;
