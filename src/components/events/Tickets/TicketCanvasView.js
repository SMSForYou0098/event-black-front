import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric-pure-browser';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from "@/Context/MyContextProvider";
import QRCode from 'qrcode';
import { useQuery } from '@tanstack/react-query';

// API fetch function for TanStack Query
const fetchTicketImage = async (path) => {
    if (!path) return null;
    const response = await api.post(
        'get-image/retrive',
        { path },
        { responseType: 'blob' }
    );
    return URL.createObjectURL(response.data);
};

/**
 * TicketCanvasView - A reusable canvas component for rendering tickets
 * 
 * Canvas size: 300px width × 600px height
 */
const TicketCanvasView = forwardRef((props, ref) => {
    const {
        showDetails,
        ticketNumber,
        preloadedImage,
        onReady,
        onError,
        ticketData,
    } = props;


    const { convertTo12HourFormat, formatDateRange } = useMyContext();
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);

    // Extract values from ticketData - handle both single and multiple booking structures
    // For multiple bookings (quantity > 1), data is in bookings[0]
    // For single booking, data is at parent level
    const ticket = ticketData?.ticket || ticketData?.bookings?.[0]?.ticket || {};
    const event = ticketData?.event || ticketData?.bookings?.[0]?.event || ticketData?.ticket?.event || ticketData?.bookings?.[0]?.ticket?.event || {};
    const venue = event?.venue || {};

    // Handle user data - can be in nested user/attendee object OR directly on the booking item
    const userObj = ticketData?.user || ticketData?.attendee || ticketData?.bookings?.[0]?.user || ticketData?.bookings?.[0]?.attendee;
    const firstBooking = ticketData?.bookings?.[0] || {};

    // Build user object - prioritize nested user object, fallback to direct properties on booking
    const user = userObj ? userObj : {
        name: firstBooking?.name || ticketData?.name,
        number: firstBooking?.number || ticketData?.number,
        email: firstBooking?.email || ticketData?.email,
    };

    // Derived values
    const ticketName = ticket?.name || 'Ticket Name';
    const userName = user?.name || user?.Name || 'User Name';
    // Aggregate seat names for group tickets
    const seatNames = ticketData?.bookings?.length > 1
        ? ticketData.bookings.map(b => b.seat_name || b.event_seat_status?.seat_name).filter(Boolean).join(', ')
        : null;
    const number = seatNames || ticketData?.seat_name || ticketData?.event_seat_status?.seat_name || 'N/A';
    const address = venue?.address || event?.address || 'Address Not Specified';
    const ticketBG = ticket?.background_image || '';
    const formattedDate = formatDateRange?.(ticketData?.booking_date || event?.date_range) || 'Date Not Available';
    const date = formattedDate.replace(/\/\d{4}/g, "");
    const time = convertTo12HourFormat?.(event?.start_time) || 'Time Not Set';
    const OrderId = ticketData?.order_id || ticketData?.token || 'N/A';
    const title = event?.name || 'Event Name';
    const eventType = event?.event_type || '';
    // Handle booking_type - can be at parent level or in booking item
    const bookingType = ticketData?.booking_type || firstBooking?.booking_type || 'Online';

    // State
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    const textColor = '#000';
    const CANVAS_WIDTH = 300;
    const CANVAS_HEIGHT = 600;

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        download: () => downloadCanvas(),
        print: () => printCanvas(),
        isReady: () => isCanvasReady,
        getDataURL: (options = {}) => {
            const canvas = fabricCanvasRef.current;
            if (!canvas) return null;
            return canvas.toDataURL({
                format: 'jpeg',
                quality: 0.9,
                multiplier: 2,
                ...options
            });
        }
    }), [isCanvasReady]);

    // Check if preloadedImage is provided (blob URL from parent)
    const hasPreloadedImage = !!preloadedImage;

    // TanStack Query for fetching ticket background image
    // Skip fetching if preloadedImage is provided
    const { data: fetchedImageUrl, isError: isImageError } = useQuery({
        queryKey: ['ticket-bg-image', ticketBG],
        queryFn: () => fetchTicketImage(ticketBG),
        enabled: !!ticketBG && !hasPreloadedImage,
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
    });

    // Use preloaded image if provided, otherwise use fetched URL
    const imageUrl = hasPreloadedImage ? preloadedImage : fetchedImageUrl;

    // Handle image fetch error
    useEffect(() => {
        if (isImageError) {
            onError?.('Failed to load ticket background');
        }
    }, [isImageError, onError]);

    // 2. Generate QR Code
    useEffect(() => {
        if (!OrderId) return;

        QRCode.toDataURL(OrderId, {
            width: 150,
            margin: 1,
            errorCorrectionLevel: 'H'
        })
            .then(url => {
                setQrDataUrl(url);
            })
            .catch(err => {
                console.error('QR Generation Error', err);
                onError?.('Failed to generate QR code');
            });
    }, [OrderId, onError]);

    // Helper Functions
    const loadFabricImage = useCallback((url, options = {}) => {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(
                url,
                (img) => {
                    if (img && img.getElement()) {
                        resolve(img);
                    } else {
                        reject(new Error('Failed to load image'));
                    }
                },
                { crossOrigin: 'anonymous', ...options }
            );
        });
    }, []);

    const centerText = useCallback((text, fontSize, fontFamily, canvas, top, options = {}) => {
        const textObj = new fabric.Text(text || '', {
            fontSize,
            fontFamily,
            top: top,
            fill: textColor,
            selectable: false,
            evented: false,
            originX: 'center',
            left: canvas.width / 2,
            ...options
        });
        canvas.add(textObj);
        return textObj;
    }, [textColor]);

    // 3. Draw Canvas
    useEffect(() => {
        if (!canvasRef.current) return;
        // Only need QR code to draw - image is optional (will use fallback bg)
        if (!qrDataUrl) return;

        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.StaticCanvas(canvasRef.current, {
            enableRetinaScaling: true
        });
        fabricCanvasRef.current = canvas;

        const draw = async () => {
            try {
                // Set fixed canvas dimensions
                canvas.setDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

                if (imageUrl) {
                    const img = await loadFabricImage(imageUrl);
                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                        scaleX: CANVAS_WIDTH / img.width,
                        scaleY: CANVAS_HEIGHT / img.height
                    });
                } else {
                    // White fallback background when no image
                    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
                }

                // Event name at top (above QR code)
                if (showDetails) {
                    centerText(title, 16, 'Arial', canvas, 50, { fontWeight: 'bold' });
                    if (eventType) {
                        centerText(eventType.charAt(0).toUpperCase() + eventType.slice(1), 11, 'Arial', canvas, 70, { fill: '#666' });
                    }
                    centerText(ticketName, 18, 'Arial', canvas, 185, { fontWeight: 'bold' });
                }

                // Add QR code
                if (qrDataUrl) {
                    const qrImg = await loadFabricImage(qrDataUrl);
                    const qrCodeSize = 85;
                    const padding = 4;
                    const qrPositionX = (CANVAS_WIDTH / 2) - (qrCodeSize / 2);
                    const qrPositionY = 220;

                    const qrBackground = new fabric.Rect({
                        left: qrPositionX - padding,
                        top: qrPositionY - padding,
                        width: qrCodeSize + padding * 2,
                        height: qrCodeSize + padding * 2,
                        fill: 'white',
                        selectable: false,
                        evented: false,
                        rx: 4,
                        ry: 4
                    });

                    qrImg.set({
                        left: qrPositionX,
                        top: qrPositionY,
                        selectable: false,
                        evented: false,
                        scaleX: qrCodeSize / qrImg.width,
                        scaleY: qrCodeSize / qrImg.height,
                    });

                    canvas.add(qrBackground);
                    canvas.add(qrImg);
                }

                // Add details
                if (showDetails) {
                    let currentY = 310;

                    // Ticket name (larger and bold) - REMOVE THIS
                    // centerText(ticketName, 18, 'Arial', canvas, currentY, { fontWeight: 'bold' });
                    // currentY += 30;

                    // Label (I) or (G)
                    if (props.ticketLabel) {
                        centerText(props.ticketLabel + (ticketNumber ? ' ' + ticketNumber : ''), 12, 'Arial', canvas, currentY, { fontWeight: 'bold', fill: '#666' });
                        currentY += 30;
                    } else {
                        currentY += 10;
                    }

                    // Booking Type
                    centerText(` ${bookingType}`, 10, 'Arial', canvas, currentY);
                    currentY += 30;

                    // User number/seat
                    if (number !== 'N/A') {
                        centerText(`Seat: ${number}`, 15, 'Arial', canvas, currentY);
                        currentY += 30;
                    }

                    // Time Column
                    const timeLabel = new fabric.Text('Time', {
                        left: 40,
                        top: currentY,
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fill: textColor,
                        selectable: false,
                        evented: false,
                        fontWeight: 'normal',
                    });
                    canvas.add(timeLabel);

                    const timeValue = new fabric.Text(time, {
                        left: 40,
                        top: currentY + 20,
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fill: textColor,
                        selectable: false,
                        evented: false,
                        fontWeight: 'bold',
                    });
                    canvas.add(timeValue);

                    // Date Column
                    const dateStartX = 180;
                    const dateLabel = new fabric.Text('Date', {
                        left: dateStartX,
                        top: currentY,
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fill: textColor,
                        selectable: false,
                        evented: false,
                        fontWeight: 'normal',
                    });
                    canvas.add(dateLabel);

                    const dateValue = new fabric.Textbox(date, {
                        left: dateStartX,
                        top: currentY + 20,
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fill: textColor,
                        selectable: false,
                        evented: false,
                        fontWeight: 'bold',
                        width: CANVAS_WIDTH - dateStartX - 15,
                        lineHeight: 1.4,
                    });
                    canvas.add(dateValue);

                    // Calculate height based on the taller element
                    const timeHeight = 20 + (timeValue.height || 20);
                    const dateHeight = 20 + (dateValue.height || 20);
                    const maxHeight = Math.max(timeHeight, dateHeight);
                    currentY += maxHeight + 10;

                    // Venue/Address - wrapped to multiple lines for readability
                    const venueLabel = new fabric.Text('Location', {
                        left: 15,
                        top: currentY,
                        fontSize: 18,
                        fontFamily: 'Arial',
                        fill: textColor,
                        fontWeight: 'bold',
                        selectable: false,
                        evented: false,
                    });
                    canvas.add(venueLabel);
                    currentY += 30;

                    const eventVenueText = new fabric.Textbox(address, {
                        left: 15,
                        top: currentY,
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fill: textColor,
                        selectable: false,
                        evented: false,
                        width: CANVAS_WIDTH - 30,
                        lineHeight: 1.5,
                        textAlign: 'center',
                    });
                    canvas.add(eventVenueText);

                    // Order ID at bottom
                }

                canvas.renderAll();
                setIsCanvasReady(true);
                onReady?.();

            } catch (error) {
                console.error('Error drawing canvas:', error);
                onError?.('Failed to render ticket');
            }
        };

        draw();

        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
                fabricCanvasRef.current = null;
            }
        };
    }, [imageUrl, qrDataUrl, showDetails, ticketName, userName, number, address, date, time, title, ticketNumber, bookingType, OrderId, centerText, loadFabricImage, textColor, onReady, onError, props.ticketLabel]);

    // Download functionality
    const downloadCanvas = () => {
        try {
            const canvas = fabricCanvasRef.current;
            if (!canvas) throw new Error('Canvas not ready');

            const dataURL = canvas.toDataURL({
                format: 'jpeg',
                quality: 0.9,
                multiplier: 2
            });

            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `ticket_${userName}_${ticketName}_${ticketNumber}.jpg`;
            link.click();
            return true;

        } catch (error) {
            console.error('Download error:', error);
            onError?.('Failed to download ticket');
            return false;
        }
    };

    const printCanvas = () => {
        try {
            const canvas = fabricCanvasRef.current;
            if (!canvas) throw new Error('Canvas not ready');

            const dataURL = canvas.toDataURL({
                format: 'png',
                multiplier: 1.5
            });

            const printWindow = window.open('', '', 'width=800,height=600');
            const printImage = new Image();
            printImage.src = dataURL;

            printImage.onload = () => {
                printWindow.document.write('<html><head><title>Print Ticket</title></head><body style="text-align:center;">');
                printWindow.document.body.appendChild(printImage);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            };
            return true;

        } catch (error) {
            console.error('Print error:', error);
            onError?.('Failed to print ticket');
            return false;
        }
    };

    return (
        <div className="ticket-canvas-view">
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '300px' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
});

TicketCanvasView.displayName = 'TicketCanvasView';

export default TicketCanvasView;