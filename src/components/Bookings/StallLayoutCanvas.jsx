import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getShapeBounds = (shape) => {
  const type = shape?.type;
  const x = Number(shape?.x || 0);
  const y = Number(shape?.y || 0);
  const width = Number(shape?.width || 0);
  const height = Number(shape?.height || 0);
  const radius = Number(shape?.radius || 0);

  if (type === 'rect') {
    return { minX: x, minY: y, maxX: x + width, maxY: y + height };
  }

  if (type === 'circle') {
    return { minX: x - radius, minY: y - radius, maxX: x + radius, maxY: y + radius };
  }

  if (type === 'line' && Array.isArray(shape?.points) && shape.points.length >= 2) {
    const pointXs = [];
    const pointYs = [];
    for (let i = 0; i < shape.points.length; i += 2) {
      const px = Number(shape.points[i]);
      const py = Number(shape.points[i + 1]);
      if (Number.isFinite(px) && Number.isFinite(py)) {
        pointXs.push(px);
        pointYs.push(py);
      }
    }
    if (pointXs.length > 0 && pointYs.length > 0) {
      return {
        minX: Math.min(...pointXs),
        minY: Math.min(...pointYs),
        maxX: Math.max(...pointXs),
        maxY: Math.max(...pointYs),
      };
    }
  }

  return { minX: x, minY: y, maxX: x + width, maxY: y + height };
};

const getLayoutBounds = (shapes = []) => {
  if (!Array.isArray(shapes) || shapes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  shapes.forEach((shape) => {
    const b = getShapeBounds(shape);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  });

  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
  return { minX, minY, maxX, maxY };
};

const toPixiColor = (value, fallback) => {
  try {
    return new PIXI.Color(value || fallback).toNumber();
  } catch {
    return new PIXI.Color(fallback).toNumber();
  }
};

const StallLayoutCanvas = ({
  layout = [],
  selectedStallId,
  onSelect,
  getFillColor,
}) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const viewportRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 1100, height: 620 });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, shape: null });
  const [appReady, setAppReady] = useState(false);

  const layoutBounds = useMemo(() => getLayoutBounds(layout), [layout]);

  // --- Resize ---
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = Math.max(320, Math.floor(containerRef.current.clientWidth || 1100));
      const isMobile = width <= 768;
      const height = isMobile ? Math.floor(window.innerHeight * 0.30) : 620;
      setViewportSize({ width, height });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // --- PIXI Application Init ---
  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    const setup = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: viewportSize.width,
        height: viewportSize.height,
        antialias: true,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (disposed || !containerRef.current) {
        app.destroy(true, { children: true, texture: true });
        return;
      }

      app.canvas.style.display = 'block';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.touchAction = 'none';

      // --- pixi-viewport: replaces ALL manual pan/zoom/pinch code ---
      const viewport = new Viewport({
        screenWidth: viewportSize.width,
        screenHeight: viewportSize.height,
        worldWidth: 2000,
        worldHeight: 2000,
        events: app.renderer.events,
        passiveWheel: false,
      });

      viewport
        .drag({ mouseButtons: 'left' })   // drag to pan (touch + mouse)
        .pinch()                            // two-finger pinch zoom
        .wheel({ smooth: 5, interrupt: true })
        .decelerate({ friction: 0.92 })
        .clampZoom({ minScale: 0.15, maxScale: 4 });

      // Prevent page scroll when wheel is inside the canvas
      app.canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

      app.stage.addChild(viewport);

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(app.canvas);

      appRef.current = app;
      viewportRef.current = viewport;
      setAppReady(true);
    };

    setup();

    return () => {
      disposed = true;
      setAppReady(false);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
      appRef.current = null;
      viewportRef.current = null;
    };
  }, []);

  // --- Resize renderer + fit layout ---
  useEffect(() => {
    const app = appRef.current;
    const viewport = viewportRef.current;
    if (!app || !viewport || !appReady || !containerRef.current) return;

    // Read actual container size from DOM
    const screenW = Math.max(320, containerRef.current.clientWidth);
    const isMobile = screenW <= 768;
    const screenH = isMobile ? Math.floor(window.innerHeight * 0.30) : 620;

    // 1. Resize renderer and viewport to actual container size
    app.renderer.resize(screenW, screenH);
    viewport.resize(screenW, screenH);

    // 2. Fit layout to viewport
    if (Array.isArray(layout) && layout.length > 0 && layoutBounds) {
      const layoutWidth = Math.max(1, layoutBounds.maxX - layoutBounds.minX);
      const layoutHeight = Math.max(1, layoutBounds.maxY - layoutBounds.minY);
      const centerX = layoutBounds.minX + layoutWidth / 2;
      const centerY = layoutBounds.minY + layoutHeight / 2;

      // Calculate scale to fit entire layout on screen
      const scale = clamp(
        Math.min(screenW / layoutWidth, screenH / layoutHeight) * 0.9,
        0.15,
        2
      );

      // Directly set position so layout center = screen center
      viewport.scale.set(scale);
      viewport.x = screenW / 2 - centerX * scale;
      viewport.y = screenH / 2 - centerY * scale;
    }
  }, [layout, layoutBounds, viewportSize.width, viewportSize.height, appReady]);

  // --- Tooltip helpers ---
  const showTooltip = useCallback((shape, x, y) => {
    setTooltip({ visible: true, x: x + 12, y: y + 12, shape });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, shape: null });
  }, []);

  // --- Draw shapes ---
  useEffect(() => {
    const app = appRef.current;
    const viewport = viewportRef.current;
    if (!app || !viewport || !appReady) return;

    // Clear only shape children (keep viewport plugins intact)
    viewport.removeChildren();
    hideTooltip();

    const zoomToShape = (shape) => {
      const cx = Number(shape?.x || 0) + Number(shape?.width || 0) / 2;
      const cy = Number(shape?.y || 0) + Number(shape?.height || 0) / 2;
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const desiredScale = isMobile ? 0.9 : 1.5;
      const targetScale = Math.max(viewport.scale.x, desiredScale);

      viewport.animate({
        time: 300,
        position: new PIXI.Point(cx, cy),
        scale: targetScale,
        ease: 'easeInOutSine',
        removeOnInterrupt: true,
      });
    };

    layout.forEach((shape) => {
      const isSelected = selectedStallId && shape?.id === selectedStallId;
      const isStall = shape?.entityType === 'stall';
      const isClickable = isStall && shape?.meta?.bookable && !shape?.meta?.booked;
      const shapeWidth = Number(shape?.width || 0);
      const shapeHeight = Number(shape?.height || 0);
      const shapeX = Number(shape?.x || 0);
      const shapeY = Number(shape?.y || 0);
      const shapeRotation = Number(shape?.rotation || 0);
      const fillColor = toPixiColor(getFillColor(shape), '#eeeeee');
      const strokeColor = toPixiColor(
        isSelected ? '#1677ff' : (shape.style?.stroke || '#000000'),
        '#000000'
      );
      const strokeW = Number(isSelected ? 3 : (shape.style?.strokeWidth || 1));

      if (shape?.type === 'rect') {
        const gfx = new PIXI.Graphics();
        gfx.rect(-shapeWidth / 2, -shapeHeight / 2, shapeWidth, shapeHeight);
        gfx.fill({ color: fillColor, alpha: isSelected ? 0.9 : 1 });
        if (strokeW > 0) gfx.stroke({ color: strokeColor, width: strokeW });
        gfx.x = shapeX + shapeWidth / 2;
        gfx.y = shapeY + shapeHeight / 2;
        gfx.rotation = (shapeRotation * Math.PI) / 180;
        gfx.scale.set(isSelected ? 1.02 : 1);
        gfx.eventMode = 'static';
        gfx.cursor = isClickable ? 'pointer' : 'default';

        gfx.on('pointertap', () => {
          if (isClickable) {
            zoomToShape(shape);
            onSelect(shape);
          }
        });
        gfx.on('pointerover', (e) => {
          app.canvas.style.cursor = isClickable ? 'pointer' : 'not-allowed';
          showTooltip(shape, e.global.x, e.global.y);
        });
        gfx.on('pointermove', (e) => {
          setTooltip((prev) =>
            prev.visible
              ? { ...prev, x: e.global.x + 12, y: e.global.y + 12 }
              : prev
          );
        });
        gfx.on('pointerout', () => {
          app.canvas.style.cursor = 'default';
          hideTooltip();
        });

        viewport.addChild(gfx);

        // Label
        if (shape?.display?.showLabel && shape?.meta?.name) {
          const label = new PIXI.Text({
            text: shape.meta.name,
            style: { fill: '#000000', fontSize: 14, align: 'center' },
          });
          label.anchor.set(0.5);
          label.x = shapeX + shapeWidth / 2;
          label.y = shapeY + shapeHeight / 2;
          label.rotation = (shapeRotation * Math.PI) / 180;
          label.eventMode = 'none';
          viewport.addChild(label);
        }
      }

      if (shape?.type === 'circle') {
        const radius = Number(shape?.radius || 0);
        const gfx = new PIXI.Graphics();
        gfx.circle(0, 0, radius);
        gfx.fill({ color: fillColor });
        if (strokeW > 0) gfx.stroke({ color: strokeColor, width: strokeW });
        gfx.x = Number(shape?.x || 0);
        gfx.y = Number(shape?.y || 0);
        gfx.scale.set(isSelected ? 1.05 : 1);
        gfx.eventMode = 'static';
        gfx.cursor = isClickable ? 'pointer' : 'default';

        gfx.on('pointertap', () => {
          if (isClickable) {
            zoomToShape(shape);
            onSelect(shape);
          }
        });
        gfx.on('pointerover', (e) => {
          app.canvas.style.cursor = isClickable ? 'pointer' : 'not-allowed';
          showTooltip(shape, e.global.x, e.global.y);
        });
        gfx.on('pointermove', (e) => {
          setTooltip((prev) =>
            prev.visible
              ? { ...prev, x: e.global.x + 12, y: e.global.y + 12 }
              : prev
          );
        });
        gfx.on('pointerout', () => {
          app.canvas.style.cursor = 'default';
          hideTooltip();
        });

        viewport.addChild(gfx);
      }

      if (shape?.type === 'line' && Array.isArray(shape?.points) && shape.points.length >= 2) {
        const gfx = new PIXI.Graphics();
        gfx.moveTo(Number(shape.points[0]), Number(shape.points[1]));
        for (let i = 2; i < shape.points.length; i += 2) {
          gfx.lineTo(Number(shape.points[i]), Number(shape.points[i + 1]));
        }
        gfx.stroke({
          color: toPixiColor(shape?.stroke || '#000000', '#000000'),
          width: Number(shape?.strokeWidth || 1),
        });
        viewport.addChild(gfx);
      }
    });
  }, [layout, selectedStallId, onSelect, getFillColor, appReady, showTooltip, hideTooltip]);

  // --- Tooltip UI ---
  const tooltipStatus = tooltip.shape?.meta?.booked
    ? 'Booked'
    : tooltip.shape?.meta?.bookable
      ? 'Available'
      : 'Not Available';

  return (
    <div ref={containerRef} className="position-relative border rounded bg-white overflow-hidden w-100 stall-layout-scope">
      <div className="canvas-container" />

      {tooltip.visible && tooltip.shape && (
        <div
          className="position-absolute bg-dark text-white px-2 py-1 rounded small"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 10,
            pointerEvents: 'none',
            maxWidth: '220px',
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
