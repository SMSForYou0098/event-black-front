import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import { CustomHeader } from '../../../utils/ModalUtils/CustomModalHeader';
import { useRouter } from 'next/router';

const OtherLocations = ({ eventData }) => {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // Filter out current location from the list
    const otherLocations = eventData?.other_locations?.filter(
        location => location.id !== eventData.id
    ) || [];

    // if (!otherLocations.length) return null;

    const handleBookNow = (event_key) => {
        router.push(`/events/process/${event_key}`);
    };

    const handleViewLocation = (event_key) => {
        router.push(`/events/${event_key}`);
    };

    return (
        <>
            <div className="my-3">
                <CustomBtn
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
            >
                <CustomHeader 
                    title="Other Locations" 
                    onClose={() => setShowModal(false)}
                    closable
                />
                <Modal.Body className="p-4">
                    <div className="d-flex flex-column gap-3">
                        {otherLocations?.map((location) => (
                            <div 
                                key={location.id}
                                className="border rounded-3 p-3 d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <h5 className="mb-2">{location.city}, {location.state}</h5>
                                    <p className="text-muted mb-0">
                                        <i className="fa-regular fa-calendar me-2"></i>
                                        {location.date_range}
                                    </p>
                                </div>
                                <div className="d-flex gap-2">
                                    <CustomBtn
                                        buttonText="Book Now"
                                        className="btn-primary btn-sm"
                                        HandleClick={() => handleBookNow(location.event_key)}
                                    />
                                    <CustomBtn
                                        buttonText="View Location"
                                        className="btn-outline-primary btn-sm"
                                        HandleClick={() => handleViewLocation(location.event_key)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default OtherLocations;