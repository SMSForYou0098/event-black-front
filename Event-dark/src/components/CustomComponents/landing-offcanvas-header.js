import React, { Fragment, memo } from "react";
import { Nav, Offcanvas, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import CustomMenu from "./CustomMenu";

const LandingOffcanvasHeader = memo(({ show, handleShow, handleClose }) => {
  return (
    <Fragment>
      <Offcanvas
        show={show}
        closeVariant="white"
        onHide={handleClose}
        className="mobile-offcanvas nav navbar navbar-expand-xl hover-nav py-0"
        style={{
          backgroundColor: '#17132E',
        }}
      >
        <Container fluid className="p-lg-0 ">
          <Offcanvas.Header
            closeButton
            className="px-0 mx-3"
          >
            <style>
              {`
              .btn-close {
                background-color: white !important;
                opacity: 1;
                }
              `}
            </style>
            <Link to="home" className="navbar-brand ms-3">
            </Link>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="landing-header">
              <Nav
                as="ul"
                className="navbar-nav iq-nav-menu  list-unstyled"
                id="header-menu"
              >
                <CustomMenu handleClose={handleClose} />
              </Nav>
            </div>
          </Offcanvas.Body>
        </Container>
      </Offcanvas>
    </Fragment>
  );
});

export default LandingOffcanvasHeader;
