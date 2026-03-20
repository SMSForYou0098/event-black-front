import React from 'react';

export const AverageRating = ({
    rating,
    count,
    className = "",
    iconClassName = "",
    ratingClassName = "",
    countClassName = "",
}) => {
    const displayRating = rating ?? 4.5;
    const displayCount = count ?? 12;

    return (
        <div
            className={`d-flex align-items-center gap-1 my-1 ${className}`}
        >
            <div className={`d-flex align-items-center text-warning ${iconClassName}`}>
                <i className="fa-solid fa-star" style={{ fontSize: "10px" }}></i>
            </div>

            <span
                className={`fw-bold text-white-50 ${ratingClassName}`}
                style={{ fontSize: "12px" }}
            >
                {Number(displayRating).toFixed(1)}
            </span>

            <span
                className={`text-muted ms-1 ${countClassName}`}
                style={{ fontSize: "11px" }}
            >
                ({displayCount} reviews)
            </span>
        </div>
    );
};
