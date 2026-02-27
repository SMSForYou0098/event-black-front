import React, { useRef, useState } from 'react'
import { Badge, Col, Row } from 'react-bootstrap';
import { useMyContext } from '@/Context/MyContextProvider';
import { capitalize } from 'lodash';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import EventMetaInfo from './EventMetaInfo';
import { Instagram, Share, Share2 } from 'lucide-react';
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

    const instaUrl =
        eventData?.eventMedia?.insta_url ||
        "https://www.instagram.com/getyourticket.in";
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
            <Col lg="3" md="12" className="mb-4 mb-lg-0 pe-0">
                {/* --- Single Event Image --- */}
                <div
                    className="product-image-container d-flex flex-column justify-content-center align-items-center"
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

                        {/* SOLD OUT BADGE */}
                        {(eventData?.eventControls?.house_full ||
                            eventData?.eventControls?.is_sold_out) && (
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
                                        objectFit: "contain",
                                    }}
                                />
                            )}

                        {/* YOUTUBE PLAY BUTTON */}
                        {eventData?.eventMedia?.youtube_url && (
                            <div
                                onClick={() =>
                                    window.open(eventData?.eventMedia?.youtube_url, "_blank")
                                }
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 20,
                                    cursor: "pointer",
                                }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-dark bg-opacity-75"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                    }}
                                >
                                    <i
                                        className="fa-solid fa-play text-white"
                                        style={{ fontSize: "24px", marginLeft: "4px" }}
                                    ></i>
                                </div>
                            </div>
                        )}

                        {/* Instagram */}
                        {/* Instagram */}
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                zIndex: 10,
                                display: "flex",
                                gap: "8px",
                            }}
                        >
                            <CustomBtn
                                variant="dark"
                                className="shadow-sm p-1 fw-semibold d-inline-flex align-items-center rounded-pill border-0"
                                size="sm"
                                style={{ fontSize: "12px" }}
                                HandleClick={() => window.open(instaUrl, "_blank")}
                                icon={<Instagram size={16} />}
                                iconPosition="left"
                                buttonText=""
                            />
                        </div>
                    </div>

                    {/* <div className="d-flex gap-3 mt-2 justify-content-between">
                        {eventData?.event_type && (
                            <Badge bg="warning" text="black" pill>
                                <i className="fa-regular fa-calendar me-1"></i>
                                {eventData?.event_type}
                            </Badge>
                        )}

                        {eventData?.Category?.title && (
                            <Badge className="custom-badge custom-dark-content-bg" text="black" pill>
                                <i className="fa-regular fa-bookmark me-1"></i>
                                {eventData?.Category?.title}
                            </Badge>
                        )}
                    </div> */}
                </div>
                {/* Category Label at bottom-left */}
            </Col>
            <Col lg="9" md="12" className="ps-0">
                {/* --- Main Event Info --- */}
                <div className="d-flex justify-content-between">
                    <h5 className="text-primary fw-bold d-none d-sm-block text-capitalize">{eventData?.name}</h5>
                </div>
                <div className="d-flex gap-3 mb-2">
                    {eventData?.event_type && (
                        <CustomBadge variant="warning" className="text-black">
                            <i className="fa-regular fa-calendar me-1"></i>
                            {eventData?.event_type}
                        </CustomBadge>
                    )}

                    {eventData?.Category?.title && (
                        <CustomBadge variant="primary" className="text-white ">
                            <i className="fa-regular fa-bookmark me-1"></i>
                            {eventData?.Category?.title}
                        </CustomBadge>
                    )}
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
                <EventMetaInfo metaInfo={metaInfo} event_key={event_key} eventData={eventData} handleShare={handleShare} />
                {/* <OtherLocations eventData={eventData} /> */}
            </Col>
        </Row>
    )
}

export default DetailsHeader
