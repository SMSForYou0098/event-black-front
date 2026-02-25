import React, { useRef, useState, useEffect, useCallback, useMemo, memo, useLayoutEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { PRIMARY } from '../../../../utils/consts';
import { THEME, IS_MOBILE, PIXEL_RATIO, SEAT_COLORS } from './constants';
import { getLayoutBounds, getDistance, getCenter } from './utils';
import Section from './Section';
import StageScreen from './StageScreen';
import ZoomButton from './ZoomButton';
import Legend from './Legend';
import SeatTooltip from './SeatTooltip';

Konva.showWarnings = false;

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
    const wasPinching = useRef(false);
    const initializedDims = useRef({ width: 0, height: 0 });
    const dragStartPos = useRef(null);

    // Mobile single-finger panning (replaces Konva's draggable on mobile)
    const singleTouchStart = useRef(null);
    const lastSingleTouch = useRef(null);
    const isMobilePanning = useRef(false);

    // Block browser double-tap zoom and pinch-zoom on the canvas container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Block multi-touch pinch from triggering browser zoom
        const blockPinch = (e) => {
            if (e.touches.length > 1) e.preventDefault();
        };

        // Block double-tap zoom
        let lastTap = 0;
        const blockDoubleTap = (e) => {
            const now = Date.now();
            if (now - lastTap < 300) {
                e.preventDefault();
            }
            lastTap = now;
        };

        const blockTouchMove = (e) => {
            // Only block multi-touch (pinch), allow single-touch scroll/drag
            if (e.touches.length > 1) e.preventDefault();
        };

        container.addEventListener('touchstart', blockPinch, { passive: false });
        container.addEventListener('touchmove', blockTouchMove, { passive: false });
        container.addEventListener('touchstart', blockDoubleTap, { passive: false });

        return () => {
            container.removeEventListener('touchstart', blockPinch);
            container.removeEventListener('touchmove', blockTouchMove);
            container.removeEventListener('touchstart', blockDoubleTap);
        };
    }, []);

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
            const dw = Math.abs(dimensions.width - initializedDims.current.width);
            const dh = Math.abs(dimensions.height - initializedDims.current.height);
            // Only re-init on significant size changes (orientation flip, actual resize)
            // Ignore small changes like mobile address bar show/hide (~50-80px)
            if (dw > 120 || dh > 120) {
                hasInitialized.current = false;
            }
        }
    }, [dimensions.width, dimensions.height]);

    // Always re-init when stage data changes (new layout)
    useEffect(() => {
        hasInitialized.current = false;
    }, [stage]);

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
        initializedDims.current = { width: dimensions.width, height: dimensions.height };
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

        if (touch1 && touch2) {
            // Two-finger pinch-zoom
            wasPinching.current = true;
            singleTouchStart.current = null;
            isMobilePanning.current = false;

            const stageInstance = stageRef.current;
            if (stageInstance) {
                stageInstance.stopDrag();
                dragStopped.current = true;
            }

            const p1 = { x: touch1.clientX, y: touch1.clientY };
            const p2 = { x: touch2.clientX, y: touch2.clientY };

            lastCenter.current = getCenter(p1, p2);
            lastDist.current = getDistance(p1, p2);
        } else if (IS_MOBILE && touch1 && !touch2) {
            // Single touch — record start for potential pan
            singleTouchStart.current = { x: touch1.clientX, y: touch1.clientY };
            lastSingleTouch.current = { x: touch1.clientX, y: touch1.clientY };
            isMobilePanning.current = false;
        }
    }, [stageRef]);

    const handleTouchMove = useCallback((e) => {
        const touch1 = e.evt.touches[0];
        const touch2 = e.evt.touches[1];

        if (touch1 && touch2) {
            // Two-finger pinch-zoom (existing logic)
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
        } else if (IS_MOBILE && touch1 && !touch2 && singleTouchStart.current) {
            // Single-finger pan on mobile
            const dx = touch1.clientX - singleTouchStart.current.x;
            const dy = touch1.clientY - singleTouchStart.current.y;

            // Only start panning after a distance threshold (so taps are not pans)
            if (!isMobilePanning.current) {
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                    isMobilePanning.current = true;
                } else {
                    return;
                }
            }

            // Apply delta since last move
            const moveDx = touch1.clientX - lastSingleTouch.current.x;
            const moveDy = touch1.clientY - lastSingleTouch.current.y;

            setPosition(prev => ({
                x: prev.x + moveDx,
                y: prev.y + moveDy,
            }));

            lastSingleTouch.current = { x: touch1.clientX, y: touch1.clientY };
        }
    }, [scale, position, stageRef]);

    const handleTouchEnd = useCallback(() => {
        lastCenter.current = null;
        lastDist.current = 0;
        dragStopped.current = false;
        singleTouchStart.current = null;
        lastSingleTouch.current = null;
        isMobilePanning.current = false;
        setTimeout(() => { wasPinching.current = false; }, 50);
    }, []);

    const handleDragStart = useCallback((e) => {
        dragStartPos.current = { ...e.target.position() };
    }, []);

    const handleDragEnd = useCallback((e) => {
        if (wasPinching.current) return;

        const pos = e.target.position();
        // Ignore micro-movements (accidental taps interpreted as drag on mobile)
        if (dragStartPos.current) {
            const dx = Math.abs(pos.x - dragStartPos.current.x);
            const dy = Math.abs(pos.y - dragStartPos.current.y);
            if (dx < 8 && dy < 8) {
                // Snap back — this was a tap or micro-movement, not a real drag
                e.target.position(dragStartPos.current);
                dragStartPos.current = null;
                return;
            }
        }
        dragStartPos.current = null;

        setPosition(pos);
        if (externalSetStagePosition) externalSetStagePosition(pos);
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
                    overflow: visible;
                    touch-action: none;
                }
                .booking-canvas-wrapper canvas {
                    touch-action: none;
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
                    bottom: 80px;
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
                        bottom: 80px;
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
                    bottom: 80px;
                    right: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    pointer-events: auto;
                }
                
                @media (min-width: 768px) {
                    .booking-zoom-controls {
                        bottom: 80px;
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
                <div className="booking-canvas-stage" style={{ touchAction: 'none' }}>
                    <Stage
                        ref={stageRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        scaleX={scale}
                        scaleY={scale}
                        x={position.x}
                        y={position.y}
                        draggable={!IS_MOBILE}
                        dragDistance={8}
                        tapDistance={10}
                        onWheel={handleWheel}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => console.log('canvas clicked')}
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
                                    canvasScale={scale}
                                />
                            ))}
                        </Layer>
                    </Stage>
                </div>

                {/* Overlay Container */}
                <div className="booking-canvas-overlay">
                    {/* Legend */}
                    <Legend />

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
                <SeatTooltip hoveredSeat={hoveredSeat} dimensions={dimensions} />
            </div>
        </>
    );
};

export default memo(BookingSeatCanvas);
