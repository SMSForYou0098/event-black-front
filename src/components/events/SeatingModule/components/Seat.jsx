import React, { useState, useEffect, useCallback, memo } from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import { Image as KonvaImage } from 'react-konva';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaClock } from 'react-icons/fa';
import { THEME, SEAT_COLORS, IS_MOBILE } from './constants';
import { createIconImage, getSeatColor } from './utils';

const Seat = memo(({
    seat,
    isSelected,
    onClick,
    onHover,
    onLeave,
    sectionId,
    rowId,
    rowTitle,
    currentUserId,
    canvasScale = 1
}) => {
    const [iconImage, setIconImage] = useState(null);
    const [clockIconImage, setClockIconImage] = useState(null);

    const hasTicket = !!seat.ticket;
    const isDisabled = seat.status === 'disabled' || !hasTicket;
    const isBooked = seat.status === 'booked';
    const isHold = seat.status === 'hold' || seat.status === 'locked';
    // Allow clicking if seat is held by current user
    const isOwnHold = isHold && currentUserId && String(seat.hold_by) === String(currentUserId);
    const isClickable = !isDisabled && !isBooked && (!isHold || isOwnHold);
    const seatColor = getSeatColor(seat, isSelected);
    const seatOpacity = isDisabled ? 0.3 : 1;

    useEffect(() => {
        if (seat.icon) {
            createIconImage(seat.icon, Math.floor(seat.radius * 1.2)).then(img => {
                if (img) setIconImage(img);
            });
        }
    }, [seat.icon, seat.radius]);

    // Create clock icon for hold/locked status (only for other users' holds)
    useEffect(() => {
        if (isHold && !isOwnHold) {
            try {
                const svgString = renderToStaticMarkup(
                    <FaClock size={Math.floor(seat.radius * 1.2)} color="#ffffff" />
                );
                const img = new window.Image();
                img.onload = () => {
                    setClockIconImage(img);
                };
                img.onerror = (err) => {
                    console.error('Failed to load clock icon:', err);
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
            } catch (error) {
                console.error('Error creating clock icon:', error);
            }
        } else {
            setClockIconImage(null);
        }
    }, [isHold, isOwnHold, seat.radius]);

    const handleInteraction = useCallback((e) => {
        if (!isClickable) return;

        try {
            const targetNode = e.target;
            const stage = targetNode?.getStage?.();
            const pointerPos = stage?.getPointerPosition?.();

            // Extra safety on mobile: only allow click if this seat
            // is actually the top-most shape under the pointer.
            if (stage && pointerPos) {
                const topShape = stage.getIntersection(pointerPos);
                if (topShape && topShape !== targetNode) {
                    return;
                }
            }
        } catch (err) {
            // If anything goes wrong in hit-testing, just fall back to normal behavior
        }

        e.cancelBubble = true;
        onClick(seat, sectionId, rowId);
    }, [isClickable, onClick, seat, sectionId, rowId]);

    const x = seat.x;
    const y = seat.y;
    const radius = seat.radius;

    if (seat.type === 'blank') {
        return (
            <Group x={x} y={y}>
                <Rect
                    x={-radius}
                    y={-radius}
                    width={radius * 2}
                    height={radius * 2}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth={1}
                    dash={[3, 3]}
                    cornerRadius={4}
                    listening={false}
                    opacity={0.3}
                    perfectDrawEnabled={false}
                />
            </Group>
        );
    }

    const isAvailable = hasTicket && seat.status !== 'booked' && seat.status !== 'disabled' && (!isHold || isOwnHold) && !isSelected;
    const seatFill = isAvailable ? 'transparent' : seatColor;
    const seatStroke = isAvailable || isSelected ? SEAT_COLORS.available : ((isHold && !isOwnHold) ? SEAT_COLORS.hold : 'transparent');
    const strokeWidth = isAvailable || isSelected || (isHold && !isOwnHold) ? 1 : 0;

    return (
        <Group x={x} y={y} opacity={seatOpacity}>
            <Rect
                x={-radius}
                y={-radius}
                width={radius * 2}
                height={radius * 2}
                fill={seatFill}
                cornerRadius={4}
                stroke={seatStroke}
                strokeWidth={strokeWidth}
                shadowColor={isSelected ? SEAT_COLORS.selected : 'transparent'}
                shadowBlur={isSelected ? 8 : 0}
                shadowOpacity={0.6}
                onClick={handleInteraction}
                onTap={handleInteraction}
                listening={true}
                perfectDrawEnabled={false}
                shadowForStrokeEnabled={false}
                hitStrokeWidth={0}
                onMouseEnter={(e) => {
                    const container = e.target.getStage().container();
                    if (isClickable) {
                        container.style.cursor = 'pointer';
                    } else if (isDisabled || isBooked || isHold) {
                        container.style.cursor = 'not-allowed';
                    }
                    if (onHover) {
                        onHover(seat, rowTitle, e.evt.clientX, e.evt.clientY);
                    }
                }}
                onMouseLeave={(e) => {
                    const container = e.target.getStage().container();
                    container.style.cursor = 'default';
                    if (onLeave) onLeave();
                }}
            />

            {!isBooked && (!isHold || isOwnHold) && (
                iconImage ? (
                    <KonvaImage
                        image={iconImage}
                        x={-radius * 0.6}
                        y={-radius * 0.6}
                        width={radius * 1.2}
                        height={radius * 1.2}
                        listening={false}
                        perfectDrawEnabled={false}
                    />
                ) : (
                    <Text
                        x={-radius}
                        y={-radius}
                        width={radius * 2}
                        height={radius * 2}
                        text={String(seat.number)}
                        fontSize={Math.max(9, Math.min(11, radius * 0.8))}
                        fill={THEME.textPrimary}
                        align="center"
                        verticalAlign="middle"
                        listening={false}
                        perfectDrawEnabled={false}
                    />
                )
            )}

            {isBooked && (
                <Text
                    x={-radius}
                    y={-radius * 0.8}
                    width={radius * 2}
                    height={radius * 2}
                    text="✕"
                    fontSize={radius * 1.2}
                    fill={THEME.errorColor}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                    perfectDrawEnabled={false}
                />
            )}

            {isHold && !isOwnHold && (
                clockIconImage ? (
                    <KonvaImage
                        image={clockIconImage}
                        x={-radius * 0.6}
                        y={-radius * 0.6}
                        width={radius * 1.2}
                        height={radius * 1.2}
                        listening={false}
                        perfectDrawEnabled={false}
                    />
                ) : (
                    <Text
                        x={-radius}
                        y={-radius}
                        width={radius * 2}
                        height={radius * 2}
                        text="⏱"
                        fontSize={radius * 1}
                        fill="#ffffff"
                        align="center"
                        verticalAlign="middle"
                        listening={false}
                        perfectDrawEnabled={false}
                    />
                )
            )}

            {isDisabled && !isBooked && (
                <Line
                    points={[-radius * 0.5, -radius * 0.5, radius * 0.5, radius * 0.5]}
                    stroke={THEME.errorColor}
                    strokeWidth={1.5}
                    listening={false}
                    perfectDrawEnabled={false}
                />
            )}
        </Group>
    );
}, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected &&
        prevProps.seat.status === nextProps.seat.status &&
        prevProps.seat.hold_by === nextProps.seat.hold_by &&
        prevProps.seat.x === nextProps.seat.x &&
        prevProps.seat.y === nextProps.seat.y &&
        prevProps.currentUserId === nextProps.currentUserId &&
        prevProps.canvasScale === nextProps.canvasScale;
});

Seat.displayName = 'Seat';

export default Seat;
