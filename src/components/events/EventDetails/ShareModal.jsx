import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaLinkedin, FaLink, FaWhatsapp } from 'react-icons/fa';
import { CustomHeader } from '../../../utils/ModalUtils/CustomModalHeader';
import { CustomTooltip } from '../../../utils/CustomTooltip';
import toast from 'react-hot-toast';

const ShareModal = ({ show, onHide, url, title }) => {
    const copyToClipboard = async (text) => {
        if (typeof window !== 'undefined') {
            try {
                await window.navigator.clipboard.writeText(text);
                toast.success('Link copied to clipboard!');
                onHide();
            } catch (err) {
                console.error('Failed to copy:', err);
                // Fallback method
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    toast.success('Link copied to clipboard!');
                    onHide();
                } catch (err) {
                    toast.error('Failed to copy link');
                }
                document.body.removeChild(textArea);
            }
        }
    };
    const shareButtons = [
        {
            id: 'facebook',
            icon: <FaFacebook size={24} />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            isLink: true,
            note: 'Share on Facebook'
        },
        {
            id: 'twitter',
            icon: <FaTwitter size={24} />,
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            isLink: true,
            note: 'Share on Twitter'
        },
        {
            id: 'whatsapp',
            icon: <FaWhatsapp size={24} />,
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
            isLink: true,
            note: 'Share via WhatsApp'
        },
        {
            id: 'linkedin',
            icon: <FaLinkedin size={24} />,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            isLink: true,
            note: 'Share on LinkedIn'
        },
        {
            id: 'copy',
            icon: <FaLink size={24} />,
            onClick: () => copyToClipboard(url),
            isLink: false,
            note: 'Copy Link'
        }
    ];

    return (
        <Modal show={show} onHide={onHide} size="md">
            <CustomHeader title="Share Event" onClose={onHide} closable />
            <Modal.Body className='p-0'>
                <div className="d-flex flex-column gap-4 py-3">
                    <p className="text-muted text-center mb-0">
                        Share this event with your friends and family
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        {shareButtons.map(button => (
                            <CustomTooltip key={button.id} text={button.note} placement="top">
                                <div key={button.id} className="d-flex flex-column align-items-center">
                                    {button.isLink ? (
                                        <a
                                            href={button.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary rounded-3 p-2 mb-2"
                                        >
                                            {button.icon}
                                        </a>
                                    ) : (
                                        <button
                                            onClick={button.onClick}
                                            className="btn btn-outline-primary rounded-3 p-2 mb-2"
                                            title={button.note}
                                        >
                                            {button.icon}
                                        </button>
                                    )}
                                    {/* <small className="text-muted text-center">{button.note}</small> */}
                                </div>
                            </CustomTooltip>
                        ))}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ShareModal;