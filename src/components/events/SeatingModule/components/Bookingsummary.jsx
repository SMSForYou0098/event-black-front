import React from 'react';
import { Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { Trash2, ShoppingCart, XCircle } from 'lucide-react';

const BookingSummary = ({
    selectedSeats,
    totalAmount,
    ticketCategoryCounts,
    onRemoveSeat,
    onClearSelection,
    onProceedToCheckout
}) => {
    if (selectedSeats.length === 0) {
        return (
            <Card className="booking-summary-card">
                <Card.Header>
                    <h5 className="mb-0">Your Selection</h5>
                </Card.Header>
                <Card.Body className="text-center py-5">
                    <div className="text-muted">
                        <p className="mb-1">No seats selected</p>
                        <small>Click on available seats to select</small>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="booking-summary-card">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Your Selection</h5>
                    <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={onClearSelection}
                    >
                        <XCircle className="me-1" size={14} />
                        Clear All
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                {/* Ticket Category Summary */}
                <div className="mb-3">
                    <strong className="d-block mb-2">Ticket Summary:</strong>
                    {Object.entries(ticketCategoryCounts).map(([name, data]) => (
                        <div key={name} className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-2">
                                <Badge bg="primary">{name}</Badge>
                                <span>× {data.count}</span>
                            </div>
                            <strong>₹{(data.price * data.count).toFixed(2)}</strong>
                        </div>
                    ))}
                </div>

                <hr className="my-3" />

                {/* Selected Seats List */}
                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <strong className="d-block mb-2">Selected Seats ({selectedSeats.length}):</strong>
                    <ListGroup variant="flush">
                        {selectedSeats.map((seat) => (
                            <ListGroup.Item
                                key={seat.id}
                                className="px-2 py-2"
                                style={{ transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    <div className="flex-grow-1">
                                        <strong className="d-block" style={{ fontSize: '13px' }}>
                                            {seat.sectionName} - Row {seat.rowTitle}
                                        </strong>
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="text-secondary" style={{ fontSize: '14px' }}>
                                                Seat {seat.number}
                                            </span>
                                            {seat.ticket && (
                                                <>
                                                    <span className="text-secondary">•</span>
                                                    <Badge
                                                        bg="primary"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        {seat.ticket.name}
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                        {seat.ticket && (
                                            <strong className="d-block" style={{ fontSize: '13px', color: '#198754' }}>
                                                ₹{parseFloat(seat.ticket.price).toFixed(2)}
                                            </strong>
                                        )}
                                    </div>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-danger p-0"
                                        onClick={() => onRemoveSeat(seat.id, seat.sectionId, seat.rowId)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>

                <hr className="my-3" />

                {/* Total Section */}
                <div className="bg-light p-3 rounded mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Subtotal:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Booking Fee:</span>
                        <span>₹0.00</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Total:</h5>
                        <h4 className="mb-0 text-success">
                            ₹{totalAmount.toFixed(2)}
                        </h4>
                    </div>
                </div>

                {/* Checkout Button */}
                <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    onClick={onProceedToCheckout}
                >
                    <ShoppingCart className="me-2" size={18} />
                    Proceed to Checkout
                </Button>

                {/* Info Text */}
                <div className="mt-3 text-center">
                    <small className="text-secondary">
                        Selected seats will be held for 10 minutes
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
};

export default BookingSummary;