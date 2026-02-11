import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { ThumbsUp } from "lucide-react";
import { useToggleInterest, useMyInterests } from "@/hooks/useInterest";
import { useMyContext } from "@/Context/MyContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import CustomBtn from "../../utils/CustomBtn";

/**
 * InterestButton Component (BookMyShow-style)
 */
const InterestButton = ({ eventId, eventData, onLoginRequired, className = "" }) => {
    const { UserData } = useMyContext();
    const [showAnimation, setShowAnimation] = useState(false);

    // Initialize state from props
    const [isInterested, setIsInterested] = useState(eventData?.is_interested || false);
    const [interestCount, setInterestCount] = useState(eventData?.interests_count || 0);
    const [inCooldown, setInCooldown] = useState(false);

    const toggleMutation = useToggleInterest();
    const { data: myInterestsData } = useMyInterests(eventId);

    // Sync with API
    React.useEffect(() => {
        const data = myInterestsData;
        if (data) {
            if (typeof data.is_interested !== "undefined") {
                setIsInterested(data.is_interested);
            }
            if (typeof data.interest_count !== "undefined") {
                setInterestCount(data.interest_count);
            }
        }
    }, [myInterestsData]);

    const handleClick = async () => {
        if (!UserData) {
            onLoginRequired?.();
            return;
        }

        if (inCooldown) return;

        try {
            setInCooldown(true);
            setTimeout(() => setInCooldown(false), 4000);

            if (!isInterested) {
                setShowAnimation(true);
                setTimeout(() => setShowAnimation(false), 600);
            }

            const newInterestState = !isInterested;
            setIsInterested(newInterestState);
            setInterestCount((prev) =>
                newInterestState ? prev + 1 : Math.max(0, prev - 1)
            );

            await toggleMutation.mutateAsync({ eventId });

            if (newInterestState) {
                toast.success("Added to your interests!");
            }
        } catch (err) {
            setIsInterested(!isInterested);
            setInterestCount((prev) =>
                !isInterested ? prev + 1 : Math.max(0, prev - 1)
            );
            toast.error(err?.response?.data?.message || "Failed to update interest");
        }
    };

    const isLoading = toggleMutation.isPending;

    const formatCount = (n) => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(n);
    };

    return (
        <div className={`interest-section-wrapper ${className}`}>
            <div className="d-flex justify-content-between align-items-center bg-dark border rounded-3 p-3">

                {/* Left Side */}
                <div className="d-flex align-items-center gap-3">
                    <motion.div
                        animate={{
                            scale: isInterested ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <ThumbsUp
                            size={26}
                            className="text-success"
                            fill="currentColor"
                        />
                    </motion.div>

                    <div>
                        <div className="d-flex align-items-center gap-1">
                            <span
                                className="text-white fw-bold"
                                style={{ fontSize: "12px" }}
                            >
                                {formatCount(interestCount)}
                            </span>
                            <span
                                className="text-white"
                                style={{ fontSize: "12px" }}
                            >
                                are interested
                            </span>
                        </div>
                    </div>
                </div>

                {/* Button */}
                <div className="position-relative">
                    <CustomBtn
                        variant={isInterested ? "primary" : "outline-danger"}
                        size="md"
                        className="px-4 py-2"
                        HandleClick={handleClick}
                        disabled={isLoading || inCooldown}
                        style={{
                            borderRadius: "4px",
                            minWidth: "120px",
                        }}
                        hideIcon={true}
                        buttonText={
                            isLoading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <span
                                    className="fw-medium"
                                    style={{ fontSize: "13px" }}
                                >
                                    {isInterested ? "Interested" : "Interested?"}
                                </span>
                            )
                        }
                    />

                    {/* Animation */}
                    <AnimatePresence>
                        {showAnimation && (
                            <motion.div
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    pointerEvents: "none",
                                    zIndex: 10,
                                }}
                            >
                                <ThumbsUp
                                    size={22}
                                    className="text-success"
                                    fill="currentColor"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default InterestButton;
