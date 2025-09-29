import React, { useState, useEffect } from "react";

//react-boostrap
import { Button, Nav, Collapse, Navbar, Container } from "react-bootstrap";

//rounter
import { Link } from "react-router-dom";

//components
import Card from "../components/bootstrap/card";
import Logo from "../components/partials/components/logo";

//uiKit
import Accordions from "./uikit/accordion";
import Alerts from "./uikit/alert";
import Badges from "./uikit/badge";
import Breadcrumbs from "./uikit/breadcrumb";
import Buttons from "./uikit/button";
import ButtonGroups from "./uikit/buttons-group";
import Calenders from "./uikit/calender";
import Cards from "./uikit/card";
import Carousels from "./uikit/carousel";
import CollapseComponent from "./uikit/collapse";
import DropDowns from "./uikit/dropdowns";
import ListGroups from "./uikit/list-group";
import Modals from "./uikit/modal";
import Navbars from "./uikit/navbar";
import Navs from "./uikit/nav";
import OffCanvass from "./uikit/off-canvas";
import Paginations from "./uikit/pagination";
import Popovers from "./uikit/popovers";
import Ribbon from "./uikit/ribbon";
import Scrollspys from "./uikit/scrollspy";
import Spinnerss from "./uikit/spinner";
import Toasts from "./uikit/toast";
import Tooltips from "./uikit/tooltip";
import Progresss from "./uikit/progress";
import Footer from "../components/partials/dashboard/footerstyle/footer";

//form
import DisabledForms from "./uikit/disabled-form";
import AFormControls from "./uikit/alternate-form-control";
import Sizings from "./uikit/sizing";
import InputGroups from "./uikit/input-group";
import FloatingLables from "./uikit/floating-lable";
import AFloatingLables from "./uikit/alternate-floating-lable";
import ToggleBtns from "./uikit/toggle-btn";
import Validations from "./uikit/validation";
import Overview from "./uikit/form-overview";

// content
import Typographys from "./uikit/typography";
import Images from "./uikit/image";
import Figures from "./uikit/figure";
import Tables from "./uikit/table";

//img
import topImage from "../assets/images/dashboard/top-image.jpg";

//prism
import "../../node_modules/prismjs/prism";
import "../../node_modules/prismjs/themes/prism-okaidia.css";

// SliderTab
import SliderTab from "../directives/slider-tabs";

// Import selectors & action from setting store
import * as SettingSelector from "../store/setting/selectors";

// Redux Selector / Action
import { useSelector } from "react-redux";

//settingoffcanvas
import SettingOffCanvas from "../components/setting/SettingOffCanvas";
import FilledInput from "./uikit/filled-input";

// sidebar-offcanvas
const SidebarOffcanvas = React.lazy(() => import("./uikit/sidebar-offcanvas"));

const Index = React.memo(() => {
  const appName = useSelector(SettingSelector.app_name);
  // collapse
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  useEffect(() => {
    return () => {
      setTimeout(() => {
        Array.from(
          document.querySelectorAll('[data-toggle="slider-tab"]'),
          (elem) => {
            return new SliderTab(elem);
          }
        );
      }, 100);
    };
  });

  useEffect(() => {
    const backToTop = document.getElementById("back-to-top");

    if (backToTop) {
      backToTop.classList.add("animate__animated", "animate__fadeOut");

      const handleScroll = () => {
        if (document.documentElement.scrollTop > 250) {
          backToTop.classList.remove("animate__fadeOut");
          backToTop.classList.add("animate__fadeIn");
        } else {
          backToTop.classList.remove("animate__fadeIn");
          backToTop.classList.add("animate__fadeOut");
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <React.Fragment>
      <span className="uisheet screen-darken"></span>
      <div
        className="header"
        style={{
          background: `url(${topImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "100vh",
          position: "relative",
        }}
      >
        <div className="main-img">
          <div className="container">
            <svg
              width="150"
              viewBox="0 0 55 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="-0.423828"
                y="34.5762"
                width="50"
                height="7.14286"
                rx="3.57143"
                transform="rotate(-45 -0.423828 34.5762)"
                fill="white"
              />
              <rect
                x="14.7295"
                y="49.7266"
                width="50"
                height="7.14286"
                rx="3.57143"
                transform="rotate(-45 14.7295 49.7266)"
                fill="white"
              />
              <rect
                x="19.7432"
                y="29.4902"
                width="28.5714"
                height="7.14286"
                rx="3.57143"
                transform="rotate(45 19.7432 29.4902)"
                fill="white"
              />
              <rect
                x="19.7783"
                y="-0.779297"
                width="50"
                height="7.14286"
                rx="3.57143"
                transform="rotate(45 19.7783 -0.779297)"
                fill="white"
              />
            </svg>
            <h1 className="my-4">
              <span data-setting="app_name">{appName}</span>Pro - Design System
            </h1>
            <h4 className="text-white mb-5">
              Production ready FREE Open Source <b>Dashboard UI Kit</b> and{" "}
              <b>Design System</b>.
            </h4>
            <div className="d-flex justify-content-center align-items-center">
              <div>
                <Link
                  className="bg-white btn  text-black d-flex"
                  to="/dashboard"
                  target="_black"
                >
                  <svg
                    width="22"
                    height="22"
                    className="me-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    ></path>
                  </svg>
                  Dashboard Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Container>
          <Nav className="rounded  navbar navbar-expand-lg navbar-light top-1">
            <Container>
              <Navbar.Brand href="#" className="mx-2 d-flex align-items-center">
                <Logo color={"true"} />
                <h5 className="logo-title mx-3">{appName}</h5>
              </Navbar.Brand>
              <Navbar.Toggle
                aria-controls="basic-navbar-nav"
                onClick={() => setOpen3(!open3)}
              />
              <Navbar.Collapse id="basic-navbar-nav" in={open3}>
                <ul className="mb-2 navbar-nav ms-auto mb-lg-0 d-flex align-items-start">
                  <Nav.Item as="li">
                    <Nav.Link
                      aria-current="page"
                      href="https://templates.iqonic.design/hope-ui/pro/documentation/react"
                      target="_blank"
                    >
                      Documentation
                    </Nav.Link>
                  </Nav.Item>
                  <li className="nav-item me-3">
                    <Nav.Link
                      aria-current="page"
                      href="https://templates.iqonic.design/hope-ui/pro/documentation/react/changelog"
                      target="_blank"
                    >
                      Change Log
                    </Nav.Link>
                  </li>

                  <Nav.Item as="li" className="me-3 mb-2 mb-sm-0">
                    <Link
                      className="btn btn-secondary"
                      to="/landing-pages/home"
                      target="_blank"
                    >
                      Landing pages
                    </Link>
                  </Nav.Item>

                  <Nav.Item as="li" className="me-3 mb-2 mb-sm-0">
                    <Button
                      variant="primary d-flex align-items-center gap-2"
                      aria-current="page"
                      href="https://iqonic.design/product/admin-templates/hope-ui-free-open-source-react-admin-template/"
                      target="_blank"
                    >
                      <svg
                        className="icon-22"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.4274 2.5783C20.9274 2.0673 20.1874 1.8783 19.4974 2.0783L3.40742 6.7273C2.67942 6.9293 2.16342 7.5063 2.02442 8.2383C1.88242 8.9843 2.37842 9.9323 3.02642 10.3283L8.05742 13.4003C8.57342 13.7163 9.23942 13.6373 9.66642 13.2093L15.4274 7.4483C15.7174 7.1473 16.1974 7.1473 16.4874 7.4483C16.7774 7.7373 16.7774 8.2083 16.4874 8.5083L10.7164 14.2693C10.2884 14.6973 10.2084 15.3613 10.5234 15.8783L13.5974 20.9283C13.9574 21.5273 14.5774 21.8683 15.2574 21.8683C15.3374 21.8683 15.4274 21.8683 15.5074 21.8573C16.2874 21.7583 16.9074 21.2273 17.1374 20.4773L21.9074 4.5083C22.1174 3.8283 21.9274 3.0883 21.4274 2.5783Z"
                          fill="currentColor"
                        ></path>
                        <path
                          opacity="0.4"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.01049 16.8079C2.81849 16.8079 2.62649 16.7349 2.48049 16.5879C2.18749 16.2949 2.18749 15.8209 2.48049 15.5279L3.84549 14.1619C4.13849 13.8699 4.61349 13.8699 4.90649 14.1619C5.19849 14.4549 5.19849 14.9299 4.90649 15.2229L3.54049 16.5879C3.39449 16.7349 3.20249 16.8079 3.01049 16.8079ZM6.77169 18.0003C6.57969 18.0003 6.38769 17.9273 6.24169 17.7803C5.94869 17.4873 5.94869 17.0133 6.24169 16.7203L7.60669 15.3543C7.89969 15.0623 8.37469 15.0623 8.66769 15.3543C8.95969 15.6473 8.95969 16.1223 8.66769 16.4153L7.30169 17.7803C7.15569 17.9273 6.96369 18.0003 6.77169 18.0003ZM7.02539 21.5683C7.17139 21.7153 7.36339 21.7883 7.55539 21.7883C7.74739 21.7883 7.93939 21.7153 8.08539 21.5683L9.45139 20.2033C9.74339 19.9103 9.74339 19.4353 9.45139 19.1423C9.15839 18.8503 8.68339 18.8503 8.39039 19.1423L7.02539 20.5083C6.73239 20.8013 6.73239 21.2753 7.02539 21.5683Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                      Try Free Version
                    </Button>
                  </Nav.Item>
                </ul>
              </Navbar.Collapse>
            </Container>
          </Nav>
        </Container>
      </div>
      <div className=" body-class-1 container">
        <aside
          className="mb-5 mobile-offcanvas bd-aside card iq-document-card sticky-xl-top text-muted align-self-start"
          id="left-side-bar"
        >
          <div className="offcanvas-header p-0">
            <button className="btn-close float-end"></button>
          </div>
          <h2 className="h6 pb-2 border-bottom">On this page</h2>
          <div className="small" id="elements-section">
            <ul className="list-unstyled mb-0">
              <li className="mt-2">
                <Button
                  variant=" d-inline-flex align-items-center "
                  onClick={() => setOpen(!open)}
                  aria-controls="example-collapse-text"
                  aria-expanded={open}
                >
                  <i className="right-icon me-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon-18"
                      width="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </i>
                  Components
                </Button>
                <Collapse in={open}>
                  <ul
                    className="list-unstyled ps-3 elem-list"
                    id="components-collapse"
                    to="#components"
                  >
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#accordion"
                      >
                        Accordion
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#alerts"
                      >
                        Alerts
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#badge"
                      >
                        Badge
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#breadcrumb"
                      >
                        Breadcrumb
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#buttons"
                      >
                        Buttons
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#button-group"
                      >
                        Button Group
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#dropdowns"
                      >
                        Dropdowns
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#calendar"
                      >
                        Calendar
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#card"
                      >
                        Card
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#carousel"
                      >
                        Carousel
                      </Nav.Link>
                    </li>

                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#list-group"
                      >
                        List Group
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#modal"
                      >
                        Modal
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#navs"
                      >
                        Navs
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#navbar"
                      >
                        Navbar
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#off-canvas"
                      >
                        Off Canvas
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#pagination"
                      >
                        Pagination
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#popovers"
                      >
                        Popovers
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-item-center rounded"
                        href="#ribbon"
                      >
                        Ribbon
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#progress"
                      >
                        Progress
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#scrollspy"
                      >
                        Scrollspy
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#spinners"
                      >
                        Spinners
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#toasts"
                      >
                        Toasts
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#tooltips"
                      >
                        Tooltips
                      </Nav.Link>
                    </li>
                  </ul>
                </Collapse>
              </li>
              <li className="my-2">
                <Button
                  variant=" d-inline-flex align-items-center "
                  onClick={() => setOpen1(!open1)}
                  aria-controls="example-collapse-text"
                  aria-expanded={open1}
                >
                  <i className="right-icon me-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon-18"
                      width="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </i>
                  Forms
                </Button>
                <Collapse in={open1}>
                  <ul
                    className="list-unstyled ps-3 "
                    id="forms-collapse"
                    to="#forms"
                  >
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#overview"
                      >
                        Overview
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#disabled-forms"
                      >
                        Disabled Forms
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#sizing"
                      >
                        Sizing
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#input-group"
                      >
                        Input Group
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#filled-input"
                      >
                        Filled Input
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#a-form-control"
                      >
                        Alertnate Input
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#floating-labels"
                      >
                        Floating Labels
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#a-floating-labels"
                      >
                        Alertnate Float Labels
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#toggle-btn"
                      >
                        Toggle Button
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#validation"
                      >
                        Validation
                      </Nav.Link>
                    </li>
                  </ul>
                </Collapse>
              </li>
              <li className="mb-2">
                <Button
                  variant=" d-inline-flex align-items-center "
                  onClick={() => setOpen2(!open2)}
                  aria-controls="example-collapse-text"
                  aria-expanded={open2}
                >
                  <i className="right-icon me-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon-18"
                      width="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </i>
                  Contents
                </Button>
                <Collapse in={open2}>
                  <ul
                    className="list-unstyled ps-3 "
                    id="contents-collapse"
                    to="#content"
                  >
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#typography"
                      >
                        Typography
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#images"
                      >
                        Images
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#tables"
                      >
                        Tables
                      </Nav.Link>
                    </li>
                    <li>
                      <Nav.Link
                        className="d-inline-flex align-items-center rounded"
                        href="#figures"
                      >
                        Figures
                      </Nav.Link>
                    </li>
                  </ul>
                </Collapse>
              </li>
            </ul>
          </div>
        </aside>
        <div className="bd-cheatsheet container-fluid bg-trasprent">
          <section id="components">
            <div className="iq-side-content sticky-xl-top">
              <Card className="">
                <Card.Body className="">
                  <h4 className="fw-bold">Components</h4>
                </Card.Body>
              </Card>
            </div>
            <Accordions />
            <Alerts />
            <Badges />
            <Breadcrumbs />
            <Buttons />
            <ButtonGroups />
            <DropDowns />
            <Calenders />
            <Cards />
            <Carousels />
            <CollapseComponent />
            <ListGroups />
            <Modals />
            <Navs />
            <Navbars />
            <OffCanvass />
            <Paginations />
            <Popovers />
            <Progresss />
            <Ribbon />
            <Scrollspys />
            <Spinnerss />
            <Toasts />
            <Tooltips />
          </section>
          <section id="forms">
            <div className="iq-side-content sticky-xl-top">
              <Card className="">
                <Card.Body className="">
                  <h4 className="fw-bold">Forms</h4>
                </Card.Body>
              </Card>
            </div>
            <Overview />
            <DisabledForms />
            <Sizings />
            <InputGroups />
            <FilledInput />
            <AFormControls />
            <FloatingLables />
            <AFloatingLables />
            <ToggleBtns />
            <Validations />
          </section>
          <section id="content">
            <div className="iq-side-content sticky-xl-top">
              <Card className="">
                <Card.Body className="">
                  <h4 className="fw-bold">Contents</h4>
                </Card.Body>
              </Card>
            </div>
            <Typographys />
            <Images />
            <Tables />
            <Figures />
          </section>
        </div>
      </div>
      <div id="back-to-top" style={{ display: "none" }}>
        <Button size="xs" variant="primary  p-0 position-fixed top" href="#top">
          <svg
            width="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 15.5L12 8.5L19 15.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </Button>
      </div>
      <div className="middle" style={{ display: "none" }}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <SidebarOffcanvas />
        </React.Suspense>
      </div>
      <SettingOffCanvas name={true} page={false} />
      <Footer />
    </React.Fragment>
  );
});

export default Index;
