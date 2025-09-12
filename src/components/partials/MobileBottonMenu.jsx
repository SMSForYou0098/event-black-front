// MobileBottomMenu.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { HomeIcon, LayoutDashboard, MenuIcon, TicketIcon, UserIcon } from "lucide-react";
import { Button, Col, Container, Nav, Offcanvas, Row } from "react-bootstrap";
import CustomMenu from "../CustomComponents/CustomMenu";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import Link from "next/link";

/**
 * AnimatedButton: small presentational component used by MobileBottomMenu
 */
export const AnimatedButton = ({ onClick, Icon, text, animation, isActive }) => (
  <Button
    onClick={onClick}
    variant={isActive ? "primary" : "dark"} // ✅ bootstrap colors
    className="w-100 py-3 border-0 d-flex flex-column align-items-center"
    style={{ borderRadius: 0 }}
  >
    <motion.div
      animate={animation}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon color={isActive ? "var(--bs-light)" : "var(--bs-primary)"} size={20} />
    </motion.div>
    <span className="mt-2" style={{ fontSize: 12 }}>
      {text}
    </span>
  </Button>
);

/**
 * MobileBottomMenu component
 */
const MobileBottomMenu = ({ hideMenu = false }) => {
  const { UserData } = useMyContext();
  const [show, setShow] = useState(false);
  const [activeButton, setActiveButton] = useState("home");
  const router = useRouter();

  if (hideMenu) return null;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow((s) => !s);

  const handleNavigateProfile = () => {
    let path = "/sign-in";
    if (UserData && Object.keys(UserData)?.length > 0) {
      path = `/dashboard/users/manage/${UserData?.id}`;
    }
    router.push(path);
  };

  const buttons = [
    {
      key: "home",
      onClick: () => {
        router.push("/");
        setActiveButton("home");
      },
      Icon: HomeIcon,
      text: "Home",
      animation: { scale: [1, 1.2, 1] },
    },
    {
      key: "events",
      onClick: () => {
        router.push("/events");
        setActiveButton("events");
      },
      Icon: LayoutDashboard,
      text: "Events",
      animation: { rotate: [0, -20, 0] },
    },
    {
      key: "profile",
      onClick: () => {
        handleNavigateProfile();
        setActiveButton("profile");
      },
      Icon: UserIcon,
      text: "Profile",
      animation: { scale: [1, 1.2, 1] },
    },
    {
      key: "menu",
      onClick: () => {
        handleShow();
        setActiveButton("menu");
      },
      Icon: MenuIcon,
      text: "Menu",
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


      <Container
        fluid
        className="d-flex flex-column justify-content-end bg-dark"
        style={{
          position: "fixed",
          left: 0,
          zIndex: 98,
          bottom: 0,
          maxWidth: "100%",
          margin: 0,
          padding: 0,
        }}
      >
        <Row className="g-0">
          {buttons.map((item) => (
            <Col key={item.key} xs={3} className="p-0">
              <AnimatedButton {...item} isActive={activeButton === item.key} />
            </Col>
          ))}
        </Row>

        {/* Central floating Book button */}
        <div
          style={{
            position: "absolute",
            top: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: 60,
            height: 60,
            borderRadius: "50%",
            overflow: "hidden",        // Ensure circular clipping
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Button
            variant="secondary"
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
        </div>

      </Container>
    </>
  );
};

export default MobileBottomMenu;
