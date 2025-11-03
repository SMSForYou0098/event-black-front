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
    const event_date = formatDateRange(eventData?.date_range) +
        " | " +
        `${convertTo12HourFormat(eventData?.start_time)}`
    const metaInfo = [
        {
            icon: "fa-regular fa-bookmark", // Category icon
            value: eventData?.category?.title,
            valueClass: "fw-semibold",
        },
        {
            icon: "fa-regular fa-calendar", // Event Type icon
            value: eventData?.event_type,
            valueClass: "fw-semibold text-capitalize",
            description : eventData?.event_type === 'daily' ?
            'daily ticket QR code is valid only for the specific event and date' : 
            'season ticket QR that allows access throughout the season, but only one entry per day',
        },
        {
            icon: "fa-solid fa-location-dot", // Location icon
            value: `${eventData?.venue?.address}, ${eventData?.venue?.city}, ${eventData?.venue?.state}`,
            valueClass: "fw-semibold",
        },
        {
            icon: "fa-regular fa-clock", // Date & Time icon
            value: event_date,
            valueClass: "fw-semibold",
        },
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
                <div className="product-image-container d-flex justify-content-center align-items-center">
                    <Image
                        src={eventData?.event_media?.thumbnail || 'https://placehold.co/500x400'}
                        alt={eventData?.name}
                        className="img-fluid rounded-4"
                        width={310}
                        height={400}
                        priority
                        style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                </div>
            </Col>
            <Col lg="9" md="12" className="ps-lg-4">
                {/* --- Main Event Info --- */}
                <div className="d-flex justify-content-between">
                    <h4 className="text-primary text-capitalize">{eventData?.name}</h4>
                    <CustomBtn
                        icon={<Share2 />}
                        className="p-1 m-0"
                        HandleClick={handleShare}
                    />
                </div>
                {/* <h5 className="text-secondary">{eventData?.tagline || 'tagline'}</h5> */}

                {/* Event Description */}

                <div ref={descRef}>
                    <div
                        className="description-content"
                        dangerouslySetInnerHTML={{
                            __html: showFullDesc
                                ? eventData?.description || ""
                                : getShortDesc(eventData?.description || "").truncatedHtml,
                        }}
                    />
                    {!showFullDesc && eventData?.description &&
                        getShortDesc(eventData?.description)?.isTruncated && (
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
