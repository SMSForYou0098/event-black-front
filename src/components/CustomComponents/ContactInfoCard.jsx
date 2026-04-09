import React from 'react';
import { Col } from 'react-bootstrap';
import CustomCard from './CustomCard';
import Link from 'next/link';

const ContactInfoCard = ({ icon: Icon, title, discription, children, CONTACT_INFO, email }) => {
    return (
        <Col lg="3" md="6">
            <CustomCard>
                <div className="bg-dark d-flex align-items-center justify-content-center rounded-3 mb-4 shadow-sm" style={{ width: '50px', height: '50px' }}>
                    {Icon && <Icon size={24} className="text-white" />}
                </div>
                <h5 className="fw-500 mb-3">{title}</h5>
                <p className="text-muted small mb-4">
                    {discription}
                </p>
                {
                    title === "Call Us" ?
                        <>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Link href={`tel:${CONTACT_INFO.phone1}`} className="text-white text-decoration-none small fw-500">
                                    {CONTACT_INFO.phone1}
                                </Link>
                                <span className="text-muted small">/</span>
                                <Link href={`tel:${CONTACT_INFO.phone2}`} className="text-white text-decoration-none small fw-500">
                                    {CONTACT_INFO.phone2}
                                </Link>
                            </div>
                            <div className="mt-auto">
                                <span className="text-muted extra-small d-block">Support Hours:</span>
                                <span className="text-white small fw-500">{CONTACT_INFO.workingHours}</span>
                            </div>
                        </>
                        :
                        <Link href={`mailto:${email}`} className="text-primary text-decoration-none small fw-500">
                            {email}
                        </Link>
                }
                {children}
            </CustomCard>
        </Col>
    );
};

export default ContactInfoCard;
