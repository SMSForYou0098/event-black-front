import React, { useState } from "react";
import { Card, Button, Dropdown, Modal } from "react-bootstrap";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import StarRating from "./StarRating";
import { useMyContext } from "@/Context/MyContextProvider";
import moment from "moment";
import CustomBtn from "../../utils/CustomBtn";
import CustomHeader from "../../utils/ModalUtils/CustomModalHeader";

/**
 * ReviewCard Component
 * @param {Object} review - Review data object
 * @param {Function} onEdit - Callback to edit review
 * @param {Function} onDelete - Callback to delete review
 */


const ReviewCard = ({ review, onEdit, onDelete, onViewMore }) => {
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

    // Use truncated text logic
    const MAX_LENGTH = 120;
    const isLongText = review?.review && review.review.length > MAX_LENGTH;
    const displayText = isLongText
        ? review.review.substring(0, MAX_LENGTH) + "..."
        : review.review;

    return (
        <Card className="mb-0 bg-dark border-muted rounded-3 h-100">
            <Card.Body className="p-2 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    {/* User Info */}
                    <div className="d-flex align-items-center gap-2">
                        <img
                            src={review?.user?.photo || getAvatarUrl(review?.user?.name)}
                            alt={review?.user?.name || "User"}
                            className="rounded-circle"
                            width={35}
                            height={35}
                            style={{ objectFit: "cover" }}
                        />
                        <div>
                            <h6 className="mb-0 text-white fw-semibold" style={{ fontSize: '0.9rem' }}>
                                {review?.user?.name || "Anonymous"}
                            </h6>
                            <div className="d-flex align-items-center gap-2">
                                <StarRating rating={review?.rating || 0} size={12} readOnly />
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
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
                                <MoreVertical size={16} />
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
                    <div className="mt-1 flex-grow-1">
                        <p className="text-light mb-0 small" style={{ lineHeight: 1.4 }}>
                            {displayText}
                            {isLongText && (
                                <span
                                    className="text-primary ms-1 cursor-pointer fw-semibold"
                                    style={{ cursor: "pointer", fontSize: '0.8rem' }}
                                    onClick={() => onViewMore?.(review)}
                                >
                                    Read More
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </Card.Body>

            {/* Delete Confirmation Modal - kept inside but could be moved up if needed */}
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                centered
                contentClassName="bg-dark border-secondary"
            >
                <CustomHeader
                    title="Delete Review"
                    closable
                    onClose={() => setShowDeleteConfirm(false)}
                    className="border-secondary border-0"
                />
                <Modal.Body className="pb-0">
                    <p className="text-light mb-0">
                        Are you sure you want to delete this review? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-secondary border-0 p-2">
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
        </Card>
    );
};

export default ReviewCard;

