import React from "react";
import { Star } from "lucide-react";

/**
 * StarRating Component
 * @param {number} rating - Current rating value (1-5)
 * @param {number} maxRating - Maximum rating (default 5)
 * @param {Function} onChange - Callback when rating changes (if interactive)
 * @param {boolean} readOnly - If true, stars are not clickable
 * @param {number} size - Size of star icons
 * @param {string} className - Additional CSS classes
 */
const StarRating = ({
    rating = 0,
    maxRating = 5,
    onChange,
    readOnly = false,
    size = 20,
    className = "",
}) => {
    const handleClick = (value) => {
        if (!readOnly && onChange) {
            onChange(value);
        }
    };

    const handleKeyDown = (e, value) => {
        if (!readOnly && onChange && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onChange(value);
        }
    };

    return (
        <div
            className={`d-inline-flex align-items-center gap-1 ${className}`}
            role={readOnly ? "img" : "group"}
            aria-label={`Rating: ${rating} out of ${maxRating} stars`}
        >
            {Array.from({ length: maxRating }, (_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= rating;
                const isHalf = !isFilled && starValue - 0.5 <= rating;

                return (
                    <span
                        key={index}
                        onClick={() => handleClick(starValue)}
                        onKeyDown={(e) => handleKeyDown(e, starValue)}
                        tabIndex={readOnly ? -1 : 0}
                        role={readOnly ? undefined : "button"}
                        aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                        style={{
                            cursor: readOnly ? "default" : "pointer",
                            transition: "transform 0.15s ease",
                        }}
                        className={!readOnly ? "star-hover" : ""}
                    >
                        <Star
                            size={size}
                            fill={isFilled ? "#ffc107" : isHalf ? "url(#half)" : "transparent"}
                            color={isFilled || isHalf ? "#ffc107" : "#6c757d"}
                            strokeWidth={1.5}
                        />
                    </span>
                );
            })}

            {/* Half-fill gradient definition (for read-only display) */}
            {readOnly && (
                <svg width="0" height="0" style={{ position: "absolute" }}>
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="#ffc107" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                </svg>
            )}

            <style jsx>{`
        .star-hover:hover {
          transform: scale(1.15);
        }
        .star-hover:focus {
          outline: 2px solid var(--bs-primary);
          outline-offset: 2px;
          border-radius: 2px;
        }
      `}</style>
        </div>
    );
};

export default StarRating;
