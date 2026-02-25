import React, { useRef, useState } from 'react'
import { Col, Row } from 'react-bootstrap';
import { useMyContext } from '@/Context/MyContextProvider';
import { capitalize } from 'lodash';
import EventMetaInfo from './EventMetaInfo';
import { Share, Share2 } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import { useRouter } from 'next/router';
import ShareModal from './ShareModal';
import OtherLocations from './OtherLocations';
import Image from 'next/image';

const DetailsHeader = ({ eventData, event_key }) => {
    const descRef = useRef(null);
    const router = useRouter();
    const { convertTo12HourFormat, formatDateRange } = useMyContext();
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const event_time = `${convertTo12HourFormat(eventData?.start_time)} - ${convertTo12HourFormat(eventData?.end_time)}`;
    const event_date = formatDateRange(eventData?.date_range);

    const metaInfo = [
        // {
        //     icon: "fa-regular fa-bookmark", // Category icon
        //     value: eventData?.Category?.title,
        //     valueClass: "fw-semibold",
        // },
        // {
        //     icon: "fa-regular fa-calendar", // Event Type icon
        //     value: eventData?.event_type,
        //     valueClass: "fw-semibold text-capitalize",
        //     description: eventData?.event_type === 'daily' ?
        //         'daily ticket QR code is valid only for the specific event and date' :
        //         'season ticket QR that allows access throughout the season, but only one entry per day',
        // },
        {
            icon: "fa-regular fa-clock", // Time icon
            value: event_time,
            valueClass: "fw-semibold",
        },
        {
            icon: "fa-regular fa-calendar-days", // Date icon
            value: event_date,
            valueClass: "fw-semibold",
        },
        {
            icon: "fa-solid fa-location-dot",
            value: (
                <>
                    {eventData?.venue?.address}, {eventData?.venue?.city}, {eventData?.venue?.state}
                    ...{" "}
                    <a
                        href={eventData?.venue?.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: "#B51515", // Bootstrap primary blue
                            fontWeight: 600,
                        }}
                    >
                        click here
                    </a>
                </>
            ),
            valueClass: "fw-semibold",
        }
    ];


    const handleReadMore = () => {
        const el = document.getElementById("event-details");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            // window.scrollBy(0, 80); // scroll slightly down if needed
        }
    };

    const getShortDesc = (html, wordLimit = 45) => {
        // Remove HTML tags and get plain text
        const text = html.replace(/<[^>]+>/g, "");
        const words = text.split(/\s+/);
        return {
            truncatedHtml: words.length > wordLimit
                ? words.slice(0, wordLimit).join(" ") + "..."
                : html,
            isTruncated: words.length > wordLimit
        };
    };


    const handleShare = () => {
        setShowShareModal(true);
    };

    const currentUrl = typeof window !== 'undefined'
        ? window.location.href
        : '';
    return (
        <Row>
            <ShareModal
                show={showShareModal}
                onHide={() => setShowShareModal(false)}
                url={currentUrl}
                title={eventData?.name}
                eventData={eventData}
                event_date={event_date}
            />
            <Col lg="3" md="12" className="mb-4 mb-lg-0">
                {/* --- Single Event Image --- */}
                <div
                    className="product-image-container d-flex justify-content-center align-items-center"
                >
                    <div className="position-relative d-inline-block">
                        <Image
                            src={eventData?.eventMedia?.thumbnail || "https://placehold.co/500x400"}
                            alt={eventData?.name}
                            className="img-fluid rounded-4"
                            width={210}
                            height={400}
                            priority
                            style={{ maxHeight: "400px", objectFit: "cover" }}
                        />
                        {(eventData?.eventControls?.house_full || eventData?.eventControls?.is_sold_out) && (
                            <Image
                                src="/assets/images/hfull.webp"
                                alt="Sold Out"
                                width={70}
                                height={70}
                                className="position-absolute z-3"
                                style={{
                                    bottom: "-10px",
                                    right: "-10px",
                                    transform: "rotate(-15deg)",
                                    pointerEvents: "none",
                                    objectFit: "contain"
                                }}
                            />
                        )}

                        {/* Share button at top-right */}
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                zIndex: 10,
                            }}
                        >
                            <CustomBtn
                                icon={<Share2 />}
                                className="p-1 m-0"
                                HandleClick={handleShare}
                            />
                        </div>

                        {/* Category Label at bottom-left */}
                        {eventData?.Category?.title && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "10px",
                                    zIndex: 10,
                                }}
                            >
                                <span className="badge bg-light text-dark shadow-sm px-2 py-1 rounded-pill fw-semibold border">
                                    <i className="fa-regular fa-bookmark me-1"></i>
                                    {eventData?.Category?.title}
                                </span>
                            </div>
                        )}

                        {/* Event Type Label at bottom-right */}
                        {eventData?.event_type && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    right: "10px",
                                    zIndex: 10,
                                }}
                            >
                                <span className="badge bg-light text-dark shadow-sm px-2 py-1 rounded-pill fw-semibold border text-capitalize">
                                    <i className="fa-regular fa-calendar me-1"></i>
                                    {eventData?.event_type}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </Col>
            <Col lg="9" md="12" className="ps-lg-4">
                {/* --- Main Event Info --- */}
                <div className="d-flex justify-content-between">
                    <h5 className="text-primary fw-bold d-none d-sm-block text-capitalize">{eventData?.name}</h5>

                </div>
                {/* <h5 className="text-secondary">{eventData?.tagline || 'tagline'}</h5> */}

                {/* Event Description */}

                <div ref={descRef}>
                    <span
                        className="description-content"
                        dangerouslySetInnerHTML={{
                            __html: showFullDesc
                                ? eventData?.description || ""
                                : getShortDesc(eventData?.description || "", 10).truncatedHtml,
                        }}
                    />{" "}
                    {!showFullDesc && eventData?.description &&
                        getShortDesc(eventData?.description, 10)?.isTruncated && (
                            <a
                                href="#"
                                className="text-primary fw-semibold"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleReadMore();
                                }}
                            >
                                Read More
                            </a>
                        )}
                </div>

                {/* Event Meta Information */}
                <EventMetaInfo metaInfo={metaInfo} event_key={event_key} eventData={eventData} />
                {/* <OtherLocations eventData={eventData} /> */}
            </Col>
        </Row>
    )
}

export default DetailsHeader
