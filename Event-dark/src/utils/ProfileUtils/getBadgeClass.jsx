import React from "react";
import { Badge } from "react-bootstrap";

// Map outline variants to Bootstrap classes
const getBadgeClass = (variant) => {
  if (!variant) return "";
  if (variant.startsWith("outline-")) {
    const color = variant.replace("outline-", "");
    return `badge-outline-${color}`;
  }
  return `bg-${variant}`;
};

const CustomBadge = ({ variant = "primary", className = "", children, ...props }) => {
  const badgeClass = getBadgeClass(variant);

  // Check if className contains any rounded-* class
  const hasRounded = /\brounded-\w+\b/.test(className);

  // If no rounded-* in className, add rounded-3 by default
  const finalClass = `${badgeClass} ${hasRounded ? "" : "rounded-3"} ${className}`.trim();

  return (
    <Badge bg={null} className={finalClass} {...props}>
      {children}
    </Badge>
  );
};

export default CustomBadge;