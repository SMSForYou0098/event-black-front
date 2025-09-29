import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric-pure-browser";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Col, Placeholder, Row, Spinner } from "react-bootstrap";
import { ArrowBigDownDash, Printer } from "lucide-react";
const IdCard = (props) => {
  const {
    showDetails,
    user,
    OrderId,
    showPrintButton,
    userPhoto,
    idCardBg,
    bgRequired,
    savedLayout,
    imageLoading,
  } = props;
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

  // Inside your component...

  useEffect(() => {
    if (!idCardBg) return; // Don’t draw until bg is ready

    const canvas = new fabric.Canvas(canvasRef.current);
    setFabricCanvas(canvas);

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
  canvas.clear();

  // Set background
  canvas.setBackgroundImage(null, () => {
    canvas.renderAll();
  });

  if (bgRequired && idCardBg) {
    fabric.Image.fromURL(
      idCardBg,
      (bgImg) => {
        bgImg.set({
          left: 0,
          top: 0,
          scaleX: CANVAS_WIDTH / bgImg.width,
          scaleY: CANVAS_HEIGHT / bgImg.height,
          selectable: false,
          evented: false,
        });
        canvas.setBackgroundImage(bgImg, () => {
          canvas.renderAll();
        });
      },
      { crossOrigin: "anonymous" }
    );
  } else {
    canvas.backgroundColor = "transparent";
    canvas.renderAll();
  }

  // --- User Photo ---
  if (userPhoto && savedLayout?.user_photo) {
    fabric.Image.fromURL(
      userPhoto,
      (img) => {
        img.set({
          ...savedLayout.user_photo,
          selectable: false,
          evented: false,
        });

        // If isCircle, clip to circle
        if (savedLayout.user_photo.isCircle) {
          const radius = Math.min(
            (savedLayout.user_photo.width || img.width) * (savedLayout.user_photo.scaleX || 1) / 2,
            (savedLayout.user_photo.height || img.height) * (savedLayout.user_photo.scaleY || 1) / 2
          );
          img.set({
            clipPath: new fabric.Circle({
              radius,
              originX: 'center',
              originY: 'center',
              left: 0,
              top: 0,
            }),
          });
        }

        canvas.add(img);
        canvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  }

  // --- QR Code ---
  const qrCodeCanvas = qrCodeRef.current;
  if (qrCodeCanvas && savedLayout?.qr_code) {
    const qrCodeDataURL = qrCodeCanvas.toDataURL("image/png");
    fabric.Image.fromURL(qrCodeDataURL, (qrImg) => {
      qrImg.set({
        ...savedLayout.qr_code,
        selectable: false,
        evented: false,
      });
      canvas.add(qrImg);
      canvas.renderAll();
    });
  }

  if (savedLayout?.text_1) {
  const text1 = new fabric.Text(String(user?.Name || "User Name"), {
    ...savedLayout.text_1,
    selectable: false,
    evented: false,
  });
  canvas.add(text1);
}

// --- Text 2 ---
if (savedLayout?.text_2) {
  const text2 = new fabric.Text(String(user?.Email || "User Email"), {
    ...savedLayout.text_2,
    selectable: false,
    evented: false,
  });
  canvas.add(text2);
}

// --- Text 3 ---
if (savedLayout?.text_3) {
  const text3 = new fabric.Text(String(user?.Mo || "User Number"), {
    ...savedLayout.text_3,
    selectable: false,
    evented: false,
  });
  canvas.add(text3);
}

  canvas.renderAll();
};

    drawCanvas();

    return () => {
      canvas.dispose();
    };
  }, [OrderId, user, showDetails, userPhoto, idCardBg]); // ✅ add idCardBg here
  if (!idCardBg) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 321 }}
      >
        <Placeholder as="div" animation="glow">
          <Placeholder
            xs={12}
            style={{
              width: 204,
              height: 321,
              borderRadius: "8px",
              backgroundColor: "#000000",
            }}
          />
        </Placeholder>
      </div>
    );
  }

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
  if (!fabricCanvas) {
    alert("Canvas not initialized yet.");
    return;
  }

  setLoading(true);
  try {
    // Generate high-quality image
    const { dataURL, actualMultiplier } = await upscaleCanvas(fabricCanvas, 15); // consider reducing to 10

    const safeName = (user?.Name || "event")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const qualityLabel = actualMultiplier >= 10 ? "4k" : actualMultiplier >= 6 ? "hd" : "standard";

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `ticket_${qualityLabel}_${OrderId || safeName}.png`;
    link.style.display = "none";
    link.click();

    // console.log("✅ Downloaded successfully");
  } catch (err) {
    console.error("❌ Download error:", err);
    alert("Download failed.");
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
    const { dataURL, actualMultiplier } = await upscaleCanvas(
      fabricCanvas,
      10
    );

    // Create a new window for printing
    const printWindow = window.open("", "", "width=800,height=600");

    // Create an image element and set the high-res canvas data URL as the source
    const printImage = new Image();
    printImage.src = dataURL;

    printImage.onload = () => {
      printWindow.document.body.appendChild(printImage);
      printWindow.document.body.style.textAlign = "center";
      printWindow.document.body.style.margin = "0";
      printWindow.document.body.style.padding = "0";

      // Set print styles for high quality
      const style = printWindow.document.createElement("style");
      style.textContent = `
        @media print {
          body { margin: 0; padding: 0; }
          img { max-width: 100%; height: auto; }
        }
      `;
      printWindow.document.head.appendChild(style);

      // Wait a bit to ensure image is rendered before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300); // 300ms delay, adjust if needed
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
      <div
        className="d-flex justify-content-center align-items-center w-100 my-3"
        style={{ position: "relative" }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "inline-block",
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "none" }}>
        <QRCodeCanvas ref={qrCodeRef} value={OrderId} size={150 * 3} />
      </div>
    </>
  );
};

export default IdCard;
