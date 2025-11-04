import Image from "next/image";
import React from "react";

const Logo = ({ size = 50 }) => {
  return (
    <>
      {/* Desktop logo (visible on sm and above) */}
      <div className="d-none d-sm-block">
        <Image
          src="/assets/images/logo/logo.webp"
          alt="Logo"
          width={size}
          height={size * 0.5} // maintain aspect ratio
          priority
        />
      </div>

      {/* Mobile logo (visible below sm) */}
      <div className="d-block d-sm-none">
        <Image
          src="/assets/images/logo/logo-sm.webp"
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
