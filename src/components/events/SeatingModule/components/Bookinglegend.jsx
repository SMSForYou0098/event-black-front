import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { PRIMARY } from '../../../../utils/consts';

// Reusable box generator
const box = (bg, border, extra = {}) => ({
    width: 20,
    height: 20,
    backgroundColor: bg,
    borderRadius: 4,
    border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...extra
});

const BookingLegend = ({ sections }) => {

    // Extract unique ticket categories
    const getUniqueTicketCategories = () => {
        const map = new Map();

        sections.forEach(s =>
            s.rows?.forEach(r =>
                r.seats?.forEach(seat => {
                    if (
                        seat.ticket &&
                        seat.status !== 'disabled' &&
                        seat.status !== 'booked' &&
                        !map.has(seat.ticket.id)
                    ) {
                        map.set(seat.ticket.id, {
                            id: seat.ticket.id,
                            name: seat.ticket.name,
                            price: parseFloat(seat.ticket.price || 0)
                        });
                    }
                })
            )
        );

        return Array.from(map.values());
    };

    const ticketCategories = getUniqueTicketCategories();

    return (
        <Card className="mt-3">
            <Card.Body className="p-2">
                <div className="d-flex flex-wrap gap-4 align-items-start">

                    {/* ---- Seat Status ---- */}
                    <div>
                        <strong className="d-block mb-2" style={{ fontSize: 13 }}>Seat Status:</strong>

                        <div className="d-flex flex-column gap-2">

                            {/* Available */}
                            <div className="d-flex align-items-center gap-2">
                                <Badge bg="primary" style={{ minWidth: '24px' }}>1</Badge>
                                <span style={{ fontSize: 13 }}>Available</span>
                            </div>

                            {/* Selected */}
                            <div className="d-flex align-items-center gap-2">
                                <Badge bg="danger" style={{ minWidth: '24px' }}>1</Badge>
                                <span style={{ fontSize: 13 }}>Selected</span>
                            </div>

                            {/* Booked */}
                            <div className="d-flex align-items-center gap-2">
                                <Badge bg="danger" style={{ minWidth: '24px' }}>
                                    ✕
                                </Badge>
                                <span style={{ fontSize: 13 }}>Booked</span>
                            </div>

                            {/* Not Available */}
                            <div className="d-flex align-items-center gap-2">
                                <Badge bg="secondary" style={{ minWidth: '24px' }}></Badge>
                                <span style={{ fontSize: 13 }}>Not Available</span>
                            </div>

                        </div>
                    </div>



                {/* ---- Ticket Categories ---- */}
                {ticketCategories.length > 0 && (
                    <>
                        <div className="vr" style={{ height: 'auto' }}></div>

                        <div>
                            <strong className="d-block mb-2" style={{ fontSize: 13 }}>
                                Ticket Categories:
                            </strong>

                            <div className="d-flex flex-column gap-2">
                                {ticketCategories.map(cat => (
                                    <div key={cat.id} className="d-flex align-items-center gap-3">
                                        <div style={box(PRIMARY, `1px solid ${PRIMARY}`)} />
                                        <span style={{ fontSize: 13, minWidth: 100 }}>{cat.name}</span>
                                        <Badge bg="success" style={{ fontSize: 11 }}>
                                            ₹{cat.price.toFixed(2)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ---- Instructions ---- */}
                <div className="vr" style={{ height: 'auto' }}></div>

                <div style={{ maxWidth: 250 }}>
                    <strong className="d-block mb-2" style={{ fontSize: 13 }}>How to Book:</strong>

                    <ol style={{ fontSize: 12, paddingLeft: 20, margin: 0 }}>
                        <li className="mb-1">Click on available seats to select</li>
                        <li className="mb-1">Review your selection in the summary</li>
                        <li className="mb-1">Click "Proceed to Checkout"</li>
                        <li className="mb-1">Fill in your details and confirm</li>
                    </ol>

                    <div
                        className="mt-2 p-2"
                        style={{
                            fontSize: 11,
                            backgroundColor: '#fff3cd',
                            borderRadius: 4,
                            color: '#856404'
                        }}
                    >
                        <strong>Note:</strong> Seats without tickets assigned cannot be selected.
                    </div>
                </div>

            </div>
            </Card.Body>
        </Card>
    );
};

export default BookingLegend;
