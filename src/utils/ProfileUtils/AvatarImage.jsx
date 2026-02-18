import React, { useState, useEffect } from 'react';
import { Image } from 'react-bootstrap';

const getInitials = (name = "") => {
  const names = name?.trim().split(" ").filter(Boolean);
  if (!names?.length) return "";
  if (names.length === 1) return names[0]?.[0]?.toUpperCase() ?? "";
  return ((names[0]?.[0] ?? "") + (names[names.length - 1]?.[0] ?? "")).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    '#dc3545', '#6f42c1', '#0d6efd', '#198754', '#fd7e14',
    '#20c997', '#6610f2', '#d63384', '#fd7e14', '#198754'
  ];
  const str = name || "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AvatarImage = ({ src, alt, name, size = 100, className = "", style = {} }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [src]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const shouldShowInitials = !src || imageError;

  if (shouldShowInitials) {
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name || 'Default');

    return (
      <div
        className={`d-flex justify-content-center align-items-center ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: 'white',
          fontSize: `${size * 0.4}px`,
          fontWeight: 'bold',
          ...style
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        roundedCircle
        width={size}
        height={size}
        className={className}
        style={{
          // border: '4px solid #dc3545',
          display: imageLoading ? 'none' : 'block',
          ...style
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {imageLoading && (
        <div
          className={`d-flex justify-content-center align-items-center ${className}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            fontSize: `${size * 0.3}px`,
            fontWeight: 'bold',
            // border: '4px solid #dc3545',
            ...style
          }}
        >
          ...
        </div>
      )}
    </>
  );
};

export default AvatarImage;