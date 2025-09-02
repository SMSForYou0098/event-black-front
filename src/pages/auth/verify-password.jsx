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
      router.push("/dashboard");
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
          className="rounded-0 mb-2"
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
      <Form.Group className="text-end mb-3">
        <Link href="/auth/lost-password" passHref>
          Forgot Password?
        </Link>
      </Form.Group>
      <div className="full-button">
        <Button
          variant="primary"
          className="w-100"
          onClick={handleVerification}
          disabled={!password || loading}
        >
          {loading ? "Verifying..." : "Sign In"}
        </Button>
      </div>
      <div className="mt-3 text-center">
        <Link href="/auth/login" className="text-primary">
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
});

VerifyPassword.displayName = "VerifyPassword";
// VerifyPassword.layout = "Blank";
export default VerifyPassword;
