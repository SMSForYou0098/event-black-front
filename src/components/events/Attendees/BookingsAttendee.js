import { Card, Row, Col, Carousel, Image, Button } from "react-bootstrap";
import { Edit as EditIcon, Trash as DeleteIcon, ChevronRight, ChevronLeft, User, MailIcon, PhoneIcon } from "lucide-react";
import { useRef, useState } from "react";

const formatFieldName = (name) => {
    if (!name) return "";
    return name
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

const AttendeeCard = ({ attendee, index, apiData, handleOpenModal, handleDeleteAttendee, ShowAction }) => (
    <Card
        className={`rounded-3 shadow-sm custom-dark-content-bg ${attendee?.missingFields?.length > 0 ? 'border-primary' : 'border-dashed-thin'}`}
        style={{ minWidth: '280px', borderWidth: '2px', backgroundColor: '#212529' }}
    >
        <Card.Body className="py-3 border-0">
            <Row className="align-items-center">
                {/* Profile Image - Left Side */}
                <Col xs="auto">
                    {apiData?.some(field =>
                        attendee[field?.field_name] instanceof File ||
                        (typeof attendee[field?.field_name] === "string" &&
                            (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                            /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]))
                    ) ? (
                        apiData?.map((field, fieldIndex) => {
                            const imageUrl =
                                attendee[field?.field_name] instanceof File
                                    ? URL.createObjectURL(attendee[field?.field_name])
                                    : (typeof attendee[field?.field_name] === "string" &&
                                        (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                                        /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]))
                                        ? attendee[field?.field_name]
                                        : null;

                            return imageUrl ? (
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Click to view full image"
                                    style={{ display: 'inline-block' }}
                                >
                                    <Image
                                        key={fieldIndex}
                                        src={imageUrl}
                                        alt={`${field?.field_name} preview`}
                                        className="rounded-circle"
                                        style={{
                                            width: '90px',
                                            height: '90px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </a>
                            ) : null;
                        })
                    ) : (
                        // Default avatar with initials if no image
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-light fw-bold"
                            style={{
                                width: '90px',
                                height: '90px',
                                objectFit: 'cover'
                            }}
                        >
                            {apiData?.find(field => field?.field_name?.toLowerCase().includes('name'))?.field_name ?
                                String(attendee[apiData.find(field => field?.field_name?.toLowerCase().includes('name'))?.field_name] || '??').charAt(0).toUpperCase() +
                                String(attendee[apiData.find(field => field?.field_name?.toLowerCase().includes('name'))?.field_name] || '??').split(' ').pop()?.charAt(0).toUpperCase() || ''
                                : '??'
                            }
                        </div>
                    )}
                </Col>

                {/* Content - Middle Section */}
                <Col>
                    {/* Name and Badges Row */}
                    <div className="d-flex align-items-center flex-wrap mb-2">
                        {/* Display Name */}
                        {apiData?.map((field, fieldIndex) => {
                            const isImage =
                                attendee[field?.field_name] instanceof File ||
                                (typeof attendee[field?.field_name] === "string" &&
                                    (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                                    /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]));

                            const fieldNameLower = field?.field_name?.toLowerCase();
                            const isName = fieldNameLower === 'name' || fieldNameLower === 'full_name';

                            return !isImage && isName ? (
                                <h5 key={fieldIndex} className="mb-0 me-3 text-light d-flex align-items-center gap-2">
                                    <User size={20} className="custom-text-secondary" /> {attendee[field?.field_name] || 'Unknown'}
                                </h5>
                            ) : null;
                        })}

                        {/* Status Badges - you can customize these based on your data */}
                        {apiData?.map((field, fieldIndex) => {
                            const isImage =
                                attendee[field?.field_name] instanceof File ||
                                (typeof attendee[field?.field_name] === "string" &&
                                    (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                                    /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]));

                            const isStatus = field?.field_name?.toLowerCase().includes('status') ||
                                field?.field_name?.toLowerCase().includes('type') ||
                                field?.field_name?.toLowerCase().includes('category');

                            return !isImage && isStatus ? (
                                <span key={fieldIndex} className="badge bg-warning text-dark me-2">
                                    {attendee[field?.field_name]}
                                </span>
                            ) : null;
                        })}
                    </div>

                    {/* Contact Information Row */}
                    <div className="d-flex flex-column flex-sm-row text-muted small">
                        {apiData?.map((field, fieldIndex) => {
                            const isImage =
                                attendee[field?.field_name] instanceof File ||
                                (typeof attendee[field?.field_name] === "string" &&
                                    (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                                    /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]));

                            const isEmail = field?.field_name?.toLowerCase().includes('email') ||
                                field?.field_name?.toLowerCase().includes('mail');
                            const isPhone = field?.field_name?.toLowerCase().includes('phone') ||
                                field?.field_name?.toLowerCase().includes('mobile') ||
                                field?.field_name?.toLowerCase().includes('mo') ||
                                field?.field_name?.toLowerCase().includes('number') ||
                                field?.field_name?.toLowerCase().includes('contact');

                            if (!isImage && (isEmail || isPhone)) {
                                return (
                                    <div key={fieldIndex} className="d-flex align-items-center gap-2">
                                        {isEmail && <MailIcon size={14} className="text-info" />}
                                        {isPhone && <PhoneIcon size={14} className="text-warning" />}
                                        <span>{attendee[field?.field_name] || '—'}</span>
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {/* Other non-contact, non-name, non-status fields */}
                        {/* {apiData?.map((field, fieldIndex) => {
                            const isImage =
                                attendee[field?.field_name] instanceof File ||
                                (typeof attendee[field?.field_name] === "string" &&
                                    (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                                    /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]));

                            const isName = field?.field_name?.toLowerCase().includes('name');
                            const isEmail = field?.field_name?.toLowerCase().includes('email') ||
                                field?.field_name?.toLowerCase().includes('mail');
                            const isPhone = field?.field_name?.toLowerCase().includes('phone') ||
                                field?.field_name?.toLowerCase().includes('mobile') ||
                                field?.field_name?.toLowerCase().includes('contact');
                            const isStatus = field?.field_name?.toLowerCase().includes('status') ||
                                field?.field_name?.toLowerCase().includes('type') ||
                                field?.field_name?.toLowerCase().includes('category');

                            return !isImage && !isName && !isEmail && !isPhone && !isStatus ? (
                                <div key={fieldIndex} className="d-flex align-items-center me-4 mb-1 mb-sm-0">
                                    <small className="text-muted me-1">{formatFieldName(field?.field_name)}:</small>
                                    <span>{attendee[field?.field_name] || '—'}</span>
                                </div>
                            ) : null;
                        })} */}
                    </div>
                </Col>

                {/* Action Buttons - Right Side */}
                {ShowAction && (
                    <Col xs="auto">
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-3 d-flex align-items-center justify-content-center p-1"
                                onClick={() => handleOpenModal(index)}
                                title="Edit Attendee"
                            >
                                <EditIcon size={16} />
                            </Button>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-3 d-flex align-items-center justify-content-center p-1"
                                onClick={() => handleDeleteAttendee(index)}
                                title="Delete Attendee"
                            >
                                <DeleteIcon size={16} />
                            </Button>
                        </div>
                    </Col>
                )}
            </Row>

            {/* Missing Fields Warning */}
            {ShowAction && attendee?.missingFields?.length > 0 && (
                <Row className="mt-3">
                    <Col>
                        <div className="p-2 bg-primary bg-opacity-10 border border-primary rounded">
                            <small className=" fw-semibold">
                                Missing Fields: {attendee.missingFields.join(', ')}
                            </small>
                        </div>
                    </Col>
                </Row>
            )}
        </Card.Body>
    </Card>
);

const BookingsAttendee = ({ attendeeList, apiData, handleOpenModal, handleDeleteAttendee, ShowAction, Slider }) => {
    const carouselRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setStartX(e.clientX || e.touches[0].clientX);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX || e.touches[0].clientX;
        const diff = startX - currentX;

        if (diff > 50) {
            carouselRef.current?.next();
            setIsDragging(false);
        } else if (diff < -50) {
            carouselRef.current?.prev();
            setIsDragging(false);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const showNavigator = attendeeList?.length > 1;

    return (
        <div style={{ maxHeight: '35rem', overflowX: 'hidden', overflowY: 'auto' }}>
            {Slider ? (
                <div className="position-relative">
                    {/* Left Arrow */}
                    {showNavigator && (
                        <Button
                            variant="light"
                            className="position-absolute top-50 start-0 translate-middle-y rounded-circle shadow-sm border"
                            style={{ zIndex: 10, width: 36, height: 36 }}
                            onClick={() => carouselRef.current?.prev()}
                            aria-label="Previous Attendee"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                    )}

                    <Carousel
                        ref={carouselRef}
                        interval={null}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                        indicators={false}
                        slide={false}
                    >
                        {attendeeList?.map((attendee, index) => (
                            <Carousel.Item key={`card_${index}`}>
                                <AttendeeCard
                                    attendee={attendee}
                                    index={index}
                                    apiData={apiData}
                                    handleOpenModal={handleOpenModal}
                                    handleDeleteAttendee={handleDeleteAttendee}
                                    ShowAction={ShowAction}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>

                    {/* Right Arrow */}
                    {showNavigator && (
                        <Button
                            variant="primary"
                            className="position-absolute top-50 end-0 translate-middle-y rounded-circle shadow-sm"
                            style={{ zIndex: 10, width: 36, height: 36 }}
                            onClick={() => carouselRef.current?.next()}
                            aria-label="Next Attendee"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    )}
                </div>
            ) : (
                <Row className="g-3 mb-3">
                    {attendeeList?.map((attendee, index) => (
                        <Col key={`card_${index}`} xs={12} sm={6} md={6} lg={6}>
                            <AttendeeCard
                                key={index}
                                attendee={attendee}
                                index={index}
                                apiData={apiData}
                                handleOpenModal={handleOpenModal}
                                handleDeleteAttendee={handleDeleteAttendee}
                                ShowAction={ShowAction}
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default BookingsAttendee;
