import React, { Fragment, useState, useEffect } from "react";
import {
  Col,
  Container,
  Form,
  Row,
  Button,
  Alert,
  Card,
} from "react-bootstrap"; // Added Card
import Link from "next/link";
import { useRouter } from "next/router";
// import { motion, AnimatePresence } from 'framer-motion';
import { publicApi } from "@/lib/axiosInterceptor";
import AuthLayout from "@/layouts/AuthLayout";
import CustomBtn from "@/utils/CustomBtn";

const SignUp = () => {
  const router = useRouter();
  const { data } = router.query;

  const [formData, setFormData] = useState({
    email: "",
    number: "",
    name: "",
    role_id: 4,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (typeof data === "string") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmail = emailRegex.test(data);
      const isPhone = /^\d{10}$/.test(data) || /^\d{12}$/.test(data);
      if (isEmail) {
        setFormData((prev) => ({ ...prev, email: data }));
      } else if (isPhone) {
        setFormData((prev) => ({ ...prev, number: data }));
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await publicApi.post("/create-user", formData);
      const response = await publicApi.post("/verify-user", {
        data: formData.number || formData.email,
      });

      if (response.data.status) {
        const { pass_req, session_id, auth_session } = response.data;
        const query = {
          data: formData.number || formData.email,
          session_id,
          auth_session,
        };
        if (pass_req) {
          router.push({ pathname: "/auth/verify-password", query });
        } else {
          router.push({
            pathname: "/auth/two-factor",
            query: { data: query.data },
          });
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      handleSignup();
    }
    setValidated(true);
  };

  const formFields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      pattern: "[A-Za-z ]{3,}",
      invalidFeedback: "Please enter a valid name (min 3 characters).",
    },
    {
      name: "number",
      label: "Phone Number",
      type: "tel",
      pattern: "^\\d{10,12}$",
      invalidFeedback: "Please enter a valid 10 or 12 digit number.",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      invalidFeedback: "Please enter a valid email.",
    },
  ];
  return (
    <AuthLayout>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="g-2">
          {formFields.map((field) => (
            <Col xs={12} md={12} key={field.name}>
              <Form.Group>
                <Form.Label className="text-white fw-500 mb-2">
                  {field.label} *
                </Form.Label>
                <Form.Control
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="card-glassmorphism__input"
                  required
                  pattern={field.pattern}
                />
                <Form.Control.Feedback type="invalid">
                  {field.invalidFeedback}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          ))}
        </Row>
        <Form.Group className="list-group-item d-flex align-items-center mt-5 mb-3 text-white">
          {/* Applied the checkbox style */}
          <Form.Check.Input
            type="checkbox"
            required
            className="m-0 me-2 card-glassmorphism__checkbox"
            style={{ width: "24px", height: "24px" }}
          />
          I've read and accept the
          <Link href="/extra/terms-of-use" className="ms-1 text-primary fw-bold">
            terms & conditions*
          </Link>
        </Form.Group>

        <Row className="text-center">
          <Col lg="3"></Col>
          <Col lg="6">
            <CustomBtn
              buttonText={loading ? "Creating Account..." : "Sign Up"}
              type="submit"
              className="btn text-uppercase position-relative w-100"
              disabled={loading}
            />
            <div className="full-button">
              <p className="mt-2 mb-0 fw-normal text-white">
                Already have an account?
                <Link href="/auth/login" className="ms-1 text-primary fw-bold">
                  Login
                </Link>
              </p>
            </div>
          </Col>
          <Col lg="3"></Col>
        </Row>
      </Form>
    </AuthLayout>
  );
};

SignUp.layout = "Blank";
export default SignUp;
