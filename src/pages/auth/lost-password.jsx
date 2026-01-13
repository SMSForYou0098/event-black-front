import React, { Fragment, useState, useEffect } from 'react';
import { Col, Container, Form, Row, Button, Alert, Card } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { publicApi } from '@/lib/axiosInterceptor';
import CustomBtn from '@/utils/CustomBtn';
import ShakyButton from '@/utils/ShakyButton';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const LostPassword = () => {
  const router = useRouter();
  const { token, email: queryEmail } = router.query;

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);

  // Set email from query if available
  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  // Mode: 'request' or 'reset'
  const isResetMode = !!token;

  // Mutation for Requesting Reset Link
  const { mutate: requestReset, isPending: requestLoading } = useMutation({
    mutationFn: async (values) => {
      return await publicApi.post('/forgot-password', { email: values.email });
    },
    onSuccess: (response) => {
      setSuccess('A link to reset your password has been sent to your email.');
      // Optional: Redirect to success page
      router.push('/auth/auth-success');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to send password reset link.');
      setShake(true);
    }
  });

  // Mutation for Resetting Password (from user snippet)
  const { mutate: resetPassword, isPending: resetLoading } = useMutation({
    mutationFn: async (values) => {
      const response = await publicApi.post('/reset-password', {
        token,
        email: values.email, // using state/form value or query value
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      return response;
    },
    onSuccess: (response) => {
      const msg = response?.data?.message || 'Password reset successfully!';
      setSuccess(msg);
      toast.success(msg);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        // router.push('/auth/login');
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setShake(true);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isResetMode) {
      // Reset Password Logic
      if (!password || !confirmPassword) {
        setError('Please fill in all fields.');
        setShake(true);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setShake(true);
        return;
      }
      resetPassword({ email, password, confirmPassword });
    } else {
      // Request Link Logic
      if (!email) {
        setError('Please enter your email address.');
        setShake(true);
        return;
      }
      requestReset({ email });
    }
  };

  const isLoading = requestLoading || resetLoading;

  return (
    <Fragment>
      <main className='main-content'>
        <div className='vh-100' style={{ backgroundImage: "url(/assets/images/pages/01.webp)", backgroundSize: 'cover', backgroundRepeat: "no-repeat", position: 'relative', minHeight: '500px' }}>
          <Container>
            <Row className='justify-content-center align-items-center height-self-center vh-100'>
              <Col lg="5" md="12" className='align-self-center'>
                <Card className='user-login-card p-4 card-glassmorphism'>
                  <h4 className='text-center mb-4 text-white'>
                    {isResetMode ? 'Set New Password' : 'Reset Password'}
                  </h4>
                  <p className="text-white text-center mb-4">
                    {isResetMode
                      ? 'Please enter your new password below.'
                      : 'Please enter your username or email address. You will receive a link to create a new password via email.'}
                  </p>

                  {error && <Alert variant="primary">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='text-white fw-500 mb-2'>Email Address</Form.Label>
                      <Form.Control
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='card-glassmorphism__input'
                        required
                        disabled={!changeEmail}
                      />
                    </Form.Group>

                    {isResetMode && (
                      <>
                        <Form.Group className='mb-3'>
                          <Form.Label className='text-white fw-500 mb-2'>New Password</Form.Label>
                          <Form.Control
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='card-glassmorphism__input'
                            required
                          />
                        </Form.Group>
                        <Form.Group className='mb-3'>
                          <Form.Label className='text-white fw-500 mb-2'>Confirm Password</Form.Label>
                          <Form.Control
                            type='password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='card-glassmorphism__input'
                            required
                          />
                        </Form.Group>
                      </>
                    )}
                    <Row>
                      <Col lg={6}>
                        <CustomBtn
                          buttonText="Back to Home"
                          className="text-uppercase position-relative w-100"
                          HandleClick={() => router.push('/')}
                          icon={<i className="fa-solid fa-angle-left"></i>}
                          variant=""
                          iconPosition="left"
                        />
                      </Col>
                      <Col lg={6}>
                        <CustomBtn
                          type="submit"
                          shake={shake}
                          size='sm'
                          onShakeComplete={() => setShake(false)}
                          disabled={isLoading}
                          className="btn position-relative w-100 btn-translucent-secondary"
                          HandleClick={handleSubmit}
                          buttonText={isLoading
                            ? (isResetMode ? 'Resetting...' : 'Sending...')
                            : (isResetMode ? 'Reset Password' : 'Submit')}
                        />
                      </Col>
                    </Row>
                    {!changeEmail && (
                      <div className='text-center mt-3'>
                        <button
                          type="button"
                          onClick={() => setChangeEmail(true)}
                          className='btn btn-link text-white text-decoration-underline p-0'
                        >
                          Change Email
                        </button>
                      </div>
                    )}
                  </Form>

                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </main>
    </Fragment>
  );
};

LostPassword.layout = "Blank";
export default LostPassword;