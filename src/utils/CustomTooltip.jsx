import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export const CustomTooltip = ({ children, text, placement = 'top' }) => (
    <OverlayTrigger
        placement={placement}
        overlay={<Tooltip>{text}</Tooltip>}
    >
        <span>{children}</span>
    </OverlayTrigger>
);