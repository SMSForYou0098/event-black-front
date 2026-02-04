import React, { useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { Star, MessageSquarePlus, AlertCircle, ChevronRight, User } from "lucide-react";
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
        // Construct path relative to current page
        // Remove existing query params from asPath
        const currentPath = router.asPath.split('?')[0];

        router.push({
            pathname: `${currentPath}/reviews`,
            query: { id: eventId }
        });
    };

    return (
        <div className="reviews-section py-4">
            {/* Header with Stats */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h5 className="text-white mb-2" style={{ fontSize: '18px' }}>Reviews & Ratings</h5>
                    {totalReviews > 0 && (
                        <div className="d-flex align-items-center gap-2">
                            <StarRating rating={averageRating} size={18} readOnly />
                            <span className="text-white fw-semibold">
                                {averageRating?.toFixed(1)}
                            </span>
                            <span className="text-muted">
                                ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                            </span>
                        </div>
                    )}
                </div>

                {/* Write Review Button */}
                {!userReview && (
                    <CustomBtn
                        HandleClick={handleWriteReview}
                        size="sm"
                        className="d-flex align-items-center gap-2"
                        buttonText='Write a Review'
                        icon={<MessageSquarePlus size={18} />}
                    />
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <p className="text-muted mt-2 mb-0">Loading reviews...</p>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <Card className="bg-dark border-danger">
                    <Card.Body className="text-center py-4">
                        <AlertCircle className="text-danger mb-2" size={32} />
                        <p className="text-danger mb-0">
                            {error?.message || "Failed to load reviews"}
                        </p>
                    </Card.Body>
                </Card>
            )}

            {/* Reviews List */}
            {!isLoading && !isError && (
                <>
                    {displayReviews.length === 0 ? (
                        <Card className="bg-dark rounded-3">
                            <Card.Body className="d-flex flex-column align-items-center py-5">
                                <Star className="text-muted mb-3" size={40} />
                                <p className="text-muted mb-3">No reviews yet</p>
                                <CustomBtn
                                    HandleClick={handleWriteReview}
                                    size="sm"
                                    hideIcon={true}
                                    buttonText='Be the first to review'
                                    variant='outline-primary'
                                />
                            </Card.Body>
                        </Card>
                    ) : (
                        <div>
                            {/* Horizontal Scroll Layout */}
                            <div
                                className="reviews-carousel d-flex gap-3 pb-3 hide-scrollbar"
                                style={{
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    paddingBottom: '0.5rem'
                                }}
                            >
                                {displayReviews.map((review) => (
                                    <div key={review.id} style={{ minWidth: '300px', maxWidth: '350px' }}>
                                        <ReviewCard
                                            review={review}
                                            onEdit={handleEditReview}
                                            onDelete={handleDeleteReview}
                                        />
                                    </div>
                                ))}

                                {/* View All "Card" at the end if more reviews exist */}
                                {totalReviews > 10 && (
                                    <div style={{ minWidth: '150px' }} className="d-flex align-items-center justify-content-center">
                                        <Button
                                            variant="outline-secondary"
                                            className="d-flex flex-column align-items-center gap-2 border-0"
                                            onClick={navigateToAllReviews}
                                        >
                                            <div className="bg-secondary bg-opacity-25 p-3 rounded-circle">
                                                <ChevronRight size={24} className="text-white" />
                                            </div>
                                            <span className="text-white">View All</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* View All Button below for mobile or ease of access */}
                            {totalReviews > reviews.length && (
                                <div className="text-center mt-3">
                                    <Button
                                        variant="link"
                                        className="text-decoration-none text-primary"
                                        onClick={navigateToAllReviews}
                                    >
                                        View all {totalReviews} reviews
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

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
        </div>
    );
};

export default ReviewsSection;
