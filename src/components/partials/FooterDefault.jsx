import { memo, Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import { useQuery } from '@tanstack/react-query';
import { getFooterData } from "@/services/home";
import DOMPurify from 'dompurify';
import { MailCheck } from "lucide-react";
import Logo from "./Logo";
import Divider from '../../utils/Divider'
import { getEmailError, validateNewsLetterEmail } from "@/utils/validations";
const ORGANIZER_LOGIN_URL = "https://login.getyourticket.in/auth/register";

const FooterMega = memo(() => {
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  // Validation states
  const [touched, setTouched] = useState({});

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

  // Computed live error — same pattern as LoginOffCanvas
  const newsletterValidationError = touched.email ? getEmailError(newsletterEmail) : null;


  const handleNewsletterSubmit = () => {
    // Mark as touched on submit click
    setTouched(prev => ({ ...prev, email: true }));

    const { errors, isValid } = validateNewsLetterEmail({ email: newsletterEmail });

    // If invalid → stop (error shows via computed newsletterValidationError)
    if (!isValid) {
      setNewsletterSuccess("");
      return;
    }

    // If valid → show success, reset input
    setTouched({});
    setNewsletterSuccess("Subscribed successfully!");
    setNewsletterEmail("");
  };


  // Fix for the TypeScript error - safely handle the site_credit strin

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
          { id: 5, title: "Pricing Policy", page_id: "pricing-policy" },
        ],
      },
      {
        id: 3,
        title: "Links",
        footer_menu: [
          { id: 6, title: "Offers and Sale", page_id: "events/offers" },
          { id: 7, title: "Live Events", page_id: "events/live" },
        ],
      },

      // 🔥 Top Trending
      {
        id: 4,
        title: "Top Trending",
        footer_menu: [
          { id: 8, title: "Recommended", page_id: "events/recommended" },
          { id: 9, title: "Popular", page_id: "events/popular" },
          { id: 10, title: "Free", page_id: "events/free" },
          { id: 11, title: "Promotional Event", page_id: "events/promotional" },
          { id: 12, title: "Educational", page_id: "events/educational" },
        ],
      },

      // 🎉 Cultural Events
      {
        id: 5,
        title: "Cultural Events",
        footer_menu: [
          { id: 13, title: "Christmas Festival", page_id: "events/christmas-festival" },
          { id: 14, title: "Holi Festival", page_id: "events/holi-festival" },
          { id: 15, title: "Navratri Fest", page_id: "events/navratri-fest" },
          { id: 16, title: "Weekend Bazaars", page_id: "events/weekend-bazaars" },
          { id: 17, title: "Global Festivals", page_id: "events/global-festivals" },
        ],
      },
      {
        id: 6,
        title: "Registrations",
        footer_menu: [
          // { id: 13, title: "Registrations", page_id: "/" },
          { id: 14, title: "Organizer", page_id: ORGANIZER_LOGIN_URL },
          { id: 15, title: "Influencer ", page_id: "/" },
          { id: 16, title: "Volunteer ", page_id: "/" },
          { id: 17, title: "Internship ", page_id: "/" },
          { id: 17, title: "Careers ", page_id: "/" },
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

                  {/* Dynamic Footer Link Groups - Limited to 2 groups for layout */}
                  <Col size={12} className="mb-5 mb-lg-0">
                    <Row>
                      {footerStaticData.groups.map((group) => (
                        <Col xs={12} sm={2} key={group.id} className="mb-4">
                          <h4 className="footer-link-title">{group.title}</h4>
                          <ul className="list-unstyled footer-menu">
                            {group.footer_menu.map((link) => (
                              <li className="mb-3" key={link.id}>
                                <Link
                                  href={link.page_id.startsWith('http') ? link.page_id : `/${link.page_id}`}
                                  className="ms-3"
                                  target={link.page_id.startsWith('http') ? "_blank" : undefined}
                                  rel={link.page_id.startsWith('http') ? "noopener noreferrer" : undefined}
                                >
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
                <div className="footer-border">
                  <Row>
                    <Col xl={12} lg={12} className="text-center d-flex justify-content-center flex-column align-items-center">
                      <h4 className="footer-link-title">Subscribe Newsletter</h4>
                      <div className="mailchimp mailchimp-dark w-50">
                        <div className="input-group">
                          <Form.Control
                            type="email"
                            className="mb-0 font-size-14"
                            placeholder="Email*"
                            aria-describedby="button-addon2"
                            value={newsletterEmail}
                            isInvalid={touched.email && !!newsletterValidationError}
                            onChange={(e) => {
                              setNewsletterEmail(e.target.value);
                              setTouched(prev => ({ ...prev, email: true }));
                              setNewsletterSuccess(""); // hide success when user re-types
                            }}
                            onBlur={() => {
                              // Mark as touched when user clicks outside the field
                              setTouched(prev => ({ ...prev, email: true }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleNewsletterSubmit();
                            }}
                          />
                          <div className="iq-button">
                            <button
                              type="button"
                              className="btn btn-sm"
                              id="button-addon2"
                              onClick={handleNewsletterSubmit}
                            >
                              Subscribe
                            </button>
                          </div>
                        </div>
                        {/* Error — forced visible via style since it's outside input-group */}
                        <Form.Control.Feedback type="invalid"
                          className="text-start mt-1"
                          style={{ display: touched.email && newsletterValidationError ? "block" : "none", fontSize: "12px" }}
                        >
                          {newsletterValidationError}
                        </Form.Control.Feedback>
                        {/* Success message */}
                        <Form.Control.Feedback type="valid"
                          className="text-success text-start mt-1"
                          style={{ display: newsletterSuccess ? "block" : "none", fontSize: "12px" }}
                        >
                          {newsletterSuccess}
                        </Form.Control.Feedback>
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
                      <small className="mb-0 my-4 d-flex gap-2 justify-content-center">
                        © {currentYear} All Right Reserved | TRAVA GET YOUR TICKET PVT LTD.
                      </small>
                      <small>
                        All content and images on this website are copyrighted and belong to their respective owners. They are used solely for promotional purposes, with no implied endorsement. Any unauthorized use, copying, or distribution is strictly prohibited and may lead to legal action.
                      </small>
                    </Col>
                  </Row>
                </div>
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