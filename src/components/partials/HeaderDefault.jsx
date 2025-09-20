import React, { memo, Fragment, useState, useEffect } from "react";

// react-bootstrap
import {
  Button,
  Nav,
  Collapse,
  Navbar,
  Offcanvas,
  Container,
  Dropdown,
  Image,
} from "react-bootstrap";

// router
import Link from "next/link";
import { useRouter } from "next/router";

// icons from lucide-react
import {
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  User as UserIcon,
  PlusSquare as PlusSquareIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
  LogOut as LogOutIcon,
  Fingerprint,
} from "lucide-react";

// components
import Logo from "../logo";
import CustomToggle from "../CustomToggle";
import { useMyContext } from "@/Context/MyContextProvider";
import { useQuery } from "@tanstack/react-query";
import { getActiveMenu } from "@/services/home";
import { useDispatch } from "react-redux";
import { logout } from "@/store/auth/authSlice";
import CustomBtn from "@/utils/CustomBtn";
import AvatarImage from '../../utils/ProfileUtils/AvatarImage';
import GlobalSearch from "../modals/GlobalSearch";
const HeaderDefault = memo(() => {
  const router = useRouter();


  // if (!shouldShowMenu) return null;

  const { UserData, createSlug, isLoggedIn, systemSetting, showHeaderBookBtn } =
    useMyContext();
  const [isMega, setIsMega] = useState(true);
  const location = useRouter();
  const [show1, setShow1] = useState(false);
  const [show, setShow] = useState(false);
  const [searchShow, setSearchShow] = useState(false);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (nextShow, event) => {
    // Check if event exists and has preventDefault method
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
      event.stopPropagation();
    }
    setIsOpen(nextShow);
  };

  const handleToggleClick = (e) => {
    setSearchShow((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      const headerSticky = document.querySelector(".header-sticky");
      if (headerSticky) {
        if (window.scrollY > 1) {
          headerSticky.classList.add("sticky");
        } else {
          headerSticky.classList.remove("sticky");
        }
      }
    };

    const updateIsMega = () => {
      setIsMega(location.asPath === "/");
    };

    window.addEventListener("scroll", handleScroll);
    updateIsMega();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location]);

  const {
    data: menu = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["activeMenu"],
    queryFn: getActiveMenu,
  });

  const handleNavigation = (href) => {
    location.push(href);
    setShow1(false); // Close mobile menu
    setShow(false); // Close user dropdown
  };

  const handleLogout = () => {
    dispatch(logout());
    location.push("/auth/login");
  };


  // Extract event_key from the URL
  const { event_key } = router.query;

  // ...existing code...

  // Book button handler
  const handleBookClick = () => {
    if (event_key) {
      router.push(`/events/cart/${event_key}`);
    }
  };

  return (
    <Fragment>
      <GlobalSearch show={searchShow} handleShow={handleToggleClick} />
      <header className="header-center-home header-default header-sticky sticky">
        <Navbar
          expand="xl"
          className="nav navbar-light iq-navbar header-hover-menu py-xl-0"
        >
          <Container fluid className="navbar-inner">
            <div className="d-flex align-items-center justify-content-between w-100 landing-header">
              <div className="d-flex gap-3 gap-xl-0 align-items-center">
                <div>
                  <button
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#navbar_main"
                    aria-controls="navbar_main"
                    className="d-xl-none btn btn-primary rounded-pill p-1 pt-0 toggle-rounded-btn"
                    onClick={() => setShow1(!show1)}
                  >
                    <ArrowLeftIcon size={20} />
                  </button>
                </div>
                {/* <Logo /> */}
                <Image height={65} src={systemSetting?.auth_logo || ""} />
              </div>
              <Navbar
                expand="xl"
                className={`offcanvas mobile-offcanvas nav hover-nav horizontal-nav py-xl-0 ${show1 === true ? "show" : ""
                  } ${isMega ? "mega-menu-content" : ""}`}
                style={{
                  visibility: `${show1 === true ? "visible" : "hidden"}`,
                }}
                id="navbar_main"
              >
                <Container fluid className="container-fluid p-lg-0">
                  <Offcanvas.Header className="px-0">
                    <div className="navbar-brand ms-3">
                      <Image height={65} src={systemSetting?.mo_logo || ""} />
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShow1(false)}
                      aria-label="Close"
                    ></button>
                  </Offcanvas.Header>
                  <ul
                    className="navbar-nav iq-nav-menu list-unstyled"
                    id="header-menu"
                  >
                    {menu.map((item) => {
                      let href =
                        item.external_url ||
                        (item.page ? `/${createSlug(item.page.title)}` : "#");

                      // If the item is "home" (case insensitive), set href to root '/'
                      if (item.title.toLowerCase() === "home") {
                        href = "/";
                      }

                      const isActive = location.asPath === href;

                      return (
                        <Nav.Item key={item.id} className="nav-item">
                          <Link href={href} passHref legacyBehavior>
                            <Nav.Link
                              className={`fw-bold ${isActive ? "active" : ""}`}
                              onClick={() => handleNavigation(href)}
                            >
                              {item.title}
                            </Nav.Link>
                          </Link>
                        </Nav.Item>
                      );
                    })}
                    <Nav.Item className="nav-item">
                      <Link href="/blogs" passHref legacyBehavior>
                        <Nav.Link
                          className={`fw-bold ${location.asPath === "/blogs" ? "active" : ""
                            }`}
                          onClick={() => handleNavigation("/blogs")}
                        >
                          Blogs
                        </Nav.Link>
                      </Link>
                    </Nav.Item>
                  </ul>
                </Container>
              </Navbar>
              <div className="right-panel">
                <Button
                  id="navbar-toggle"
                  bsPrefix="navbar-toggler"
                  type="button"
                  aria-expanded={show}
                  data-bs-toggle="collapse"
                  className="fw-bold"
                  data-bs-target="#navbarSupportedContent"
                  onClick={() => setShow(!show)}
                >
                  <span className="navbar-toggler-btn">
                    <span className="navbar-toggler-icon"></span>
                  </span>
                </Button>
                <div
                  className={`fw-bold navbar-collapse ${show === true ? "collapse show" : "collapse"
                    }`}
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav align-items-center ms-auto mb-2 mb-xl-0">
                    {showHeaderBookBtn && (
                      <CustomBtn
                        variant="outline-primary"
                        icon={<i className="fa-solid fa-arrow-right ms-2"></i>}
                        className="me-4 fw-bold btn-sm"
                        onClick={handleBookClick}
                        buttonText="Book Now"
                      >
                      </CustomBtn>
                    )}
                    <Dropdown
                      as="li"
                      className="nav-item dropdown iq-responsive-menu"
                    >
                      <div className={`search-box ${isOpen ? "show" : ""}`}>
                        <Dropdown show={isOpen} onToggle={handleToggle}>
                          <Dropdown.Toggle
                            as={CustomToggle}
                            href="#"
                            variant="nav-link p-0"
                            onClick={handleToggleClick}
                          >
                            <div className="btn-icon btn-sm rounded-pill btn-action">
                              <span className="btn-inner">
                                <SearchIcon size={20} />
                              </span>
                            </div>
                          </Dropdown.Toggle>
                        </Dropdown>
                      </div>
                    </Dropdown>

                    {isLoggedIn ? (
                      <Dropdown as="li" className="nav-item">
                        <Dropdown.Toggle
                          as={CustomToggle}
                          href="#"
                          variant=" nav-link d-flex align-items-center"
                          size="sm"
                          id="dropdownMenuButton1"
                        >
                          <div className="btn-icon rounded-pill user-icons">
                            <span className="btn-inner">
                              <UserIcon size={18} />
                            </span>
                          </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          as="ul"
                          className="dropdown-menu-end dropdown-user border-0 p-0 m-0"
                        >
                          <li className="user-info d-flex align-items-center gap-3 mb-3">
                            <AvatarImage
                              src={UserData.photo}
                              alt="Profile"
                              name={UserData.name}
                              size={43}
                            />
                            <span className="font-size-14 fw-500 text-capitalize text-white">
                              {UserData?.name}
                            </span>
                          </li>
                          <li>
                            <Link
                              href="/profile"
                              className="iq-sub-card d-flex align-items-center gap-3"
                            >
                              <UserIcon size={16} />
                              <h6 className="mb-0 font-size-14 fw-normal">
                                My Profile
                              </h6>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/extra/pricing-plan"
                              className="iq-sub-card d-flex align-items-center gap-3"
                            >
                              <CreditCardIcon size={16} />
                              <h6 className="mb-0 font-size-14 fw-normal">
                                Bookings
                              </h6>
                            </Link>
                          </li>
                          <li>
                            <Button
                              href="/auth/login"
                              className="border-0 iq-sub-card iq-logout-2 mt-1 d-flex justify-content-center gap-2"
                              onClick={handleLogout}
                            >
                              <LogOutIcon size={16} />
                              <h6 className="mb-0 font-size-14 fw-normal">
                                Logout
                              </h6>
                            </Button>
                          </li>
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : (
                      <CustomBtn
                        style={{ padding: "8px 16px" }}
                        buttonText={"Login"}
                        className={'ms-3'}
                        icon={<Fingerprint size={20} />}
                        HandleClick={() => location.push("/auth/login")}
                      />
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </Navbar>
      </header>
    </Fragment>
  );
});

HeaderDefault.displayName = "HeaderDefault";
export default HeaderDefault;
