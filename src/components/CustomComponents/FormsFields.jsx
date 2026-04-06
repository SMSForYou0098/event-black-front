import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { getAddressError, getEmailError, getNameError, getNumberError, getSearchError } from "@/utils/validations";  // already exists
import { Search, X } from "lucide-react";

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
}) => {
    // touched → boolean → e.g. touched.name && !!validationErrors.name
    const [touched, setTouched] = useState(false);

    // Filter: alphabets + spaces only
    const handleChange = (e) => {
        const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
        setValue(filtered);           // update parent state
        setTouched(true);             // trigger live validation immediately
    };

    // handleBlur → set touched to true
    const handleBlur = () => setTouched(true);

    // intenalError → error from validation
    const internalError = touched ? getNameError(value) : null;

    // externalError → error from parent component
    const error = externalError || internalError;

    return (
        <Form.Group className="mb-0" controlId="formName">
            <Form.Label>{label}</Form.Label>
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
}) => {
    // touched → boolean → e.g. touched.name && !!validationErrors.name
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        setValue(e.target.value.toLowerCase());
        setTouched(true);             // trigger live validation immediately
    };

    // handleBlur → set touched to true
    const handleBlur = () => setTouched(true);

    // intenalError → error from validation
    const internalError = touched ? getEmailError(value) : null;

    // externalError → error from parent component
    const error = externalError || internalError;

    return (
        <Form.Group className="mb-0" controlId="formEmail">
            <Form.Label>{label}</Form.Label>
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
}) => {
    // touched → boolean → e.g. touched.name && !!validationErrors.name
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        const filtered = (e.target.value.replace(/[^0-9]/g, ""));
        setValue(filtered)
        setTouched(true);  // trigger live validation immediately
    };

    // handleBlur → set touched to true
    const handleBlur = () => setTouched(true);

    // intenalError → error from validation
    const internalError = touched ? getNumberError(value) : null;

    // externalError → error from parent component
    const error = externalError || internalError;
    return (
        <Form.Group controlId="phone">
            <Form.Label>{label}</Form.Label>
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
                isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

// Address Input Field
const AddressInputField = ({
    name,
    value,
    setValue,
    externalError,
    isMobile,
    label = "Address",
    placeholder = "Enter your address",
}) => {
    // touched → boolean → e.g. touched.address  && !!validationErrors.address
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        const filtered = (e.target.value.replace(/[^a-zA-Z0-9\s,\-/()]/g, ""));
        setValue(filtered)
        setTouched(true);  // trigger live validation immediately
    };

    // handleBlur → set touched to true
    const handleBlur = () => setTouched(true);

    // intenalError → error from validation
    const internalError = touched ? getAddressError(value, true) : null;

    // externalError → error from parent component
    const error = externalError || internalError;
    return (
        <Form.Group controlId="formAddress">
            <Form.Label>{label}</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
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

export { NameInputField, EmailInputField, PhoneInputField, AddressInputField, GlobalSearchInputField };
