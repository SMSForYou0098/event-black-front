import React from "react";
import { Modal } from "react-bootstrap";
import Image from "next/image";
import CustomBtn from "../CustomBtn";
import CustomDrawer from "../CustomDrawer";

/**
 * A responsive component that displays an image message in a Drawer (mobile)
 * or a Modal (desktop) with a "Got it" style closure button.
 * 
 * @param {boolean} show - Control visibility
 * @param {function} onHide - Callback when closing
 * @param {string} imageSrc - Source of the image to display
 * @param {string} altText - Alt text for the image
 * @param {string} buttonText - Text for the close button
 * @param {boolean} isMobile - Whether to show Drawer instead of Modal
 */
const ImageMessageModal = ({
    show,
    onHide,
    imageSrc,
    altText = "Message Image",
    buttonText = "Got it",
    isMobile = false
}) => {
    const content = (
        <div className="text-center p-2">
            <Image
                src={imageSrc}
                alt={altText}
                width={300}
                height={200}
                style={{ maxWidth: '100%', height: 'auto' }}
            />
            <div className="mt-3">
                <CustomBtn
                    HandleClick={onHide}
                    size="sm"
                    className="w-100"
                    buttonText={buttonText}
                    hideIcon={true}
                />
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <CustomDrawer
                showOffcanvas={show}
                setShowOffcanvas={onHide}
            >
                {content}
            </CustomDrawer>
        );
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="modal-glass-bg"
        >
            <Modal.Body className="p-4">
                {content}
            </Modal.Body>
        </Modal>
    );
};

export default ImageMessageModal;
