import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric-pure-browser";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { ArrowBigDownDash, Printer } from "lucide-react";
const IdCard = (props) => {
  const { showDetails, user, OrderId, showPrintButton, userPhoto } = props;
  const canvasRef = useRef(null);
  const qrCodeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const textColor = "#000";

  // Fixed canvas dimensions
  const CANVAS_WIDTH = 204;
  const CANVAS_HEIGHT = 321;

  const getTextWidth = (text, fontSize = 16, fontFamily = "Arial") => {
    const tempText = new fabric.Text(text, {
      fontSize,
      fontFamily,
    });
    return tempText.width;
  };
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);
    setFabricCanvas(canvas);

    // Set fixed canvas dimensions with transparent background
    canvas.setDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    canvas.backgroundColor = "transparent";

    const centerText = (text, fontSize, fontFamily, canvas, top) => {
      const textWidth = getTextWidth(text, fontSize, fontFamily);
      const canvasWidth = canvas.getWidth();
      const centerX = (canvasWidth - textWidth) / 2;

      const textObject = new fabric.Text(text, {
        fontSize,
        fontFamily,
        left: centerX,
        top: top,
        fill: textColor,
        selectable: false,
        evented: false,
      });

      canvas.add(textObject);
      canvas.renderAll();

      return textObject;
    };

    const drawCanvas = () => {
      // Clear canvas
      canvas.clear();
    //   canvas.backgroundColor = 'transparent';
      canvas.backgroundColor = "blue";

      // Always show QR code
      const qrCodeCanvas = qrCodeRef.current;

      // Show profile image
      if (userPhoto) {
        const profileImageURL = userPhoto;
        const circleCenterX = 95;
        const circleCenterY = 60;
        const circleRadius = 45; // smaller image
        // Try Fabric.js first
        fabric.Image.fromURL(
          profileImageURL,
          (img) => {
            if (img) {
              const scale =
                (circleRadius * 2) / Math.max(img?.width, img.height);
              img.set({
                left: circleCenterX - circleRadius,
                top: circleCenterY - circleRadius,
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false,
              });

              canvas.add(img);
              canvas.renderAll();
            } else {
              // Fallback to native canvas
              const ctx = canvas.getContext("2d");
              const nativeImg = new window.Image();
              nativeImg.crossOrigin = "anonymous";
              nativeImg.onload = function () {
                ctx.drawImage(
                  nativeImg,
                  circleCenterX - circleRadius,
                  circleCenterY - circleRadius,
                  circleRadius * 2,
                  circleRadius * 2
                );
              };
              nativeImg.src = profileImageURL;
            }
          },
          { crossOrigin: "anonymous" }
        );
      }
      // Conditionally show other ticket details
      if (showDetails) {
        centerText(`${user.Name}` || "User Name", 16, "Arial", canvas, 115);
        centerText(`${user.Email}` || "User Email", 16, "Arial", canvas, 135);
        centerText(`${user.Mo}` || "User Number", 16, "Arial", canvas, 160);

        //qrCodeCanvas
        if (qrCodeCanvas) {
          const qrCodeDataURL = qrCodeCanvas.toDataURL("image/png");
          fabric.Image.fromURL(qrCodeDataURL, (qrImg) => {
            const qrCodeWidth = 80;
            const qrCodeHeight = 80;
            const qrPositionX = 60;
            const qrPositionY = 190;

            qrImg.set({
              left: qrPositionX,
              top: qrPositionY,
              selectable: false,
              evented: false,
              scaleX: qrCodeWidth / qrImg.width,
              scaleY: qrCodeHeight / qrImg.height,
            });

            canvas.add(qrImg);
            canvas.renderAll();
          });
        }
        canvas.renderAll();
      }
    };

    drawCanvas();

    return () => {
      canvas.dispose();
    };
  }, [OrderId, user, showDetails, userPhoto]);

  const upscaleCanvas = async (canvas, preferredMultiplier = 15) => {
    let dataURL = null;
    let actualMultiplier = preferredMultiplier;

    try {
      // First try with preferred multiplier (15x for true 4K)
      dataURL = canvas.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: actualMultiplier,
      });

      // Check if dataURL is valid
      if (
        !dataURL ||
        !dataURL.startsWith("data:image") ||
        dataURL.length < 1000
      ) {
        throw new Error("Invalid dataURL generated");
      }
    } catch (highQualityError) {
      // Fallback to 10x multiplier
      try {
        actualMultiplier = 10;
        dataURL = canvas.toDataURL({
          format: "png",
          quality: 1.0,
          multiplier: actualMultiplier,
        });

        if (
          !dataURL ||
          !dataURL.startsWith("data:image") ||
          dataURL.length < 1000
        ) {
          throw new Error("Invalid dataURL generated with 10x multiplier");
        }
      } catch (mediumQualityError) {
        // Final fallback to 6x multiplier
        actualMultiplier = 6;
        dataURL = canvas.toDataURL({
          format: "png",
          quality: 1.0,
          multiplier: actualMultiplier,
        });

        if (!dataURL || !dataURL.startsWith("data:image")) {
          throw new Error("Failed to generate any valid image");
        }
      }
    }

    return { dataURL, actualMultiplier };
  };

  // Download functionality with true 4K quality using Fabric.js multiplier
  const downloadCanvas = async () => {
    setLoading(true);
    try {
      if (!fabricCanvas) {
        throw new Error("Canvas not found");
      }

      // Use upscale function with 15x preferred multiplier for 4K download
      const { dataURL, actualMultiplier } = await upscaleCanvas(fabricCanvas, 15);

      // Create and trigger download - safer approach without DOM manipulation
      const link = document.createElement("a");
      link.href = dataURL;
      const qualityLabel =
        actualMultiplier >= 10
          ? "4k"
          : actualMultiplier >= 6
          ? "hd"
          : "standard";
      link.download = `ticket_${qualityLabel}_${
        OrderId || user?.Name?.replace(/\s+/g, "_") || "event"
      }.png`;
      
      // Trigger download without adding to DOM
      link.style.display = 'none';
      link.click();

      console.log(`Downloaded at ${actualMultiplier}x quality (${qualityLabel})`);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const printCanvas = async () => {
    setLoading(true);
    try {
      if (!fabricCanvas) {
        throw new Error("Canvas not found");
      }

      // Use upscale function with 10x preferred multiplier for high-quality print
      const { dataURL, actualMultiplier } = await upscaleCanvas(fabricCanvas, 10);

      // Create a new window for printing
      const printWindow = window.open("", "", "width=800,height=600");

      // Create an image element and set the high-res canvas data URL as the source
      const printImage = new Image();
      printImage.src = dataURL;

      // Once the image is loaded, inject it into the print window and trigger the print
      printImage.onload = () => {
        printWindow.document.body.appendChild(printImage);
        printWindow.document.body.style.textAlign = "center";
        printWindow.document.body.style.margin = "0";
        printWindow.document.body.style.padding = "0";
        
        // Set print styles for high quality
        const style = printWindow.document.createElement('style');
        style.textContent = `
          @media print {
            body { margin: 0; padding: 0; }
            img { max-width: 100%; height: auto; }
          }
        `;
        printWindow.document.head.appendChild(style);
        
        console.log(`Printing at ${actualMultiplier}x quality`);
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Print error:", error);
      alert("Failed to print ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Row className="justify-content-center mb-2">
        <Col xs={12} sm={6} className="d-flex gap-2">
          <Button
            variant="primary"
            className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
            onClick={downloadCanvas}
            disabled={loading}
          >
            <span>{loading ? "Please Wait..." : "Download"}</span>
            <ArrowBigDownDash size={18} />
          </Button>
          {showPrintButton && (
            <Button
              variant="secondary"
              className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={printCanvas}
            >
              <span>Print</span>
              <Printer size={18} />
            </Button>
          )}
        </Col>
      </Row>
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <canvas ref={canvasRef} />
        </div>
      )}
      <div style={{ display: "none" }}>
        <QRCodeCanvas ref={qrCodeRef} value={OrderId} size={150 * 3} />
      </div>
    </>
  );
};

export default IdCard;
