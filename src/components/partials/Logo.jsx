import Image from "next/image";
import React from "react";

const Logo = ({
  size = 50,
  desktopUrl = "/assets/images/logo/logo.webp", // default desktop logo
  mobileUrl = "/assets/images/logo/logo-sm.webp", // default mobile logo
}) => {
  return (
    <>
      {/* Desktop logo (visible on sm and above) */}
      <div className="d-none d-sm-block">
        <Image
          src={desktopUrl}
          alt="Logo"
          width={size}
          height={size * 1} // maintain aspect ratio
          priority
        />
      </div>

      {/* Mobile logo (visible below sm) */}
      <div className="d-block d-sm-none">
        <Image
          src={mobileUrl}
          alt="Logo Small"
          width={size * 0.8}
          height={size * 0.32} // maintain aspect ratio
          priority
        />
      </div>
    </>
  );
};

export default Logo;
