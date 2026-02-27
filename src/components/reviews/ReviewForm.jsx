import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { X, Save, LoaderCircle } from "lucide-react";
import StarRating from "./StarRating";
import { CustomHeader } from "../../utils/ModalUtils/CustomModalHeader";
import CustomBtn from "../../utils/CustomBtn";

/**
 * ReviewForm Modal Component
 * @param {boolean} show - Show/hide modal
 * @param {Function} onHide - Close modal callback
 * @param {Object} review - Existing review for edit mode (null for create)
 * @param {Function} onSubmit - Submit callback with { rating, review }
 * @param {boolean} isLoading - Loading state
 */
const ReviewForm = ({ show, onHide, review = null, onSubmit, isLoading = false }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [error, setError] = useState("");

    const isEditMode = !!review;

    // Populate form when editing
    useEffect(() => {
        if (show) {
            if (review) {
                setRating(review.rating || 0);
                setReviewText(review.review || "");
            } else {
                setRating(0);
                setReviewText("");
            }
            setError("");
        }
    }, [show, review]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setError("");
        onSubmit?.({
            rating,
            review: reviewText.trim(),
        });
    };

    const handleClose = () => {
        if (!isLoading) {
            onHide?.();
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Form onSubmit={handleSubmit}>
                <CustomHeader
                    title={isEditMode ? "Edit Review" : "Rate This"}
                    closable
                    onClose={handleClose}
                />
                <Modal.Body className="p-4">
                    {/* Rating Selection */}
                    <Form.Group className="mb-4 text-center">
                        <Form.Label className="d-block mb-3 text-light">
                            How would you rate this event?
                        </Form.Label>
                        <StarRating
                            rating={rating}
                            onChange={setRating}
                            size={36}
                            className="justify-content-center"
                        />
                        {error && (
                            <div className="text-danger small mt-2">{error}</div>
                        )}
                    </Form.Group>

                    {/* Review Text */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-light">
                            Your Review <span className="text-muted">(optional)</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience about this event..."
                            className="card-glassmorphism__input"
                            maxLength={500}
                            disabled={isLoading}
                        />
                        <div className="text-muted small mt-1 text-end">
                            {reviewText.length}/500
                        </div>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <CustomBtn
                        type="button"
                        variant="secondary"
                        className="btn-sm"
                        disabled={isLoading}
                        icon={<X size={18} />}
                        buttonText="Cancel"
                        HandleClick={handleClose}
                    />
                    <CustomBtn
                        type="submit"
                        variant="primary"
                        className="btn-sm"
                        disabled={isLoading || rating === 0}
                        icon={
                            isLoading ? (
                                <LoaderCircle className="spin" size={18} />
                            ) : (
                                <Save size={18} />
                            )
                        }
                        buttonText={
                            isLoading
                                ? "Submitting..."
                                : isEditMode
                                    ? "Update Review"
                                    : "Submit Review"
                        }
                    />
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ReviewForm;
