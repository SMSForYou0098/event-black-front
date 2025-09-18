import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
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
                size="lg"
                centered
            >
                <CustomHeader
                    title="Other Locations" 
                    onClose={() => setShowModal(false)}
                    closable
                />
                <Modal.Body className="p-4">
                    <div className="d-flex flex-column gap-3">
                        {dummyEventData?.map((location) => (
                            <div 
                                key={location.id}
                                className="border rounded-3 p-3 d-flex justify-content-between align-items-center"
                                style={{
                                    border: '1px solid #dee2e6',
                                    borderRadius: '12px',
                                    padding: '16px'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <h5 className="mb-2" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                        {location.event_name}
                                    </h5>
                                    <div className="mb-1" style={{ marginBottom: '4px' }}>
                                        <span style={{ color: '#6c757d', fontSize: '14px' }}>
                                            <i className="fa-regular fa-clock me-2" style={{ marginRight: '8px' }}></i>
                                            {location.timing}
                                        </span>
                                    </div>
                                    <div className="mb-1" style={{ marginBottom: '4px' }}>
                                        <span style={{ color: '#6c757d', fontSize: '14px' }}>
                                            <i className="fa-solid fa-location-dot me-2" style={{ marginRight: '8px' }}></i>
                                            {location.city}, {location.state}
                                        </span>
                                    </div>
                                    <p className="text-muted mb-0" style={{ color: '#6c757d', margin: 0, fontSize: '13px' }}>
                                        {location.address}
                                    </p>
                                </div>
                                <div className="d-flex gap-2" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    <MockCustomBtn
                                        buttonText="Book Now"
                                        className="btn-primary btn-sm"
                                        HandleClick={() => handleBookNow(location.event_key)}
                                    />
                                    <MockCustomBtn
                                        buttonText="View Location"
                                        className="btn-outline-primary btn-sm"
                                        variant="outline-primary"
                                        icon={<MapPin size={16} />}
                                        HandleClick={() => handleViewLocation(location.event_key)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty state when no other locations */}
                    {dummyEventData?.length === 0 && (
                        <div className="text-center py-4">
                            <div style={{ color: '#6c757d', fontSize: '16px' }}>
                                <MapPin size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p>No other locations available for this event.</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};
export default OtherLocations;