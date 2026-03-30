import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Minus, Plus } from 'lucide-react';
import { IS_MOBILE } from '../../SeatingModule/components/constants';
import CustomDrawer from '@/utils/CustomDrawer';
import { CustomHeader } from '@/utils/ModalUtils/CustomModalHeader';
import CustomBtn from '@/utils/CustomBtn';

/**
 * Standing Section Quantity Picker
 * Shows a modal (desktop) or drawer (mobile) with a +/- counter
 * to select the number of standing tickets for a section.
 */
const StandingQuantityPicker = ({ show, onHide, section, ticket, onConfirm }) => {
    const [quantity, setQuantity] = useState(0);

    const selectionLimit = ticket ? parseInt(ticket.selection_limit, 10) || 10 : 10;
    const maxAllowed = ticket
        ? Math.min(selectionLimit, ticket.remaining_count || selectionLimit)
        : 0;
    const isSoldOut = ticket?.sold_out || !ticket?.status || maxAllowed <= 0;
    const ticketName = ticket?.name || 'Standing';
    const ticketPrice = parseFloat(ticket?.price || 0);

    // Reset quantity when section changes or picker opens
    useEffect(() => {
        if (show) setQuantity(0);
    }, [show, section?.id]);

    const handleConfirm = () => {
        if (quantity > 0 && onConfirm) {
            onConfirm({ section, ticket, quantity });
        }
        onHide();
    };

    const title = `Select Quantity for ${section?.name || 'Section'}`;

    const pickerContent = (
        <div className="d-flex flex-column align-items-center py-3">
            {/* Ticket info */}
            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                {ticketName} (₹{ticketPrice})
            </p>

            {isSoldOut ? (
                <p className="text-danger fw-semibold">Sold Out</p>
            ) : (
                <>
                    {/* Quantity counter */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <button
                            type="button"
                            className="d-flex align-items-center justify-content-center rounded-circle border-0"
                            onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                            disabled={quantity <= 0}
                            style={{
                                width: 44,
                                height: 44,
                                background: quantity <= 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                cursor: quantity <= 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Minus size={20} />
                        </button>

                        <span
                            className="fw-bold text-white"
                            style={{ fontSize: '1.75rem', minWidth: 50, textAlign: 'center' }}
                        >
                            {quantity}
                        </span>

                        <button
                            type="button"
                            className="d-flex align-items-center justify-content-center rounded-circle border-0"
                            onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
                            disabled={quantity >= maxAllowed}
                            style={{
                                width: 44,
                                height: 44,
                                background: quantity >= maxAllowed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                cursor: quantity >= maxAllowed ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Limit hint */}
                    <p className="text-muted small mb-4">
                        Maximum {maxAllowed} tickets allowed for this category
                    </p>

                    {/* Action buttons */}
                    <div className="d-flex gap-2 justify-content-between w-100 px-3">
                        <CustomBtn
                            buttonText="Cancel"
                            HandleClick={onHide}
                            variant="outline"
                            className="px-4"
                            hideIcon={true}
                            size='sm'
                        />
                        <CustomBtn
                            buttonText="Confirm"
                            HandleClick={handleConfirm}
                            disabled={quantity <= 0}
                            className="px-4"
                            size='sm'
                        />
                    </div>
                </>
            )}
        </div>
    );

    if (IS_MOBILE) {
        return (
            <CustomDrawer
                title={title}
                showOffcanvas={show}
                setShowOffcanvas={onHide}
                hideIndicator={true}
            >
                {pickerContent}
            </CustomDrawer>
        );
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            contentClassName="custom-dark-bg border border-secondary border-opacity-25"
        >
            <CustomHeader title={title} closable onClose={onHide} />
            <Modal.Body>{pickerContent}</Modal.Body>
        </Modal>
    );
};

export default StandingQuantityPicker;
