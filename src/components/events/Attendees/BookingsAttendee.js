import { Card, Row, Col, Carousel, Image, Button } from "react-bootstrap";
import { Edit as EditIcon, Trash as DeleteIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState } from "react";

const formatFieldName = (name) => {
    if (!name) return "";
    return name
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

const AttendeeCard = ({ attendee, index, apiData, handleOpenModal, handleDeleteAttendee, ShowAction }) => (
    <Card 
      className={`mb-3 shadow-sm custom-dotted-border ${attendee?.missingFields?.length > 0 ? 'border-danger' : 'border-secondary'}`} 
      style={{ minWidth: '280px', borderWidth: '2px', backgroundColor: '#212529' }} // dark background
    >
        <Card.Header className="d-flex justify-content-end bg-dark text-white border-bottom-0 py-2">
            {ShowAction && (
                <div className="d-flex gap-3">
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      className="d-flex align-items-center justify-content-center p-1"
                      onClick={() => handleOpenModal(index)}
                      title="Edit Attendee"
                    >
                        <EditIcon size={16} />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="d-flex align-items-center justify-content-center p-1"
                      onClick={() => handleDeleteAttendee(index)}
                      title="Delete Attendee"
                    >
                        <DeleteIcon size={16} />
                    </Button>
                </div>
            )}
        </Card.Header>
        <Card.Body className="pt-0">
            <Row className="mb-3">
                {apiData?.some(field =>
                    attendee[field?.field_name] instanceof File ||
                    (typeof attendee[field?.field_name] === "string" &&
                        (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                        /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]))
                ) && (
                    <Col xs={12} className="d-flex justify-content-center mb-3">
                        {apiData?.map((field, fieldIndex) => {
                            const imageUrl =
                                attendee[field?.field_name] instanceof File
                                    ? URL.createObjectURL(attendee[field?.field_name])
                                    : (typeof attendee[field?.field_name] === "string" &&
                                        (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                                        /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]))
                                        ? attendee[field?.field_name]
                                        : null;

                            return imageUrl ? (
                                <Image
                                    key={fieldIndex}
                                    src={imageUrl}
                                    alt={`${field?.field_name} preview`}
                                    rounded
                                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                />
                            ) : null;
                        })}
                    </Col>
                )}
            </Row>

            <Row xs={1} md={3} className="g-3">
                {apiData?.map((field, fieldIndex) => {
                    const isImage =
                        attendee[field?.field_name] instanceof File ||
                        (typeof attendee[field?.field_name] === "string" &&
                            (attendee[field?.field_name].startsWith("http://") || attendee[field?.field_name].startsWith("https://")) &&
                            /\.(jpe?g|png|gif|bmp|webp|ico)$/i.test(attendee[field?.field_name]));

                    return !isImage ? (
                        <Col key={fieldIndex} className="text-white">
                            <small className="text-muted">{formatFieldName(field?.field_name)}:</small>
                            <div className="fw-semibold text-truncate" title={String(attendee[field?.field_name])}>
                                {typeof attendee[field?.field_name] !== 'object' ? (
                                    attendee[field?.field_name] !== null ? attendee[field?.field_name] : <span className="text-muted">—</span>
                                ) : (
                                    <span className="text-muted">[File]</span>
                                )}
                            </div>
                        </Col>
                    ) : null;
                })}
            </Row>

            {ShowAction && attendee?.missingFields?.length > 0 && (
                <div className="mt-3 text-muted fw-semibold small">
                    Missing Fields: {attendee.missingFields.join(', ')}
                </div>
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
                            <Carousel.Item key={index}>
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
                <div className="d-flex flex-column gap-3">
                    {attendeeList?.map((attendee, index) => (
                        <AttendeeCard
                            key={index}
                            attendee={attendee}
                            index={index}
                            apiData={apiData}
                            handleOpenModal={handleOpenModal}
                            handleDeleteAttendee={handleDeleteAttendee}
                            ShowAction={ShowAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingsAttendee;
