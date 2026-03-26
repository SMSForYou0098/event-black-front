import React, { useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import { Calendar, MapPin, Ticket, User, CheckCircle, Info } from 'lucide-react';
import { useRouter } from "next/router";
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from "@/lib/axiosInterceptor"
import { useMyContext } from "@/Context/MyContextProvider";
import { getErrorMessage } from "@/utils/errorUtils";
import CustomBtn from '../../../../../utils/CustomBtn';
import BookingSummarySkeleton from '../../../../../utils/SkeletonUtils/BookingSummarySkeleton';

const ExhibitionBookingSummary = () => {
    const router = useRouter();
    const { event_id, session_id } = router.query;
    const { ErrorAlert, formatDateRange, convertTo12HourFormat } = useMyContext();

    // Status update: after redirect from waiting page, the booking should be confirmed
    const { data: bookingData, isLoading, isError, error } = useQuery({
        queryKey: ['stall-booking-summary', session_id],
        queryFn: async () => {
            if (!session_id) return null;
            const res = await api.post('/stall/application/verify-session', { session_id });
            return res.data;
        },
        enabled: !!session_id,
        staleTime: 0, // Always get fresh status
    });

    if (isLoading || !session_id) return <BookingSummarySkeleton type="cart" />;

    if (isError) {
        return (
            <Container className="py-5 text-center">
                <Card className="custom-dark-bg p-5">
                    <Info className="text-danger mb-3" size={48} />
                    <h4 className="text-white">Unable to Load Summary</h4>
                    <p className="text-muted">{getErrorMessage(error, "Please check your bookings page for status.")}</p>
                    <div className="d-flex gap-2 justify-content-center mt-3">
                        <CustomBtn
                            variant="primary"
                            buttonText="Back to Exhibition"
                            HandleClick={() => router.push('/events/exhibition')}
                        />
                        <CustomBtn
                            variant="secondary"
                            buttonText="My Bookings"
                            HandleClick={() => router.push('/bookings')}
                        />
                    </div>
                </Card>
            </Container>
        );
    }

    const application = bookingData?.application || bookingData?.data || bookingData || {};
    const payment = bookingData?.payment_log || {};
    const event = application?.event || {};
    const venue = application?.event?.address || {};
    console.log('app', application)
    const infoItems = [
        { icon: User, label: "Vendor", value: application?.vendor?.name || application?.user?.name || "N/A" },
        { icon: Ticket, label: "Stall", value: application?.stall?.name || application?.category || "N/A" },
        { icon: Calendar, label: "Date", value: formatDateRange(event?.date_range) || "N/A" },
        { icon: MapPin, label: "Location", value: venue || "N/A" },
    ];

    return (
        <div className="cart-page min-vh-100">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        {/* Success Header */}
                        <Card className="custom-dark-bg border-0 shadow-lg overflow-hidden mb-4">
                            <div className={`py-3 text-center ${application?.application_status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                                <h4 className="mb-0 text-white fw-bold">
                                    {application?.application_status === 'pending' ? 'Application Received' : 'Booking Confirmed!'}
                                </h4>
                            </div>
                            <Card.Body className="p-4 p-md-5 text-center">
                                <div className="mb-4">
                                    <CheckCircle size={80} className={application?.application_status === 'pending' ? 'text-warning' : 'text-success'} />
                                </div>
                                <h3 className="text-white mb-2">Thank You for Booking!</h3>
                                <p className="text-muted">
                                    Your stall application for <strong>{event?.name || application?.category || 'selected stall'}</strong> has been {application?.application_status === 'pending' ? 'submitted and is awaiting final confirmation' : 'successfully processed'}.
                                    A confirmation has been sent to your registered email and WhatsApp.
                                </p>

                            </Card.Body>
                        </Card>

                        <Row>
                            {/* Stall & Event Details */}
                            <Col md={7}>
                                <Card className="custom-dark-bg border-0 h-100 mb-4">
                                    <Card.Body className="p-4">
                                        <h5 className="text-white mb-4 border-bottom border-secondary pb-2">Booking Details</h5>
                                        {infoItems.map((item, index) => (
                                            <div key={index} className="d-flex align-items-center mb-3">
                                                <div className="bg-dark p-2 rounded-circle me-3">
                                                    <item.icon size={18} className="text-warning" />
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">{item.label}</small>
                                                    <span className="text-white fw-medium">{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Payment Summary */}
                            <Col md={5}>
                                <Card className="custom-dark-bg border-0 h-100 mb-4">
                                    <Card.Body className="p-4 d-flex flex-column">
                                        <h5 className="text-white mb-4 border-bottom border-secondary pb-2">Payment Overview</h5>
                                        <div className="flex-grow-1">
                                            <Table borderless className="text-white mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td className="ps-0 py-3 fw-bold fs-5">Total Paid</td>
                                                        <td className="pe-0 py-3 text-end text-success fw-bold fs-5">₹{application?.amount || 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>

                                        </div>
                                        <div className="mt-auto pt-4">
                                            <CustomBtn
                                                variant="primary"
                                                className="w-100"
                                                buttonText="Explore More Events"
                                                HandleClick={() => router.push('/events/exhibition')}
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

ExhibitionBookingSummary.layout = 'events';
export default ExhibitionBookingSummary;
