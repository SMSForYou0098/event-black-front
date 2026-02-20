import React, { useState } from "react";
import { Card, Button, Spinner, Container, Row, Col, Badge } from "react-bootstrap";
import { Star, MessageSquarePlus, AlertCircle, ChevronRight } from "lucide-react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";
import { useEventReviews, useCreateReview, useUpdateReview, useDeleteReview } from "@/hooks/useReviews";
import { useMyContext } from "@/Context/MyContextProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import CustomBtn from "../../utils/CustomBtn";

/**
 * ReviewsSection Component
 * @param {number|string} eventId - Event ID
 * @param {Function} onLoginRequired - Callback when login is required
 */
const ReviewsSection = ({ eventId, onLoginRequired }) => {
    const { UserData } = useMyContext();
    const router = useRouter();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // API hooks
    const { data: reviewsData, isLoading, isError, error } = useEventReviews(eventId);
    const createMutation = useCreateReview();
    const updateMutation = useUpdateReview();
    const deleteMutation = useDeleteReview();

    // Flatten reviews from infinite query pages - data is directly in page.data array
    const reviews = reviewsData?.pages?.flatMap(page => page?.data || []) || [];

    // Get total count from first page pagination
    const totalReviews = reviewsData?.pages?.[0]?.pagination?.total || reviews.length || 0;

    // Calculate stats (or use from API if available later)
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length
        : 0;

    // Check if user already reviewed
    const userReview = reviews.find((r) => r.user_id === UserData?.id);

    // Limit to 10 for dashboard view
    const displayReviews = reviews.slice(0, 10);

    const handleWriteReview = () => {
        if (!UserData) {
            onLoginRequired?.();
            return;
        }
        setEditingReview(null);
        setShowReviewForm(true);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteMutation.mutateAsync({ reviewId, eventId });
            toast.success("Review deleted");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete review");
        }
    };

    const handleSubmitReview = async ({ rating, review }) => {
        try {
            if (editingReview) {
                await updateMutation.mutateAsync({
                    reviewId: editingReview.id,
                    eventId,
                    rating,
                    review,
                });
                toast.success("Review updated");
            } else {
                await createMutation.mutateAsync({
                    eventId,
                    rating,
                    review,
                });
                toast.success("Review submitted");
            }
            setShowReviewForm(false);
            setEditingReview(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to submit review");
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const navigateToAllReviews = () => {
        const currentPath = router.asPath.split('?')[0];
        router.push({
            pathname: `${currentPath}/reviews`,
            query: { id: eventId }
        });
    };

    return (
        <div className="reviews-section py-4">
            <Container fluid className="px-3 px-md-4">
                {/* Header with Stats */}
                <Row className="mb-4 g-3">
                    <Col xs={12} lg={6} className="d-flex flex-column justify-content-center">
                        <h5 className="text-white mb-3 fw-bold">Reviews & Ratings</h5>
                        {totalReviews > 0 && (
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <div className="d-flex align-items-center gap-2">
                                    <StarRating rating={averageRating} size={20} readOnly />
                                    <span className="text-white fw-bold fs-5">
                                        {averageRating?.toFixed(1)}
                                    </span>
                                </div>
                                <Badge bg="secondary" className="px-3 py-2">
                                    {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                        )}
                    </Col>

                    {/* Write Review Button */}
                    {/* <Col xs={12} lg={6} className="d-flex align-items-center justify-content-lg-end">
                        {!userReview && (
                            <CustomBtn
                                HandleClick={handleWriteReview}
                                size="sm"
                                className="d-flex align-items-center gap-2 w-100 w-lg-auto justify-content-center"
                                buttonText='Write a Review'
                                icon={<MessageSquarePlus size={18} />}
                            />
                        )}
                    </Col> */}
                </Row>

                {/* Loading State */}
                {isLoading && (
                    <Card className="bg-dark border-0 shadow-sm">
                        <Card.Body className="text-center py-5">
                            <Spinner animation="border" variant="primary" size="sm" />
                            <p className="text-muted mt-3 mb-0">Loading reviews...</p>
                        </Card.Body>
                    </Card>
                )}

                {/* Error State */}
                {isError && (
                    <Card className="bg-dark border-danger shadow-sm">
                        <Card.Body className="text-center py-4">
                            <AlertCircle className="text-danger mb-3" size={40} />
                            <p className="text-danger mb-0 fw-semibold">
                                {error?.message || "Failed to load reviews"}
                            </p>
                        </Card.Body>
                    </Card>
                )}

                {/* Reviews List */}
                {!isLoading && !isError && (
                    <>
                        {displayReviews.length === 0 ? (
                            <Card className="bg-dark border-0 shadow-sm rounded-3">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                                    <div className="bg-secondary bg-opacity-25 rounded-circle p-4 mb-3">
                                        <Star className="text-muted" size={48} />
                                    </div>
                                    <h6 className="text-white mb-2">No reviews yet</h6>
                                    <p className="text-muted mb-4 text-center">
                                        Be the first to share your experience
                                    </p>
                                    <CustomBtn
                                        HandleClick={handleWriteReview}
                                        size="sm"
                                        hideIcon={true}
                                        buttonText='Write the First Review'
                                        variant='outline-primary'
                                    />
                                </Card.Body>
                            </Card>
                        ) : (
                            <>
                                {/* Horizontal Scroll Layout for Desktop, Stack for Mobile */}
                                <div className="d-none d-md-block">
                                    <div
                                        className="d-flex gap-3 pb-3 overflow-auto"
                                        style={{
                                            scrollbarWidth: 'thin',
                                            msOverflowStyle: 'auto',
                                        }}
                                    >
                                        {displayReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="flex-shrink-0"
                                                style={{ width: '320px' }}
                                            >
                                                <ReviewCard
                                                    review={review}
                                                    onEdit={handleEditReview}
                                                    onDelete={handleDeleteReview}
                                                />
                                            </div>
                                        ))}

                                        {/* View All Card */}
                                        {totalReviews > 10 && (
                                            <div
                                                className="flex-shrink-0 d-flex align-items-center justify-content-center"
                                                style={{ width: '180px' }}
                                            >
                                                <Card
                                                    className="bg-dark border-0 shadow-sm h-100 w-100 cursor-pointer"
                                                    onClick={navigateToAllReviews}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                                                        <div className="bg-primary bg-opacity-25 rounded-circle p-3 mb-3">
                                                            <ChevronRight size={32} className="text-primary" />
                                                        </div>
                                                        <h6 className="text-white mb-1">View All</h6>
                                                        <small className="text-muted">
                                                            {totalReviews} reviews
                                                        </small>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Stack Layout */}
                                <div className="d-md-none">
                                    <Row className="g-3">
                                        {displayReviews.slice(0, 3).map((review) => (
                                            <Col xs={12} key={review.id}>
                                                <ReviewCard
                                                    review={review}
                                                    onEdit={handleEditReview}
                                                    onDelete={handleDeleteReview}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>

                                {/* View All Button */}
                                {totalReviews > 10 && (
                                    <div className="text-center mt-4 d-none d-md-block">
                                        <Button
                                            variant="outline-primary"
                                            className="px-4 py-2 d-inline-flex align-items-center gap-2"
                                            onClick={navigateToAllReviews}
                                        >
                                            <span>View all {totalReviews} reviews</span>
                                            <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                )}

                                {/* Mobile View All Button - Show after 3 reviews */}
                                {totalReviews > 3 && (
                                    <div className="text-center mt-4 d-md-none">
                                        <Button
                                            variant="outline-primary"
                                            className="px-4 py-2 w-100 d-flex align-items-center justify-content-center gap-2"
                                            onClick={navigateToAllReviews}
                                        >
                                            <span>View all {totalReviews} reviews</span>
                                            <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>

            {/* Review Form Modal */}
            <ReviewForm
                show={showReviewForm}
                onHide={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                }}
                review={editingReview}
                onSubmit={handleSubmitReview}
                isLoading={isSubmitting}
            />

            <style jsx>{`
                .cursor-pointer:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ReviewsSection;