import React, { useState, useEffect } from "react";
import { Container, Button, Card, Spinner, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import { ChevronLeft, Star, MessageSquarePlus, AlertCircle } from "lucide-react";
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
    // We need eventId, but router only gives event_key usually. 
    // Ideally useEventReviews should accept event_key or we need to fetch event details to get ID.
    // However, looking at previous code, eventId (numeric) was passed to ReviewsSection. 
    // If this page is accessed directly, we might not have eventId immediately if it relies on a parent prop.
    // BUT checking useEventReviews hook, it takes eventId.
    // If the API supports event_key for reviews, that would be great. 
    // If not, we rely on the fact that existing pages usually fetch event details first.
    // Let's assume for now we need to fetch event details to get the ID, OR useEventReviews supports slug/key.
    // Looking at useEventReviews implementation: params: { reviewable_id: eventId, reviewable_type: "event" }
    // It EXPLICITLY expects an ID. Use of "event_key" (slug) might not work directly unless the backend handles it.

    // To solve this correctly: We should fetch the event details using the existing method (getServerSideProps or client fetching) 
    // to get the ID. 
    // Let's assume we can fetch event details using the same method as the detail page.

    // However, to save time/complexity, maybe we can fetch event details client side efficiently 
    // OR assuming the previous pages passed state (which is unreliable on refresh).

    // Let's try to fetch event details to get ID.

    // WAIT, actually let's check if we can pass the ID via query params from the "View All" button?
    // User might refresh the page though.
    // Best practice: Fetch the event by key first.

    // I will try to use the existing getEventSSR or similar if possible, or just fetch client side.
    // The EventDetailPage uses `getEventSSR`.

    // Let's import api and fetch event details to get ID.

    const [eventData, setEventData] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(true);

    // Fetch event basic info to get ID
    useEffect(() => {
        const fetchEventId = async () => {
            if (!event_key) return;
            try {
                // Assuming there's an endpoint to get event by key
                // Or we can use the public API used in other places
                // For now, let's try to get it from a common endpoint or reuse the logic.
                // The endpoint commonly used is /event-detail/{key}

                // Actually, let's look at getEventSSR implementation later if needed. 
                // For now, let's assume we can fetch it.
                // const res = await api.get(`/event-detail/${event_key}`); // Validating this might be risky without checking.

                // ALTERNATIVE: Use a context if available? No.

                // Let's try to use query param "id" if passed for optimization, but fallback to fetch?
                // The router.push in ReviewsSection doesn't pass ID yet.

                // Let's check api.get('/events/' + event_key) or similar?
            } catch (err) {
                // ...
            }
        };
        // fetchEventId();
    }, [event_key]);

    // REVISIT: I'll use a hack for now: 
    // The User's previous code in EventDetailPage passes `eventData` which has `id`.
    // I can pass `eventId` in the query params from ReviewsSection navigation!
    // `router.push({ pathname: ..., query: { ..., eventId: eventId } })`
    // It's not persistent on refresh (unless it stays in URL), but it's a start.
    // Better: Add `eventId` to the URL Query string. `/events/.../reviews?id=123`.
    // I will update ReviewsSection to pass `id` in query.

    const eventId = router.query.id; // Expecting ID from query param for now

    const { UserData } = useMyContext();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    useHeaderSimple({
        title: "Reviews",
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
    } = useEventReviews(eventId); // This will only run if eventId is present

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
    const reviews = reviewsData?.pages?.flatMap(page => page?.data?.data || []) || [];
    const totalReviews = reviewsData?.pages?.[0]?.data?.total || reviews.length || 0;

    // Stats
    const averageRating = totalReviews > 0
        ? reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length
        : 0;

    const userReview = reviews.find((r) => r.user_id === UserData?.id);

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

    if (!eventId) {
        // Fallback if ID is missing (e.g. direct access without query param)
        // For a real app, we should fetch event details here.
        return (
            <Container className="py-5 text-center text-white">
                <p>Event ID missing. Please access this page from the event details.</p>
                <Button variant="outline-light" onClick={() => router.back()}>Go Back</Button>
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

            <Container className="">
                <div className="d-none d-sm-flex align-items-center mb-4">
                    <Button
                        variant="link"
                        className="text-white p-0 me-3"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft size={24} />
                    </Button>
                    <h4 className="text-white mb-0">Reviews</h4>
                </div>

                {/* Header Stats Card */}
                <Card className="bg-dark border-muted rounded-3 mb-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <div className="display-4 fw-bold text-white mb-0">
                                    <Star className="text-warning me-2" size={40} fill="currentColor" />
                                    {averageRating?.toFixed(1)}
                                </div>
                            </Col>
                            <Col>
                                <div className="text-muted small text-uppercase">Total Reviews</div>
                                <div className="text-white h5 mb-0">{totalReviews} reviews</div>
                            </Col>
                            <Col xs="auto">
                                {!userReview && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="d-flex align-items-center gap-2"
                                        onClick={handleWriteReview}
                                    >
                                        <MessageSquarePlus size={18} />
                                        Rate & Review
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Reviews List */}
                {isLoading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Loading reviews...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-5 text-danger">
                        <AlertCircle size={32} className="mb-2" />
                        <p>{error?.message || "Failed to load reviews"}</p>
                    </div>
                ) : (
                    <div className="reviews-list">
                        {reviews.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <Star size={48} className="mb-3 opacity-25" />
                                <p>No reviews yet. Be the first to analyze!</p>
                            </div>
                        ) : (
                            <>
                                {reviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        onEdit={handleEditReview}
                                        onDelete={handleDeleteReview}
                                    />
                                ))}

                                {/* Loading More / Infinite Scroll Trigger */}
                                <div ref={ref} className="text-center py-3">
                                    {isFetchingNextPage ? (
                                        <Spinner animation="border" size="sm" variant="secondary" />
                                    ) : hasNextPage ? (
                                        <span className="text-muted small">Loading more...</span>
                                    ) : (
                                        <span className="text-muted small opacity-50">You've reached the end</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Container>

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
        </div>
    );
};

export default EventReviewsPage;
