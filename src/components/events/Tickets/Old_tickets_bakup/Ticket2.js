import React from 'react';

import { Container, Row, Col, Image } from 'react-bootstrap';

const Ticket2 = () => {
    return (
        <Container fluid >
            <Row className="text-white overflow-hidden" style={{ maxWidth: '800px', height: '300px' }}>
                <Col md={1} className="bg-dark d-flex flex-column align-items-center justify-content-between p-5 text-white" style={{ height: '100%' }}>
                    <p className="m-0 small" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>0123456789</p>
                    <p className="m-0 small" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Ticket Number</p>
                </Col>
                <Col md={7} className="p-0 position-relative" style={{ height: '100%' }}>
                    <Image src="https://www.alliedmarketresearch.com/blog/Blog_banner_image/ctoykrzsmv.jpeg" alt="Concert crowd with stage lights" className="img-fluid w-100 h-100" />
                    <div className="position-absolute top-0 left-0 w-100 h-100 bg-dark bg-opacity-75 p-4 d-flex flex-column justify-content-between">
                        <div>
                            <h1
                                className="display-5 font-weight-bold text-white">
                                REALLY GREAT <br /><span className="font-weight-normal bg-light text-dark">CONCERT</span>
                            </h1>
                            <div className='d-flex gap-5 position-relative top-50'>
                            <div className='details'>
                                <p className="mb-0 fw-bold">Studio Shodwe,</p>
                                <p className="mb-0 fw-bold">123 Anywhere St., Any city</p>
                            </div>
                            <div className='details'>
                                <p className="mb-0">Date:</p>
                                <p className='fw-bold'>October 14, 2025</p>
                            </div>
                            <div className='details'>
                                <p className="mb-0">Time: </p>
                                <p className='fw-bold'>4:00 pm</p>
                            </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col md={1} className="bg-dark p-0 m-0 d-flex flex-column align-items-center justify-content-between" style={{ width: '30px', height: '100%' }}>
                    <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
                    <div className="bg-white position-relative" style={{ bottom:'5%', width: '30px', height: '54px', margin: '2px 0', borderRadius: '100px' }}></div>
                        {Array.from({ length: 33 }).map((_, index) => (
                            <div key={index} className="bg-white" style={{ width: '5px', height: '7px', margin: '2px 0', borderRadius: '100px' }}></div>
                        ))}
                        <div className="bg-white position-relative" style={{ top:'5%', width: '30px', height: '54px', margin: '2px 0', borderRadius: '100px' }}></div>
                    </div>
                </Col>
                <Col md={3} className="text-white d-flex flex-column justify-content-between p-4" style={{ background: '#252734' }}>
                    <div className="text-center ">
                        <p className="m-0 small">Gate</p>
                        <p className="m-0 display-5 font-weight-bold">01</p>
                    </div>
                    <div className="text-center">
                        <p className="m-0 small">Row</p>
                        <p className="m-0 display-5 font-weight-bold">02</p>
                    </div>
                    <div className="text-center">
                        <p className="m-0 small">Seat</p>
                        <p className="m-0 display-5 font-weight-bold">03</p>
                    </div>
                    <div className="w-100">
                        <p className="m-0 small text-center">ADMIT ONE</p>
                        <Image src="https://placehold.co/600x200" alt="Barcode" className="img-fluid w-100" />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Ticket2;
