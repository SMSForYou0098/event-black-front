import React, { Fragment, useState, useEffect } from 'react';
import { Col, Container, Form, Row, Button, Alert, Card } from 'react-bootstrap'; // Added Card
import Link from 'next/link';
import { useRouter } from 'next/router';
// import { motion, AnimatePresence } from 'framer-motion';
import { publicApi } from '@/lib/axiosInterceptor';

const SignUp = () => {
    const router = useRouter();
    const { data } = router.query;

    const [formData, setFormData] = useState({
        email: '',
        number: '',
        name: '',
        role_id: 4,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (typeof data === 'string') {
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
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            await publicApi.post('/create-user', formData);
            const response = await publicApi.post('/verify-user', { data: formData.number || formData.email });
            
            if (response.data.status) {
                const { pass_req, session_id, auth_session } = response.data;
                 const query = { data: formData.number || formData.email, session_id, auth_session };
                if (pass_req) {
                    router.push({ pathname: '/auth/verify-password', query });
                } else {
                    router.push({ pathname: '/auth/two-factor', query: { data: query.data } });
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong');
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


 return (
    <Fragment>
      <main className='main-content'>
        <div className='vh-100' style={{ backgroundImage: "url(/assets/images/pages/01.webp)", backgroundSize: 'cover', backgroundRepeat: "no-repeat", position: 'relative', minHeight: '500px' }}>
          <Container>
            <Row className='justify-content-center align-items-center height-self-center vh-100'>
              <Col lg="8" md="12" className='align-self-center'>
                {/* Applied the glassmorphism card style */}
                <Card className="user-login-card p-4 card-glassmorphism">
                  <h4 className='text-center mb-5 text-white'>Create Your Account</h4>
                   {error && (
                       <div>
                           <Alert variant="danger">{error}</Alert>
                       </div>
                   )}
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row lg="2" className='row-cols-1 g-2 g-lg-5'>
                      <Col>
                        <Form.Group>
                          <Form.Label className='text-white fw-500 mb-2'>Full Name *</Form.Label>
                          {/* Applied the input style */}
                          <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} className='rounded-0 card-glassmorphism__input' required pattern="[A-Za-z ]{3,}" />
                           <Form.Control.Feedback type="invalid">Please enter a valid name (min 3 characters).</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                       <Col>
                        <Form.Group>
                             <Form.Label className='text-white fw-500 mb-2'>Phone Number *</Form.Label>
                             {/* Applied the input style */}
                             <Form.Control type="tel" name="number" value={formData.number} onChange={handleChange} className='rounded-0 card-glassmorphism__input' required pattern="^\d{10,12}$" />
                             <Form.Control.Feedback type="invalid">Please enter a valid 10 or 12 digit number.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group>
                             <Form.Label className='text-white fw-500 mb-2'>Email *</Form.Label>
                             {/* Applied the input style */}
                             <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} className='rounded-0 card-glassmorphism__input' required />
                              <Form.Control.Feedback type="invalid">Please enter a valid email.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="list-group-item d-flex align-items-center mt-5 mb-3 text-white">
                        {/* Applied the checkbox style */}
                        <Form.Check.Input
                            type="checkbox"
                            required
                            className="m-0 me-2 card-glassmorphism__checkbox"
                            style={{ width: '24px', height: '24px' }}
                        />
                        I've read and accept the
                        <Link href="/extra/terms-of-use" className="ms-1 text-primary">
                            terms & conditions*
                        </Link>
                    </Form.Group>

                    <Row className='text-center'>
                      <Col lg="3"></Col>
                      <Col lg="6">
                        <div className="full-button">
                          <div className="iq-button">
                               {/* Applied the gradient button style */}
                               <Button type="submit" className="btn text-uppercase position-relative w-100 btn-gradient-primary" disabled={loading}>
                                 <span className="button-text">{loading ? 'Creating Account...' : 'Sign Up'}</span>
                                 <i className="fa-solid fa-play ms-2"></i>
                               </Button>
                          </div>
                          <p className="mt-2 mb-0 fw-normal text-white">Already have an account?<Link href="/auth/login" className="ms-1 text-primary">Login</Link></p>
                        </div>
                      </Col>
                      <Col lg="3"></Col>
                    </Row>
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

SignUp.layout = "Blank";
export default SignUp;