import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { HomeIcon, LayoutDashboard, MenuIcon, Telescope, TicketIcon, UserIcon } from "lucide-react";
import { Button, Col, Container, Nav, Offcanvas, Row } from "react-bootstrap";
import CustomMenu from "../CustomComponents/CustomMenu";
import { useMyContext } from "@/Context/MyContextProvider";
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
      stiffness: 300,  // Reduced from 400
      damping: 30,     // Increased from 25
      mass: 1.2,       // Added mass for more "weight" feeling
      duration: 0.5    // Added duration for smoother transition
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
  const { UserData } = useMyContext();
  const [show, setShow] = useState(false);
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
    };
    return pathToButton[currentPath] || "home";
  }, [currentPath]);

  // Define routes where menu should be visible
  const visibleRoutes = new Set([
    "/",
    "/events",
    "/events/offers",
    "/events/live",
    "/profile",
    "/event-details",
    "/about-us",
    "/blogs",
    "/faq",
  ]);

  // Show only if the exact path matches one in visibleRoutes
  const shouldShowMenu = visibleRoutes.has(currentPath);

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
    // {
    //   key: "menu",
    //   onClick: () => {
    //     handleShow();
    //     setActiveButton("menu");
    //   },
    //   Icon: MenuIcon,
    //   text: "Menu",
    //   animation: { scale: [1, 1.2, 1] },
    // },
    {
      key: "Bookings",
      onClick: () => router.push("/my-bookings"),
      Icon: UserIcon,
      text: "Bookings",
      animation: { scale: [1, 1.2, 1] },
    },
  ];

  return (
    <>
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
            // background:"#000",
            // border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
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

          {/* Central floating Book button */}
          {/* <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.2, // Slight delay after container animation
            type: "spring",
            stiffness: 150,
            damping: 15
          }}
          style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: 60,
            height: 60,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Button
            variant="warning"
            className="rounded-circle"
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: 0,
            }}
            onClick={() => router.push("/events")}
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <TicketIcon color="var(--bs-dark)" size={20} />
            </motion.div>
            <span style={{ fontSize: 10, marginTop: 5 }}>Book</span>
          </Button>
        </motion.div> */}
        </Container>
      </motion.div>
    </>
  );
};

export default MobileBottomMenu;
