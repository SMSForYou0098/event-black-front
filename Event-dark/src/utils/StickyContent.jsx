import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MdPhone, MdPhoneMissed } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { useMyContext } from "@/Context/MyContextProvider";
const StickyContent = () => {
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");
  const { systemSetting } = useMyContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isWhatsAppHovered, setIsWhatsAppHovered] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showMissedCallNumber, setShowMissedCallNumber] = useState(false);
  const missedCallRef = useRef(null);
  const [number, setNumber] = useState({
    whatsapp_number: null,
    missed_call_no: null
  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (missedCallRef.current && !missedCallRef.current.contains(event.target)) {
        setShowMissedCallNumber(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleScroll = () => {
    if (document.documentElement.scrollTop > 250) {
      setAnimationClass("animate__fadeIn");
      setShowScrollToTop(true);
    } else {
      setAnimationClass("animate__fadeOut");
      setShowScrollToTop(false);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const formatPhoneNumber = (number) => {
    let cleanNumber = number?.replace(/\D/g, "");

    if (cleanNumber?.length === 10) {
      return `${cleanNumber?.slice(0, 4)}-${cleanNumber?.slice(
        4,
        6
      )}-${cleanNumber?.slice(6)}`;
    } else {
      return cleanNumber;
    }
  };

  useEffect(() => {
    setNumber({
      whatsapp_number: formatPhoneNumber(systemSetting?.whatsapp_number),
      missed_call_no: formatPhoneNumber(systemSetting?.missed_call_no)
    })
  }, [systemSetting])

  const containerStyle = {
    position: "fixed",
    right: "1.3rem",
    bottom: "10rem",
    zIndex: 9,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: showScrollToTop ? "1.5rem" : "1rem", // Adjust gap dynamically
    transition: "gap 0.3s ease", // Smooth transition for gap
  };

  const buttonStyle = {
    width: "50px", // Adjusted size for perfect roundness
    height: "50px", // Adjusted size for perfect roundness
    borderRadius: "50% !important", // Ensures the button is perfectly round
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "1.5rem",
  };

  const missedCallStyle = {
    position: "fixed",
    left: "1.3rem",
    bottom: "10rem",
    zIndex: 9,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    cursor: "pointer",
    flexDirection: "row", // Adjusted for number toggle
  };

  const toggleMissedCallNumber = () => {
    setShowMissedCallNumber((prev) => !prev);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!systemSetting?.missed_call_no) return null;

  return (
    <>
      <div
        id="back-to-top"
        style={{ display: "none" }}
        className={`animate__animated ${animationClass}`}
        onClick={scrollToTop}
      >
        <Link
          style={{ position: "fixed", bottom: "100px", right: "20px" }}
          className="p-0 btn bg-primary btn-sm position-fixed top border-0 rounded-circle"
          id="top"
          href="#top"
        >
          <i className="fa-solid fa-chevron-up"></i>
        </Link>
      </div>

      <div style={containerStyle}>
        <motion.a
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
          style={buttonStyle}
          href={`tel:${systemSetting.whatsapp_number}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <motion.div
            style={{ fontSize: "16px" }}
            animate={{ rotate: isHovered ? -20 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MdPhone />
          </motion.div>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="position-absolute bg-white text-primary p-2 rounded shadow"
                style={{
                  right: "70px",
                  whiteSpace: "nowrap",
                  fontSize: "14px",
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {number.whatsapp_number}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.a>

        <motion.a
          className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
          style={buttonStyle}
          href={`https://wa.me/${systemSetting?.whatsapp_number}?text=hi`}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsWhatsAppHovered(true)}
          onMouseLeave={() => setIsWhatsAppHovered(false)}
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <motion.div
            style={{ fontSize: "22px", color: "white", lineHeight: 0 }} // Changed icon color to white
            animate={{ rotate: isWhatsAppHovered ? -20 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaWhatsapp />
          </motion.div>
          <AnimatePresence>
            {isWhatsAppHovered && (
              <motion.div
                className="position-absolute bg-white text-success p-2 rounded shadow"
                style={{
                  right: "70px",
                  whiteSpace: "nowrap",
                  fontSize: "14px",
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {number.whatsapp_number}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.a>
      </div>

      <div style={missedCallStyle} ref={missedCallRef}>
        <motion.i
          style={{ fontSize: "22px", color: "red", cursor: "pointer" }}
          onClick={toggleMissedCallNumber}
        >
          <MdPhoneMissed />
        </motion.i>
        <AnimatePresence>
          {showMissedCallNumber && (
            <motion.span
              style={{ fontSize: "16px", color: "black", cursor: "pointer" }}
              onClick={() =>
                (window.location.href = `tel:${systemSetting.missed_call_no}`)
              } // Call action on number click
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {number.missed_call_no}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StickyContent;