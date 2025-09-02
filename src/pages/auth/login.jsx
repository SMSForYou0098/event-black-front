import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { publicApi } from "@/lib/axiosInterceptor";
import { useMyContext } from "@/Context/MyContextProvider";
import AuthLayout from "@/layouts/AuthLayout";
import { Home } from "lucide-react";

// Validation Schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().required("Username or Email is required"),
});

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const { systemSetting } = useMyContext();

  const handleLogin = async (
    values,
    { setSubmitting }
  ) => {
    setError("");
    setSubmitting(true);
    try {
      const response = await publicApi.post("/verify-user", {
        data: values.email,
      });
      if (response.data.status) {
        const { pass_req, session_id, auth_session } = response.data;
        const query = {
          data: values.email,
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
            query: { data: values.email },
          });
        }
      }
    } catch (err) {
      if (err.response?.data?.status === false) {
        router.push({
          pathname: "/auth/sign-up",
          query: { data: values.email },
        });
      } else {
        setError(
          err.response?.data?.message || "An unexpected error occurred."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Formik
        initialValues={{
          email: "",
          rememberMe: false,
        }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting, errors, touched }) => (
          <FormikForm noValidate>
            <h4 className="text-center mb-4 text-white">Login</h4>
            {error && <Alert variant="primary">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="text-white fw-500 mb-2">
                Username or Email Address
              </Form.Label>
              <Field
                name="email"
                type="text"
                as={Form.Control}
                placeholder="Enter your username or email"
                className={`rounded-0 card-glassmorphism__input ${
                  errors.email && touched.email ? "is-invalid" : ""
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="invalid-feedback"
              />
            </Form.Group>
            <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
              <Field
                as={Form.Check}
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                className="card-glassmorphism__checkbox"
                label={
                  <span className="text-white fw-500">
                    Remember Me
                  </span>
                }
              />
              <Button
                onClick={() => router.push("/")}
                className="d-flex align-items-center px-3 py-2 btn-glow"
              >
                <Home size={16} className="me-1" />
                Home
              </Button>
            </Form.Group>
            <div className="full-button">
              <Button
                type="submit"
                className="btn text-uppercase position-relative w-100"
                disabled={isSubmitting || loading}
              >
                <span className="button-text">
                  {isSubmitting || loading
                    ? "Processing..."
                    : "Next"}
                </span>
                <i className="fa-solid fa-play ms-2"></i>
              </Button>
            </div>
          </FormikForm>
        )}
      </Formik>
      <p className="my-4 text-center fw-500 text-white">
        New to Streamit?{" "}
        <Link href="/auth/sign-up" className="text-primary ms-1">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

Login.layout = "Blank";
export default Login;