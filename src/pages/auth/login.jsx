import React, { useState } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { signIn, getSession } from "next-auth/react";
import { publicApi } from "@/lib/axiosInterceptor";
import { useMyContext } from "@/Context/MyContextProvider";
import AuthLayout from "@/layouts/AuthLayout";
import { Home } from "lucide-react";
import CustomBtn from "../../utils/CustomBtn";
import ShakyButton from "@/utils/ShakyButton";
import { setAuthToken, setUserData } from "../../utils/cookieUtils";

const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch();
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

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/' 
      });
      
      if (result?.error) {
        setError('Google sign-in failed. Please try again.');
        console.error('NextAuth error:', result.error);
      } else if (result?.ok) {
        // Get the session which contains backend response
        const session = await getSession();
        console.log('Google login successful:', session);
        
        if (session?.sessionData) {
          // Update Redux state with backend authentication data
          const { token, user } = session.sessionData;
          
          // Store token in cookies/localStorage (using your existing utility)
          if (token) {
            setAuthToken(token);
          }
          
          if (user) {
            setUserData(user);
            
            // Update Redux auth state
            dispatch({
              type: 'auth/loginSuccess', // or whatever action you use
              payload: {
                user,
                token,
                isAuthenticated: true
              }
            });
          }
          
          // Redirect to home or dashboard
          router.push('/');
        } else {
          setError('Authentication failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Facebook OAuth login logic
      // You'll need to implement Facebook OAuth integration
      // For now, this is a placeholder that shows the intended flow
      console.log("Facebook login initiated");

      // Example API call - replace with your actual Facebook OAuth endpoint
      // const response = await publicApi.post("/auth/facebook");
      // if (response.data.status) {
      //   router.push("/"); // or wherever you want to redirect after successful login
      // }

      setError("Facebook login not yet configured. Please contact administrator.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Facebook login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

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
    // Don't set validated to true here to prevent the flash of validation error

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
        // Set validated to true only when there's an actual error
        setValidated(true);
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
            <Col xs={12} lg={6} md={6}>
              <CustomBtn
                buttonText="Home"
                iconPosition="left"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                className="btn-secondary border-0 w-100 btn-sm"
                HandleClick={() => router.push("/")}
                icon={<Home size={20} />}
              />
            </Col>
            <Col xs={12} lg={6} md={6}>
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

      {/* Social Login Section */}
      <div className="text-center mb-3">
        <div className="position-relative">
          <span className="">
            Or continue with
          </span>
        </div>
      </div>

      <Row className="g-2">
        <Col xs={12} lg={6} md={6} >
          <CustomBtn
            variant="outline-light"
            className="w-100 d-flex align-items-center justify-content-center btn-sm border-1"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            hideIcon={true}
            buttonText={
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" className="me-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                 Google
              </>
            }
          >
          </CustomBtn>
        </Col>
        <Col xs={12} lg={6} md={6}>
          <CustomBtn
            variant="outline-light"
            className="w-100 d-flex align-items-center justify-content-center btn-sm border-1"
            onClick={handleFacebookLogin}
            disabled={isSubmitting}
            hideIcon={true}
            buttonText={
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" className="me-2">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </>
            }
          >
          </CustomBtn>
        </Col>
      </Row>

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