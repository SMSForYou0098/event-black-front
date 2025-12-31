import React, { useRef, useState, useEffect, useCallback, useMemo, memo, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Path, Line } from 'react-konva';
import { Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { PRIMARY, SECONDARY } from '../../../../utils/consts';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaChair } from 'react-icons/fa';
import { MdOutlineChair, MdOutlineTableBar } from 'react-icons/md';
import { PiArmchairLight, PiChair, PiOfficeChair } from 'react-icons/pi';
import { LuSofa } from 'react-icons/lu';
import { TbSofa } from 'react-icons/tb';
import { GiRoundTable } from 'react-icons/gi';
import { SiTablecheck } from 'react-icons/si';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { FaClock } from 'react-icons/fa';

const THEME = {
    primary: PRIMARY,
    primaryLight: '#ff3333',
    primaryDark: '#8a1010',
    canvasBg: SECONDARY,
    screenGradientStart: '#0a0a0a',
    screenGradientMid: '#1a0505',
    screenGradientEnd: '#0d0d0d',
    textPrimary: '#ffffff',
    textSecondary: '#e5e5e5',
    textMuted: '#9ca3af',
    seatAvailable: PRIMARY,
    seatSelected: PRIMARY,
    seatBooked: 'rgb(255 255 255 / 6%)',
    seatDisabled: '#1f2937',
    seatNoTicket: '#111827',
    buttonBg: 'rgba(181, 21, 21, 0.9)',
    buttonShadow: 'rgba(181, 21, 21, 0.4)',
    buttonSecondaryBg: 'rgba(30, 30, 30, 0.9)',
    hintBg: 'rgba(20, 5, 5, 0.9)',
    hintBorder: 'rgba(181, 21, 21, 0.5)',
    legendBg: SECONDARY,
    errorColor: '#ef4444',
};

const IS_MOBILE = typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const PIXEL_RATIO = typeof window !== 'undefined' ?
    Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 2 : 3) : 1;

Konva.showWarnings = false;
const iconImageCache = new Map();
const iconLoadingPromises = new Map();

const ICON_MAP = {
    'FaChair': FaChair,
    'MdOutlineChair': MdOutlineChair,
    'PiArmchairLight': PiArmchairLight,
    'PiChair': PiChair,
    'PiOfficeChair': PiOfficeChair,
    'LuSofa': LuSofa,
    'TbSofa': TbSofa,
    'GiRoundTable': GiRoundTable,
    'SiTablecheck': SiTablecheck,
    'MdOutlineTableBar': MdOutlineTableBar
};

const createIconImage = (iconName, size, color = '#FFFFFF') => {
    const cacheKey = `${iconName}-${size}-${color}`;

    if (iconImageCache.has(cacheKey)) {
        return Promise.resolve(iconImageCache.get(cacheKey));
    }

    if (iconLoadingPromises.has(cacheKey)) {
        return iconLoadingPromises.get(cacheKey);
    }

    const promise = new Promise((resolve) => {
        try {
            const IconComponent = ICON_MAP[iconName];

            if (!IconComponent) {
                const DefaultIcon = ICON_MAP['FaChair'];
                const svgString = renderToStaticMarkup(
                    <DefaultIcon size={size} color={color} />
                );

                const img = new window.Image();
                img.onload = () => {
                    iconImageCache.set(cacheKey, img);
                    iconLoadingPromises.delete(cacheKey);
                    resolve(img);
                };
                img.onerror = () => {
                    iconLoadingPromises.delete(cacheKey);
                    resolve(null);
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
                return;
            }

            const svgString = renderToStaticMarkup(
                <IconComponent size={size} color={color} />
            );

            const img = new window.Image();
            img.onload = () => {
                iconImageCache.set(cacheKey, img);
                iconLoadingPromises.delete(cacheKey);
                resolve(img);
            };
            img.onerror = () => {
                iconLoadingPromises.delete(cacheKey);
                resolve(null);
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        } catch (error) {
            console.error('Error creating icon image:', error);
            iconLoadingPromises.delete(cacheKey);
            resolve(null);
        }
    });

    iconLoadingPromises.set(cacheKey, promise);
    return promise;
};

const SEAT_COLORS = {
    available: THEME.seatAvailable,
    selected: THEME.seatSelected,
    booked: THEME.seatBooked,
    hold: '#B51515', // Orange for locked/hold seats
    disabled: THEME.seatDisabled,
    noTicket: THEME.seatNoTicket,
};

const getSeatColor = (seat, isSelected) => {
    if (!seat.ticket) return SEAT_COLORS.noTicket;
    if (seat.status === 'booked') return SEAT_COLORS.booked;
    if (seat.status === 'hold' || seat.status === 'locked') return SEAT_COLORS.hold;
    if (seat.status === 'disabled') return SEAT_COLORS.disabled;
    if (isSelected || seat.status === 'selected') return SEAT_COLORS.selected;
    return SEAT_COLORS.available;
};

const Seat = memo(({
    seat,
    isSelected,
    onClick,
    onHover,
    onLeave,
    sectionId,
    rowId,
    rowTitle,
    currentUserId
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
                    // console.log('Clock icon loaded successfully');
                    setClockIconImage(img);
                };
                img.onerror = (err) => {
                    console.error('Failed to load clock icon:', err);
                };
                // Use exact encoding from reference
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
            } catch (error) {
                console.error('Error creating clock icon:', error);
            }
        } else {
            setClockIconImage(null);
        }
    }, [isHold, isOwnHold, seat.radius]);

    const handleInteraction = useCallback((e) => {
        if (isClickable) {
            e.cancelBubble = true;
            onClick(seat, sectionId, rowId);
        }
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
                y={-radius * (IS_MOBILE ? 1.2 : 1)}
                width={radius * 2}
                height={radius * 2 * (IS_MOBILE ? 1.2 : 1)}
                fill={seatFill}
                cornerRadius={4}
                stroke={seatStroke}
                strokeWidth={strokeWidth}
                shadowColor={isSelected ? SEAT_COLORS.selected : 'transparent'}
                shadowBlur={isSelected ? 8 : 0}
                shadowOpacity={0.6}
                onClick={handleInteraction}
                onTap={handleInteraction}
                listening={isClickable}
                perfectDrawEnabled={false}
                shadowForStrokeEnabled={false}
                hitStrokeWidth={IS_MOBILE ? 12 : 4}
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
        prevProps.currentUserId === nextProps.currentUserId;
});

Seat.displayName = 'Seat';

const Row = memo(({ row, selectedSeatIds, onSeatClick, onSeatHover, onSeatLeave, sectionId, currentUserId }) => {
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
                    />
                );
            })}
        </Group>
    );
}, (prevProps, nextProps) => {
    // Check if row reference changed (new data from state update)
    if (prevProps.row !== nextProps.row) return false;

    // Check selected seat changes
    const prevHasSelected = prevProps.row.seats.some(s => prevProps.selectedSeatIds.has(s.id));
    const nextHasSelected = nextProps.row.seats.some(s => nextProps.selectedSeatIds.has(s.id));

    if (prevHasSelected !== nextHasSelected) return false;
    if (prevProps.selectedSeatIds !== nextProps.selectedSeatIds) {
        // Check if any seat in this row changed selection
        for (const seat of prevProps.row.seats) {
            if (prevProps.selectedSeatIds.has(seat.id) !== nextProps.selectedSeatIds.has(seat.id)) {
                return false;
            }
        }
    }

    return true;
});

Row.displayName = 'Row';

const Section = memo(({ section, selectedSeatIds, onSeatClick, onSeatHover, onSeatLeave, currentUserId }) => {
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
                />
            ))}
        </Group>
    );
}, (prevProps, nextProps) => {
    // Always re-render if section reference changed (new data from state update)
    if (prevProps.section !== nextProps.section) return false;

    // Only skip re-render if both section and selectedSeatIds are same reference
    if (prevProps.selectedSeatIds === nextProps.selectedSeatIds) return true;

    // Check if any seat in this section changed selection
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

const StageScreen = memo(({ stage }) => {
    if (!stage) return null;

    const isStraight = stage.shape === 'straight';
    const curveIntensity = stage.curve || 0.12;
    const curveHeight = isStraight ? 0 : stage.width * curveIntensity;

    return (
        <Group x={stage.x} y={stage.y}>
            {isStraight ? (
                <Line
                    points={[0, 0, stage.width, 0]}
                    stroke={THEME.primary}
                    strokeWidth={3}
                    lineCap="round"
                    listening={false}
                    perfectDrawEnabled={false}
                    shadowColor={THEME.primary}
                    shadowBlur={12}
                    shadowOpacity={0.7}
                />
            ) : (
                <Path
                    data={`
                        M 0 ${curveHeight}
                        Q ${stage.width / 2} 0 ${stage.width} ${curveHeight}
                    `}
                    stroke={THEME.primary}
                    strokeWidth={3}
                    fill="transparent"
                    lineCap="round"
                    listening={false}
                    perfectDrawEnabled={false}
                    shadowColor={THEME.primary}
                    shadowBlur={12}
                    shadowOpacity={0.7}
                />
            )}

            <Text
                width={stage.width}
                y={curveHeight + 15}
                text={stage.name || 'SCREEN'}
                fontSize={14}
                fill={THEME.textSecondary}
                fontStyle="500"
                align="center"
                letterSpacing={4}
                listening={false}
                perfectDrawEnabled={false}
            />
        </Group>
    );
});

StageScreen.displayName = 'StageScreen';

const getLayoutBounds = (stage, sections) => {
    if (!stage || !sections || sections.length === 0) {
        return { minX: 0, minY: 0, maxX: 1000, maxY: 600, width: 1000, height: 600 };
    }

    let minX = stage.x;
    let minY = stage.y;
    let maxX = stage.x + stage.width;
    let maxY = stage.y + stage.height;

    sections.forEach(section => {
        minX = Math.min(minX, section.x);
        minY = Math.min(minY, section.y);
        maxX = Math.max(maxX, section.x + section.width);
        maxY = Math.max(maxY, section.y + section.height);
    });

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
};

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCenter = (p1, p2) => {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };
};

// Custom Button Component (no react-bootstrap)
const ZoomButton = ({ onClick, variant = 'primary', children }) => {
    const isPrimary = variant === 'primary';

    return (
        <button
            onClick={onClick}
            className="zoom-control-btn"
            style={{
                width: IS_MOBILE ? 36 : 40,
                height: IS_MOBILE ? 36 : 40,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isPrimary ? THEME.primary : 'rgba(100, 100, 100, 0.9)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
                outline: 'none',
                padding: 0,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
            onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {children}
        </button>
    );
};

const BookingSeatCanvas = ({
    stageRef: externalStageRef,
    canvasScale: externalScale,
    stage,
    sections,
    selectedSeats,
    onSeatClick,
    handleWheel: externalHandleWheel,
    setStagePosition: externalSetStagePosition,
    primaryColor = PRIMARY,
    currentUserId
}) => {
    const internalStageRef = useRef(null);
    const stageRef = externalStageRef || internalStageRef;
    const containerRef = useRef(null);

    const lastCenter = useRef(null);
    const lastDist = useRef(0);
    const dragStopped = useRef(false);
    const hasInitialized = useRef(false);
    const lastTapTime = useRef(0);

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [scale, setScale] = useState(externalScale || 1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isReady, setIsReady] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [hoveredSeat, setHoveredSeat] = useState(null);

    useEffect(() => {
        SEAT_COLORS.available = primaryColor;
    }, [primaryColor]);

    useEffect(() => {
        if (IS_MOBILE && isReady) {
            const timer = setTimeout(() => setShowHint(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [isReady]);

    const selectedSeatIds = useMemo(() => {
        const seatIds = new Set();
        if (selectedSeats?.ticket_id && selectedSeats.seats && Array.isArray(selectedSeats.seats)) {
            selectedSeats.seats.forEach(seat => {
                seatIds.add(seat.seat_id);
            });
        }
        return seatIds;
    }, [selectedSeats]);

    const handleSeatClick = useCallback((seat, sectionId, rowId) => {
        onSeatClick(seat, sectionId, rowId);
    }, [onSeatClick]);

    const handleSeatHover = useCallback((seat, rowTitle, x, y) => {
        let relativeX = x;
        let relativeY = y;

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            relativeX = x - rect.left;
            relativeY = y - rect.top;
        }

        setHoveredSeat({
            seat,
            rowTitle,
            x: relativeX,
            y: relativeY
        });
    }, []);

    const handleSeatLeave = useCallback(() => {
        setHoveredSeat(null);
    }, []);
    // Replace ONLY the useEffect for dimensions with this:

    useEffect(() => {
        const updateDimensions = () => {
            // Use a small delay to ensure container is rendered
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const newWidth = rect.width > 0 ? rect.width : window.innerWidth;
                    const newHeight = rect.height > 0 ? rect.height : window.innerHeight - 200;

                    setDimensions({
                        width: newWidth,
                        height: newHeight
                    });
                }
            });
        };

        // Initial call with delay
        const timer = setTimeout(updateDimensions, 100);

        window.addEventListener('resize', updateDimensions);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const getInitialView = useCallback(() => {
        const bounds = getLayoutBounds(stage, sections);
        const padding = IS_MOBILE ? 40 : 80;

        const scaleX = (dimensions.width - padding * 2) / bounds.width;
        const scaleY = (dimensions.height - padding * 2) / bounds.height;
        const fitScale = Math.min(scaleX, scaleY, IS_MOBILE ? 0.8 : 1);

        const contentCenterX = bounds.minX + bounds.width / 2;
        const centerX = dimensions.width / 2 - contentCenterX * fitScale;
        const centerY = padding - bounds.minY * fitScale;

        return { scale: fitScale, position: { x: centerX, y: centerY } };
    }, [stage, sections, dimensions]);

    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            hasInitialized.current = false;
        }
    }, [stage, dimensions.width, dimensions.height]);
    useLayoutEffect(() => {
        if (!stageRef.current) return;
        if (!stage) return;
        if (!sections || sections.length === 0) return;
        if (hasInitialized.current) return;

        const { scale: fitScale, position: initialPos } = getInitialView();
        setScale(fitScale);
        setPosition(initialPos);

        if (externalSetStagePosition) {
            externalSetStagePosition(initialPos);
        }

        setIsReady(true);
        hasInitialized.current = true;
    }, [stage, sections, dimensions, externalSetStagePosition, getInitialView]);

    const handleWheel = useCallback((e) => {
        e.evt.preventDefault();

        const scaleBy = 1.08;
        const stageInstance = stageRef.current;
        if (!stageInstance) return;

        const oldScale = scale;
        const pointer = stageInstance.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - position.x) / oldScale,
            y: (pointer.y - position.y) / oldScale,
        };

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const clampedScale = Math.max(0.5, Math.min(3, newScale));

        const newPos = {
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale,
        };

        setScale(clampedScale);
        setPosition(newPos);

        if (externalHandleWheel) {
            externalHandleWheel(e);
        }
    }, [scale, position, stageRef, externalHandleWheel]);

    const handleTouchStart = useCallback((e) => {
        const touch1 = e.evt.touches[0];
        const touch2 = e.evt.touches[1];

        if (e.evt.touches.length === 1) {
            const currentTime = Date.now();
            if (currentTime - lastTapTime.current < 300) {
                const { scale: fitScale, position: initialPos } = getInitialView();
                setScale(fitScale);
                setPosition(initialPos);
            }
            lastTapTime.current = currentTime;
        }

        if (touch1 && touch2) {
            const stageInstance = stageRef.current;
            if (stageInstance) {
                stageInstance.stopDrag();
                dragStopped.current = true;
            }

            const p1 = { x: touch1.clientX, y: touch1.clientY };
            const p2 = { x: touch2.clientX, y: touch2.clientY };

            lastCenter.current = getCenter(p1, p2);
            lastDist.current = getDistance(p1, p2);
        }
    }, [stageRef, getInitialView]);

    const handleTouchMove = useCallback((e) => {
        const touch1 = e.evt.touches[0];
        const touch2 = e.evt.touches[1];

        if (touch1 && touch2) {
            e.evt.preventDefault();

            const stageInstance = stageRef.current;
            if (!stageInstance) return;

            if (!dragStopped.current) {
                stageInstance.stopDrag();
                dragStopped.current = true;
            }

            const p1 = { x: touch1.clientX, y: touch1.clientY };
            const p2 = { x: touch2.clientX, y: touch2.clientY };

            const newCenter = getCenter(p1, p2);
            const newDist = getDistance(p1, p2);

            if (!lastCenter.current || lastDist.current === 0) {
                lastCenter.current = newCenter;
                lastDist.current = newDist;
                return;
            }

            const scaleRatio = newDist / lastDist.current;
            const newScale = Math.max(0.5, Math.min(3, scale * scaleRatio));

            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();

            const pointX = newCenter.x - rect.left;
            const pointY = newCenter.y - rect.top;

            const mousePointTo = {
                x: (pointX - position.x) / scale,
                y: (pointY - position.y) / scale,
            };

            const dx = newCenter.x - lastCenter.current.x;
            const dy = newCenter.y - lastCenter.current.y;

            const newPos = {
                x: pointX - mousePointTo.x * newScale + dx,
                y: pointY - mousePointTo.y * newScale + dy,
            };

            setScale(newScale);
            setPosition(newPos);

            lastCenter.current = newCenter;
            lastDist.current = newDist;
        }
    }, [scale, position, stageRef]);

    const handleTouchEnd = useCallback(() => {
        lastCenter.current = null;
        lastDist.current = 0;
        dragStopped.current = false;
    }, []);

    const handleDragEnd = useCallback((e) => {
        const pos = e.target.position();
        setPosition(pos);

        if (externalSetStagePosition) {
            externalSetStagePosition(pos);
        }
    }, [externalSetStagePosition]);

    const handleZoomIn = useCallback(() => {
        const newScale = Math.min(3, scale * 1.3);
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;

        const mousePointTo = {
            x: (centerX - position.x) / scale,
            y: (centerY - position.y) / scale,
        };

        setScale(newScale);
        setPosition({
            x: centerX - mousePointTo.x * newScale,
            y: centerY - mousePointTo.y * newScale,
        });
    }, [scale, position, dimensions]);

    const handleZoomOut = useCallback(() => {
        const newScale = Math.max(0.5, scale / 1.3);
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;

        const mousePointTo = {
            x: (centerX - position.x) / scale,
            y: (centerY - position.y) / scale,
        };

        setScale(newScale);
        setPosition({
            x: centerX - mousePointTo.x * newScale,
            y: centerY - mousePointTo.y * newScale,
        });
    }, [scale, position, dimensions]);

    const handleResetView = useCallback(() => {
        const { scale: fitScale, position: initialPos } = getInitialView();
        setScale(fitScale);
        setPosition(initialPos);
    }, [getInitialView]);

    return (
        <>
            {/* Inline Styles */}
            <style>{`
                .booking-canvas-wrapper .konvajs-content {
                    width: 100% !important;
                }

                .booking-canvas-wrapper .konvajs-content canvas {
                    width: 100% !important;
                }
                .booking-canvas-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .booking-canvas-stage {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                .booking-canvas-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 10;
                }
                
                .booking-legend {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    display: flex;
                    flex-direction: row;
                    gap: 12px;
                    padding: 8px 12px;
                    background-color: ${THEME.legendBg};
                    border-radius: 8px;
                    pointer-events: none;
                }
                
                @media (min-width: 768px) {
                    .booking-legend {
                        top: 20px;
                        left: 20px;
                        gap: 16px;
                        padding: 12px 16px;
                    }
                }
                
                .booking-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .booking-legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }
                
                @media (min-width: 768px) {
                    .booking-legend-color {
                        width: 14px;
                        height: 14px;
                    }
                }
                
                .booking-legend-label {
                    color: ${THEME.textPrimary};
                    font-size: 11px;
                }
                
                @media (min-width: 768px) {
                    .booking-legend-label {
                        font-size: 12px;
                    }
                }
                
                .booking-zoom-controls {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    pointer-events: auto;
                }
                
                @media (min-width: 768px) {
                    .booking-zoom-controls {
                        top: 20px;
                        right: 20px;
                        gap: 10px;
                    }
                }
                
                .booking-hint {
                    position: absolute;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: ${THEME.hintBg};
                    color: ${THEME.textPrimary};
                    padding: 10px 20px;
                    border-radius: 24px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid ${THEME.hintBorder};
                    white-space: nowrap;
                    animation: fadeInOut 4s forwards;
                    pointer-events: none;
                }
                
                .booking-tooltip {
                    position: absolute;
                    z-index: 1000;
                    font-size: 16px;
                    pointer-events: none;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                
                .booking-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: ${THEME.textPrimary};
                    font-size: 14px;
                    z-index: 5;
                }
                
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>

            <div
                ref={containerRef}
                className="booking-canvas-wrapper"
                style={{
                    minHeight: dimensions.height,
                    backgroundColor: THEME.canvasBg,
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                }}
            >
                {/* Loading state */}
                {!isReady && (
                    <div className="booking-loading">
                        Loading seats...
                    </div>
                )}

                {/* Canvas Stage */}
                <div className="booking-canvas-stage">
                    <Stage
                        ref={stageRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        scaleX={scale}
                        scaleY={scale}
                        x={position.x}
                        y={position.y}
                        draggable={true}
                        onWheel={handleWheel}
                        onDragEnd={handleDragEnd}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                            opacity: isReady ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            cursor: 'grab',
                        }}
                        pixelRatio={PIXEL_RATIO}
                    >
                        <Layer>
                            <StageScreen stage={stage} />

                            {sections.map(section => (
                                <Section
                                    key={section.id}
                                    section={section}
                                    selectedSeatIds={selectedSeatIds}
                                    onSeatClick={handleSeatClick}
                                    onSeatHover={handleSeatHover}
                                    onSeatLeave={handleSeatLeave}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </Layer>
                    </Stage>
                </div>

                {/* Overlay Container */}
                <div className="booking-canvas-overlay">
                    {/* Legend */}
                    <div className="booking-legend">
                        {[
                            { color: SEAT_COLORS.available, label: 'Available' },
                            { color: SEAT_COLORS.selected, label: 'Selected' },
                            { color: SEAT_COLORS.hold, label: 'Locked' },
                            { color: SEAT_COLORS.booked, label: 'Booked' },
                        ].map((item) => (
                            <div key={item.label} className="booking-legend-item">
                                <div
                                    className="booking-legend-color"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="booking-legend-label">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Zoom Controls */}
                    <div className="booking-zoom-controls">
                        <ZoomButton onClick={handleZoomIn} variant="primary">
                            <Plus size={IS_MOBILE ? 18 : 20} />
                        </ZoomButton>

                        <ZoomButton onClick={handleZoomOut} variant="primary">
                            <Minus size={IS_MOBILE ? 18 : 20} />
                        </ZoomButton>

                        <ZoomButton onClick={handleResetView} variant="secondary">
                            <RotateCcw size={IS_MOBILE ? 18 : 20} />
                        </ZoomButton>
                    </div>

                    {/* Pinch hint for mobile */}
                    {IS_MOBILE && showHint && isReady && (
                        <div className="booking-hint">
                            <span style={{ fontSize: 18 }}>👆👆</span>
                            Pinch to zoom • Double tap to reset
                        </div>
                    )}
                </div>

                {/* Seat Tooltip */}
                {hoveredSeat && (
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
                )}
            </div>
        </>
    );
};

export default memo(BookingSeatCanvas);
