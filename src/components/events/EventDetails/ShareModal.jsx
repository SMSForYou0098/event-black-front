import React, { useState } from 'react';
import { Modal, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaLinkedin, FaCheck, FaWhatsapp, FaEnvelope, FaEllipsisH, FaCopy } from 'react-icons/fa';
import { CustomHeader } from '../../../utils/ModalUtils/CustomModalHeader';
import { CustomTooltip } from '../../../utils/CustomTooltip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

const ShareModal = ({ show, onHide, url, title, eventData, event_date }) => {
    // Add this state inside the ShareModal component
    const [isCopied, setIsCopied] = useState(false);

    // Modify the copyToClipboard function
    const copyToClipboard = async (text) => {
        if (typeof window !== 'undefined') {
            try {
                await window.navigator.clipboard.writeText(text);
                setIsCopied(true);
                toast.success('Link copied to clipboard!');
                // Reset the icon after 2 seconds
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                // Fallback method
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setIsCopied(true);
                    toast.success('Link copied to clipboard!');
                    setTimeout(() => setIsCopied(false), 2000);
                } catch (err) {
                    toast.error('Failed to copy link');
                }
                document.body.removeChild(textArea);
            }
        }
    };


    const handleSystemShare = async (e) => {
        // Prevent any event bubbling that might interfere
        e.preventDefault();
        e.stopPropagation();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this event: ${title}`,
                    url: url,
                });
            } catch (err) {
                console.log('Share error:', err);
                toast.error('Share cancelled or failed');
            }
        } else {
            toast.error('Native sharing not supported');
        }
    };

    const socialShareButtons = [
        {
            id: 'email',
            icon: <FaEnvelope size={20} />,
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this event: ${title} - ${url}`)}`,
            label: 'Email',
            bgColor: '#6c757d'
        },
        {
            id: 'whatsapp',
            icon: <FaWhatsapp size={25} />,
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
            label: 'WhatsApp',
            bgColor: '#25d366'
        },
        {
            id: 'facebook',
            icon: <FaFacebook size={20} />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            label: 'Facebook',
            bgColor: '#1877f2'
        },
        {
            id: 'linkedin',
            icon: <FaLinkedin size={20} />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            label: 'LinkedIn',
            bgColor: '#0a66c2'
        },
        {
            id: 'x',
            icon: <FontAwesomeIcon icon={faXTwitter} />,
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            label: 'X',
            bgColor: '#000000'
        },
        {
            id: 'more',
            icon: <FaEllipsisH size={20} />,
            onClick: handleSystemShare,
            label: 'More',
            bgColor: '#6c757d'
        }
    ];


    return (
        <Modal show={show} onHide={onHide} size="md" centered>
            <CustomHeader title="Share with friends & family" onClose={onHide} closable />
            <Modal.Body className="px-4 py-3">
                {/* Event Info Section */}
                {eventData && (
                    <div className="d-flex align-items-center mb-4 p-3 rounded-3 border">
                        <Image
                            src={eventData.eventMedia?.thumbnail || 'https://via.placeholder.com/60x80'}
                            alt={eventData.title}
                            className="rounded me-3"
                            width={40}
                            height={60}
                            style={{ objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold">{eventData.title || title}</h6>
                            <div className="d-flex align-items-center text-muted">
                                <Calendar size={16} className='me-2 custom-text-secondary' />
                                <small>{event_date || 'Event Date'}</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Link Section */}
                <div className="mb-4">
                    <InputGroup>
                        <Form.Control
                            type="text"
                            value={url}
                            size='sm'
                            className='card-glassmorphism-input'
                            readOnly
                            style={{ fontSize: '14px', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        />
                        <Button onClick={() => copyToClipboard(url)} variant={isCopied ? "success" : "primary"} size='sm'>
                            {isCopied ? <FaCheck /> : <FaCopy />} {isCopied ? 'Copied' : 'Copy'}
                        </Button>
                    </InputGroup>
                </div>

                {/* Social Share Section */}
                <div className="mb-4">
                    <h6 className="mb-3 text-muted">Social share</h6>
                    <Row className="g-3">
                        {socialShareButtons.map(button => (
                            <Col xs={4} sm={2} key={button.id} className="text-center">
                                <div className="d-flex flex-column align-items-center">
                                    {button.onClick ? (
                                        <button
                                            onClick={button.onClick}
                                            className="btn rounded-circle p-3 border-0 mb-2"
                                            style={{
                                                backgroundColor: button.bgColor,
                                                color: 'white',
                                                width: '50px',
                                                height: '50px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {button.icon}
                                        </button>
                                    ) : (
                                        <a
                                            href={button.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn rounded-circle p-3 border-0 mb-2 text-decoration-none"
                                            style={{
                                                backgroundColor: button.bgColor,
                                                color: 'white',
                                                width: '50px',
                                                height: '50px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {button.icon}
                                        </a>
                                    )}
                                    <small className="text-muted">{button.label}</small>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ShareModal;