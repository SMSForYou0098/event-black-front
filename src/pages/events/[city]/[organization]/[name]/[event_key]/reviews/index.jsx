import React, { useState, useEffect } from "react";
import { Container, Button, Card, Spinner, Row, Col, Modal, Form, Dropdown, Badge } from "react-bootstrap";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, Star, MessageSquarePlus, AlertCircle, Filter, SortDesc, TrendingUp } from "lucide-react";
import { useEventReviews, useCreateReview, useUpdateReview, useDeleteReview } from "@/hooks/useReviews";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import StarRating from "@/components/reviews/StarRating";
import { useMyContext } from "@/Context/MyContextProvider";
import { useHeaderSimple } from "@/Context/HeaderContext";
import toast from "react-hot-toast";
import LoginModal from "@/components/auth/LoginOffCanvas";

const EventReviewsPage = () => {
    const router = useRouter();
    const { event_key } = router.query;
    const eventId = router.query.id;

    const { UserData } = useMyContext();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Filter & Sort States
    const [selectedFilter, setSelectedFilter] = useState("all"); // all, 5, 4, 3, 2, 1
    const [sortBy, setSortBy] = useState("recent"); // recent, highest, lowest

    useHeaderSimple({
        title: "Reviews & Ratings",
    });

    // Infinite Query
    const {
        data: reviewsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useEventReviews(eventId);

    const createMutation = useCreateReview();
    const updateMutation = useUpdateReview();
    const deleteMutation = useDeleteReview();

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    // Flatten reviews
    const allReviews = reviewsData?.pages?.flatMap(page => page?.data || []) || [];
    const totalReviews = reviewsData?.pages?.[0]?.pagination?.total || allReviews.length || 0;

    // Filter and Sort Reviews
    const getFilteredAndSortedReviews = () => {
        let filtered = [...allReviews];

        // Apply Filter
        if (selectedFilter !== "all") {
            const rating = parseInt(selectedFilter);
            filtered = filtered.filter(r => Math.floor(r.rating) === rating);
        }

        // Apply Sort
        if (sortBy === "highest") {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "lowest") {
            filtered.sort((a, b) => a.rating - b.rating);
        } else {
            // Recent (default)
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return filtered;
    };

    const reviews = getFilteredAndSortedReviews();

    // Calculate Rating Distribution
    const ratingDistribution = {
        5: allReviews.filter(r => Math.floor(r.rating) === 5).length,
        4: allReviews.filter(r => Math.floor(r.rating) === 4).length,
        3: allReviews.filter(r => Math.floor(r.rating) === 3).length,
        2: allReviews.filter(r => Math.floor(r.rating) === 2).length,
        1: allReviews.filter(r => Math.floor(r.rating) === 1).length,
    };

    // Stats
    const averageRating = totalReviews > 0
        ? allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / allReviews.length
        : 0;

    const userReview = allReviews.find((r) => r.user_id === UserData?.id);

    const handleViewMore = (review) => {
        setSelectedReview(review);
        setShowDetailModal(true);
    };

    const handleWriteReview = () => {
        if (!UserData) {
            setShowLoginModal(true);
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
            toast.success("Review deleted successfully");
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
                toast.success("Review updated successfully");
            } else {
                await createMutation.mutateAsync({
                    eventId,
                    rating,
                    review,
                });
                toast.success("Review submitted successfully");
            }
            setShowReviewForm(false);
            setEditingReview(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to submit review");
        }
    };

    if (!eventId) {
        return (
            <Container className="py-5 text-center">
                <Card className="bg-dark border-0 shadow-lg">
                    <Card.Body className="py-5">
                        <AlertCircle size={48} className="text-warning mb-3" />
                        <h5 className="text-white mb-3">Event Not Found</h5>
                        <p className="text-muted mb-4">
                            Please access this page from the event details.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.back()}
                            className="px-4"
                        >
                            Go Back
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <div className="reviews-page bg-black min-vh-100 pb-5">
            <LoginModal
                show={showLoginModal}
                onHide={() => setShowLoginModal(false)}
                eventKey={event_key}
                redirectPath={router.asPath}
            />

            <Container className="px-0 px-md-3 pt-3 pt-md-4">
                {/* Back Button & Title */}
                <div className="d-flex align-items-center mb-4 px-3 px-md-0">
                    <Button
                        variant="link"
                        className="text-white p-0 me-3 text-decoration-none"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft size={24} />
                    </Button>
                    <h4 className="text-white mb-0 fw-bold">Reviews & Ratings</h4>
                </div>

                {/* Stats Card */}
                <Card className="bg-dark border-0 shadow-sm mb-4 mx-3 mx-md-0">
                    <Card.Body className="p-4">
                        <Row className="g-4">
                            {/* Average Rating */}
                            <Col xs={12} md={4} className="text-center text-md-start">
                                <div className="d-flex flex-column align-items-center align-items-md-start">
                                    <div className="display-3 fw-bold text-white mb-2">
                                        {averageRating?.toFixed(1)}
                                    </div>
                                    <StarRating rating={averageRating} size={24} readOnly />
                                    <p className="text-muted mt-2 mb-0">
                                        Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </Col>

                            {/* Rating Distribution */}
                            <Col xs={12} md={5}>
                                <h6 className="text-white mb-3 fw-semibold">Rating Distribution</h6>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div
                                        key={rating}
                                        className="d-flex align-items-center gap-2 mb-2 cursor-pointer"
                                        onClick={() => setSelectedFilter(rating.toString())}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="text-white" style={{ width: '20px' }}>
                                            {rating}
                                        </span>
                                        <Star size={14} className="text-warning" fill="currentColor" />
                                        <div
                                            className="flex-grow-1 bg-secondary rounded-pill overflow-hidden"
                                            style={{ height: '8px' }}
                                        >
                                            <div
                                                className="bg-warning h-100 rounded-pill"
                                                style={{
                                                    width: `${totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0}%`,
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="text-muted"
                                            style={{ width: '40px', textAlign: 'right' }}
                                        >
                                            {ratingDistribution[rating]}
                                        </span>
                                    </div>
                                ))}
                            </Col>

                            {/* Action Button */}
                            <Col xs={12} md={3} className="d-flex align-items-center justify-content-center justify-content-md-end">
                                {!userReview ? (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="d-flex align-items-center gap-2 px-4 w-100 w-md-auto justify-content-center"
                                        onClick={handleWriteReview}
                                    >
                                        <MessageSquarePlus size={20} />
                                        <span>Write Review</span>
                                    </Button>
                                ) : (
                                    <div className="text-center">
                                        <Badge bg="success" className="px-3 py-2 mb-2">
                                            <i className="fas fa-check me-2"></i>
                                            Review Submitted
                                        </Badge>
                                        <div>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-primary text-decoration-none p-0"
                                                onClick={() => handleEditReview(userReview)}
                                            >
                                                Edit Your Review
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Filters & Sort */}
                <div className="d-flex justify-content-between align-items-center mb-4 px-3 px-md-0 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <Filter size={18} className="text-muted" />
                        <span className="text-white fw-semibold">
                            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                        </span>
                        {selectedFilter !== "all" && (
                            <Badge
                                bg="primary"
                                className="ms-2 cursor-pointer"
                                onClick={() => setSelectedFilter("all")}
                                style={{ cursor: 'pointer' }}
                            >
                                {selectedFilter} <Star size={12} fill="currentColor" className="ms-1" />
                                <span className="ms-1">×</span>
                            </Badge>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        {/* Filter Dropdown */}
                        <Dropdown>
                            <Dropdown.Toggle
                                as={Button}
                                variant="primary"
                                size="sm"
                                className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap"
                                style={{
                                    background: 'var(--bs-primary)',
                                    border: 'none',
                                    lineHeight: 1.2,
                                }}
                            >
                                <Filter size={16} />
                                <span className="d-none d-sm-inline">Filter</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end" className="custom-dropdown-menu">
                                <Dropdown.Item
                                    active={selectedFilter === "all"}
                                    onClick={() => setSelectedFilter("all")}
                                    className="custom-dropdown-item"
                                >
                                    All Ratings
                                </Dropdown.Item>
                                {/* <Dropdown.Divider /> */}
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <Dropdown.Item
                                        key={rating}
                                        active={selectedFilter === rating.toString()}
                                        onClick={() => setSelectedFilter(rating.toString())}
                                        className="custom-dropdown-item"
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <span>{rating}</span>
                                            <Star size={14} fill="currentColor" className="text-warning" />
                                            <span className="ms-auto text-muted">
                                                ({ratingDistribution[rating]})
                                            </span>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* Sort Dropdown */}
                        <Dropdown>
                            <Dropdown.Toggle
                                as={Button}
                                variant="primary"
                                size="sm"
                                className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap"
                                style={{
                                    background: 'var(--bs-primary)',
                                    border: 'none',
                                    lineHeight: 1.2,
                                }}
                            >
                                <SortDesc size={16} />
                                <span className="d-none d-sm-inline">Sort</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end" className="custom-dropdown-menu">
                                <Dropdown.Item
                                    active={sortBy === "recent"}
                                    onClick={() => setSortBy("recent")}
                                    className="custom-dropdown-item"
                                >
                                    Most Recent
                                </Dropdown.Item>
                                <Dropdown.Item
                                    active={sortBy === "highest"}
                                    onClick={() => setSortBy("highest")}
                                    className="custom-dropdown-item"
                                >
                                    Highest Rating
                                </Dropdown.Item>
                                <Dropdown.Item
                                    active={sortBy === "lowest"}
                                    onClick={() => setSortBy("lowest")}
                                    className="custom-dropdown-item"
                                >
                                    Lowest Rating
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {/* Reviews List */}
                {isLoading ? (
                    <Card className="bg-dark border-0 shadow-sm mx-3 mx-md-0">
                        <Card.Body className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-3 mb-0">Loading reviews...</p>
                        </Card.Body>
                    </Card>
                ) : isError ? (
                    <Card className="bg-dark border-danger shadow-sm mx-3 mx-md-0">
                        <Card.Body className="text-center py-5">
                            <AlertCircle size={48} className="text-danger mb-3" />
                            <h5 className="text-danger mb-2">Failed to Load Reviews</h5>
                            <p className="text-muted mb-3">
                                {error?.message || "Something went wrong"}
                            </p>
                            <Button
                                variant="outline-danger"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <div className="reviews-list px-3 px-md-0">
                        {reviews.length === 0 ? (
                            <Card className="bg-dark border-0 shadow-sm">
                                <Card.Body className="text-center py-5">
                                    <div className="bg-secondary bg-opacity-25 rounded-circle p-4 d-inline-flex mb-3">
                                        <Star size={48} className="text-muted" />
                                    </div>
                                    <h5 className="text-white mb-2">
                                        {selectedFilter !== "all"
                                            ? `No ${selectedFilter}-star reviews yet`
                                            : "No reviews yet"}
                                    </h5>
                                    <p className="text-muted mb-4">
                                        {selectedFilter !== "all"
                                            ? "Try selecting a different rating filter"
                                            : "Be the first to share your experience"}
                                    </p>
                                    {selectedFilter !== "all" ? (
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setSelectedFilter("all")}
                                        >
                                            Show All Reviews
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            onClick={handleWriteReview}
                                            className="px-4"
                                        >
                                            Write the First Review
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        ) : (
                            <>
                                <Row className="g-3 g-md-4">
                                    {reviews.map((review) => (
                                        <Col xs={12} lg={6} key={review.id}>
                                            <ReviewCard
                                                review={review}
                                                onEdit={handleEditReview}
                                                onDelete={handleDeleteReview}
                                                onViewMore={handleViewMore}
                                            />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Infinite Scroll Trigger */}
                                <div ref={ref} className="text-center py-4 mt-3">
                                    {isFetchingNextPage ? (
                                        <div>
                                            <Spinner animation="border" size="sm" variant="primary" />
                                            <p className="text-muted mt-2 mb-0 small">
                                                Loading more reviews...
                                            </p>
                                        </div>
                                    ) : hasNextPage ? (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => fetchNextPage()}
                                        >
                                            Load More Reviews
                                        </Button>
                                    ) : reviews.length > 0 ? (
                                        <p className="text-muted small mb-0">
                                            <i className="fas fa-check-circle me-2"></i>
                                            You've seen all reviews
                                        </p>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Container>

            {/* Mobile Sticky Button */}
            {!userReview && !isLoading && reviews.length > 0 && (
                <div className="d-md-none position-fixed bottom-0 start-0 end-0 p-3 bg-dark border-top border-secondary" style={{ zIndex: 1000 }}>
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleWriteReview}
                    >
                        <MessageSquarePlus size={20} />
                        Rate This
                    </Button>
                </div>
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
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Review Detail Modal */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                centered
                size="lg"
                contentClassName="bg-dark border-secondary"
            >
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title className="text-white">Review Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedReview && (
                        <>
                            <div className="d-flex align-items-start gap-3 mb-4">
                                <img
                                    src={selectedReview?.user?.photo || `https://ui-avatars.com/api/?background=222222&color=fff&name=${encodeURIComponent(selectedReview?.user?.name || "U")}`}
                                    alt={selectedReview?.user?.name}
                                    className="rounded-circle"
                                    width={56}
                                    height={56}
                                    style={{ objectFit: "cover" }}
                                />
                                <div className="flex-grow-1">
                                    <h5 className="mb-1 text-white fw-semibold">
                                        {selectedReview?.user?.name || "Anonymous"}
                                    </h5>
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <StarRating rating={selectedReview?.rating || 0} size={16} readOnly />
                                        <Badge bg="secondary">
                                            {selectedReview?.rating?.toFixed(1)}
                                        </Badge>
                                    </div>
                                    <small className="text-muted">
                                        <i className="far fa-clock me-1"></i>
                                        {selectedReview?.created_at && new Date(selectedReview.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </small>
                                </div>
                            </div>
                            <div
                                className="text-light p-3 bg-secondary bg-opacity-10 rounded-3"
                                style={{
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {selectedReview.review}
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            <style jsx>{`
                .cursor-pointer:hover {
                    opacity: 0.8;
                    transition: opacity 0.2s ease;
                }
            `}</style>
        </div>
    );
};

export default EventReviewsPage;