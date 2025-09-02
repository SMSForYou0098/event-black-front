import React, { Fragment, memo, useLayoutEffect, useState } from "react";
import { Container, Nav, Navbar, Offcanvas, Dropdown, Image, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import CustomMenu from "./CustomMenu";
import Dlogo from '../../../../assets/event/stock/logo_new.webp';
import { useMyContext } from "../../../../Context/MyContextProvider";
import CustomToggle from "../../../../components/dropdowns";
import LandingOffcanvasHeader from "./landing-offcanvas-header";
import { Search } from "lucide-react";
import { MenuIcon } from "../CustomHooks/CustomIcon";

const Header2 = memo(() => {
  const { GetSystemSetting, isScrolled } = useMyContext();
  const [systemSetting, setSystemSetting] = useState({
    logo: '',
    navColor: '#000',        // default background
    fontColor: '#fff',       // default font color
  });

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(!show);

  useLayoutEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        // Get cached
        const cached = localStorage.getItem('systemSetting');
        if (cached && isMounted) {
          setSystemSetting(JSON.parse(cached));
        }

        const data = await GetSystemSetting();
        if (data && isMounted) {
          const updatedSetting = {
            logo: data?.logo || Dlogo,
            navColor: data?.navColor || '#000',
            fontColor: data?.fontColor || '#fff',
          };

          setSystemSetting(updatedSetting);
          localStorage.setItem('systemSetting', JSON.stringify(updatedSetting));
        }
      } catch (error) {
        console.error('Error loading system setting:', error);
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Fragment>
      <Navbar
        expand="xl"
        className="nav navbar navbar-expand-xl navbar-light iq-navbar  p-0"
        style={{
          backgroundColor: systemSetting.navColor,
          // color: systemSetting.fontColor,
          boxShadow: isScrolled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <Container fluid className="navbar-inner">
          <div className="d-flex align-items-center justify-content-between w-100 landing-header">
            <Link to="home" className="navbar-brand m-0 d-xl-flex d-none">
              <Image
                src={systemSetting.logo}
                alt="logo"
                loading="lazy"
                width={130}
                className="p-0"
                style={{height:'60px', width:'auto'}}
                onError={(e) => {
                  e.target.src = Dlogo;
                  e.target.onerror = null;
                }}
              />
            </Link>

            <div className="d-flex align-items-center d-xl-none">
              <LandingOffcanvasHeader show={show} handleClose={handleClose} handleShow={handleShow} />
              <Link to="home" className="navbar-brand ms-3">
                <Image
                  src={systemSetting.logo}
                  alt="logo"
                  loading="lazy"
                  width={100}
                  className="mobile-logo-home"
                  onError={(e) => {
                    e.target.src = Dlogo;
                    e.target.onerror = null;
                  }}
                />
              </Link>
            </div>

            <div className="right-action d-flex align-items-center">
              <ul className="d-block d-xl-none list-unstyled m-0">
                <Dropdown as="li" className="nav-item iq-responsive-menu">
                  <Dropdown.Toggle as={CustomToggle} variant="btn btn-sm bg-body">
                    <Search size={16} color="grey" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    as="ul"
                    className="dropdown-menu-end"
                    style={{ width: "18rem" }}
                  >
                    <li className="px-3 py-0">
                      <div className="form-group input-group mb-0">
                        <input type="text" className="form-control" placeholder="Search..." />
                        <span className="input-group-text">
                          <Search size={16} color="grey" />
                        </span>
                      </div>
                    </li>
                  </Dropdown.Menu>
                </Dropdown>
              </ul>
              <Button className="d-block d-xl-none list-unstyled m-0" variant="link" onClick={handleShow}>
                <MenuIcon isOpen={show} />
              </Button>
            </div>

            {/* Horizontal Menu */}
            <Navbar expand="xl" id="navbar_main" className="mobile-offcanvas nav navbar navbar-expand-xl horizontal-nav">
              <Container fluid className="p-lg-0">
                <Offcanvas.Header className="px-0">
                  <Navbar.Brand className="ms-3" />
                  <button className="btn-close float-end px-3"></button>
                </Offcanvas.Header>
                <Nav as="ul" className="navbar-nav iq-nav-menu list-unstyled" id="header-menu">
                  <CustomMenu />
                </Nav>
              </Container>
            </Navbar>
          </div>
        </Container>
      </Navbar>
    </Fragment>
  );
});

export default Header2;
