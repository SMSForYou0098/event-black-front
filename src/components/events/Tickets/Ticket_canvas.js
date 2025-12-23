import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { fabric } from 'fabric-pure-browser';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useMyContext } from "@/Context/MyContextProvider";
import { ArrowBigDownDash, Printer } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import QRCode from 'qrcode';

const TicketCanvas = (props) => {
  const {
    showDetails,
    ticketName,
    userName,
    number,
    address,
    ticketBG,
    date,
    time,
    photo,
    OrderId,
    showPrintButton,
    ticketNumber,
    preloadedImage
  } = props;

  const { api } = useMyContext();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  // State
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const textColor = '#000';

  // 1. Handle Image URL
  useEffect(() => {
    let active = true;
    let localUrl = null;

    const fetchImage = async () => {
      // If ticketBG is already a blob URL (preloaded), use it directly
      if (preloadedImage && ticketBG && ticketBG.startsWith('blob:')) {
        if (active) setImageUrl(ticketBG);
        return;
      }

      // Otherwise fetch from API
      try {
        const response = await axios.post(
          `${api}get-image/retrive`,
          { path: ticketBG },
          { responseType: 'blob' }
        );
        if (active) {
          localUrl = URL.createObjectURL(response.data);
          setImageUrl(localUrl);
        }
      } catch (error) {
        console.error('Image fetch error:', error);
      }
    };

    if (ticketBG) {
      fetchImage();
    }

    return () => {
      active = false;
      // Only revoke if we created it locally (not preloaded)
      if (localUrl && !preloadedImage) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [ticketBG, preloadedImage, api]);

  // 2. Generate QR Code directly (No DOM needed)
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
      });
  }, [OrderId]);

  // Helper Functions (Memoized)
  const loadFabricImage = useCallback((url, options = {}) => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(
        url,
        (img) => {
          if (img && img.getElement()) {
            resolve(img);
          } else {
            console.error('Failed to load image:', url);
            reject(new Error('Failed to load image'));
          }
        },
        { crossOrigin: 'anonymous', ...options }
      );
    });
  }, []);

  const centerText = useCallback((text, fontSize, fontFamily, canvas, top) => {
    const textObj = new fabric.Text(text || '', {
      fontSize,
      fontFamily,
      top: top,
      fill: textColor,
      selectable: false,
      evented: false,
      originX: 'center',
      left: canvas.width / 2
    });
    canvas.add(textObj);
    return textObj;
  }, [textColor]);

  // 3. Draw Canvas
  useEffect(() => {
    // Only draw if we have the canvas ref
    if (!canvasRef.current) return;

    // We need either the background image OR the QR code to proceed
    // If neither is ready yet, return early
    if (!imageUrl && !qrDataUrl) return;

    // Initialize fabric canvas only once if possible, but for simplicity in this effect 
    // we'll dispose and recreate to avoid ghosting artifacts when switching tickets
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      enableRetinaScaling: true // Better quality
    });
    fabricCanvasRef.current = canvas;

    const draw = async () => {
      try {
        let imgWidth = 400; // Default canvas width
        let imgHeight = 600; // Default canvas height

        // If background image exists, load it and use its dimensions
        if (imageUrl) {
          const img = await loadFabricImage(imageUrl);
          imgWidth = img.width;
          imgHeight = img.height;

          canvas.setDimensions({ width: imgWidth, height: imgHeight });

          // Use setBackgroundImage with scale for proper cover
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
          });
        } else {
          // No background image - set default dimensions with white background
          canvas.setDimensions({ width: imgWidth, height: imgHeight });
          canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
        }

        // Add QR code if available
        if (qrDataUrl) {
          const qrImg = await loadFabricImage(qrDataUrl);

          const qrCodeSize = 100;
          const padding = 5;
          const qrPositionX = 100;
          const qrPositionY = 100;

          // Add white background for QR code
          const qrBackground = new fabric.Rect({
            left: qrPositionX - padding,
            top: qrPositionY - padding,
            width: qrCodeSize + padding * 2,
            height: qrCodeSize + padding * 2,
            fill: 'white',
            selectable: false,
            evented: false,
            rx: 5, // rounded corners
            ry: 5
          });

          // Scale and position QR code
          qrImg.set({
            left: qrPositionX,
            top: qrPositionY,
            selectable: false,
            evented: false,
            scaleX: qrCodeSize / qrImg.width,
            scaleY: qrCodeSize / qrImg.height,
          });

          // Ticket number badge
          const ticketNumStr = `${ticketNumber || '1'}`;
          const badgeRadius = 15;
          const badgeY = qrPositionY + qrCodeSize + 25;
          const badgeX = qrPositionX + (qrCodeSize / 2); // Center below QR

          const ticketNumberBadge = new fabric.Circle({
            left: badgeX,
            top: badgeY,
            radius: badgeRadius,
            fill: '#fff',
            stroke: '#ddd',
            strokeWidth: 1,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
          });

          const ticketNumberText = new fabric.Text(ticketNumStr, {
            left: badgeX,
            top: badgeY,
            fontSize: 16,
            fontFamily: 'Arial',
            originX: 'center',
            originY: 'center',
            textAlign: 'center',
            fill: "#000",
            selectable: false,
            evented: false,
          });

          canvas.add(qrBackground);
          canvas.add(qrImg);
          canvas.add(ticketNumberBadge);
          canvas.add(ticketNumberText);
        }

        // Add details
        if (showDetails) {
          centerText(`${ticketName}` || 'Ticket Name', 16, 'Arial', canvas, 50);
          centerText(`${userName}` || 'User Name', 16, 'Arial', canvas, 190);
          centerText(`${number}` || 'User Number', 16, 'Arial', canvas, 210);

          const eventVenueText = new fabric.Textbox(`Venue: ${address}`, {
            left: 30,
            top: 240,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: textColor,
            selectable: false,
            evented: false,
            width: 250,
            lineHeight: 1.2,
          });

          const eventDateText = new fabric.Textbox(`Date: ${date} : ${time}`, {
            left: 30,
            top: 320,
            width: 200,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: textColor,
            selectable: false,
            evented: false,
            lineHeight: 1.2,
          });

          canvas.add(eventDateText, eventVenueText);
        }

        canvas.renderAll();
        setIsCanvasReady(true);

      } catch (error) {
        console.error('Error drawing canvas:', error);
      }
    };

    draw();

    return () => {
      // Don't dispose immediately on dep change to prevent flickering if swift re-render
      // But we must dispose eventually.
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [imageUrl, qrDataUrl, showDetails, ticketName, userName, number, address, date, time, ticketNumber, centerText, loadFabricImage, textColor]);

  // Download functionality
  const downloadCanvas = () => {
    setLoading(true);
    try {
      const canvas = fabricCanvasRef.current; // Use fabric canvas ref
      if (!canvas) throw new Error('Canvas not ready');

      // Convert directly from fabric canvas
      // multiplier can be used for higher quality
      const dataURL = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.9,
        multiplier: 2
      });

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `ticket_${OrderId || 'event'}.jpg`;
      link.click();

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const printCanvas = () => {
    setLoading(true);
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

    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="cnvs my-2">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '300px' }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      <Row className="d-flex justify-content-center">
        <Col xs={12} sm={6} className="d-flex justify-content-center mb-2">
          <CustomBtn
            buttonText={loading ? "Generating..." : "Download"}
            icon={<ArrowBigDownDash size={14} />}
            loading={loading || !isCanvasReady} // Disable if canvas not ready
            className="flex-grow-1 btn-sm w-100"
            HandleClick={downloadCanvas}
            disabled={loading || !isCanvasReady}
          />
          {showPrintButton &&
            <Button
              variant="secondary"
              className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={printCanvas}
              disabled={loading || !isCanvasReady}
            >
              <span>Print</span>
              <Printer size={18} />
            </Button>
          }
        </Col>
      </Row>
    </>
  );
};

export default TicketCanvas;
