import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";

const OTP_LENGTH = 6;

const OtpInput = forwardRef(
    (
        {
            value = "",
            onChange,
            isInvalid = false,
            placeholder = "Enter 6-digit OTP",
            className = "",
            onSanitizedChange,
            ...rest
        },
        ref
    ) => {
        const handleChange = (event) => {
            const sanitizedValue = event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);

            if (onSanitizedChange) {
                onSanitizedChange(sanitizedValue, event);
            }

            if (onChange) {
                onChange(sanitizedValue, event);
            }
        };

        return (
            <Form.Control
                ref={ref}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                maxLength={OTP_LENGTH}
                placeholder={placeholder}
                className={className}
                isInvalid={isInvalid}
                onChange={handleChange}
                {...rest}
            />
        );
    }
);

OtpInput.displayName = "OtpInput";

export default OtpInput;
