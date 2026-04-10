"use client";

import { memo, Fragment, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMyContext } from "@/Context/MyContextProvider"; //done

// react-bootstrap
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";


// custom hook
import { publicApi } from "@/lib/axiosInterceptor";
import { MapPin, CheckCircle } from "lucide-react";
import { EmailInputField, NameInputField, PhoneInputField, TextareaInputField, ThemedSelectField } from "../components/CustomComponents/FormsFields";
import { validateContactUsForm, getSelectError } from "@/utils/validations";
import CustomCard from "../components/CustomComponents/CustomCard";
import ContactInfoCard from "../components/CustomComponents/ContactInfoCard";
import { CONTACT_INFO, CONTACT_CARD_INFO } from "../constants/contactInfo.js";

// contact page
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
  const [formResetKey, setFormResetKey] = useState(0);
  const screenshotRef = useRef();
  const [errors, setErrors] = useState({});
  const [blurErrors, setBlurErrors] = useState({});
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

      // clear all errors
      setErrors({});
      setBlurErrors({});
      setFormResetKey(prev => prev + 1);
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
    const val = selectedOption ? selectedOption.value : "";
    if (errors.query) setErrors(prev => ({ ...prev, query: "" }));
    setBlurErrors(prev => ({ ...prev, query: getSelectError(val) || "" }));
    setForm((prev) => ({ ...prev, query: val }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // validate form
    const { errors, isValid } = validateContactUsForm({ name: form.name, lastName: form.lastName, phone: form.phone, email: form.email, query: form.query, message: form.message });
    if (!isValid) {
      setErrors(errors);
      return;
    }

    // clear errors
    setErrors({});
    setBlurErrors({});

    // create form data
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('query', form.query);
    formData.append('message', form.message);
    if (form.screenshot) {
      formData.append('screenshot', form.screenshot);
    }
    mutation.mutate(formData);
  };


  // Disable button when any submit-time OR blur-time error is visible
  const hasVisibleErrors =
    Object.values(errors).some(err => !!err) ||
    Object.values(blurErrors).some(err => !!err);

  return (
    <Fragment>
      <div className="section-padding">
        {/* contact info cards */}
        <Container>
          <Row className="g-4">
            {
              CONTACT_CARD_INFO.map((item, index) => (
                <ContactInfoCard key={index} icon={item.icon} title={item.title} discription={item.discription} CONTACT_INFO={item.CONTACT_INFO} email={item.email} />
              ))
            }
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
              <Form key={formResetKey} noValidate onSubmit={handleSubmit} className="mb-5 mb-lg-0">
                <Row>
                  <Col md="6" className="mb-4">
                    <NameInputField
                      value={form.name}
                      onBlurValidate={(err) => setBlurErrors(prev => ({ ...prev, name: err || "" }))}
                      setValue={(val) => {
                        if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                        setForm((prev) => ({ ...prev, name: val }))
                      }}
                      externalError={errors.name}
                      name="name"
                      placeholder="Full Name*"
                      label=""
                    />

                  </Col>
                  <Col md="6" className="mb-4">
                    <EmailInputField
                      value={form.email}
                      onBlurValidate={(err) => setBlurErrors(prev => ({ ...prev, email: err || "" }))}
                      setValue={(val) => {
                        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                        setForm((prev) => ({ ...prev, email: val }))
                      }}
                      externalError={errors.email}
                      name="email"
                      placeholder="Email*"
                      label=""
                    />
                  </Col>
                  <Col md="6" className="mb-4">
                    <PhoneInputField
                      value={form.phone}
                      onBlurValidate={(err) => setBlurErrors(prev => ({ ...prev, phone: err || "" }))}
                      setValue={(val) => {
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                        setForm((prev) => ({ ...prev, phone: val }))
                      }}
                      externalError={errors.phone}
                      name="phone"
                      placeholder="Phone Number*"
                      label=""
                    />
                  </Col>
                  <Col md="6" className="mb-4">
                    <ThemedSelectField
                      id="contact-subject"
                      options={subjectOptions}
                      value={subjectOptions?.find(opt => opt.value === form.query) || null}
                      onChange={handleSubjectChange}
                      onBlur={() => {
                        if (!form.query) setBlurErrors(prev => ({ ...prev, query: "Please select a subject" }));
                      }}
                      placeholder={loadingOptions ? "Loading..." : "Select a Subject*"}
                      error={errors.query || blurErrors.query}
                      required={true}
                      isClearable={false}
                      height="50px"
                      textSize={""}
                      padLeft={"6px"}
                      errSize={"14px"}

                    />

                  </Col>
                  <Col md="12" className="mb-4">
                    <TextareaInputField
                      name="message"
                      value={form.message}
                      onBlurValidate={(err) => setBlurErrors(prev => ({ ...prev, message: err || "" }))}
                      setValue={(val) => {
                        if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                        setForm((prev) => ({ ...prev, message: val }))
                      }}
                      externalError={errors.message}
                      placeholder="Enter your message*"
                      rows={5}
                      errorLabel="Message"
                    />
                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                  </Col>
                  <Col md="12" className="mb-4">
                    <label className="form-label text-muted small">Attach Screenshot (Optional)</label>
                    <input type="file" className="form-control border custom-dark-input rounded-3" name="screenshot" accept="image/*" onChange={handleChange} ref={screenshotRef} />
                  </Col>
                  <Col>
                    {/* Success and Error Alerts */}
                    {mutation.isSuccess && (
                      <Alert variant="success" className="d-flex align-items-center">
                        <CheckCircle size={20} className="me-2" />
                        Your message has been sent successfully!
                      </Alert>
                    )}
                    {mutation.isError && <Alert variant="danger">{mutation.error?.response?.data?.message || "Failed to send message. Please try again."}</Alert>}

                    <div className="iq-button">
                      <Button type="submit" className="btn" disabled={mutation.isPending || hasVisibleErrors}>
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
                  <CustomCard>
                    <div className="d-flex  align-items-start gap-2 mb-3">
                      <MapPin size={20} className="text-primary" />
                      <h6 className="fw-bold mb-0">Address:</h6>
                    </div>
                    <address className="text-muted small lh-lg">
                      {CONTACT_INFO.address.title}<br />
                      {CONTACT_INFO.address.line1}<br />
                      {CONTACT_INFO.address.line2}
                    </address>
                  </CustomCard>

                </div>

                <div className="pt-4 border-top">
                  <CustomCard>
                    <h4 className="fw-bold mb-4">Business Inquiries</h4>
                    <p className="text-muted small lh-base">
                      For partnership opportunities, licensing, or media-related queries, please reach out to our business team.
                    </p>
                  </CustomCard>
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

    </Fragment >
  );
});

ContactPage.displayName = "ContactPage";
export default ContactPage;