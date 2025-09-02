import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { IoShareOutline, IoPhonePortraitOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { BsArrowDown } from "react-icons/bs";

import { useMyContext } from "../Context/MyContextProvider";
import { requestNotificationPermission, setupForegroundNotification } from "./service/firebaseConfig";

const PushNotificationButton = () => {
  const { api } = useMyContext();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [deviceOS, setDeviceOS] = useState("");
  const [browser, setBrowser] = useState("");
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(() => {
    const lastClosed = localStorage.getItem('notificationModalLastClosed');
    if (!lastClosed) return true;

    const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const timeDifference = Date.now() - parseInt(lastClosed);
    
    return timeDifference >= twoHoursInMs;
  });
  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem('notificationModalLastClosed', Date.now().toString());
  };

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isInStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(isInStandaloneMode);
      // Detect OS first
      let os = "unknown";
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        os = "iOS";
      } else if (/Android/.test(userAgent)) {
        os = "Android";
      } else if (/Windows/.test(userAgent)) {
        os = "Windows";
      } else if (/Mac/.test(userAgent)) {
        os = "MacOS";
      }
      setDeviceOS(os);

      // Detect browser
      let browserName = "unknown";
      if (/CriOS/.test(userAgent)) {
        browserName = "Chrome_iOS";
      } else if (/FxiOS/.test(userAgent)) {
        browserName = "Firefox_iOS";
      } else if (/EdgiOS/.test(userAgent)) {
        browserName = "Edge_iOS";
      } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        browserName = "Safari";
      } else if (/Chrome/.test(userAgent)) {
        browserName = "Chrome";
      } else if (/Firefox/.test(userAgent)) {
        browserName = "Firefox";
      }
      setBrowser(browserName);
    };

    detectDevice();

    const checkPermission = async () => {
      if (!("Notification" in window)) {
        setError("Notifications not supported in this browser");
        return;
      }

      if (Notification.permission === "granted") {
        setIsRegistered(true);
        setShowModal(false);
        setupForegroundNotification();

        const existingToken = localStorage.getItem("fcm_token");
        if (existingToken) {
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnableNotifications = async () => {
    if (isRegistering || isRegistered) {
      setShowModal(false);
      return;
    }
   
    setIsRegistering(true);
    setError(null);

    try {
      const permissionGranted = await requestNotificationPermission(api);
      //alert(permissionGranted ? 'true':"False");
      if (permissionGranted) {
        setupForegroundNotification();
        setIsRegistered(true);
        setShowModal(false);
      } else {
        //alert("Permission not granted");
        throw new Error("Permission not granted");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error enabling notifications:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const renderInstructions = () => {
    if (deviceOS === "iOS") {
      const isThirdPartyBrowser = [
        "Chrome_iOS",
        "Firefox_iOS",
        "Edge_iOS",
      ].includes(browser);

      if (isThirdPartyBrowser) {
        return (
          <div className="p-3 text-center">
            <div className="mb-4">
              <IoPhonePortraitOutline size={48} className="text-primary mb-2" />
              <h6 className="fw-bold">Browser Not Supported</h6>
              <p className="text-muted small">
                {browser.split("_")[0]} on iOS doesn't support notifications
              </p>
            </div>
            <div className="alert alert-warning">
              Please open this website in Safari to enable notifications
            </div>
          </div>
        );
      }

      if (browser === "Safari" && !isStandalone) {
        return (
          <div className="p-3 text-center">
            <div className="mb-4">
              <IoPhonePortraitOutline size={48} className="text-primary mb-2" />
              <h6 className="fw-bold">Add to Home Screen</h6>
              <p className="text-muted small">Follow these quick steps:</p>
            </div>

            <div className="d-flex flex-column align-items-center gap-2">
              <div className="p-3 border rounded-3 w-100">
                <IoShareOutline size={24} className="text-primary" />
                <div className="mt-2">
                  <strong>Step 1:</strong> Tap the Share icon
                </div>
              </div>

              <BsArrowDown size={20} className="text-muted" />

              <div className="p-3 border rounded-3 w-100">
                <AiOutlinePlus size={24} className="text-primary" />
                <div className="mt-2">
                  <strong>Step 2:</strong> Select "Add to Home Screen"
                </div>
              </div>

              <BsArrowDown size={20} className="text-muted" />

              <div className="p-3 border rounded-3 w-100">
                <IoPhonePortraitOutline size={24} className="text-primary" />
                <div className="mt-2">
                  <strong>Step 3:</strong> Open from Home Screen
                </div>
              </div>
            </div>
          </div>
        );
      }
      if (isStandalone || browser === "Safari") {
        return (
          <div className="p-3 text-center">
            <div className="mb-4">
              <IoPhonePortraitOutline size={48} className="text-primary mb-2" />
              <h6 className="fw-bold">Enable Notifications</h6>
              <p className="text-muted small">
                Allow notifications to stay updated with latest events
              </p>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="p-2">
        {error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <p>Click below to enable browser notifications</p>
        )}
      </div>
    );
  };
  const showEnableButton = () => {
    if (deviceOS === "iOS") {
      // Only show button if in standalone mode (home screen app)
      // or if using Safari and already in standalone mode
      if (isStandalone) {
        return true;
      }
      // Hide button during add to home screen steps
      if (browser === "Safari" && !isStandalone) {
        return false;
      }
      // Hide for third-party browsers
      return false;
    }
    // Show for all other supported browsers (non-iOS)
    return true;
  };

  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Enable Notifications</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderInstructions()}</Modal.Body>
      <Modal.Footer>
        {showEnableButton() && (
          <Button
            variant="primary"
            onClick={handleEnableNotifications}
            disabled={isRegistering || isRegistered}
          >
            {isRegistering
              ? "Enabling..."
              : isRegistered
              ? "Notifications Enabled"
              : "Enable Notifications"}
          </Button>
        )}
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PushNotificationButton;
