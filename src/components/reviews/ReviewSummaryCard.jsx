import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Star } from "lucide-react";
import StarRating from "./StarRating";

/**
 * ReviewSummaryCard - Shared component for displaying rating summary
 * @param {number} averageRating - Average rating (0-5)
 * @param {number} totalReviews - Total number of reviews
 * @param {object} ratingBreakdown - { "1": count, "2": count, ..., "5": count }
 * @param {function} [onFilterByRating] - Optional callback when a rating bar is clicked
 */
const ReviewSummaryCard = ({
    averageRating = 0,
    totalReviews = 0,
    ratingBreakdown = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    onFilterByRating,
}) => {
    if (totalReviews <= 0) return null;

    return (
        <Card className="bg-dark bg-opacity-50 border-0 shadow-lg rounded-4 overflow-hidden border-start border-primary border-4">
            <Card.Body className="p-4">
                <Row className="align-items-center g-4">
                    {/* Left: Big Average Rating */}
                    <Col xs={12} md={4} className="text-center border-md-end border-secondary border-opacity-25 py-2">
                        <div className="mb-2">
                            <span className="display-3 fw-bold text-white lh-1">
                                {averageRating.toFixed(1)}
                            </span>
                            <span className="text-muted ms-1 fs-5">/ 5</span>
                        </div>
                        <div className="mb-2">
                            <StarRating rating={averageRating} size={24} readOnly />
                        </div>
                        <div className="text-muted small">
                            Based on <strong>{totalReviews}</strong> verified review{totalReviews !== 1 ? "s" : ""}
                        </div>
                    </Col>

                    {/* Right: Breakdown Bars */}
                    <Col xs={12} md={8}>
                        <div className="px-md-4">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingBreakdown[star.toString()] || 0;
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                const isClickable = !!onFilterByRating;

                                return (
                                    <div
                                        key={star}
                                        className={`d-flex align-items-center gap-3 mb-2${isClickable ? ' cursor-pointer' : ''}`}
                                        onClick={isClickable ? () => onFilterByRating(star) : undefined}
                                        style={isClickable ? { cursor: 'pointer' } : undefined}
                                    >
                                        <div className="d-flex align-items-center gap-1 text-white small" style={{ minWidth: '40px' }}>
                                            {star} <Star size={12} fill="#ffc107" color="#ffc107" />
                                        </div>
                                        <div className="flex-grow-1" style={{ height: '8px' }}>
                                            <div className="progress h-100 bg-secondary bg-opacity-25 rounded-pill overflow-hidden">
                                                <div
                                                    className="progress-bar bg-primary rounded-pill progress-bar-animated"
                                                    style={{ width: `${percentage}%`, transition: 'width 1s ease-in-out' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-muted small text-end" style={{ minWidth: '30px' }}>
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ReviewSummaryCard;
