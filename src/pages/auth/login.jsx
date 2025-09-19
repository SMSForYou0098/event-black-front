import React, { useState } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSelector } from "react-redux";
import { publicApi } from "@/lib/axiosInterceptor";
import { useMyContext } from "@/Context/MyContextProvider";
import AuthLayout from "@/layouts/AuthLayout";
import { Home } from "lucide-react";
import CustomBtn from "../../utils/CustomBtn";
import ShakyButton from "@/utils/ShakyButton";
const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    rememberMe: false,
  });

  const { loading } = useSelector((state) => state.auth);
  const { systemSetting } = useMyContext();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const [shake, setShake] = useState(false);
  const handleLogin = async (event) => {
    event.preventDefault(); // Move this to the top

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      // Trigger shake animation
      setShake(true);
      // Reset shake after animation completes
      setTimeout(() => setShake(false), 500);
      return;
    }


    setError("");
    setIsSubmitting(true);
    setValidated(true);

    try {
      const response = await publicApi.post("/verify-user", {
        data: formData.email,
      });

      if (response.data.status) {
        const { pass_req, session_id, auth_session } = response.data;
        const query = {
          data: formData.email,
          session_id,
          auth_session,
        };

        if (pass_req) {
          router.push({
            pathname: "/auth/verify-password",
            query,
          });
        } else {
          router.push({
            pathname: "/auth/two-factor",
            query: { data: formData.email },
          });
        }
      }
    } catch (err) {
      if (err.response?.data?.status === false) {
        router.push({
          pathname: "/auth/sign-up",
          query: { data: formData.email },
        });
      } else {
        setError(
          err.response?.data?.message || "An unexpected error occurred."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Form noValidate validated={validated} onSubmit={handleLogin}>
        <h4 className="text-center mb-4 text-white">Login</h4>
        {error && <Alert variant="primary">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label className="text-white fw-500 mb-2">
            Username or Email Address
          </Form.Label>
          <Form.Control
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your username or email"
            className="card-glassmorphism__input"
            required
          />
          <Form.Control.Feedback type="invalid">
            Username or Email is required
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Row className="g-2">
            <Col>
              <CustomBtn
                buttonText="Home"
                iconPosition="left"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                className="btn-secondary border-0 w-100 btn-sm"
                HandleClick={() => router.push("/")}
                icon={<Home size={20} />}
              />
            </Col>
            <Col >
              <ShakyButton
                shake={shake}
                onShakeComplete={() => setShake(false)}
                type="submit"
                disabled={isSubmitting || loading}
                buttonText={isSubmitting || loading ? "Processing..." : "Next"}
                className="w-100 btn-sm"
              />
            </Col>
          </Row>
        </Form.Group>

      </Form>

      <p className="my-4 text-center fw-500 text-white">
        Login as organizer?{" "}
        <Link href="/auth/sign-up" className="text-primary ms-1">
          Click Here
        </Link>
      </p>
    </AuthLayout>
  );
};

Login.layout = "Blank";
export default Login;
