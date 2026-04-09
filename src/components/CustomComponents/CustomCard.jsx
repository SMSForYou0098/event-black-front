import React from 'react';

const CustomCard = ({ children, className = '', ...props }) => {
    return (
        <div className={`custom-dark-content-bg p-4 rounded-4 border h-100 ${className}`} {...props}>
            {children}
        </div>
    );
};

export default CustomCard;
