import React, { useState } from 'react';
import SectionSlider from '@/components/slider/SectionSlider';
import { Modal, Row, Col } from 'react-bootstrap';
import { CustomHeader } from '../../../utils/ModalUtils/CustomModalHeader';
import Image from 'next/image';

const dummyCrews = [
    {
        name: "John Doe",
        role: "Event Director",
        image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
        name: "Sarah Smith",
        role: "Production Manager",
        image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
        name: "Michael Johnson",
        role: "Technical Director",
        image: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    {
        name: "Emily Brown",
        role: "Stage Manager",
        image: "https://randomuser.me/api/portraits/women/4.jpg"
    }
];

const EventCrew = ({ crews = dummyCrews }) => {
    const [showModal, setShowModal] = useState(false);

    if (!crews || crews.length === 0) return null;

    const handleViewAll = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const renderCrewCard = (crew) => (
        <div className="crew-card text-center">
            <div className="crew-image mb-3">
                <Image
                    src={crew.photo || '/images/default-avatar.png'}
                    alt={crew.name}
                    className="img-fluid rounded-circle"
                    width={100}
                    height={100}
                    loading='lazy'
                    style={{
                        objectFit: 'cover',
                        width: '100px',
                        height: '100px',
                    }}
                />
            </div>
            <h5 className="crew-name mb-1">{crew.name}</h5>
            <p className="crew-role text-muted mb-0">{crew.role}</p>
        </div>
    );

    const renderModal = () => (
        <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="xl"
            // centered
        >
            <CustomHeader title="Event Crew & Casts" closable={true} onClose={()=>setShowModal(false)}/>
            <Modal.Body className='p-0 py-3'>
                <Row className="g-4">
                    {crews.map((crew, index) => (
                        <Col key={index} xs={12} sm={6} md={4} lg={3}>
                            {renderCrewCard(crew)}
                        </Col>
                    ))}
                </Row>
            </Modal.Body>
        </Modal>
    );

    return (
        <div className="event-crew-section my-4">
            <SectionSlider
                title="Event Crew & Casts"
                list={crews}
                slidesPerView={5}
                spaceBetween={20}
                loop={false}
                containerFluid={false}
                className="crew-slider"
                link="#"
                onViewAll={handleViewAll}
            >
                {(crew) => renderCrewCard(crew)}
            </SectionSlider>
            {renderModal()}
        </div>
    );
};

export default EventCrew;