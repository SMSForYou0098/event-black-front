import React, { memo, Fragment } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import Link from 'next/link';

const AuthSuccess = memo(() => {
    return (
        <Fragment>
           <main className='main-content'>
                <div className='vh-100' style={{ backgroundImage: "url(/assets/images/pages/01.webp)", backgroundSize: 'cover', backgroundRepeat: "no-repeat", position: 'relative', minHeight: '500px' }}>
                    <Container>
                         <Row className="align-items-center justify-content-center height-self-center vh-100">
                            <Col lg="5" md="12" className='align-self-center'>
                                <Card className="user-login-card bg-body">
                                    <Card.Body>
                                        <h4 className="pb-3 text-center">Success!</h4>
                                        <p className='text-center'>An email has been sent to your address. Please check for an email and click on the included link to reset your password.</p>
                                   <div className='text-center'>
                                        <Link href="/dashboard" className="btn btn-primary">Back to home</Link>
                                   </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
           </main>
        </Fragment>
    )
})

AuthSuccess.displayName="AuthSuccess";
// AuthSuccess.layout = "Blank";
export default AuthSuccess;
