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
  ChevronDown,
  Plus,
  Minus,
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
import AvatarImage from "../../utils/ProfileUtils/AvatarImage";
import GlobalSearch from "../modals/GlobalSearch";



const HeaderDefault = memo(() => {
  const router = useRouter();

  const {
    UserData,
    createSlug,
    isLoggedIn,
    isMobile,
    systemSetting,
    showHeaderBookBtn,
    fetchEventCategories,
  } = useMyContext();
  // console.log(isMobile, "isMobile---");
  const [isMega, setIsMega] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const location = useRouter();
  const [show1, setShow1] = useState(false);
  const [show, setShow] = useState(false);
  const [searchShow, setSearchShow] = useState(false);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);


  const menu = [
    { id: 1, title: "Home", href: "/" },
    { id: 2, title: "About Us", href: "/about-us" },
    { id: 3, title: "Contact Us", href: "/contact-us" },
    { id: 4, title: "FAQ", href: "/faq" },
    { id: 5, title: "Blog", href: "/blogs" },
  ];
  // NEW: State for show more functionality
  const [showAllEvents, setShowAllEvents] = useState(false);
  const INITIAL_DISPLAY_COUNT = 5; // Show only 5 categories initially

  const handleToggle = (nextShow, event) => {
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

  // Categories query (renamed variables)
  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorObj,
  } = useQuery({
    queryKey: ["eventCategories"],
    queryFn: fetchEventCategories,
    staleTime: 1000 * 60 * 5,
  });

  // Sync query result into local state (if you still want local state)
  useEffect(() => {
    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      setCategoryList(categoriesData);
    }
  }, [categoriesData]);

  const handleNavigation = (href) => {
    location.push(href);
    setShow1(false);
    setShow(false);
    setEventsOpen(false); // Close events dropdown when navigating
    setShowAllEvents(false); // Reset show more state
  };

  // NEW: Mouse enter/leave handlers for events dropdown
  const handleEventsMouseEnter = () => {
    setEventsOpen(true);
  };

  const handleEventsMouseLeave = () => {
    setEventsOpen(false);
    setShowAllEvents(false); // Reset show more when leaving
  };

  const handleLogout = () => {
    dispatch(logout());
    location.push("/auth/login");
  };

  const { event_key } = router.query;

  const handleBookClick = () => {
    if (event_key) {
      router.push(`/events/cart/${event_key}`);
    }
  };

  // Function to handle events dropdown toggle (now for mobile only)
  const toggleEventsDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow toggle on mobile/small screens
    if (typeof window !== "undefined" && window.innerWidth <= 1200) {
      setEventsOpen(!eventsOpen);
      if (eventsOpen) {
        setShowAllEvents(false);
      }
    }
  };

  // NEW: Function to handle show more/less
  const handleShowMoreLess = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllEvents(!showAllEvents);
  };

  // NEW: Get displayed categories based on showAllEvents state
  const getDisplayedCategories = () => {
    if (!categoryList || categoryList.length === 0) return [];
    return showAllEvents ? categoryList : categoryList.slice(0, INITIAL_DISPLAY_COUNT);
  };

  const displayedCategories = getDisplayedCategories();
  const hasMoreCategories = (categoryList?.length ?? 0) > INITIAL_DISPLAY_COUNT;

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
                <Logo size={150} />
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
                <Link href={"/"}>
                  <Image height={65} src={systemSetting?.auth_logo || ""} />
                </Link>
              </div>
              <Navbar
                expand="xl"
                className={`offcanvas mobile-offcanvas nav hover-nav horizontal-nav py-xl-0 ${show1 === true ? "show" : ""
                  } ${isMega ? "mega-menu-content" : ""}`}
                style={{
                  visibility: `${show1 === true ? "visible" : "hidden"}`,
                  background: "#000000f2",
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
                      const isActive = location.asPath === item?.href;
                      return (
                        <Nav.Item as="li" key={item.id} className="nav-item">
                          <Link href={`${item?.href}`} passHref legacyBehavior>
                            <Nav.Link
                              className={`fw-bold ${isActive ? "active" : ""}`}
                              onClick={() => handleNavigation(`${item?.href}`)}
                            >
                              {item.title}
                            </Nav.Link>
                          </Link>
                        </Nav.Item>
                      );
                    })}
                    {/* Events Dropdown - Enhanced with Hover and Show More */}
                    <Nav.Item
                      as="li"
                      className="nav-item events-dropdown-item"
                      onMouseEnter={handleEventsMouseEnter}
                      onMouseLeave={handleEventsMouseLeave}
                    >
                      <Nav.Link
                        aria-expanded={eventsOpen}
                        href="/events"
                        onClick={toggleEventsDropdown}
                        className="fw-bold"
                        style={{ cursor: "pointer" }}
                      >
                        <span className="item-name">Events</span>
                        <span className="menu-icon ms-2">
                          <ChevronDown
                            size={16}
                            className="toggledrop-desktop right-icon"
                          />
                          <span className="toggle-menu">
                            <Plus size={16} className="arrow-active text-white" />
                            <Minus size={16} className="arrow-hover text-white" />
                          </span>
                        </span>
                      </Nav.Link>

                      {categoryList && categoryList.length > 0 && (
                        <div className={`events-dropdown-wrapper ${eventsOpen ? "show" : ""}`}>
                          <div className="events-dropdown-container">
                            {/* Scrollable container for categories */}
                            <ul
                              className="events-category-list"
                              style={{
                                maxHeight: showAllEvents ? "300px" : "auto",
                                overflowY: showAllEvents ? "auto" : "visible",
                                paddingRight: showAllEvents ? "8px" : "0",
                                transition: "max-height 0.3s ease",
                              }}
                            >
                              <Nav.Item as="li" key={displayedCategories.length+1}>
                                  <Link
                                    href={`/events`}
                                    className={`nav-link ${location.pathname === `/events}` ? "active" : ""}`}
                                    // onClick={() => handleNavigation(`/events/category/${category.value || category.id}`)}
                                  >
                                    All Events
                                  </Link>
                                </Nav.Item>
                              {displayedCategories.map((category) => (
                                <Nav.Item as="li" key={category.value || category.id}>
                                  <Link
                                    href={`/events/category/${createSlug(category.label).toLowerCase()}?key=${category.value || category.id}`}
                                    className={`nav-link ${location.pathname === `/events/category/${category.value || category.id}` ? "active" : ""}`}
                                    // onClick={() => handleNavigation(`/events/category/${category.value || category.id}`)}
                                  >
                                    {category.label || category.name}
                                  </Link>
                                </Nav.Item>
                              ))}
                            </ul>

                            {/* Show More/Less Button */}
                            {hasMoreCategories && (
                              <div className="show-more-container" style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                                <button
                                  type="button"
                                  className="btn btn-link text-info p-0 fw-bold "
                                  onClick={handleShowMoreLess}
                                  style={{
                                    fontSize: "14px",
                                    textDecoration: "none",
                                  }}
                                >
                                  {showAllEvents ? (
                                    <>
                                      <span>Show Less</span>
                                      <ChevronDown size={14} style={{ transform: "rotate(180deg)", marginLeft: "4px" }} />
                                    </>
                                  ) : (
                                    <>
                                      <span>Show More ({categoryList.length - INITIAL_DISPLAY_COUNT} more)</span>
                                      <ChevronDown size={14} style={{ marginLeft: "4px" }} />
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Nav.Item>
                    {/* 
                    <Nav.Item as="li" className="nav-item">
                      <Link href="/blogs" passHref legacyBehavior>
                        <Nav.Link
                          className={`fw-bold ${location.asPath === "/blogs" ? "active" : ""}`}
                          onClick={() => handleNavigation("/blogs")}
                        >
                          Blogs
                        </Nav.Link>
                      </Link>
                    </Nav.Item> */}
                  </ul>
                </Container>
              </Navbar>
              <div className="right-panel d-flex ">
                <div className={`search-box d-flex align-items-center ${isOpen ? "show" : ""} `}>
                  <Dropdown show={isOpen} onToggle={handleToggle}>
                    <Dropdown.Toggle
                      as={CustomToggle}
                      href="#"
                      variant="nav-link p-0"
                      onClick={handleToggleClick}
                    >
                      <div className="btn-icon btn-sm rounded-pill btn-action text-white">
                        <span className="btn-inner">
                          <SearchIcon size={20} />
                        </span>
                      </div>
                    </Dropdown.Toggle>
                  </Dropdown>
                </div>
                {isLoggedIn ? (
                  <Dropdown as="li" className="">
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
                        <AvatarImage src={UserData.photo} alt="Profile" name={UserData.name} size={43} />
                        <span className="font-size-14 fw-500 text-capitalize text-white">
                          {UserData?.name}
                        </span>
                      </li>
                      <li>
                        <Link href="/profile" className="iq-sub-card d-flex align-items-center gap-3">
                          <UserIcon size={16} />
                          <h6 className="mb-0 font-size-14 fw-normal">My Profile</h6>
                        </Link>
                      </li>
                      {/* <li>
                        <Link href="/extra/pricing-plan" className="iq-sub-card d-flex align-items-center gap-3">
                          <CreditCardIcon size={16} />
                          <h6 className="mb-0 font-size-14 fw-normal">Bookings</h6>
                        </Link>
                      </li> */}
                      <li>
                        <Button
                          href="/auth/login"
                          className="border-0 iq-sub-card iq-logout-2 mt-1 d-flex justify-content-center gap-2"
                          onClick={handleLogout}
                        >
                          <LogOutIcon size={16} />
                          <h6 className="mb-0 font-size-14 fw-normal">Logout</h6>
                        </Button>
                      </li>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <CustomBtn
                    style={{ padding: "8px 16px" }}
                    buttonText={!isMobile && "Login"}
                    className={"ms-3"}
                    icon={<Fingerprint size={20} />}
                    HandleClick={() => location.push("/auth/login")}
                  />
                )}
                <div
                  className={`fw-bold navbar-collapse ${show === true ? "collapse show" : "collapse"}`}
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav align-items-center ms-auto mb-2 mb-xl-0">
                    {showHeaderBookBtn && (
                      <CustomBtn
                        variant="outline-primary"
                        icon={<i className="fa-solid fa-arrow-right ms-2"></i>}
                        className="fw-bold px-4 py-2 d-flex align-items-center rounded-3"
                        HandleClick={handleBookClick}
                        size="sm"
                        style={{
                          height: "3rem",
                          marginRight: '1rem',
                          fontSize: "16px",
                        }} Ï
                        buttonText="Book Now"
                      />
                    )}
                    {/* <Dropdown as="li" className="nav-item dropdown iq-responsive-menu">
                      
                    </Dropdown> */}
                  </ul>
                </div>
                {/* <Button
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
                </Button> */}
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
