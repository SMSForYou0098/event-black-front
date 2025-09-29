import React from "react";

// router (keeping Next.js Link)
import Link from "next/link";

const CustomToggle = React.forwardRef(({ children, variant, onClick }, ref) => (
  <Link
    href="/"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      if (onClick) {
        onClick(e);
      }
    }}
    className={variant}
  >
    {children}
  </Link>
));

export default CustomToggle;
