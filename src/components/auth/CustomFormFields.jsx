// CustomFormFields.js
import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Select from "react-select";
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { customStyles } from './select2';

// Custom Text Field Component
export const CustomTextField = ({ label, value, onChange, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                type="text"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={validated && !value}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

export const PasswordField = ({ value, setPassword, handleKeyDown, className, autoFocus, idValue }) => {
    const [showPassword, setShowPassword] = useState(false);
    // Allow only '@' and '_'
    const allowedRegex = /^[a-zA-Z0-9@_]*$/;


    const handleChange = (e) => {
        const newValue = e.target.value;
        if (newValue === "" || allowedRegex.test(newValue)) {
    setPassword(newValue);
  }
        // Optionally, else block to show an error or ignore other characters
    };

    return (
        <InputGroup className="position-relative">
            <Form.Control
                type={showPassword ? "text" : "password"}
                id={idValue|| `password`}
                required
                placeholder="Enter Password"
                onKeyDown={handleKeyDown}
                value={value}
                onChange={handleChange}
                className={`pe-5 ${className}`} // Ensures padding so text doesn't overlap the icon
                autoFocus={autoFocus}
            />
            <span
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer"
                style={{ cursor: "pointer", zIndex: 999 }}
            >
                <AnimatePresence mode="wait">
                    {showPassword ? (
                        <motion.div
                            key="eye-off"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <EyeOff size={20} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="eye"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Eye size={20} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </span>
        </InputGroup>
    );
};

// Custom Select Component
export const CustomSelect = ({ label, options, onChange, required, validated, validationMessage, value, className }) => {
    return (
        <Form.Group>
            <Form.Label>
                {label} {required && <span className="text-danger">*</span>}
            </Form.Label>
            <Select
                options={options}
                value={value}
                styles={customStyles}
                onChange={(selectedOption) => onChange(selectedOption)}
                isRequired={required}
                classNamePrefix="react-select"
                className={`react-select-container ${validated && !options ? 'is-invalid' : ''} ${className}`}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            {validated && !options && (
                <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
            )}
        </Form.Group>
    );
};

// Custom Switch Component
export const CustomSwitch = ({ label, checked, onChange, required, validated, validationMessage, className }) => {
    return (
        <Form.Group className={className}>
            {/* <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label> */}
            <Form.Check type="switch">
                <Form.Check.Input
                    checked={checked}
                    onChange={onChange}
                    required={required}
                    isInvalid={validated && !checked}
                />
                <Form.Check.Label>{label}</Form.Check.Label>
                <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
            </Form.Check>
        </Form.Group>
    );
};

// Custom Checkbox Component
export const CustomCheckbox = ({ label, checked, onChange, required, validated, validationMessage, disabled }) => {
    return (
        <Form.Group>
            <Form.Check
                type="checkbox"
                label={
                    <>
                        {label} {required && <span className="text-danger">*</span>}
                    </>
                }
                checked={checked}
                onChange={onChange}
                required={required}
                disabled={disabled}
                isInvalid={validated && !checked}
            />
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

// Custom Radio Button Component
export const CustomRadioButton = ({ label, option, selectedValue, onChange, required, validated, validationMessage, value, defaultChecked, name }) => {
    return (
        <Form.Group className='d-flex gap-3'>
            <Form.Check
                key={option}
                type="radio"
                label={option}
                name={name}
                value={value}
                defaultChecked={defaultChecked}
                onChange={onChange}
                required={required}
                isInvalid={validated && selectedValue === ''}
            />
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

// Custom Text Area Component
export const CustomTextArea = ({ label, value, onChange, rows, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                as="textarea"
                rows={rows}
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={validated && !value}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

export const CustomNumberField = ({ label, value, onChange, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                type="number"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={validated && !value}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

// Custom Date Field Component
export const CustomDateField = ({ label, value, onChange, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                type="date"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={validated && !value}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

// Custom File Upload Component
export const CustomFileField = ({ label, onChange, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                type="file"
                onChange={onChange}
                required={required}
                isInvalid={validated && !onChange}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

// Custom Color Picker Component
export const CustomColorPicker = ({ label, value, onChange, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                type="color"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={validated && !value}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};

// Custom Range Field Component
export const CustomRangeField = ({ label, value, onChange, required, validationMessage, validated }) => {
    return (
        <Form.Group>
            <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
                type="range"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={validated && !value}
            />
            <Form.Control.Feedback tooltip>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">{validationMessage}</Form.Control.Feedback>
        </Form.Group>
    );
};
