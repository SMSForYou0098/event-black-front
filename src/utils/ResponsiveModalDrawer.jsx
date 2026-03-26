import React from 'react';
import { Modal } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import CustomDrawer from './CustomDrawer';
import CustomHeader from './ModalUtils/CustomModalHeader';

/**
 * A responsive wrapper that renders its children in a CustomDrawer (Offcanvas)
 * on mobile and in a standard Modal on desktop.
 * 
 * @param {boolean} show - Whether to show the container
 * @param {function} onHide - Close handler
 * @param {string} title - Title text for Header
 * @param {React.ReactNode} children - Contents to render
 * @param {string} size - Modal size (sm, lg, xl)
 * @param {boolean} centered - Whether to center the modal
 * @param {object} drawerProps - Extra props for CustomDrawer
 * @param {object} modalProps - Extra props for Modal
 * @param {string} className - Extra class for the outer container/modal
 */
const ResponsiveModalDrawer = ({
  show,
  onHide,
  title,
  children,
  size = 'lg',
  centered = true,
  drawerProps = {},
  modalProps = {},
  className = '',
  closable = true,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (isMobile) {
    return (
      <CustomDrawer
        showOffcanvas={show}
        setShowOffcanvas={onHide}
        title={title}
        placement="bottom"
        {...drawerProps}
        className={`${className} ${drawerProps.className || ''}`}
      >
        <div 
          className="h-100 flex-grow-1 overflow-auto px-2" 
          style={{ overflowX: 'hidden' }}
        >
          {children}
        </div>
      </CustomDrawer>
    );
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
      {...modalProps}
      className={`${className} ${modalProps.className || ''}`}
    >
      <CustomHeader
        title={title}
        closable={closable}
        onClose={onHide}
        className={modalProps.headerClassName || ''}
      />
      <Modal.Body className={modalProps.bodyClassName || ''}>
        {children}
      </Modal.Body>
    </Modal>
  );
};

export default ResponsiveModalDrawer;
export { ResponsiveModalDrawer };
