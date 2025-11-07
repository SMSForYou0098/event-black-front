import React, { useEffect, useState } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import TicketCanvas from '../events/Tickets/Ticket_canvas';
import { FaInstagram, FaTimes, FaYoutube } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useMyContext } from "@/Context/MyContextProvider"; // done

import AmusementTicket from '../events/Tickets/AmusementTicket';
import AccreditationTicket from '../events/Tickets/AccreditationTicket';
import TicketCanvasBatch from '../events/Tickets/TicketCanvasBatch';
import axios from 'axios';
import IDCardDragAndDrop from '../../components/CustomComponents/IDCardDragAndDrop';

const TicketModal = (props) => {
    const { convertTo12HourFormat, isMobile, api, authToken } = useMyContext()
    const { showPrintButton, showTicketDetails, show, handleCloseModal, ticketType, ticketData, formatDateRange, isAccreditation, isIdCard, card_url, bgRequired, eventId } = props;
    const [savedLayout, setSavedLayout] = useState({});
    const [userPhoto, setUserPhoto] = useState();
    const [idCardBg, setIdCardBg] = useState();

    const RetriveName = (data) => {
        return data?.attendee?.Name ||
            data?.bookings?.[0]?.attendee?.Name ||
            data?.user?.name ||
            data?.bookings?.[0]?.user?.name ||
            'N/A';
    };
    const RetriveUser = (data) => {
        return data?.attendee ||
            data?.bookings?.[0]?.attendee ||
            data?.user ||
            data?.bookings?.[0]?.user ||
            data ||
            'N/A';
    };
    const RetriveNumber = (data) => {
        return data?.attendee?.Mo ||
            data?.bookings?.[0]?.attendee?.Mo ||
            data?.user?.number ||
            data?.bookings?.[0]?.user?.number ||
            'N/A';
    };
    const category = ticketData?.ticket?.event?.category || (ticketData?.bookings && ticketData?.bookings[0]?.ticket?.event?.category)
    const isAmusementTicket = category === 18

    const getTicketComponent = () => {
        // if (isIdCard) return IdCard;
        if (isIdCard) return IDCardDragAndDrop;
        if (isAmusementTicket) return AmusementTicket;
        if (isAccreditation) return AccreditationTicket;
        return TicketCanvas;
    };

    const Ticket = getTicketComponent();

    const fetchLayout = async () => {
        try {
            const response = await axios.get(`${api}layout/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            const layoutData = response.data?.layout || {};
            setSavedLayout(layoutData); // ✅ store the layout in state
        } catch (error) {
            console.error("❌ Error fetching layout:", error);
            setSavedLayout({}); // fallback to empty layout
        }
    };

    const fetchImage = async (bg, setBg) => {
        try {
            const response = await axios.post(
                `${api}get-image/retrive`,
                { path: bg },
                { responseType: 'blob' }
            );
            const imageUrl = URL.createObjectURL(response.data);
            setBg(imageUrl);
        } catch (error) {
            console.error('Image fetch error:', error);
        }
    };

    useEffect(() => {
        if (show && isIdCard) {
            if (ticketData?.Photo) {
                fetchImage(ticketData.Photo, setUserPhoto);
            }

            if (bgRequired && card_url) {
                fetchImage(card_url, setIdCardBg);
                fetchLayout()
            }
        }
    }, [show, ticketData, card_url, bgRequired, isIdCard]);
    return (
        <Modal show={show} onHide={() => handleCloseModal()} size={ticketType?.type === 'zip' ? 'xl' : ''}>
            <Modal.Body>
                <button
                    type="button"
                    onClick={() => handleCloseModal()}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        zIndex: '99999',
                        fontSize: '24px',
                        cursor: 'pointer',
                    }}
                >
                    <FaTimes />
                </button>
                <Row>
                    <Col lg="12">
                        {ticketType?.type === 'individual' ? (
                            ticketData?.bookings?.length > 0 && (
                                <Swiper autoplay={true} spaceBetween={10} slidesPerView={1} navigation>
                                    <div className="d-flex gap-2 flex-column justify-content-center">
                                        {ticketData.bookings.map((item, index) => {
                                            // Safely extract event and ticket data
                                            const event = item?.ticket?.event || {};
                                            const ticket = item?.ticket || {};
                                            return (
                                                <SwiperSlide className="card-slide" key={index}>
                                                    <Col lg={12} md={12} xl={12}>
                                                        <div>
                                                            <Ticket
                                                                showDetails={showTicketDetails}
                                                                showPrintButton={showPrintButton}
                                                                category={event.category || 'N/A'}
                                                                title={event.name || 'Event Name'}
                                                                number={item?.user?.number}
                                                                user={item?.user}
                                                                ticketBG={ticket.background_image || ''}
                                                                ticketName={ticket.name || 'Ticket'}
                                                                date={formatDateRange(item?.booking_date || event.date_range) || 'Date Not Available'}
                                                                city={event.city || 'City'}
                                                                address={event.address || 'Address Not Specified'}
                                                                time={convertTo12HourFormat(event.start_time) || 'Time Not Set'}
                                                                OrderId={item?.order_id || item?.token || 'N/A'}
                                                                quantity={1}
                                                                idCardBg={idCardBg}
                                                                bgRequired={bgRequired}
                                                                ticketNumber={index + 1}
                                                            />
                                                        </div>
                                                        <p className="text-center text-secondary">{index + 1}</p>
                                                    </Col>
                                                </SwiperSlide>
                                            );
                                        })}
                                    </div>
                                </Swiper>
                            )
                        ) : ticketType?.type === 'combine' ? (
                            <div style={{ height: "auto" }}>
                                <Col lg={12} md={12} xl={12}>
                                    <div>
                                        {/* Safely extract data with fallback values */}
                                        <Ticket
                                            userPhoto={userPhoto}
                                            showDetails={showTicketDetails}
                                            showPrintButton={showPrintButton}
                                            number={RetriveNumber(ticketData)}
                                            userName={RetriveName(ticketData)}
                                            user={RetriveUser(ticketData)}
                                            photo={
                                                ticketData?.attendee?.Photo ||
                                                ticketData?.bookings?.[0]?.attendee?.Photo ||
                                                'N/A'
                                            }
                                            ticketName={
                                                ticketData?.ticket?.name ||
                                                ticketData?.bookings?.[0]?.ticket?.name ||
                                                'Ticket Name'
                                            }
                                            category={
                                                ticketData?.ticket?.event?.category ||
                                                ticketData?.bookings?.[0]?.ticket?.event?.category ||
                                                'Category'
                                            }
                                            ticketBG={
                                                ticketData?.ticket?.background_image ||
                                                ticketData?.bookings?.[0]?.ticket?.background_image ||
                                                ''
                                            }
                                            title={
                                                ticketData?.ticket?.event?.name ||
                                                ticketData?.bookings?.[0]?.ticket?.event?.name ||
                                                'Event Name'
                                            }
                                            date={
                                                formatDateRange(
                                                    (ticketData?.booking_date ||
                                                        ticketData?.bookings?.[0]?.booking_date) ||
                                                    (ticketData?.ticket?.event?.date_range ||
                                                        ticketData?.bookings?.[0]?.ticket?.event?.date_range)
                                                ) || 'Date Not Available'
                                            }
                                            city={
                                                ticketData?.ticket?.event?.city ||
                                                ticketData?.bookings?.[0]?.ticket?.event?.city ||
                                                'City'
                                            }
                                            address={
                                                ticketData?.ticket?.event?.address ||
                                                ticketData?.bookings?.[0]?.ticket?.event?.address ||
                                                'Address Not Specified'
                                            }
                                            time={
                                                convertTo12HourFormat(
                                                    ticketData?.ticket?.event?.start_time ||
                                                    ticketData?.bookings?.[0]?.ticket?.event?.start_time
                                                ) || 'Time Not Set'
                                            }
                                            OrderId={ticketData?.order_id || ticketData?.token || 'N/A'}
                                            orderId={ticketData?.order_id || ticketData?.token || 'N/A'}
                                            quantity={ticketData?.bookings?.length || 1}

                                            // props for idcarddraganddrop component
                                            finalImage={idCardBg}
                                            {...(savedLayout ? { savedLayout } : {})}
                                            userData={RetriveUser(ticketData)}
                                            userImage={userPhoto}
                                            bgRequired={bgRequired}
                                            isEdit={false}
                                            download={true}
                                            print={true}
                                            isCircle={savedLayout?.user_photo?.isCircle || false}
                                            handleCloseModal={handleCloseModal}
                                        />
                                    </div>
                                </Col>
                            </div>
                        ) : ticketType?.type === 'zip' ? (
                            <TicketCanvasBatch
                                isMobile={isMobile}
                                ticketData={ticketData}
                                formatDateRange={formatDateRange}
                                convertTo12HourFormat={convertTo12HourFormat}
                            />
                        ) : null}
                    </Col>
                </Row>
                <Modal.Footer>
                <div className="text-center text-secondary small p-0">
                    <p>No physical ticket needed! Download your Ticket & enjoy unlimited fun.</p>
                    <span className="fw-semibold">
                       Watch the video to get entry without any hassle
                        <a
                            href="https://www.youtube.com/watch?v=QIVkT5Iie3c"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-decoration-underline ms-1 me-2"
                        >
                            <FaYoutube className="me-1" />
                        </a>
                        &
                        <a
                            href="https://www.instagram.com/getyourticket.in/p/DQZXxmHCNYU/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-decoration-underline ms-2"
                        >
                            <FaInstagram className="me-1" />
                        </a>
                    </span>
                </div>
                </Modal.Footer>
            </Modal.Body>
        </Modal>

    );
}


export default TicketModal;