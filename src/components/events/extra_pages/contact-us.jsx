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
import Image from "next/image";

// custom hook
import { publicApi } from "@/lib/axiosInterceptor";

// Mock context for providing API URL and token
const ContactPage = memo(() => {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    query: "", // This will store the subject ID
    message: "",
    screenshot: null,
  });
  const [validated, setValidated] = useState(false);
  const screenshotRef = useRef();
  const {systemSetting} = useMyContext();
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
      return publicApi.post(`/contac-store`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      setForm({ name: "", phone: "", email: "", query: "", message: "", screenshot: null });
      if (screenshotRef.current) screenshotRef.current.value = "";
      setValidated(false);
    },
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
    const formEl = event.currentTarget;
    if (formEl.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    const formData = new FormData();
    // Use a different key for 'name' if your API expects first_name, last_name
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

  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          <Row>
            <Col lg="8">
              <div className="title-box">
                <h2>Contact With Us</h2>
                <p className="mb-0">
                  To learn more about how Streamit can help you, contact us.
                </p>
              </div>
              {/* Form now uses React state and handlers */}
              <Form noValidate validated={validated} onSubmit={handleSubmit} className="mb-5 mb-lg-0">
                <Row>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input type="text" className="form-control font-size-14" placeholder="Full Name*" required name="name" value={form.name} onChange={handleChange} />
                  </Col>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input type="tel" className="form-control font-size-14" placeholder="Phone Number*" required name="phone" value={form.phone} onChange={handleChange} />
                  </Col>
                  <Col md="6" className="mb-4 mb-lg-5">
                    <input type="email" className="form-control font-size-14" placeholder="Your Email*" required name="email" value={form.email} onChange={handleChange} />
                  </Col>
                  <Col md="6" className="mb-4 mb-lg-5">
  <Select
    options={subjectOptions}
    onChange={handleSubjectChange}
    placeholder={loadingOptions ? "Loading..." : "Select a Subject*"}
    isDisabled={loadingOptions}
    required
    theme={theme => ({
      ...theme,
      colors: {
        ...theme.colors,
        neutral0: "#141314",      // control background
        neutral80: "#ffffff",     // input text color
        neutral20: "#141314",     // control border color removed (same as background)
        neutral30: "#141314",     // control focused border removed
        neutral40: "#000000",     // indicator color
        neutral50: "#888888",     // placeholder color
        primary25: "#000000",     // option hover background
        primary: "#000000",       // selected or active color
      }
    })}
    styles={{
      control: (base, state) => ({
        ...base,
        height: '45px',
        backgroundColor: "#141314",
        borderColor: "#141314",   // no visible border for control
        boxShadow: "none",
        color: "#141314",
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: "#141314",
        color: "#ffffff",
        border: "1px solid #989eac",  // border applied only on dropdown menu
        borderRadius: '4px',
        marginTop: 0,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
          ? "#000000"
          : state.isSelected
            ? "#000000"
            : "#141314",
        color: "#ffffff",
      }),
      placeholder: (base) => ({
        ...base,
        color: "#888888",
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
</Col>

                  <Col md="12" className="mb-4 mb-lg-5">
                    <textarea className="form-control font-size-14" rows={5} placeholder="Your Message*" required name="message" value={form.message} onChange={handleChange}></textarea>
                  </Col>
                   <Col md="12" className="mb-4 mb-lg-5">
                    <label className="form-label">Attach Screenshot (Optional)</label>
                    <input type="file" className="form-control font-size-14" name="screenshot" accept="image/*" onChange={handleChange} ref={screenshotRef} />
                  </Col>
                  <Col>
                    {/* Success and Error Alerts */}
                    {mutation.isSuccess && <Alert variant="success">Your message has been sent successfully!</Alert>}
                    {mutation.isError && <Alert variant="danger">Failed to send message. Please try again.</Alert>}

                    <div className="iq-button">
                      <Button type="submit" className="btn" disabled={mutation.isPending}>
                        {mutation.isPending ? <><Spinner as="span" animation="border" size="sm"/> Sending...</> : 'Send Message'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col lg="1" className="d-none d-lg-block"></Col>
            
          </Row>
        </Container>
      </div>
    </Fragment>
  );
});

ContactPage.displayName = "ContactPage";
export default ContactPage;