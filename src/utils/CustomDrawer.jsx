import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

const CustomDrawer = ({ 
  title,
  children,
  showOffcanvas, 
  setShowOffcanvas,
  placement // optional: can override default behavior
}) => {
  // Use media query to conditionally render instead of CSS hiding
  const isMobile = useMediaQuery({ maxWidth: 575 }); // Bootstrap sm breakpoint

  return (
    <Offcanvas
      show={showOffcanvas}
      onHide={() => setShowOffcanvas(false)}
      placement={placement || (isMobile ? "bottom" : "top")}
    >
      <Offcanvas.Header>
        <Offcanvas.Title>{title}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {children}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CustomDrawer;