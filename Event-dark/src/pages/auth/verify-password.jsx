import React, { memo, Fragment, useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Container,
} from "react-bootstrap";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { signIn, logout } from "@/store/auth/authSlice";
import { AppDispatch } from "@/store";
// import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";
import toast from "react-hot-toast";
import { PasswordField } from "../../components/auth/CustomFormFields";
import AuthLayout from "@/layouts/AuthLayout";
import CustomBtn from "@/utils/CustomBtn";
import { ChevronLeft } from "lucide-react";

const VerifyPassword = memo(() => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, session_id, auth_session } = router.query;

  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data || !session_id || !auth_session) {
      router.push("/auth/login");
    }
  }, [data, session_id, auth_session, router]);

  const handleVerification = async () => {
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    setError("");

    const loginData = {
      password,
      number: data,
      passwordRequired: true,
      session_id: session_id,
      auth_session: auth_session,
    };

    const resultAction = await dispatch(signIn(loginData));

    if (signIn.fulfilled.match(resultAction)) {
      toast.success("Login Successful!");
      router.push("/");
    } else {
      setAttempts((prev) => prev + 1);
      if (resultAction.payload) {
        setError(resultAction.payload);
      } else {
        setError("Login failed. Please check your credentials.");
      }
      if (attempts >= 2) {
        dispatch(logout());
        toast.error("Too many failed attempts. You have been logged out.");
        router.push("/auth/login");
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && password) {
      handleVerification();
    }
  };

  return (
    <AuthLayout>
      {error && <Alert variant="primary">{error}</Alert>}
      <Form.Group className="mb-4">
        <Form.Label htmlFor="password-field">Password</Form.Label>
        {/* --- REPLACED WITH PasswordField COMPONENT --- */}
        <PasswordField
          idValue="password-field"
          value={password}
          setPassword={setPassword}
          handleKeyDown={handleKeyDown}
          className="mb-2 card-glassmorphism__input"
          autoFocus
        />
        <Form.Text className="text-muted" as="small">
          Enter your password for{" "}
          <strong>
            {typeof data === "string" && /^\d+$/.test(data) ? (
              <>
                <span role="img" aria-label="phone">
                  📞
                </span>{" "}
                {data}
              </>
            ) : (
              <>
                <span role="img" aria-label="mail">
                  📧
                </span>{" "}
                {data}
              </>
            )}
          </strong>
        </Form.Text>
      </Form.Group>
      <div className="full-button">
        <CustomBtn
          type="button"
          disabled={!password || loading}
          HandleClick={handleVerification}
          buttonText={loading ? "Verifying..." : "Sign In"}
        />
      </div>
      <div className="mt-3 d-flex justify-content-between">
        <Link href="/auth/login" className="text-primary fw-bold d-flex align-items-center">
          <ChevronLeft/> Back to Login
        </Link>
        <Link href="/auth/lost-password" passHref className="fw-bold">
          Forgot Password?
        </Link>
      </div>
    </AuthLayout>
  );
});

VerifyPassword.displayName = "VerifyPassword";
// VerifyPassword.layout = "Blank";
export default VerifyPassword;
