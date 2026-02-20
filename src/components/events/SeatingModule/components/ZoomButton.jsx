import React from 'react';
import { THEME, IS_MOBILE } from './constants';

const ZoomButton = ({ onClick, variant = 'primary', children }) => {
    const isPrimary = variant === 'primary';

    return (
        <button
            onClick={onClick}
            className="zoom-control-btn"
            style={{
                width: IS_MOBILE ? 36 : 40,
                height: IS_MOBILE ? 36 : 40,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isPrimary ? THEME.primary : 'rgba(100, 100, 100, 0.9)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
                outline: 'none',
                padding: 0,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
            onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {children}
        </button>
    );
};

export default ZoomButton;
