import React, { useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import TicketCanvas from '../Events/Tickets/Ticket_canvas';
import { FaTimes } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useMyContext } from '../../../../Context/MyContextProvider';


const TicketModal = ({ show, handleCloseModal, ticketType, ticketData, formatDateRange, }) => {
    const { convertTo12HourFormat } = useMyContext()
    

    return (
        <Modal show={show} onHide={() => handleCloseModal()}>
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
                        color: 'black',
                    }}
                >
                    <FaTimes />
                </button>
                <Row>
                    <Col lg="12">
                        {ticketType?.type === 'individual' ?
                            ticketData?.bookings?.length > 0 &&
                            <Swiper autoplay={true} spaceBetween={10} slidesPerView={1} navigation>
                                <div className="d-flex gap-2 flex-column justify-content-center">
                                    {ticketData.bookings?.map((item, index) => (
                                        <SwiperSlide className="card-slide" key={index}>
                                            <Col lg={12} md={12} xl={12}>
                                                <div>
                                                    <TicketCanvas
                                                        category={item?.ticket?.event?.category}
                                                        title={item?.ticket?.event?.name}
                                                        ticketBG={item?.ticket?.background_image}
                                                        ticketName={item?.ticket?.name}
                                                        date={formatDateRange(item?.ticket?.event?.date_range)}
                                                        city={item?.ticket?.event?.city}
                                                        address={item?.ticket?.event?.address}
                                                        time={convertTo12HourFormat(item?.ticket?.event?.start_time)}
                                                        OrderId={item?.order_id || item?.token}
                                                        quantity={1}
                                                    />
                                                </div>
                                                <p className="text-center text-secondary">{index + 1}</p>
                                            </Col>
                                        </SwiperSlide>
                                    ))}
                                </div>
                            </Swiper>
                            :
                            ticketType?.type === 'combine' &&
                            Object.entries(ticketData)?.length > 0 &&
                            <>
                                <div className="d-flex gap-2 flex-column">
                                    <Col lg={12} md={12} xl={12}>
                                        <div>
                                            <TicketCanvas
                                                ticketName={ticketData?.ticket?.name || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.name)}
                                                category={ticketData?.ticket?.event?.category || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.event?.category)}
                                                ticketBG={ticketData?.ticket?.background_image || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.background_image)}
                                                title={ticketData?.ticket?.event?.name || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.event?.name)}
                                                date={formatDateRange(ticketData?.ticket?.event?.date_range || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.event?.date_range))}
                                                city={ticketData?.ticket?.event?.city || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.event?.city)}
                                                address={ticketData?.ticket?.event?.address || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.event?.address)}
                                                time={convertTo12HourFormat(ticketData?.ticket?.event?.start_time || (ticketData?.bookings[0] && ticketData?.bookings[0]?.ticket?.event?.start_time))}
                                                OrderId={ticketData?.order_id || ticketData?.token}
                                                quantity={ticketData?.bookings?.length || 1}
                                            />
                                        </div>
                                    </Col>
                                </div>
                            </>
                        }
                    </Col>
                </Row>

            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>

    );
}


export default TicketModal;