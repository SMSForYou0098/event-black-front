import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getShapeBounds = (shape) => {
  const type = shape?.type;
  const x = Number(shape?.x || 0);
  const y = Number(shape?.y || 0);
  const width = Number(shape?.width || 0);
  const height = Number(shape?.height || 0);
  const radius = Number(shape?.radius || 0);

  if (type === 'rect') {
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  }

  if (type === 'circle') {
    return {
      minX: x - radius,
      minY: y - radius,
      maxX: x + radius,
      maxY: y + radius
    };
  }

  if (type === 'line' && Array.isArray(shape?.points) && shape.points.length >= 2) {
    const pointXs = [];
    const pointYs = [];

    for (let index = 0; index < shape.points.length; index += 2) {
      const pointX = Number(shape.points[index]);
      const pointY = Number(shape.points[index + 1]);

      if (Number.isFinite(pointX) && Number.isFinite(pointY)) {
        pointXs.push(pointX);
        pointYs.push(pointY);
      }
    }

    if (pointXs.length > 0 && pointYs.length > 0) {
      return {
        minX: Math.min(...pointXs),
        minY: Math.min(...pointYs),
        maxX: Math.max(...pointXs),
        maxY: Math.max(...pointYs)
      };
    }
  }

  return {
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height
  };
};

const getLayoutBounds = (shapes = []) => {
  if (!Array.isArray(shapes) || shapes.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  shapes.forEach((shape) => {
    const bounds = getShapeBounds(shape);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  });

  if (![minX, minY, maxX, maxY].every(Number.isFinite)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
};

const StallLayoutCanvas = ({
  layout = [],
  selectedStallId,
  onSelect,
  getFillColor
}) => {
  const containerRef = useRef(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 1100, height: 620 });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, shape: null });

  const layoutBounds = useMemo(() => getLayoutBounds(layout), [layout]);
  const lastCenter = useRef(null);
  const lastDist = useRef(0);

  useEffect(() => {
    const updateViewport = () => {
      if (!containerRef.current) return;
      const width = Math.max(320, Math.floor(containerRef.current.clientWidth || 1100));
      setViewport({ width, height: 620 });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!Array.isArray(layout) || layout.length === 0 || !layoutBounds) {
      setStageScale(1);
      setStagePosition({ x: 0, y: 0 });
      return;
    }

    const padding = 40;
    const layoutWidth = Math.max(1, layoutBounds.maxX - layoutBounds.minX);
    const layoutHeight = Math.max(1, layoutBounds.maxY - layoutBounds.minY);

    const fitScale = clamp(
      Math.min(
        (viewport.width - padding * 2) / layoutWidth,
        (viewport.height - padding * 2) / layoutHeight
      ) * 0.8,
      0.35,
      2
    );

    const offsetX = (viewport.width - layoutWidth * fitScale) / 2;
    const offsetY = (viewport.height - layoutHeight * fitScale) / 2;

    setStageScale(fitScale);
    setStagePosition({
      x: offsetX - layoutBounds.minX * fitScale,
      y: offsetY - layoutBounds.minY * fitScale
    });
  }, [layout, layoutBounds, viewport.width, viewport.height]);

  const handleWheel = (event) => {
    event.evt.preventDefault();

    const scaleBy = 1.08;
    const stage = event.target.getStage();
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale
    };

    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const nextScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const newScale = clamp(nextScale, 0.5, 3);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };

    setStageScale(newScale);
    setStagePosition(newPos);
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

  const handleTouch = (e) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      if (e.target.getStage().isDragging()) {
        e.target.getStage().stopDrag();
      }

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      if (!lastCenter.current) {
        lastCenter.current = getCenter(p1, p2);
        lastDist.current = getDistance(p1, p2);
        return;
      }

      const newDist = getDistance(p1, p2);
      const newCenter = getCenter(p1, p2);

      const stage = e.currentTarget;
      const oldScale = stage.scaleX();

      const pointTo = {
        x: (newCenter.x - stage.x()) / oldScale,
        y: (newCenter.y - stage.y()) / oldScale,
      };

      const scaleBy = (newDist / lastDist.current) * oldScale;
      const newScale = clamp(scaleBy, 0.4, 3);

      const newPos = {
        x: newCenter.x - pointTo.x * newScale,
        y: newCenter.y - pointTo.y * newScale,
      };

      setStageScale(newScale);
      setStagePosition(newPos);
      lastDist.current = newDist;
      lastCenter.current = newCenter;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    lastCenter.current = null;
  };

  const showTooltip = (shape, event) => {
    setTooltip({
      visible: true,
      x: event.evt.layerX + 12,
      y: event.evt.layerY + 12,
      shape
    });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, shape: null });
  };

  const renderShape = (shape) => {
    const shapeId = shape?.id || `${shape?.type}-${shape?.x}-${shape?.y}`;
    const isSelected = selectedStallId && shape?.id === selectedStallId;
    const isStall = shape?.entityType === 'stall';
    const isClickable = isStall && shape?.meta?.bookable && !shape?.meta?.booked;
    const shapeWidth = Number(shape?.width || 0);
    const shapeHeight = Number(shape?.height || 0);
    const shapeX = Number(shape?.x || 0);
    const shapeY = Number(shape?.y || 0);
    const shapeRotation = Number(shape?.rotation || 0);

    if (shape?.type === 'rect') {
      return (
        <React.Fragment key={shapeId}>
          <Rect
            x={shapeX + shapeWidth / 2}
            y={shapeY + shapeHeight / 2}
            width={shapeWidth}
            height={shapeHeight}
            rotation={shapeRotation}
            offsetX={shapeWidth / 2}
            offsetY={shapeHeight / 2}
            fill={getFillColor(shape)}
            stroke={isSelected ? '#1677ff' : '#000'}
            strokeWidth={isSelected ? 3 : 1}
            scaleX={isSelected ? 1.02 : 1}
            scaleY={isSelected ? 1.02 : 1}
            cornerRadius={Number(shape?.radius || 0)}
            opacity={isSelected ? 0.9 : 1}
            onClick={() => {
              if (!isClickable) return;
              onSelect(shape);
            }}
            onTap={() => {
              if (!isClickable) return;
              onSelect(shape);
            }}
            onMouseEnter={(event) => {
              const container = event.target.getStage().container();
              container.style.cursor = isClickable ? 'pointer' : 'not-allowed';
              showTooltip(shape, event);
            }}
            onMouseLeave={(event) => {
              const container = event.target.getStage().container();
              container.style.cursor = 'default';
              hideTooltip();
            }}
          />

          {shape?.display?.showLabel && (
            <Text
              text={shape?.meta?.name || ''}
              x={shapeX + shapeWidth / 2}
              y={shapeY + shapeHeight / 2}
              width={shapeWidth}
              height={shapeHeight}
              offsetX={shapeWidth / 2}
              offsetY={shapeHeight / 2}
              rotation={shapeRotation}
              fontSize={14}
              fill="#000"
              align="center"
              verticalAlign="middle"
              listening={false}
            />
          )}
        </React.Fragment>
      );
    }

    if (shape?.type === 'circle') {
      return (
        <Circle
          key={shapeId}
          x={Number(shape?.x || 0)}
          y={Number(shape?.y || 0)}
          radius={Number(shape?.radius || 0)}
          fill={getFillColor(shape)}
          stroke={isSelected ? '#1677ff' : '#000'}
          strokeWidth={isSelected ? 3 : 1}
          scaleX={isSelected ? 1.05 : 1}
          scaleY={isSelected ? 1.05 : 1}
          onClick={() => {
            if (!isClickable) return;
            onSelect(shape);
          }}
          onTap={() => {
            if (!isClickable) return;
            onSelect(shape);
          }}
          onMouseEnter={(event) => {
            const container = event.target.getStage().container();
            container.style.cursor = isClickable ? 'pointer' : 'not-allowed';
            showTooltip(shape, event);
          }}
          onMouseLeave={(event) => {
            const container = event.target.getStage().container();
            container.style.cursor = 'default';
            hideTooltip();
          }}
        />
      );
    }

    if (shape?.type === 'line' && Array.isArray(shape?.points)) {
      return (
        <Line
          key={shapeId}
          points={shape.points}
          stroke={shape?.stroke || '#000'}
          strokeWidth={Number(shape?.strokeWidth || 1)}
          listening={false}
        />
      );
    }

    return null;
  };

  const tooltipStatus = tooltip.shape?.meta?.booked
    ? 'Booked'
    : tooltip.shape?.meta?.bookable
      ? 'Available'
      : 'Not Available';

  return (
    <div ref={containerRef} className="position-relative border rounded bg-white overflow-hidden w-100 stall-layout-scope">
      <div className='canvas-container'>
        <Stage
          width={viewport.width}
          height={viewport.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={handleWheel}
          onTouchMove={handleTouch}
          onTouchEnd={handleTouchEnd}
          draggable
          onDragEnd={(event) => {
            setStagePosition({ x: event.target.x(), y: event.target.y() });
          }}
        >
          <Layer>{layout.map(renderShape)}</Layer>
        </Stage>
      </div>

      {tooltip.visible && tooltip.shape && (
        <div
          className="position-absolute bg-dark text-white px-2 py-1 rounded small"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 10,
            pointerEvents: 'none',
            maxWidth: '220px'
          }}
        >
          <div className="fw-semibold">{tooltip.shape?.meta?.name || 'Shape'}</div>
          {tooltip.shape?.entityType === 'stall' && (
            <>
              <div>Status: {tooltipStatus}</div>
              <div>Price: ₹{tooltip.shape?.meta?.price ?? 'N/A'}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StallLayoutCanvas;
