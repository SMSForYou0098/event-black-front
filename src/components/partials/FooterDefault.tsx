import { memo, Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useQuery } from '@tanstack/react-query';
import { getFooterData } from "@/services/home";

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
    if (!data?.config?.site_credit) return `© ${currentYear} All Rights Reserved`;
    
    // Safely replace {year} with currentYear
    const creditText = data.config.site_credit;
    if (typeof creditText === 'string') {
      return creditText.replace(/{year}/g, currentYear.toString());
    }
    
    return `© ${currentYear} All Rights Reserved`;
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

  return (
    <>
      {isSuccess && data && (
        <Fragment>
          <footer className="footer footer-default">
            <Container fluid>
              <div className="footer-top">
                <Row>
                  <Col xl={3} lg={6} className="mb-5 mb-lg-0">
                    <div className="footer-logo">
                      {data.config.footer_logo && (
                        <Image
                          height={200}
                          src={data.config.footer_logo}
                          alt="Footer Logo"
                        />
                      )}
                    </div>
                  </Col>
                  {/* Dynamic Footer Link Groups */}
                  {data.groups.map((group) => (
                    <Col xl={3} lg={6} className="mb-5 mb-lg-0" key={group.id}>
                      <h4 className="footer-link-title">{group.title}</h4>
                      <ul className="list-unstyled footer-menu">
                        {group.footer_menu.map((link) => (
                          <li className="mb-3" key={link.id}>
                            {/* NOTE: Adjust the href to your actual page routing structure */}
                            <Link
                              href={`/page/${link.page_id}`}
                              className="ms-3"
                            >
                              {link.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Col>
                  ))}

                  <Col xl={3} lg={6}>
                    <div className="d-flex align-items-center mt-5">
                      <span className="font-size-14 me-2">Follow Us:</span>
                      <ul className="p-0 m-0 list-unstyled widget_social_media">
                        {data.socialLinks.facebook && (
                          <li>
                            <Link
                              href={data.socialLinks.facebook}
                              className="position-relative"
                              target="_blank"
                            >
                              <i className="fab fa-facebook"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks.instagram && (
                          <li>
                            <Link
                              href={data.socialLinks.instagram}
                              className="position-relative"
                              target="_blank"
                            >
                              <i className="fab fa-instagram"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks.twitter && (
                          <li>
                            <Link
                              href={data.socialLinks.twitter}
                              className="position-relative"
                              target="_blank"
                            >
                              <i className="fab fa-twitter"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks.youtube && (
                          <li>
                            <Link
                              href={data.socialLinks.youtube}
                              className="position-relative"
                              target="_blank"
                            >
                              <i className="fab fa-youtube"></i>
                            </Link>
                          </li>
                        )}
                        {data.socialLinks.linkedin && (
                          <li>
                            <Link
                              href={data.socialLinks.linkedin}
                              className="position-relative"
                              target="_blank"
                            >
                              <i className="fab fa-linkedin"></i>
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </Col>
                  <Col xl={3} lg={6} className="mb-5 mb-lg-0">
                    <p className="mb-4 font-size-14">
                      Email us:{" "}
                      <a
                        href={`mailto:${data.config.footer_email}`}
                        className="text-white"
                      >
                        {data.config.footer_email}
                      </a>
                    </p>
                    <p className="text-uppercase letter-spacing-1 font-size-14 mb-1">
                      customer services
                    </p>
                    <p className="mb-0 contact text-white">
                      {data.config.footer_contact}
                    </p>
                  </Col>
                </Row>
              </div>
              <div className="footer-bottom border-top">
                <Row className="align-items-center">
                  <Col md={12}>
                    <div className="font-size-14 text-center">
                      <p>
  <i className="fas fa-copyright me-1"></i>
  {currentYear}{" "}
  <span
    dangerouslySetInnerHTML={{
      __html: getCopyrightText(),
    }}
  />
</p>

                    </div>
                  </Col>
                </Row>
              </div>
            </Container>
          </footer>
          <div
            id="back-to-top"
            style={{ display: "block" }} // Logic for display is handled by animation
            className={`animate__animated ${animationClass}`}
            onClick={scrollToTop}
          >
            <Link
              className="p-0 btn bg-primary btn-sm position-fixed top border-0 rounded-circle"
              id="top"
              href="#top"
            >
              <i className="fa-solid fa-chevron-up"></i>
            </Link>
          </div>
        </Fragment>
      )}
    </>
  );
});
FooterMega.displayName = "FooterMega";
export default FooterMega;