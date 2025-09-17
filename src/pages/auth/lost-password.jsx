import React, { Fragment, useState } from 'react';
import { Col, Container, Form, Row, Button, Alert, Card } from 'react-bootstrap'; // Added Card
import Link from 'next/link';
import { useRouter } from 'next/router';
import { publicApi } from '@/lib/axiosInterceptor';
import CustomBtn from '@/utils/CustomBtn';
import { CircleChevronLeft } from 'lucide-react';


const LostPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setLoading(true);
        try {
            // NOTE: Replace with your actual password reset endpoint
            await publicApi.post('/request-password-reset', { email });
            setSuccess('A link to reset your password has been sent to your email.');
            router.push('/auth/auth-success');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send password reset link.');
        } finally {
            setLoading(false);
        }
    };

 return (
    <Fragment>
      <main className='main-content'>
        <div className='vh-100' style={{ backgroundImage: "url(/assets/images/pages/01.webp)", backgroundSize: 'cover', backgroundRepeat: "no-repeat", position: 'relative', minHeight: '500px' }}>
          <Container>
            <Row className='justify-content-center align-items-center height-self-center vh-100'>
              <Col lg="5" md="12" className='align-self-center'>
                {/* Applied the glassmorphism card style */}
                <Card className='user-login-card p-4 card-glassmorphism'>
                  <h4 className='text-center mb-4 text-white'>Reset Password</h4>
                  <p className="text-white text-center mb-4">
                    Please enter your username or email address. You will receive a link to create a new password via email.
                  </p>
                   {error && <Alert variant="primary">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='text-white fw-500 mb-2'>Username or Email Address</Form.Label>
                      {/* Applied the input style */}
                      <Form.Control 
                        type='email' 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className='rounded-0 card-glassmorphism__input' 
                        required 
                      />
                    </Form.Group>
                      <CustomBtn 
                        type="submit"
                        disabled={loading}
                        className="btn text-uppercase position-relative w-100 btn-translucent-secondary"
                        buttonText={loading ? 'Sending...' : 'Get new password'}
                      />
                    {/* Styled the separator */}
                    <div className="seperator d-flex justify-content-center align-items-center my-4 seperator-glass">
                      <span className="line"></span>
                       <span className="mx-2">OR</span>
                      <span className="line"></span>
                    </div>
                      <CustomBtn
                        buttonText="Back to Login"
                        className="text-uppercase position-relative w-100"
                        HandleClick={() => router.push('/auth/login')}
                        icon={<i className="fa-solid fa-angle-left"></i>}
                        variant=""
                        iconPosition="left"
                      />
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