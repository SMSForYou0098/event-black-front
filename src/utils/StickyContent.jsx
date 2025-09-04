import React, { useEffect, useState } from "react";
import Link from "next/link";
const StickyContent = () => {
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleScroll = () => {
    if (document.documentElement.scrollTop > 250) {
      setAnimationClass("animate__fadeIn");
    } else {
      setAnimationClass("animate__fadeOut");
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
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
  );
};

export default StickyContent;
