"use client";

import { memo, Fragment, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios"; // Or your pre-configured instance
import Select from "react-select";
import { useMyContext } from "@/Context/MyContextProvider"; //done

// react-bootstrap
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";

// next components
import Link from "next/link";

// custom hook
import { publicApi } from "@/lib/axiosInterceptor";
import { Headphones, Phone, Megaphone, Users, MapPin } from "lucide-react";

// Mock context for providing API URL and token
const CONTACT_INFO = {
  supportEmail: "support@getyourticker.in",
  adsEmail: "adds@getyourticker.in",
  inquiriesEmail: "contact@getyourticker.in",
  phone1: process.env.NEXT_PUBLIC_SUPPORT_CALL_PHONE1 || "8000308888",
  phone2: process.env.NEXT_PUBLIC_SUPPORT_CALL_PHONE2 || "8000306666",
  workingHours: "11:00 AM - 6:00 PM",

  address: {
    title: "401-402, Blue Cystals",
    line1: " VV Nagar",
    line2: "Anand, Gujarat 388120"
  },
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.886884154925!2d72.92939439999999!3d22.545909700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4d1c5d587853%3A0x743303d6fea6e85f!2sGetyourticket.in!5e0!3m2!1sen!2sin!4v1773140637244!5m2!1sen!2sin"
};



const ContactPage = memo(() => {

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    query: "", // This will store the subject ID
    message: "",
    screenshot: null,
  });
  const [validated, setValidated] = useState(false);
  const screenshotRef = useRef();
  const [errors, setErrors] = useState({});
  const { systemSetting, ErrorAlert, successAlert } = useMyContext();
  // 1. Fetching subject options with TanStack Query
  const { data: subjectOptions, isPending: loadingOptions } = useQuery({
    queryKey: ['contactPageSubjects'],
    queryFn: async () => {
      const res = await publicApi.get(`/query-list?type=contact_us`);
      if (res.data.status && res.data.data) {
        return res.data.data.map((option) => ({
          value: option.id,
          label: option.title,
        }));
      }
      return [];
    },
  });

  // 2. Handling form submission with TanStack Query
  const mutation = useMutation({
    mutationFn: (formData) => {
      return publicApi.post(`/contact-us`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      successAlert("Success", "Your message has been sent successfully!");
      setForm({ name: "", phone: "", email: "", query: "", message: "", screenshot: null });
      if (screenshotRef.current) screenshotRef.current.value = "";
      setValidated(false);
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.message || "Failed to send message. Please try again.";
      ErrorAlert(errorMsg);
    }
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubjectChange = (selectedOption) => {
    setForm((prev) => ({ ...prev, query: selectedOption ? selectedOption.value : "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^\d+$/;
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone number must contain only digits";
    } else if (form.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    // Subject validation
    if (!form.query) {
      newErrors.query = "Please select a subject";
    }

    // Message validation
    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setValidated(true);
      return;
    }

    setErrors({});
    const formData = new FormData();
    formData.append('name', `${form.name} ${form.lastName}`);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('query', form.query);
    formData.append('message', form.message);
    if (form.screenshot) {
      formData.append('screenshot', form.screenshot);
    }
    mutation.mutate(formData);
  };

  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          <Row className="g-4">
            <Col lg="3" md="6">
              <div className="custom-dark-content-bg p-4 rounded-4 border h-100">
                <div className="bg-dark d-flex align-items-center justify-content-center rounded-3 mb-4 shadow-sm" style={{ width: '50px', height: '50px' }}>
                  <Headphones size={24} className="text-white" />
                </div>
                <h5 className="fw-500 mb-3">Help & support</h5>
                <p className="text-muted small mb-4">
                  Need quick, reliable support? Our team is always ready to help you.
                </p>
                <Link href={`mailto:${CONTACT_INFO.supportEmail}`} className="text-primary text-decoration-none small fw-500">
                  {CONTACT_INFO.supportEmail}
                </Link>
              </div>
            </Col>
            <Col lg="3" md="6">
              <div className="custom-dark-content-bg p-4 rounded-4 border h-100">
                <div className="bg-dark d-flex align-items-center justify-content-center rounded-3 mb-4 shadow-sm" style={{ width: '50px', height: '50px' }}>
                  <Phone size={24} className="text-white" />
                </div>
                <h5 className="fw-500 mb-3">Call Us</h5>
                <p className="text-muted small mb-3">
                  Speak directly to one of our team members for assistance.
                </p>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Link href={`tel:${CONTACT_INFO.phone1}`} className="text-white text-decoration-none small fw-500">
                    {CONTACT_INFO.phone1}
                  </Link>
                  <span className="text-muted small">/</span>
                  <Link href={`tel:${CONTACT_INFO.phone2}`} className="text-white text-decoration-none small fw-500">
                    {CONTACT_INFO.phone2}
                  </Link>
                </div>
                <div className="mt-auto">
                  <span className="text-muted extra-small d-block">Support Hours:</span>
                  <span className="text-white small fw-500">{CONTACT_INFO.workingHours}</span>
                </div>
              </div>
            </Col>
            <Col lg="3" md="6">
              <div className="custom-dark-content-bg p-4 rounded-4 border h-100">
                <div className="bg-dark d-flex align-items-center justify-content-center rounded-3 mb-4 shadow-sm" style={{ width: '50px', height: '50px' }}>
                  <Megaphone size={24} className="text-white" />
                </div>
                <h5 className="fw-500 mb-3">Advertising</h5>
                <p className="text-muted small mb-4">
                  Looking to advertise with us? contact our advertising team
                </p>
                <Link href={`mailto:${CONTACT_INFO.adsEmail}`} className="text-primary text-decoration-none small fw-500">
                  {CONTACT_INFO.adsEmail}
                </Link>
              </div>
            </Col>
            <Col lg="3" md="6">
              <div className="custom-dark-content-bg p-4 rounded-4 border h-100">
                <div className="bg-dark d-flex align-items-center justify-content-center rounded-3 mb-4 shadow-sm" style={{ width: '50px', height: '50px' }}>
                  <Users size={24} className="text-white" />
                </div>
                <h5 className="fw-500 mb-3">Press Inquiries</h5>
                <p className="text-muted small mb-4">
                  For media inquiries or products our press team is here to help.
                </p>
                <Link href={`mailto:${CONTACT_INFO.inquiriesEmail}`} className="text-primary text-decoration-none small fw-500">
                  {CONTACT_INFO.inquiriesEmail}
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div>
        <Container>
          <Row>
            <Col lg="8">
              <div className="title-box mb-5">
                <h3 className="fw-bold mb-3">Start the conversation</h3>
                <p className="text-muted">
                  Fill out the contact form, and one of our team members will be in touch shortly
                </p>
              </div>
              {/* Form now uses React state and handlers */}
              <Form noValidate validated={validated} onSubmit={handleSubmit} className="mb-5 mb-lg-0">
                <Row>
                  <Col md="6" className="mb-4">
                    <input type="text" className={`form-control border-0 custom-dark-input py-3 px-4 rounded-3 ${errors.name ? 'is-invalid' : ''}`} placeholder="Your Name*" required name="name" value={form.name} onChange={handleChange} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </Col>
                  <Col md="6" className="mb-4">
                    <input type="text" className={`form-control border-0 custom-dark-input py-3 px-4 rounded-3`} placeholder="Last Name*" required name="lastName" value={form.lastName} onChange={handleChange} />
                  </Col>
                  <Col md="6" className="mb-4">
                    <input type="email" className={`form-control border-0 custom-dark-input py-3 px-4 rounded-3 ${errors.email ? 'is-invalid' : ''}`} placeholder="Your Email*" required name="email" value={form.email} onChange={handleChange} />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </Col>
                  <Col md="6" className="mb-4">
                    <input type="tel" className={`form-control border-0 custom-dark-input py-3 px-4 rounded-3 ${errors.phone ? 'is-invalid' : ''}`} placeholder="Phone Number*" required name="phone" value={form.phone} onChange={handleChange} />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </Col>
                  <Col md="12" className="mb-4">
                    <Select
                      options={subjectOptions}
                      onChange={handleSubjectChange}
                      placeholder={loadingOptions ? "Loading..." : "Select a Subject*"}
                      isDisabled={loadingOptions}
                      required
                      className={errors.query ? 'is-invalid' : ''}
                      theme={theme => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          neutral0: "#101010",      // control background
                          neutral80: "#ffffff",     // input text color
                          neutral20: "#101010",     // control border color removed (same as background)
                          neutral30: "#101010",     // control focused border removed
                          neutral40: "#000000",     // indicator color
                          neutral50: "#666666",     // placeholder color
                          primary25: "#000000",     // option hover background
                          primary: "#000000",       // selected or active color
                        }
                      })}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          height: '50px',
                          backgroundColor: "#101010",
                          borderColor: errors.query ? "#dc3545" : "rgba(255,255,255,0.05)",
                          boxShadow: "none",
                          color: "#ffffff",
                          borderRadius: '8px',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: "#101010",
                          color: "#ffffff",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: '8px',
                          marginTop: '4px',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? "rgba(255,255,255,0.05)"
                            : state.isSelected
                              ? "var(--bs-primary)"
                              : "#101010",
                          color: "#ffffff",
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "#666666",
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "#ffffff",
                        }),
                        input: (base) => ({
                          ...base,
                          color: "#ffffff",
                        }),
                      }}
                    />
                    {errors.query && <div className="invalid-feedback d-block">{errors.query}</div>}
                  </Col>

                  <Col md="12" className="mb-4">
                    <textarea className={`form-control border-0 custom-dark-input py-3 px-4 rounded-3 ${errors.message ? 'is-invalid' : ''}`} rows={5} placeholder="Your Message" required name="message" value={form.message} onChange={handleChange}></textarea>
                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                  </Col>
                  <Col md="12" className="mb-4">
                    <label className="form-label text-muted small">Attach Screenshot (Optional)</label>
                    <input type="file" className="form-control border-0 custom-dark-input rounded-3" name="screenshot" accept="image/*" onChange={handleChange} ref={screenshotRef} />
                  </Col>
                  <Col>
                    {/* Success and Error Alerts */}
                    {mutation.isSuccess && <Alert variant="success">Your message has been sent successfully!</Alert>}
                    {mutation.isError && <Alert variant="danger">{mutation.error?.response?.data?.message || "Failed to send message. Please try again."}</Alert>}

                    <div className="iq-button">
                      <Button type="submit" className="btn" disabled={mutation.isPending}>
                        {mutation.isPending ? <><Spinner as="span" animation="border" size="sm" /> Sending...</> : 'Send Message'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Col>
            {/* <Col lg="1" className="d-none d-lg-block"></Col> */}
            <Col lg="4">
              <div className="sidebar-contact ps-lg-5">
                <div className="mb-5">
                  <h4 className="fw-bold mb-4">Visit Us</h4>
                  <p className="text-muted mb-4">If you'd like to visit or write to us:</p>
                  <div className="d-flex align-items-start gap-2 mb-3">
                    <MapPin size={20} className="text-primary mt-1" />
                    <h6 className="fw-bold mb-0">Address:</h6>
                  </div>
                  <address className="text-muted small lh-lg">
                    {CONTACT_INFO.address.title}<br />
                    {CONTACT_INFO.address.line1}<br />
                    {CONTACT_INFO.address.line2}
                  </address>
                </div>

                <div className="pt-4 border-top">
                  <h4 className="fw-bold mb-4">Business Inquiries</h4>
                  <p className="text-muted small lh-base">
                    For partnership opportunities, licensing, or media-related queries, please reach out to our business team.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="map mt-3">
        <Container className="">
          <iframe
            loading="lazy"
            className="w-100"
            src={CONTACT_INFO.mapEmbedUrl}
            height="600"
          ></iframe>
        </Container>
      </div>

    </Fragment>
  );
});

ContactPage.displayName = "ContactPage";
export default ContactPage;