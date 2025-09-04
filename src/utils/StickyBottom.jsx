const StickyBottom = ({ children }) => {
  return (
    <div
      className="mobile-sticky-book-btn"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "15px",
        // background: "transparent",
        background: "rgba(30, 30, 30, 0.3)", // semi-transparent for Safari
        backdropFilter: "blur(15px) saturate(180%)",
        WebkitBackdropFilter: "blur(15px) saturate(180%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 1000,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      {children}
    </div>
  );
};

export default StickyBottom;
