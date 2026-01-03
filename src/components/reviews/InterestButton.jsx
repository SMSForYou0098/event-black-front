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
 * @param {number|string} eventId - Event ID
 * @param {Function} onLoginRequired - Callback when login is needed
 * @param {string} className - Additional CSS classes
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

    // Sync with my-interests API if available
    React.useEffect(() => {
        // Response format: {"status":true,"event_id":8,"interest_count":1,"is_interested":false}
        const data = myInterestsData;
        if (data) {
            if (typeof data.is_interested !== 'undefined') {
                setIsInterested(data.is_interested);
            }
            if (typeof data.interest_count !== 'undefined') {
                setInterestCount(data.interest_count);
            }
        }
    }, [myInterestsData]);

    const handleClick = async () => {
        if (!UserData) {
            onLoginRequired?.();
            return;
        }

        // Rate limit check
        if (inCooldown) return;

        try {
            // Start cooldown
            setInCooldown(true);
            setTimeout(() => setInCooldown(false), 4000); // 1 second limit (better UX)

            // Trigger animation if adding interest
            if (!isInterested) {
                setShowAnimation(true);
                setTimeout(() => setShowAnimation(false), 600);
            }

            // Optimistic update
            const newInterestState = !isInterested;
            setIsInterested(newInterestState);
            setInterestCount(prev => newInterestState ? prev + 1 : Math.max(0, prev - 1));

            await toggleMutation.mutateAsync({ eventId });

            if (newInterestState) {
                toast.success("Added to your interests!");
            }
        } catch (err) {
            // Revert on error
            setIsInterested(!isInterested);
            setInterestCount(prev => !isInterested ? prev + 1 : Math.max(0, prev - 1));
            toast.error(err?.response?.data?.message || "Failed to update interest");
        }
    };

    ///call this api on get /my-interests

    const isLoading = toggleMutation.isPending;

    const formatCount = (n) => {
        return Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(n);
    };

    return (
        <div className={`interest-section-wrapper ${className}`}>
            <div
                className="d-flex justify-content-between align-items-center bg-dark border border rounded-3 p-3"
            >
                {/* Left Side: Stats and Info */}
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center">
                        <motion.div
                            animate={{
                                scale: isInterested ? [1, 1.3, 1] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <ThumbsUp
                                size={28}
                                className="text-success"
                                fill={isInterested ? "currentColor" : "currentColor"}
                            />
                        </motion.div>
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-1">
                            <span className="text-white fw-bold fs-5">
                                {formatCount(interestCount)}
                            </span>
                            <span className="text-white fs-5">are interested</span>
                        </div>
                        <div className="text-muted small">
                            Mark seeks more info.
                        </div>
                    </div>
                </div>

                {/* Right Side: Button */}
                <div className="position-relative">
                    <CustomBtn
                        variant={isInterested ? "primary" : "outline-danger"} // Red outline as requested? User img had red outline.
                        size="md"
                        className="px-4 py-2"
                        HandleClick={handleClick}
                        disabled={isLoading || inCooldown}
                        style={{
                            borderRadius: "4px", // More like the screenshot (squared corners) or standard rounded
                            minWidth: "120px"
                        }}
                        hideIcon={true}
                        buttonText={isLoading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <span className="fw-medium">
                                {isInterested ? "Interested" : "Interested?"}
                            </span>
                        )}
                    />


                    {/* Heart/Thumb burst animation positioned near button or icon? 
                        User wanted UI like image. Image doesn't show burst but previous code had it.
                        I'll keep it centered on the button.
                     */}
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
                                    zIndex: 10
                                }}
                            >
                                <ThumbsUp size={24} className="text-success" fill="currentColor" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default InterestButton;
