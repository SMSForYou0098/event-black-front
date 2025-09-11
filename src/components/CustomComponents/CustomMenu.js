"use client";

import React, { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Nav, Row } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

import Mumbai from "../../assets/event/stock/cities/mumbai.png";
import Delhi from "../../assets/event/stock/cities/delhi.png";
import Bengaluru from "../../assets/event/stock/cities/bangluru.png";
import Hyderabad from "../../assets/event/stock/cities/hydrabad.png";
import Chandigarh from "../../assets/event/stock/cities/chandigargh.png";
import Ahmedabad from "../../assets/event/stock/cities/ahmedabad.png";

import { MapPin } from "lucide-react";
import { useMyContext } from "@/Context/MyContextProvider";

/**
 * CustomMenu (Next.js + client)
 * - Uses Bootstrap theme colors/variants
 * - Uses next/link + useRouter
 * - Client-only for geolocation and localStorage
 */

const CustomMenu = ({ handleClose }) => {
  const { UserData, userRole, isMobile, api, createSlug, systemSetting } = useMyContext();
  const router = useRouter();

  const home = userRole === "User" ? "/dashboard/bookings" : "/dashboard";

  const CloseMenu = () => {
    if (typeof handleClose === "function") handleClose();
  };

  const popularCities = [
    { name: "Mumbai", icon: Mumbai },
    { name: "Delhi-NCR", icon: Delhi },
    { name: "Bengaluru", icon: Bengaluru },
    { name: "Hyderabad", icon: Hyderabad },
    { name: "Chandigarh", icon: Chandigarh },
    { name: "Ahmedabad", icon: Ahmedabad },
  ];

  const [show, setShow] = useState(false);
  const [menu, setMenu] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  const handleCloseModel = () => setShow(false);
  const handleShowMode = () => setShow(true);

  const cityIconStyle = {
    width: "60px",
    height: "60px",
    objectFit: "cover",
  };

  // Simple deep-compare via JSON.stringify (ok for menu objects)
  const isMenuDataEqual = (menuA, menuB) => {
    try {
      return JSON.stringify(menuA) === JSON.stringify(menuB);
    } catch (e) {
      return false;
    }
  };

  // Fetch menu with localStorage caching
  const GetMenu = async () => {
    try {
      const cachedMenuString = localStorage.getItem("cachedMenu");
      let cachedMenu = null;

      if (cachedMenuString && cachedMenuString !== "undefined") {
        try {
          cachedMenu = JSON.parse(cachedMenuString);
          setMenu(cachedMenu);
        } catch (e) {
          console.error("Failed to parse cached menu:", e);
          localStorage.removeItem("cachedMenu");
        }
      }

      // Fetch latest
      const res = await axios.get(`${api}active-menu`);
      const latestMenu = res?.data?.menu?.navigation_menu ?? null;

      if (!cachedMenu || !isMenuDataEqual(cachedMenu, latestMenu)) {
        setMenu(latestMenu);
        try {
          localStorage.setItem("cachedMenu", JSON.stringify(latestMenu));
        } catch (e) {
          console.warn("Could not cache menu:", e);
        }
      }
    } catch (err) {
      console.error("GetMenu error:", err);
      // fallback to cached menu already set above
    }
  };

  useEffect(() => {
    // only run on client
    GetMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Geolocation + reverse-geocode using BigDataCloud
  const detectLocation = () => {
    if (!navigator || !navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await axios.get(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const city = response?.data?.city || response?.data?.locality || "City not found";
          setUserLocation(city);
          setError(null);
        } catch (err) {
          console.error("reverse geocode error", err);
          setError("Error retrieving city name.");
        }
      },
      (geolocErr) => {
        console.error("geolocation error", geolocErr);
        setError("Unable to retrieve your location.");
      }
    );
  };

  // Active class calculation using router.pathname
  const getClassName = (menuItem) => {
    const slug = createSlug?.(menuItem?.title) ?? menuItem?.title?.toLowerCase?.();
    const path1 = `/home/dashboard/bookings/${slug}`;
    const path2 = `/home/dashboard/${slug}`;
    const isActive = router?.pathname === path1 || router?.pathname === path2;
    return isActive ? "active" : "";
  };

  const getLinkTo = (menuItem) => {
    const isHome = menuItem?.title?.toLowerCase?.() === "home";
    if (menuItem?.type === 1) {
      // external link
      return menuItem?.external_url || "#";
    }
    if (isHome) {
      return "/home";
    }
    return `/home/${createSlug(menuItem?.title)}`;
  };

  return (
    <>
      {/* City selector modal */}
      <Modal show={show} onHide={handleCloseModel} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Your City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="citySearch">
              <Form.Control type="text" placeholder="Search for your city" />
            </Form.Group>

            <Button variant="primary" className="w-100 my-3" onClick={detectLocation} aria-label="Detect my location">
              Detect my location
            </Button>

            {error && <div className="text-danger small mb-2">{error}</div>}
            {userLocation && <div className="text-success small mb-2">Detected: {userLocation}</div>}
          </Form>

          <h5 className="text-center mt-3">Popular Cities</h5>
          <Row className="mt-2">
            {popularCities.map((city, index) => (
              <Col xs={4} md={3} lg={2} key={index} className="text-center mb-3">
                <img src={city.icon.src ?? city.icon} alt={city.name} style={cityIconStyle} className="mb-2 rounded" />
                <p className="mb-0 small">{city.name}</p>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>

      {/* Render navigation menu items */}
      {Array.isArray(menu) &&
        menu.map((menuItem, index) => {
          const href = getLinkTo(menuItem);
          const target = menuItem?.new_tab === 1 ? "_blank" : "_self";
          const isActive = getClassName(menuItem) === "active";
          const linkClass = `nav-link ${isActive ? "active text-primary" : "text-muted"}`;

          return (
            <Nav.Item as="li" key={index}>
              {/* If external, still use Link but add rel for safety */}
              <Link
                href={href}
                target={target}
                className={linkClass}
                style={{ color: isActive ? undefined : systemSetting?.fontColor ?? undefined, textDecoration: "none" }}
                onClick={CloseMenu}
                rel={target === "_blank" ? "noopener noreferrer" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {menuItem?.title}
              </Link>
            </Nav.Item>
          );
        })}

      {/* City + Dashboard/Login controls */}
      <div className="alt d-flex justify-content-center gap-2 align-items-center mt-3">
        {!isMobile && <hr className="hr-horizontal" style={{ width: "35px", transform: "rotate(90deg)" }} />}

        <Nav.Item
          as="li"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShowMode();
          }}
        >
          <div style={{ cursor: "pointer" }} className="d-flex align-items-center">
            <MapPin size={16} color="var(--bs-primary)" aria-hidden />
            <a
              className="nav-link ms-2 p-0"
              // style={{ color: systemSetting?.fontColor ?? "var(--bs-light)" }}
              href="#"
              onClick={(ev) => ev.preventDefault()}
              aria-label="Select city"
            >
              City
            </a>
          </div>
        </Nav.Item>

        <hr className="hr-horizontal" style={{ width: "35px", transform: "rotate(90deg)" }} />

        <Nav.Item as="li" onClick={() => CloseMenu()}>
          <Link href={UserData && Object.keys(UserData)?.length > 0 ? home : "/sign-in"} className="text-decoration-none">
            <Button variant="secondary" size="sm" className="px-3 py-1">
              {UserData && Object.keys(UserData)?.length > 0 ? "Dashboard" : "Login"}
            </Button>
          </Link>
        </Nav.Item>
      </div>
    </>
  );
};

export default CustomMenu;
