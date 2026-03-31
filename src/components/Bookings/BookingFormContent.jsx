import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import CustomDateRangePicker from '@/components/CustomComponents/CustomDateRangePicker';
import CustomBtn from '@/utils/CustomBtn';
import MobileTwoButtonFooter from '@/utils/MobileTwoButtonFooter';
import UserInfoCard from './UserInfoCard';

const BookingFormContent = (props) => {
  const {
    form, setForm, onCancel, onProceed, isValid, isPending, eventDateRange, stall,
    currentStep, setCurrentStep, profile, setProfile, isFetchingProfile, isUpdatingProfile, 
    targetUser, phoneNumber, error, setError
  } = props;

  const handleFieldChange = (step, field, value) => {
    // Restrict pincode to numbers only (max 6 digits)
    if (field === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    if (step === 1) {
      setProfile(prev => ({ ...prev, [field]: value }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const errors = useMemo(() => {
    const errs = {};
    if (currentStep === 1) {
      if (profile.business_name && profile.business_name.trim().length < 3)
        errs.business_name = 'Business name must be at least 3 characters';
      if (profile.address && profile.address.trim().length < 5)
        errs.address = 'Address must be at least 5 characters';
      if (profile.pincode && !/^\d{6}$/.test(profile.pincode))
        errs.pincode = 'Pincode must be exactly 6 digits';
      if (profile.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(profile.gst_number))
        errs.gst_number = 'Invalid GST format (15 characters, e.g. 22AAAAA0000A1Z5)';
    } else if (currentStep === 2) {
      if (form.stall_name && form.stall_name.trim().length < 3)
        errs.stall_name = 'Stall name must be at least 3 characters';
      if (form.product_description && form.product_description.trim().length < 10)
        errs.product_description = 'Description must be at least 10 characters';
    }
    return errs;
  }, [profile, form, currentStep]);

  const isProfileValid = useMemo(() => {
    return (
      profile.business_name?.trim().length >= 3 &&
      profile.business_type?.trim() &&
      profile.address?.trim().length >= 5 &&
      profile.city?.trim() &&
      profile.state?.trim() &&
      /^\d{6}$/.test(profile.pincode) &&
      (!profile.gst_number || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(profile.gst_number))
    );
  }, [profile]);

  const step1Fields = [
    { name: 'business_name', label: 'Business Name', placeholder: 'Enter Business Name', col: 6 },
    { name: 'business_type', label: 'Business Type', placeholder: 'e.g. Food, Electronics', col: 6 },
    { name: 'gst_number', label: 'GST Number (Optional)', placeholder: 'Enter GST Number', col: 12 },
    { name: 'address', label: 'Address', placeholder: 'Enter Business Address', col: 12, as: 'textarea', rows: 2 },
    { name: 'city', label: 'City', placeholder: 'City', col: 4 },
    { name: 'state', label: 'State', placeholder: 'State', col: 4 },
    { name: 'pincode', label: 'Pincode', placeholder: 'Pincode', col: 4 },
  ];

  const step2Fields = [
    // { name: 'stall_name', label: 'Give a name to your Stall', placeholder: 'e.g. Acme Corp Exhibition', col: 6 },
    { name: 'product_description', label: 'Product Description', placeholder: 'What products will you be displaying?', col: 12, as: 'textarea', rows: 2 },
    { name: 'notes', label: 'Notes', placeholder: 'Any special requests or notes?', col: 12, as: 'textarea', rows: 2 },
  ];

  const renderFields = (fields, step, data) => (
    <Row>
      {fields.map((field) => (
        <Col md={field.col} key={field.name} xs={12}>
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted">{field.label}</Form.Label>
            <Form.Control
              as={field.as || 'input'}
              rows={field.rows}
              type={field.type || 'text'}
              className="card-glassmorphism__input"
              placeholder={field.placeholder}
              value={data[field.name] || ''}
              onChange={(e) => handleFieldChange(step, field.name, e.target.value)}
              isInvalid={!!errors[field.name]}
              style={field.as === 'textarea' ? { height: 'auto' } : {}}
            />
            {errors[field.name] && (
              <Form.Control.Feedback type="invalid">
                {errors[field.name]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      ))}
    </Row>
  );

  return (
    <Form className="d-flex flex-column h-100" style={{ minHeight: '450px' }}>
      {currentStep === 1 && (
        <div className="animate__animated animate__fadeIn d-flex flex-column h-100">
          <div
            className="px-3"
            style={{
              overflowY: 'auto',
              flex: 1,
              paddingBottom: '80px',
              minHeight: 0,
            }}
          >
            {isFetchingProfile ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" variant="light" />
                <div className="text-muted mt-2">Fetching profile...</div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError('')}
                    className="mb-3 small d-flex align-items-center"
                    style={{ background: 'rgba(255, 77, 79, 0.1)', border: '1px solid rgba(255, 77, 79, 0.2)', color: '#ff4d4f' }}
                  >
                    <AlertCircle size={16} className="me-2 flex-shrink-0" />
                    <div>{error}</div>
                  </Alert>
                )}
                {renderFields(step1Fields, 1, profile)}
              </>
            )}
          </div>

          <MobileTwoButtonFooter
            leftButton={
              <CustomBtn
                variant="secondary"
                className="w-100"
                buttonText="Cancel"
                HandleClick={onCancel}
                hideIcon={true}
                wrapperClassName="justify-content-start"
                size="sm"
              />
            }
            rightButton={
              <CustomBtn
                variant="primary"
                className="w-100"
                wrapperClassName="justify-content-end"
                size="sm"
                buttonText="Next Step"
                HandleClick={onProceed}
                disabled={isFetchingProfile || isUpdatingProfile || !isProfileValid}
                loading={isUpdatingProfile}
                hideIcon={true}
              />
            }
          />
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate__animated animate__fadeIn d-flex flex-column h-100">
          <div
            className="px-3"
            style={{
              overflowY: 'auto',
              flex: 1,
              paddingBottom: '80px',
              minHeight: 0,
            }}
          >
            {/* <UserInfoCard user={targetUser} phoneNumber={phoneNumber} /> */}

            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError('')}
                className="mb-3 small d-flex align-items-center"
                style={{ background: 'rgba(255, 77, 79, 0.1)', border: '1px solid rgba(255, 77, 79, 0.2)', color: '#ff4d4f' }}
              >
                <AlertCircle size={16} className="me-2 flex-shrink-0" />
                <div>{error}</div>
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Expected Setup Date</Form.Label>
                  <CustomDateRangePicker
                    value={form.expected_setup_date}
                    placeholder="Select setup date"
                    isSingle={true}
                    minDate={eventDateRange.min}
                    maxDate={eventDateRange.max}
                    onChange={(dates) =>
                      setForm((prev) => ({ ...prev, expected_setup_date: dates }))
                    }
                    className="card-glassmorphism__input rounded-3"
                  />
                </Form.Group>
              </Col>
            </Row>

            {renderFields(step2Fields, 2, form)}
          </div>

          <MobileTwoButtonFooter
            leftButton={
              <CustomBtn
                variant="secondary"
                className="w-100"
                buttonText="Back"
                HandleClick={() => setCurrentStep(1)}
                hideIcon={true}
                wrapperClassName="justify-content-start"
                size="sm"
              />
            }
            rightButton={
              <CustomBtn
                variant="primary"
                className="w-100"
                wrapperClassName="justify-content-end"
                size="sm"
                buttonText="Proceed to Payment"
                HandleClick={onProceed}
                disabled={!isValid || isPending}
                loading={isPending}
                hideIcon={true}
              />
            }
          />
        </div>
      )}
    </Form>
  );
};

export default BookingFormContent;
