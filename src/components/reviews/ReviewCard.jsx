import React, { useState } from "react";
import { Card, Button, Dropdown, Modal } from "react-bootstrap";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import StarRating from "./StarRating";
import { useMyContext } from "@/Context/MyContextProvider";
import moment from "moment";
import CustomBtn from "../../utils/CustomBtn";

/**
 * ReviewCard Component
 * @param {Object} review - Review data object
 * @param {Function} onEdit - Callback to edit review
 * @param {Function} onDelete - Callback to delete review
 */
const ReviewCard = ({ review, onEdit, onDelete }) => {
    const { UserData } = useMyContext();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isOwner = UserData?.id === review?.user_id;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            return moment(dateStr).fromNow();
        } catch {
            return dateStr;
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        onDelete?.(review.id);
    };

    // Generate avatar from name
    const getAvatarUrl = (name) => {
        return `https://ui-avatars.com/api/?background=222222&color=fff&name=${encodeURIComponent(
            name || "U"
        )}`;
    };

    return (
        <>
            <Card className="mb-3 bg-dark border-secondary">
                <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        {/* User Info */}
                        <div className="d-flex align-items-center gap-3">
                            <img
                                src={review?.user?.photo || getAvatarUrl(review?.user?.name)}
                                alt={review?.user?.name || "User"}
                                className="rounded-circle"
                                width={45}
                                height={45}
                                style={{ objectFit: "cover" }}
                            />
                            <div>
                                <h6 className="mb-0 text-white fw-semibold">
                                    {review?.user?.name || "Anonymous"}
                                </h6>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <StarRating rating={review?.rating || 0} size={14} readOnly />
                                    <small className="text-muted">
                                        {formatDate(review?.created_at)}
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Actions (only for owner) */}
                        {isOwner && (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    as={React.forwardRef(({ children, onClick }, ref) => (
                                        <Button
                                            ref={ref}
                                            variant="link"
                                            className="p-0 text-white"
                                            style={{ boxShadow: "none" }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onClick(e);
                                            }}
                                        >
                                            {children}
                                        </Button>
                                    ))}
                                >
                                    <MoreVertical size={18} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="bg-dark border-secondary hover-bg-secondary">
                                    <Dropdown.Item
                                        className="d-flex align-items-center gap-2 text-info hover-bg-secondary"
                                        onClick={() => onEdit?.(review)}
                                    >
                                        <Pencil size={14} />
                                        Edit
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        className="d-flex align-items-center gap-2 text-primary hover-bg-secondary"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </div>

                    {/* Review Text */}
                    {review?.review && (
                        <p className="text-light mb-0 mt-3" style={{ lineHeight: 1.6 }}>
                            {review.review}
                        </p>
                    )}
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                centered
                contentClassName="bg-dark border-secondary"
            >
                <Modal.Header closeButton className="pt-2 border-secondary">
                    <Modal.Title className="text-white">Delete Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-light mb-0">
                        Are you sure you want to delete this review? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <CustomBtn
                        size="sm"
                        variant="outline-secondary"
                        HandleClick={() => setShowDeleteConfirm(false)}
                        buttonText="Cancel"
                        hideIcon={true}
                    />
                    <CustomBtn
                        size="sm"
                        variant="primary"
                        HandleClick={handleDelete}
                        buttonText="Delete"
                        icon={<Trash2 size={14} />}
                        iconPosition="left"
                    />
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReviewCard;

