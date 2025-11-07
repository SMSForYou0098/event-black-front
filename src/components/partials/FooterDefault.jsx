import { memo, Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useQuery } from '@tanstack/react-query';
import { getFooterData } from "@/services/home";
import DOMPurify from 'dompurify';
import { MailCheck } from "lucide-react";
import Logo from "./Logo";

const FooterMega = memo(() => {
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch footer data using TanStack Query
  const { data, isLoading, error, isSuccess } = useQuery({
    queryKey: ['footerData'],
    queryFn: getFooterData,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (document.documentElement.scrollTop > 250) {
      setAnimationClass("animate__fadeIn");
    } else {
      setAnimationClass("animate__fadeOut");
    }
  };

  useEffect(() => {
    handleScroll();
    setCurrentYear(new Date().getFullYear());
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fix for the TypeScript error - safely handle the site_credit string
  const getCopyrightText = () => {
    if (!data?.config?.site_credit) return `All Rights Reserved`;
    
    // Safely replace {year} with currentYear
    const creditText = data.config.site_credit;
    if (typeof creditText === 'string') {
      return creditText.replace(/{year}/g, currentYear.toString());
    }
    
    return `All Rights Reserved`;
  };

  if (isLoading) {
    return (
      <footer className="footer footer-default">
        <Container fluid>
          <div className="text-center p-5">Loading Footer...</div>
        </Container>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="footer footer-default">
        <Container fluid>
          <div className="text-center p-5 text-danger">Failed to load footer information.</div>
        </Container>
      </footer>
    );
  }
const footerStaticData = {
  groups: [
    {
      id: 1,
      title: "Company",
      footer_menu: [
        { id: 1, title: "About Us", page_id: "about-us" },
        { id: 2, title: "Contact Us", page_id: "contact-us" },
        { id: 5, title: "FAQ", page_id: "faq" },
      ],
    },
    {
      id: 2,
      title: "Legal",
      footer_menu: [
        { id: 3, title: "Privacy Policy", page_id: "privacy-policy" },
        { id: 4, title: "Terms & Conditions", page_id: "terms-and-conditions" },
        { id: 4, title: "Pricing Policy", page_id: "pricing-policy" },
      ],
    },
  ],
};

  return (
    <>
      {isSuccess && data && (
        <Fragment>
          <footer className="footer footer-default">
            <Container fluid>
              <div className="footer-top">
                <Row>
                  {/* Logo and Contact Section */}
                  <Col xl={3} lg={6} className="mb-5 mb-lg-0">
                    <div className="footer-logo">
                      {/* <Logo size={120} /> */}
                      <Logo
                        desktopUrl="/assets/images/logo/footer-logo.png"
                        mobileUrl="/assets/images/logo/footer-logo.png"
                        size={250}
                      />
                    </div>
                      <p className="mb-4 font-size-14">
                        <MailCheck color="var(--bs-primary)" /> {" "}
                        <a
                          href={`mailto:${'contact@getyourticket.in'}`}
                          className="text-white"
                        >
                          {'contact@getyourticket.in'}
                        </a>
                      </p>
                  </Col>

                  {/* Dynamic Footer Link Groups - Limited to 2 groups for layout */}
                  {footerStaticData.groups.map((group, index) => (
                    <Col xl={3} lg={6} className="mb-5 mb-lg-0" key={group.id}>
                      <h4 className="footer-link-title">{group.title}</h4>
                      <ul className="list-unstyled footer-menu">
                        {group.footer_menu.map((link) => (
                          <li className="mb-3" key={link.id}>
                            <Link
                              href={`/${link.page_id}`}
                              className="ms-3"
                            >
                              {link.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Col>
                  ))}

                  {/* Newsletter and Social Media Section */}
                  <Col xl={3} lg={6}>
                    <h4 className="footer-link-title">Subscribe Newsletter</h4>
                    <div className="mailchimp mailchimp-dark">
                      <div className="input-group mb-3 mt-4">
                        <input
                          type="email"
                          className="form-control mb-0 font-size-14"
                          placeholder="Email*"
                          aria-describedby="button-addon2"
                        />
                        <div className="iq-button">
                          <button
                            type="submit"
                            className="btn btn-sm"
                            id="button-addon2"
                          >
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Social Media Links */}
                    <div className="d-flex align-items-center mt-5">
                      <span className="font-size-14 me-2">Follow Us:</span>
                      <ul className="p-0 m-0 list-unstyled widget_social_media">
                        {data.socialLinks?.facebook && (
                          <li>
                            <Link
                              href={data.socialLinks.facebook}
                              className="position-relative"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fab fa-facebook"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks?.twitter && (
                          <li>
                            <Link
                              href={data.socialLinks.twitter}
                              className="position-relative"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fab fa-twitter"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks?.github && (
                          <li>
                            <Link
                              href={data.socialLinks.github}
                              className="position-relative"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fab fa-github"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks?.instagram && (
                          <li>
                            <Link
                              href={data.socialLinks.instagram}
                              className="position-relative"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fab fa-instagram"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks?.youtube && (
                          <li>
                            <Link
                              href={data.socialLinks.youtube}
                              className="position-relative"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fab fa-youtube"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks?.linkedin && (
                          <li>
                            <Link
                              href={data.socialLinks.linkedin}
                              className="position-relative"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fab fa-linkedin"></i>
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Footer Bottom Section */}
              <div className="footer-bottom border-top">
                <Row className="align-items-center">
                  <Col md={6}>
                    {/* Dynamic footer menu links for bottom */}
                    {/* <ul className="menu list-inline p-0 d-flex flex-wrap align-items-center">
                      {data.groups.slice(0, 1).map((group) =>
                        group.footer_menu.slice(0, 4).map((link) => (
                          <li className="menu-item" key={link.id}>
                            <Link href={`/page/${link.page_id}`}>
                              {link.title}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul> */}
                    
                    {/* Copyright Text */}
                  </Col>
                    <Container className=" footer-border">
                        <Row>
                            <Col md={12} className="text-center" >
                                <p className="mb-0 d-flex gap-2 justify-content-center">
                                    © {currentYear} {data?.config?.site_credit && (
                                        <span
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data?.config?.site_credit) }}
                                        />
                                    )}
                                </p>
                            </Col>
                        </Row>
                    </Container>
                  {/* <Col md={3}></Col>
                  <Col md={3}>
                    <h6 className="font-size-14 pb-1">Download Streamit Apps</h6>
                    <div className="d-flex align-items-center">
                      <Link className="app-image" href="#">
                        <img 
                          src="/assets/images/footer/google-play.webp" 
                          loading="lazy" 
                          alt="play-store" 
                        />
                      </Link>
                      <Link className="ms-3 app-image" href="#">
                        <img 
                          src="/assets/images/footer/apple.webp" 
                          loading="lazy" 
                          alt="app-store" 
                        />
                      </Link>
                    </div>
                  </Col> */}
                </Row>
              </div>
            </Container>
          </footer>
        </Fragment>
      )}
    </>
  );
});

FooterMega.displayName = "FooterMega";
export default FooterMega;