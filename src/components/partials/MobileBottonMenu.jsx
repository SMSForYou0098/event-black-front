import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, HomeIcon, LayoutDashboard, MenuIcon, SendHorizontal, Telescope, TicketIcon, UserIcon } from "lucide-react";
import { Button, Col, Container, Nav, Offcanvas, Row, Dropdown } from "react-bootstrap";
import CustomMenu from "../CustomComponents/CustomMenu";
import { useMyContext } from "@/Context/MyContextProvider";
import LoginModal from "../auth/LoginOffCanvas";
import { useRouter } from "next/router";
import Link from "next/link";

/**
 * AnimatedButton: small presentational component used by MobileBottomMenu
 */
export const AnimatedButton = ({ onClick, Icon, text, animation, isActive }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    animate={{
      y: isActive ? -4 : 0,
      scale: isActive ? 1 : 0.98,
    }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1.2,
      duration: 0.5
    }}
  >
    <Button
      onClick={onClick}
      variant={isActive ? "primary" : "link"}
      className={`text-decoration-none p-2 rounded-4 d-flex flex-column align-items-center justify-content-center ${isActive ? 'shadow-lg' : ''
        }`}
      style={{
        width: '65px',
        height: '55px',
        margin: '0 auto',
        border: 'none',
        background: isActive ? 'var(--bs-primary)' : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <motion.div
        animate={animation}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          padding: '4px',
          borderRadius: '50%',
        }}
      >
        <Icon
          color={isActive ? "var(--bs-light)" : "var(--bs-primary)"}
          size={22}
        />
      </motion.div>
      <motion.span
        className="mt-1"
        animate={{
          scale: isActive ? 1.05 : 1,
          color: isActive ? "var(--bs-light)" : "var(--bs-primary)"
        }}
        transition={{ duration: 0.2 }}
        style={{
          fontSize: '11px',
          fontWeight: '500'
        }}
      >
        {text}
      </motion.span>
    </Button>
  </motion.div>
);

/**
 * MobileBottomMenu component
 */
const MobileBottomMenu = ({ hideMenu = false }) => {
  const { UserData, isLoggedIn, ticketActions } = useMyContext();
  const [show, setShow] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // Normalize path helper
  const normalizePath = (p = "") => {
    const clean = p.split("?")[0].split("#")[0];
    return clean.endsWith("/") && clean.length > 1 ? clean.slice(0, -1) : clean;
  };

  const rawPath =
    typeof window !== "undefined" ? router.asPath : router.pathname;
  const currentPath = normalizePath(rawPath);

  // Derive active button from current path
  const activeButton = useMemo(() => {
    const pathToButton = {
      "/": "home",
      "/events": "events",
      "/events/offers": "offers",
      "/events/live": "live",
      "/profile": "profile",
      "/bookings": "bookings",
    };

    if (currentPath.startsWith("/events/category/")) {
      return "events";
    }

    return pathToButton[currentPath] || "home";
  }, [currentPath]);

  // Define routes where menu should be visible
  const visibleRoutes = new Set([
    "/",
    "/events",
    "/events/offers",
    "/events/live",
    "/profile",
    "/bookings",
    "/event-details",
    "/about-us",
    "/blogs",
    "/faq",

  ]);

  // Show only if the exact path matches one in visibleRoutes OR it's a ticket page
  const shouldShowMenu =
    visibleRoutes.has(currentPath) ||
    currentPath.startsWith("/t/") ||
    currentPath.startsWith("/events/category/");

  // Return null if menu should be hidden
  if (hideMenu || !shouldShowMenu) return null;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow((s) => !s);

  const buttons = [
    {
      key: "home",
      onClick: () => router.push("/"),
      Icon: HomeIcon,
      text: "Home",
      animation: { scale: [1, 1.2, 1] },
    },
    {
      key: "events",
      onClick: () => router.push("/events"),
      Icon: TicketIcon,
      text: "Events",
      animation: { rotate: [0, -20, 0] },
    },
    {
      key: "offers",
      onClick: () => router.push("/events/offers"),
      Icon: LayoutDashboard,
      text: "Offers",
      animation: { rotate: [0, -20, 0] },
    },
    {
      key: "live",
      onClick: () => router.push("/events/live"),
      Icon: Telescope,
      text: "Live",
      animation: { rotate: [0, -20, 0] },
    },
    {
      key: "bookings",
      onClick: () => {
        if (isLoggedIn) {
          router.push("/bookings");
        } else {
          setShowLoginModal(true);
        }
      },
      Icon: UserIcon,
      text: "Bookings",
      animation: { scale: [1, 1.2, 1] },
    },
  ];

  const renderTicketActions = () => {
    if (!ticketActions || !currentPath.startsWith("/t/")) return null;

    const {
      ticketData,
      ticketCount,
      disableCombineButton,
      imageLoaded,
      cardImageUrl,
      handleDownloadClick,
      handleTransferClick,
    } = ticketActions;

    const isDisabled = !imageLoaded && cardImageUrl;
    const canTransfer = ticketData?.controls?.ticket_transfer && UserData?.id === ticketData?.user_id;

    return (
      <div className="d-flex gap-2 w-100 mb-3 px-2">
        {canTransfer ? (
          <>
            <Button
              variant="outline-primary"
              onClick={handleTransferClick}
              className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill"
              style={{
                border: '1px solid var(--bs-primary)',
                lineHeight: 1.7,
              }}
              disabled={isDisabled}
            >
              <SendHorizontal size={18} />
              Transfer
            </Button>
            {ticketCount > 1 ? (
              <Dropdown className="flex-fill">
                <Dropdown.Toggle
                  as={Button}
                  variant="primary"
                  className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap w-100"
                  style={{
                    background: 'var(--bs-primary)',
                    border: 'none',
                    lineHeight: 1.7,
                  }}
                  disabled={isDisabled}
                >
                  <Download size={18} />
                  Download
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown-menu w-100">
                  {disableCombineButton && (
                    <Dropdown.Item onClick={() => handleDownloadClick("combine")} className="custom-dropdown-item">Group</Dropdown.Item>
                  )}
                  <Dropdown.Item onClick={() => handleDownloadClick("download")} className="custom-dropdown-item">Single</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleDownloadClick("single")}
                className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill"
                style={{
                  background: 'var(--bs-primary)',
                  border: 'none',
                  lineHeight: 1.7,
                }}
                disabled={isDisabled}
              >
                <Download size={18} />
                Download
              </Button>
            )}
          </>
        ) : (
          <>
            {ticketCount > 1 ? (
              <>
                {disableCombineButton && (
                  <Button
                    variant="secondary"
                    onClick={() => handleDownloadClick("combine")}
                    className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill"
                    style={{ lineHeight: 1.7 }}
                    disabled={isDisabled}
                  >
                    <Download size={18} />
                    Group
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => handleDownloadClick("download")}
                  className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill"
                  style={{
                    background: 'var(--bs-primary)',
                    border: 'none',
                    lineHeight: 1.7,
                  }}
                  disabled={isDisabled}
                >
                  <Download size={18} />
                  Single
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleDownloadClick("single")}
                className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap flex-fill"
                style={{
                  background: 'var(--bs-primary)',
                  border: 'none',
                  lineHeight: 1.7,
                }}
                disabled={isDisabled}
              >
                <Download size={18} />
                Download
              </Button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        redirectPath="/bookings"
      />
      <Offcanvas
        show={show}
        onHide={handleClose}
        className="mobile-offcanvas nav navbar navbar-expand-xl hover-nav mt-3 py-0 w-75 bg-dark"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <Container fluid className="p-0">
          <Offcanvas.Header closeButton className="px-0 mx-3">
            <Link href="/" className="navbar-brand ms-3"></Link>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <div className="landing-header">
              <Nav
                as="ul"
                className="navbar-nav iq-nav-menu list-unstyled"
                id="header-menu"
              >
                <CustomMenu handleClose={handleClose} />
              </Nav>
            </div>
          </Offcanvas.Body>
        </Container>
      </Offcanvas>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.6,
          ease: "easeOut"
        }}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          zIndex: 98,
          bottom: 0,
          maxWidth: "calc(100%)",
          margin: '0',
        }}
      >
        <Container
          className="d-flex flex-column justify-content-end card-glassmorphism"
          style={{
            padding: '12px 16px',
            borderRadius: '0px',
            background: 'rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
          {renderTicketActions()}
          <Row className="g-0 justify-content-between align-items-center">
            {buttons.map(({ key, ...buttonProps }) => (
              <Col
                key={key}
                className="text-center"
                style={{ flex: '1', minWidth: 'auto' }}
              >
                <AnimatedButton {...buttonProps} isActive={activeButton === key} />
              </Col>
            ))}
          </Row>
        </Container>
      </motion.div>
    </>
  );
};

export default MobileBottomMenu;
