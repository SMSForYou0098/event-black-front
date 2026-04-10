import { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { getTextareaError, getEmailError, getNameError, getNumberError } from "@/utils/validations";  // already exists
import { Search, X } from "lucide-react";
import Select from "react-select";

// Name Input Field
const NameInputField = ({
    name,
    value,          // controlled value from parent
    setValue,       // (val: string) => void  — replaces onChange
    isMobile,
    autoFocus,
    label = "Full Name *",
    placeholder = "Enter your name",
    externalError,
    onBlurValidate
}) => {
    // touched → boolean → e.g. touched.name && !!validationErrors.name
    const [touched, setTouched] = useState(false);

    // Filter: alphabets + spaces only
    const handleChange = (e) => {
        const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
        setValue(filtered);           // update parent state
        setTouched(true);             // trigger live validation immediately
        if (onBlurValidate) onBlurValidate(getNameError(filtered));
    };

    // handleBlur → set touched to true
    const handleBlur = () => {
        setTouched(true)
        if (onBlurValidate) onBlurValidate(getNameError(value));
    };

    // intenalError → error from validation
    const internalError = touched ? getNameError(value) : null;

    // externalError → error from parent component
    const error = externalError || internalError;

    return (
        <Form.Group className="mb-0" controlId="formName">
            {label &&
                <Form.Label>{label}</Form.Label>
            }
            <Form.Control
                name={name}
                type="text"
                placeholder={placeholder}
                value={value}
                required
                className="card-glassmorphism__input"
                onChange={handleChange}
                onBlur={handleBlur}
                size={isMobile ? "sm" : ""}
                autoFocus={autoFocus}
                isInvalid={!!error}
            />
            {/* display error message string */}
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

// Email Input Field
const EmailInputField = ({
    name,
    value,
    setValue,
    isMobile,
    autoFocus,
    label = "Email *",
    placeholder = "Enter email",
    externalError,
    onBlurValidate
}) => {
    // touched → boolean → e.g. touched.name && !!validationErrors.name
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        const val = e.target.value.toLowerCase();
        setValue(val);
        setTouched(true);             // trigger live validation immediately
        if (onBlurValidate) onBlurValidate(getEmailError(val));
    };

    // handleBlur → set touched to true
    const handleBlur = () => {
        setTouched(true);
        if (onBlurValidate) onBlurValidate(getEmailError(value));
    };

    // intenalError → error from validation
    const internalError = touched ? getEmailError(value) : null;

    // externalError → error from parent component
    const error = externalError || internalError;

    return (
        <Form.Group className="mb-0" controlId="formEmail">
            {label &&
                <Form.Label>{label}</Form.Label>
            }
            <Form.Control
                name={name}
                type="email"
                placeholder={placeholder}
                value={value}
                required
                className="card-glassmorphism__input"
                onChange={handleChange}
                onBlur={handleBlur}
                size={isMobile ? "sm" : ""}
                autoFocus={autoFocus}
                isInvalid={!!error}
            />
            {/* display error message string */}
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

// Phone Input Field
const PhoneInputField = ({
    name,
    value,
    setValue,
    externalError,
    isMobile,
    label = "Phone Number *",
    placeholder = "Enter phone number",
    onBlurValidate
}) => {
    // touched → boolean → e.g. touched.name && !!validationErrors.name
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        const filtered = (e.target.value.replace(/[^0-9]/g, ""));
        setValue(filtered)
        setTouched(true);  // trigger live validation immediately
        if (onBlurValidate) onBlurValidate(getNumberError(filtered));
    };

    // handleBlur → set touched to true
    const handleBlur = () => {
        setTouched(true);
        if (onBlurValidate) onBlurValidate(getNumberError(value));
    };

    // intenalError → error from validation
    const internalError = touched ? getNumberError(value) : null;

    // externalError → error from parent component
    const error = externalError || internalError;
    return (
        <Form.Group controlId="phone">
            {label &&
                <Form.Label>{label}</Form.Label>
            }
            <Form.Control
                name={name}
                type="text"
                placeholder={placeholder}
                maxLength={10}
                value={value}
                required
                className="card-glassmorphism__input"
                onChange={handleChange}
                onBlur={handleBlur}
                size={isMobile ? "sm" : ""}
                isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

// Address Input Field
const TextareaInputField = ({
    name,
    value,
    setValue,
    externalError,
    isMobile,
    rows,
    label,
    errorLabel,
    placeholder = "Enter your message",
    onBlurValidate
}) => {
    // touched → boolean → e.g. touched.address  && !!validationErrors.address
    const [touched, setTouched] = useState(false);

    const validationName = errorLabel || label || "Field";

    const handleChange = (e) => {
        const filtered = (e.target.value.replace(/[^a-zA-Z0-9\s,\-/()]/g, ""));
        setValue(filtered)
        setTouched(true);  // trigger live validation immediately
        if (onBlurValidate) onBlurValidate(getTextareaError(filtered, true, validationName));
    };

    // handleBlur → set touched to true
    const handleBlur = () => {
        setTouched(true);
        if (onBlurValidate) onBlurValidate(getTextareaError(value, true, validationName));
    };

    // intenalError → error from validation
    const internalError = touched ? getTextareaError(value, true, validationName) : null;

    // externalError → error from parent component
    const error = externalError || internalError;
    return (
        <Form.Group controlId="formAddress">
            {label &&
                <Form.Label>{label}</Form.Label>
            }
            <Form.Control
                as="textarea"
                rows={rows}
                name={name}
                className="card-glassmorphism__input"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

// Global Search Input Field
const GlobalSearchInputField = ({
    ref,
    value,
    setValue,
    isMobile,
    placeholder = "Search events",
}) => {
    // handle change
    const handleChange = (e) => {
        let filtered = (e.target.value.replace(/[^a-zA-Z0-9\s\.]/g, ""));
        if (filtered.match(/\.{4,}/)) {
            filtered = filtered.replace(/\.{4,}/, "...");
        }
        setValue(filtered)
    };

    return (
        <InputGroup className="bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25">
            <InputGroup.Text className="bg-transparent border-0 text-muted">
                <Search size={20} />
            </InputGroup.Text>
            <Form.Control
                ref={ref}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className="bg-transparent border-0 text-white shadow-none"
                autoFocus
            />
            {value && (
                <Button
                    variant="link"
                    className="text-muted text-decoration-none"
                    onClick={() => setValue('')}
                >
                    <X size={18} />
                </Button>
            )}
        </InputGroup>
    )
}

// Search by filter
const SearchByFilter = ({
    value,
    setValue,
    isMobile,
    placeholder = "Event name, ID, etc.",
}) => {
    // handle change
    const handleChange = (e) => {
        let filtered = (e.target.value.replace(/[^a-zA-Z0-9\s\.]/g, ""));
        if (filtered.match(/\.{4,}/)) {
            filtered = filtered.replace(/\.{4,}/, "...");
        }
        setValue(filtered)
    };

    return (
        <InputGroup>
            <Form.Control
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </InputGroup>
    )
}

export const ThemedSelectField = ({
    id,
    label,
    options,      // Expects array: [{ label: 'text', value: 'text' }]
    value,        // Expects object: { label: 'text', value: 'text' }
    onChange,
    onBlur,
    placeholder,
    error,        // Expects the error string (if any)
    required,
    isClearable = true,
    height,
    textSize,
    padLeft,
    errSize,
    isBold,
    bgColor = "#000"
}) => {
    // 1. Create the reference
    const selectRef = useRef(null);

    // 2. Add the aggressive touch interceptor
    useEffect(() => {
        const forceCloseOnOutsideTouch = (e) => {
            // Check if they touched the main input control box
            const touchedControl = selectRef.current?.controlRef?.contains(e.target);

            // Checks if they touched ANY element inside the portaled React-Select dropdown:
            // (React-select natively places 'react-select-' IDs on all of its menus/options!)
            const touchedMenu = e.target.closest('[id^="react-select"]');

            // If they touched literally anywhere else, force it to blur (close)
            if (!touchedMenu && !touchedControl && selectRef.current) {
                selectRef.current.blur();
            }
        };

        // { capture: true } ensures we detect the tap instantly, beating the Drawer's event blocker!
        document.addEventListener('touchstart', forceCloseOnOutsideTouch, { capture: true });
        document.addEventListener('mousedown', forceCloseOnOutsideTouch, { capture: true });

        return () => {
            document.removeEventListener('touchstart', forceCloseOnOutsideTouch, { capture: true });
            document.removeEventListener('mousedown', forceCloseOnOutsideTouch, { capture: true });
        };
    }, []);

    return (
        <Form.Group className="mb-2" controlId={id}>
            {/* dangerouslySetInnerHTML allows the red * for required fields to render properly */}
            {label && (
                <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: label }} />
            )}

            <Select
                ref={selectRef}
                options={options}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder || "Select..."}
                isClearable={isClearable}
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                closeMenuOnScroll={true}
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                    // romove separator line
                    indicatorSeparator: () => ({
                        display: 'none'
                    }),
                    dropdownIndicator: (base, state) => ({
                        ...base,
                        transition: 'transform 0.2s ease',
                        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        "&:hover": { color: '#ffffff' }
                    }),

                    control: (base) => ({
                        ...base,
                        minHeight: height,
                        backgroundColor: error ? "rgba(181, 21, 21, 0.1)" : "#000",
                        borderColor: error ? "#b51515" : "rgba(255, 255, 255, 0.2)",
                        boxShadow: error ? "0 0 0 1px #b51515" : "none",
                        borderRadius: '8px',
                        "&:hover": {
                            borderColor: error ? "#b51515" : "rgba(255, 255, 255, 0.4)"
                        }
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: "#000",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: '8px',
                        overflow: "hidden",
                        // zIndex: 9999 // Prevents the dropdown menu from hiding behind other forms
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                            ? "var(--bs-primary, #e50914)"
                            : state.isFocused
                                ? "rgba(229, 9, 20, 0.2)"
                                : "transparent",
                        color: "#ffffff",
                        cursor: "pointer",
                        "&:active": {
                            backgroundColor: state.isSelected
                                ? "var(--bs-primary, #e50914)"
                                : "rgba(229, 9, 20, 0.2)"
                        },
                        fontSize: textSize

                    }),
                    singleValue: (base) => ({ ...base, color: "#ffffff", fontSize: textSize }),
                    input: (base) => ({
                        ...base,
                        color: "#ffffff",
                        paddingLeft: padLeft,
                        "& input": {
                            boxShadow: "none !important",
                        }
                    }),
                    placeholder: (base) => ({ ...base, color: "#999999", fontSize: textSize, paddingLeft: padLeft })
                }}
            />

            {/* Global Error Rendering */}
            {error && (
                <Form.Text className={`${isBold ? "fw-bold" : ""} d-block mt-1`} style={{ color: '#b51515', fontSize: errSize }}>
                    {error}
                </Form.Text>
            )}
        </Form.Group>
    );
};


export { NameInputField, EmailInputField, PhoneInputField, TextareaInputField, GlobalSearchInputField, SearchByFilter };
