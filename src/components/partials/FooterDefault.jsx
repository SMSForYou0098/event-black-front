import { memo, Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useQuery } from '@tanstack/react-query';
import { getFooterData } from "@/services/home";
import DOMPurify from 'dompurify';
import { MailCheck } from "lucide-react";
import Logo from "./Logo";
import Divider from '../../utils/Divider'
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
      {
        id: 2,
        title: "Links",
        footer_menu: [
          { id: 3, title: "Offers and Sale", page_id: "events/offers" },
          { id: 4, title: "Live Events", page_id: "events/live" },

        ],
      },
    ],
  };

  const socialPlatforms = [
    { key: 'facebook', icon: 'fab fa-facebook' },
    { key: 'twitter', icon: 'fab fa-x-twitter' },
    { key: 'github', icon: 'fab fa-github' },
    { key: 'instagram', icon: 'fab fa-instagram' },
    { key: 'youtube', icon: 'fab fa-youtube' },
    { key: 'linkedin', icon: 'fab fa-linkedin' },
  ];

  // Create a mapping object for easy lookup
  const platformIconMap = socialPlatforms.reduce((acc, platform) => {
    acc[platform.key] = platform.icon;
    return acc;
  }, {});
  return (
    <>
      {isSuccess && data && (
        <Fragment>
          <footer className="footer footer-default">
            <Container fluid>
              <div className="footer-top pb-0">
                <Row>
                  {/* Logo and Contact Section */}
                  <Col xl={3} lg={6} className="mb-5 mb-lg-0 d-flex flex-column align-items-center text-center">
                  </Col>

                  {/* Dynamic Footer Link Groups - Limited to 2 groups for layout */}
                  <Col xl={6} lg={6} className="mb-5 mb-lg-0">
                    <Row>
                      {footerStaticData.groups.map((group) => (
                        <Col xs={12} sm={4} key={group.id} className="mb-4">
                          <h4 className="footer-link-title">{group.title}</h4>
                          <ul className="list-unstyled footer-menu">
                            {group.footer_menu.map((link) => (
                              <li className="mb-3" key={link.id}>
                                <Link href={`/${link.page_id}`} className="ms-3">
                                  {link.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </Col>
                      ))}
                    </Row>
                  </Col>


                  {/* Newsletter and Social Media Section */}
                </Row>
              </div>

              {/* Footer Bottom Section */}
              <div className="footer-bottom pt-0">
                <Container className="footer-border">
                  <Row>
                    <Col xl={12} lg={12} className="text-center d-flex justify-content-center flex-column align-items-center">
                      <h4 className="footer-link-title">Subscribe Newsletter</h4>
                      <div className="mailchimp mailchimp-dark w-50">
                        <div className="input-group mb-3">
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
                    </Col>
                    <Col md={12} className="text-center" >
                      <Divider>
                        <Logo
                          desktopUrl="/assets/images/logo/footer-logo.webp"
                          mobileUrl="/assets/images/logo/footer-logo.webp"
                          height={100}
                          width={175}
                          handleClick={() => {
                            const phoneNumber = "918000408888";
                            const message = encodeURIComponent("Chat");
                            window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
                          }}
                        />
                      </Divider>
                      <p className="mb-4 font-size-14 text-center">
                        <MailCheck color="var(--bs-primary)" size={16} className="me-2" />
                        <a
                          href={`mailto:${'contact@getyourticket.in'}`}
                          className="text-white"
                        >
                          {'contact@getyourticket.in'}
                        </a>
                      </p>
                      {/* Social Media Links */}
                      <div className="d-flex align-items-center justify-content-center my-2 gap-2">
                        <ul className="p-0 m-0 list-unstyled widget_social_media d-flex align-items-center justify-content-center gap-3">
                          {Object.entries(data.socialLinks || {})
                            .filter(([platform, url]) => {
                              // More strict validation
                              return url &&
                                typeof url === 'string' &&
                                url.trim() !== '' &&
                                url !== 'null' &&
                                url !== 'undefined' &&
                                platformIconMap[platform]; // Only include if we have an icon for it
                            })
                            .map(([platform, url]) => {
                              const iconClass = platformIconMap[platform];

                              return (
                                <li key={platform}>
                                  <Link
                                    href={String(url)}
                                    className="position-relative"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i className={iconClass}></i>
                                  </Link>
                                </li>
                              );
                            })
                          }
                        </ul>
                      </div>
                      <p className="mb-0 my-4 d-flex gap-2 justify-content-center">
                        © {currentYear} {data?.config?.site_credit && (
                          <span
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data?.config?.site_credit) }}
                          />
                        )}
                      </p>
                      <small>
                        All content and images on this website are protected by copyright and belong to their respective owners. The materials are used only to promote their work, and no endorsement by the artists is implied. Any unauthorized use, reproduction, or distribution of this content is strictly prohibited and may result in legal action.
                      </small>
                    </Col>
                  </Row>
                </Container>
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