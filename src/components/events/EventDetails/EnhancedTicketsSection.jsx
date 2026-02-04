import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ProgressBar,
  Modal,
  Form,
} from "react-bootstrap";
import {
  Ticket,
  Clock,
  Users,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Calendar,
  Trophy,
  Gift,
  Sparkles,
  MapPin,
  Shield,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const EnhancedTicketsSection = ({ tickets }) => {
  const [selectedTickets, setSelectedTickets] = useState({});

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="text-center mb-4">
            <h2 className="display-6 fw-bold mb-2">
              <Ticket className="me-3 text-primary" size={40} />
              Tickets And Pricing
            </h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              Book tickets and create unforgettable memories
            </p>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {tickets.map((ticket) => {
          const availabilityPercentage =
            (ticket.availableCount / ticket.ticketQuantity) * 100;
          const selectedQuantity = selectedTickets[ticket.id] || 0;
          const maxQuantity = Math.min(
            ticket.userBookingLimit,
            ticket.availableCount
          );

          return (
            <Col key={ticket.id} lg={6}>
              <Card
                className={`h-100 border-0 shadow-lg position-relative overflow-hidden ${ticket.popular ? "border-warning" : ""
                  }`}
              >
                {/* Popular Badge */}
                {ticket.popular && (
                  <div className="position-absolute top-0 end-0 m-3 z-index-1">
                    <Badge
                      bg="warning"
                      text="dark"
                      className="px-3 py-2 rounded-pill"
                    >
                      <Star size={16} className="me-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Fast Filling Badge */}
                {ticket.fastFilling && (
                  <div className="position-absolute top-0 start-0 m-3 z-index-1">
                    <Badge
                      bg="danger"
                      className="px-3 py-2 rounded-pill animate-pulse"
                    >
                      <Zap size={16} className="me-1" />
                      Fast Filling
                    </Badge>
                  </div>
                )}

                <Card.Body className="">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Card.Title className="h4 mb-1">{ticket.name}</Card.Title>
                      <div className="d-flex align-items-center text-muted">
                        <Users size={16} className="me-1" />
                        <small>Max {ticket.userBookingLimit} per person</small>
                      </div>
                    </div>

                    <div className="text-end">
                      {ticket.onSale ? (
                        <div>
                          <div className="text-decoration-line-through text-muted small">
                            ₹{ticket.price}
                          </div>
                          <div className="h4 text-primary fw-bold mb-0">
                            ₹{ticket.salePrice}
                          </div>
                          <Badge bg="success" className="small">
                            <Gift size={12} className="me-1" />
                            Save ₹{ticket.price - ticket.salePrice}
                          </Badge>
                        </div>
                      ) : (
                        <div className="h4 text-primary fw-bold mb-0">
                          ₹{ticket.price}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Availability Progress */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center ">
                      <small className="text-muted">
                        <AlertCircle size={14} className="me-1" />
                        {ticket.availableCount} tickets left
                      </small>
                      <small className="text-muted">
                        {availabilityPercentage.toFixed(0)}% available
                      </small>
                    </div>
                    <ProgressBar
                      now={availabilityPercentage}
                      className=""
                      style={{ height: "6px" }}
                      variant={
                        availabilityPercentage > 50
                          ? "success"
                          : availabilityPercentage > 20
                            ? "warning"
                            : "danger"
                      }
                    />
                  </div>

                  {/* Sale Period */}
                  {ticket.onSale && ticket.saleDate && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="d-flex align-items-center text-success mb-1">
                        <Calendar size={16} className="me-2" />
                        <strong>Limited Time Offer</strong>
                      </div>
                      <small className="text-muted">
                        Sale ends: {ticket.saleDate.split(",")[1]}
                      </small>
                    </div>
                  )}

                  {/* Features */}
                  <div>
                    <h6 className="text-muted mb-2">What's Included:</h6>
                    <ul className="list-unstyled">
                      {ticket?.features?.map((feature, idx) => (
                        <li
                          key={idx}
                          className="d-flex align-items-center mb-1"
                        >
                          <CheckCircle
                            size={16}
                            className="text-success me-2 flex-shrink-0"
                          />
                          <small>{feature}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card.Body>

                {/* Card Footer - Status */}
                {ticket.soldOut && (
                  <Card.Footer className="bg-transparent border-0 px-4 pb-4">
                    <Button variant="secondary" disabled className="w-100">
                      <AlertCircle size={18} className="me-2" />
                      Sold Out
                    </Button>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default EnhancedTicketsSection;
