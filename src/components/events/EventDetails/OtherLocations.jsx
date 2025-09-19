import React, { useState } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import { CustomHeader } from '../../../utils/ModalUtils/CustomModalHeader';
import { useRouter } from 'next/router';

const OtherLocations = ({ eventData }) => {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // Dummy data for testing - you can remove this when you have real data
    const dummyEventData = [
        {
            id: 2,
            event_name: "Rock Music Festival Mumbai",
            timing: "6:00 PM - 11:00 PM",
            city: "Mumbai",
            state: "Maharashtra",
            address: "MMRDA Grounds, Bandra Kurla Complex",
            date_range: "15 Oct - 17 Oct 2024",
            event_key: "music-festival-mumbai-2024"
        },
        {
            id: 3,
            event_name: "Rock Music Festival Bangalore",
            timing: "5:30 PM - 10:30 PM", 
            city: "Bangalore",
            state: "Karnataka",
            address: "Palace Grounds, Jayamahal Extension",
            date_range: "22 Oct - 24 Oct 2024",
            event_key: "music-festival-bangalore-2024"
        },
        {
            id: 4,
            event_name: "Rock Music Festival Delhi",
            timing: "6:30 PM - 11:30 PM",
            city: "Delhi",
            state: "Delhi", 
            address: "Jawaharlal Nehru Stadium, Lodhi Road",
            date_range: "29 Oct - 31 Oct 2024",
            event_key: "music-festival-delhi-2024"
        },
        {
            id: 5,
            event_name: "Rock Music Festival Chennai",
            timing: "6:00 PM - 11:00 PM",
            city: "Chennai",
            state: "Tamil Nadu",
            address: "YMCA Ground, Nandanam",
            date_range: "5 Nov - 7 Nov 2024",
            event_key: "music-festival-chennai-2024"
        }
    ];

    const handleBookNow = (event_key) => {
        console.log('Booking event:', event_key);
        // router.push(`/events/process/${event_key}`);
    };

    const handleViewLocation = (event_key) => {
        console.log('Viewing location:', event_key);
        // router.push(`/events/${event_key}`);
    };

    // Mock CustomBtn component for demo
    const MockCustomBtn = ({ buttonText, className, variant, icon, HandleClick }) => (
        <CustomBtn 
            buttonText={buttonText}
            className={className}
            variant={variant}
            icon={icon}
            HandleClick={HandleClick}
        />
    );

    return (
        <>
            <div className="my-3">
                <MockCustomBtn
                    buttonText="View Other Locations"
                    className="btn-sm"
                    variant="outline-primary"
                    icon={<MapPin size={18} />}
                    HandleClick={() => setShowModal(true)}
                />
            </div>

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="xl"
                // centered
            >
                <CustomHeader
                    title="Other Locations" 
                    onClose={() => setShowModal(false)}
                    closable
                />
                <Modal.Body className="p-3 p-md-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <Row className="g-3">
                        {dummyEventData?.map((location) => (
                            <Col xs={12} key={location.id}>
                                <div className="border rounded-3 p-3">
                                    <Row className="align-items-center">
                                        {/* Event Details */}
                                        <Col xs={12} md={12} lg={7}>
                                            <h5 className="mb-2 fs-6 fs-md-5 fw-semibold">
                                                {location.event_name}
                                            </h5>
                                            
                                            <div className="mb-1">
                                                <small className="text-muted">
                                                    <i className="fa-regular fa-clock me-2"></i>
                                                    {location.timing}
                                                </small>
                                            </div>
                                            
                                            <div className="mb-1">
                                                <small className="text-muted">
                                                    <i className="fa-solid fa-location-dot me-2"></i>
                                                    {location.city}, {location.state}
                                                </small>
                                            </div>
                                            
                                            <div className="mb-0">
                                                <small className="text-muted">
                                                    {location.address}
                                                </small>
                                            </div>
                                        </Col>

                                        {/* Action Buttons */}
                                        <Col xs={12} md={12} lg={5} className="mt-3 mt-md-0">
                                            <Row className="g-2">
                                                <Col xs={6} md={6} lg={6}>
                                                    <MockCustomBtn
                                                        buttonText="Book Now"
                                                        className="btn-primary btn-sm w-100"
                                                        HandleClick={() => handleBookNow(location.event_key)}
                                                    />
                                                </Col>
                                                <Col xs={6} md={6} lg={6}>
                                                    <MockCustomBtn
                                                        buttonText={<><span className="d-none d-sm-inline">View Location</span><span className="d-sm-none">View</span></>}
                                                        className="btn-outline-primary btn-sm w-100"
                                                        variant="outline-primary"
                                                        icon={<MapPin size={16} />}
                                                        HandleClick={() => handleViewLocation(location.event_key)}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    {/* Empty state when no other locations */}
                    {dummyEventData?.length === 0 && (
                        <Row>
                            <Col xs={12}>
                                <div className="text-center py-4">
                                    <div className="text-muted">
                                        <MapPin size={48} className="mb-3 opacity-50" />
                                        <p>No other locations available for this event.</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default OtherLocations;