import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

const DRAG_CLOSE_THRESHOLD = 60;
const DRAG_RESISTANCE = 1.05; // minimal resistance for Instagram-like feel
const DRAG_HANDLE_HEIGHT = 32; // invisible hit area at top (matches CSS ::before indicator zone)

const CustomDrawer = ({
  title,
  children,
  showOffcanvas,
  setShowOffcanvas,
  placement,
  hideIndicator = false,
  className = '',
  bodyClassName = '',
  style,
  ...props
}) => {
  const isMobile = useMediaQuery({ maxWidth: 575 });
  const resolvedPlacement = placement || (isMobile ? 'bottom' : 'end');
  const isBottomDrawer = resolvedPlacement === 'bottom';

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startDragY = useRef(0);
  const dragYRef = useRef(0);
  dragYRef.current = dragY;

  const closeDrawer = useCallback(() => {
    setDragY(0);
    setIsDragging(false);
    setShowOffcanvas(false);
  }, [setShowOffcanvas]);

  const handlePointerDown = useCallback(
    (e) => {
      if (!isBottomDrawer) return;
      startY.current = e.touches ? e.touches[0].clientY : e.clientY;
      startDragY.current = dragY;
      setIsDragging(true);
    },
    [isBottomDrawer, dragY]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !isBottomDrawer) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = (clientY - startY.current) / DRAG_RESISTANCE;
      const newY = Math.max(0, startDragY.current + delta);
      setDragY(newY);
    },
    [isDragging, isBottomDrawer]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging || !isBottomDrawer) return;
    setIsDragging(false);
    if (dragYRef.current >= DRAG_CLOSE_THRESHOLD) {
      closeDrawer();
    } else {
      setDragY(0);
    }
  }, [isDragging, isBottomDrawer, closeDrawer]);

  // Document-level listeners so drag continues if finger moves outside handle
  useEffect(() => {
    if (!isDragging) return;
    const opts = { passive: false };
    const onMove = (e) => {
      e.preventDefault();
      handlePointerMove(e);
    };
    const onUp = () => handlePointerUp();
    document.addEventListener('touchmove', onMove, opts);
    document.addEventListener('touchend', onUp);
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Reset drag when drawer closes
  useEffect(() => {
    if (!showOffcanvas) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [showOffcanvas]);

  const drawerContent = (
    <>
      <Offcanvas.Header className="d-flex justify-content-center align-items-center pt-3 text-center">
        <Offcanvas.Title>{title}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className={bodyClassName}>{children}</Offcanvas.Body>
    </>
  );

  return (
    <Offcanvas
      show={showOffcanvas}
      onHide={() => setShowOffcanvas(false)}
      className={`${hideIndicator ? 'hide-indicator' : ''} ${className}`.trim()}
      placement={resolvedPlacement}
      style={style}
      {...props}
    >
      {isBottomDrawer ? (
        <div
          style={{
            position: 'relative',
            transform: `translateY(${dragY}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            touchAction: 'none',
            minHeight: '100%',
          }}
        >
          {/* Invisible drag strip: uses existing CSS ::before indicator; no duplicate handle */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drag down to close"
            onTouchStart={handlePointerDown}
            onMouseDown={handlePointerDown}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: DRAG_HANDLE_HEIGHT,
              cursor: 'grab',
              touchAction: 'none',
              zIndex: 1,
            }}
          />
          {drawerContent}
        </div>
      ) : (
        drawerContent
      )}
    </Offcanvas>
  );
};

export default CustomDrawer;