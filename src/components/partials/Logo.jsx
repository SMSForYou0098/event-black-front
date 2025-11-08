import Image from "next/image";
import React from "react";

const Logo = ({
  height = 50,
  width = 50,
  size = 50,
  desktopUrl = "/assets/images/logo/logo.png",
  mobileUrl = "/assets/images/logo/logo-sm.webp",
  handleClick,
}) => {
  return (
    <>
      {/* Desktop logo (visible on sm and above) */}
      <div
        className={`d-none d-sm-block ${handleClick ? "cursor-pointer" : ""}`}
        onClick={handleClick}
        style={{ display: "inline-block" }}
      >
        <Image
          src={desktopUrl}
          alt="Logo"
          width={width || size}
          height={height || size}
          priority
        />
      </div>

      {/* Mobile logo (visible below sm) */}
      <div
        className={`d-block d-sm-none ${handleClick ? "cursor-pointer" : ""}`}
        onClick={handleClick}
        style={{ display: "inline-block" }}
      >
        <Image
          src={mobileUrl}
          alt="Logo Small"
          width={width || size}
          height={height || size}
          priority
        />
      </div>
    </>
  );
};

export default Logo;
