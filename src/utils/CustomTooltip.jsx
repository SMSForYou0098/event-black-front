import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export const CustomTooltip = ({ children, text, placement = 'top' }) => {
    if (!text) return children;
    return (
        <OverlayTrigger
            placement={placement}
            overlay={<Tooltip className="text-capitalize">{text}</Tooltip>}
        >
            <span>{children}</span>
        </OverlayTrigger>
    );
};