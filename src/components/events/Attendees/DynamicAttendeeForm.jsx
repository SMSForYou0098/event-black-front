// DynamicAttendeeForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Button, Card, Form, Modal, InputGroup, Spinner } from "react-bootstrap";
import { api } from "@/lib/axiosInterceptor";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMyContext } from "@/Context/MyContextProvider";
import AttendySugettion from "./AttendySugettion";
import { Plus as PlusIcon, Users, Users2Icon, X } from "lucide-react";
import CustomDrawer from "@/utils/CustomDrawer";
import MobileTwoButtonFooter from "@/utils/MobileTwoButtonFooter";
import Swal from "sweetalert2";
import BookingsAttendee from "./BookingsAttendee";
import { processImageFile } from "../../CustomComponents/AttendeeStroreUtils";
import FaceDetector from "./FaceDetector";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectCheckoutDataByKey, updateAttendees } from "@/store/customSlices/checkoutDataSlice";
import CustomBtn from "../../../utils/CustomBtn";
import { getErrorMessage } from "@/utils/errorUtils";


const DynamicAttendeeForm = ({
  apiData = [],
  setAttendeesList,
  attendeeList,
  setAttendeeState,
  quantity = 1,
  event_id,
  AttendyView,
  setAttendees,
  setDisable,
  categoryId,
  getAttendees = () => { },
  isAgent = false,
  isCorporate = false,
  showAttendeeSuggetion = false,
  selectedTickets = null,
  setIsProceed = null,
  disable = false,
  showActions = true,
  requiredFields = [],
  loadingCategory,
  selectedAttendees, setSelectedAttendees

}) => {
  const { UserData, isMobile, authToken, successAlert, ErrorAlert, AskAlert } = useMyContext();
  const router = useRouter();
  const { k, event_key } = router.query ?? {};
  // Local state
  const [existingAttendee, setExistingAttendee] = useState([]);
  const [attendeeData, setAttendeeData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [errors, setErrors] = useState({});
  const fetchExistingAttendees = async () => {
    if (!UserData?.id || !categoryId || !event_id) return [];

    const url = isCorporate
      ? `/corporate-attendee/${UserData.id}/${categoryId}`
      : `/user-attendee/${UserData.id}/${categoryId}/${event_id}?isAgent=${isAgent ? 1 : 0}`;

    const resp = await api.get(url);
    // return attendees array or empty
    const { status, attendees = [] } = resp.data ?? {};
    return status && Array.isArray(attendees) ? attendees : [];
  };

  const data = useSelector((state) => (k ? selectCheckoutDataByKey(state, k) : null));
  const attendeesFromRedux =
    Array.isArray(data?.attendees)
      ? data?.attendees
      : Array.isArray(data?.data?.attendees)
        ? data.data?.attendees
        : [];
  const { data: fetchedAttendees = [], refetch: refetchExisting } = useQuery({
    queryKey: ["existingAttendees", UserData?.id, categoryId, isCorporate, isAgent, event_id],
    queryFn: fetchExistingAttendees,
    enabled: !!UserData?.id && !!categoryId && !!event_id && showAttendeeSuggetion,
    // staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {

    },
    onError: (err) => {
      console.error("Failed to fetch existing attendees", err);
      ErrorAlert(getErrorMessage(err, "Failed to fetch existing attendees"));
    }
  });


  useEffect(() => {
    if (attendeesFromRedux.length === 0 && fetchedAttendees.length > 0) {
      if (fetchedAttendees && Array.isArray(fetchedAttendees)) {
        setShowAddAttendeeModal(true)
      }
      else {
        setShowAddAttendeeModal(false)
      }

    }
  }, [fetchedAttendees]);
  // When parent wants suggestion panel initially

  // keep parent updated whenever attendeeList changes
  useEffect(() => {
    setAttendees?.(attendeeList);
    getAttendees?.(attendeeList);
  }, [attendeeList]);

  // Field change handler
  const handleFieldChange = (fieldName, value) => {
    setAttendeeData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error for this field as user types
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  // Comprehensive validation: checks ALL fields from apiData + attendeeData keys
  // Required fields → emptiness + format, Non-required fields → format only (if filled)
  const validateAttendeeData = (attData = {}, requiredFieldsList = [], allFields = []) => {
    const newErrors = {};

    // Gather all field names from apiData AND attendeeData keys (deduplicated)
    const apiFieldNames = allFields.map((f) => f.field_name);
    const dataKeys = Object.keys(attData).filter((k) => k !== 'missingFields' && k !== 'id');
    const allFieldNames = [...new Set([...apiFieldNames, ...dataKeys])];

    allFieldNames.forEach((field) => {
      const value = attData[field] ?? "";
      const isRequired = requiredFieldsList.includes(field);
      const lower = field.toLowerCase();
      const isEmailField = /email/i.test(field);
      const isPhoneField = ["number", "phone number", "mobile number", "contact_number", "mo", "phone", "contact number"].includes(lower) || /phone|contact|mobile/i.test(field);

      // Check if value is empty
      const isEmpty = value instanceof File ? !value
        : typeof value === "string" ? !value.trim()
          : !value;

      // Required field: must not be empty
      if (isRequired && isEmpty) {
        newErrors[field] = `${field} is required`;
        return;
      }

      // Format checks (only if field has a value)
      if (!isEmpty) {
        if (isEmailField && typeof value === "string") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field] = `${field} must be a valid email address`;
          }
        }
        if (isPhoneField) {
          if (!/^\d{10}$/.test(String(value || ""))) {
            newErrors[field] = `${field} must be a valid 10-digit number`;
          }
        }
      }
    });

    return newErrors;
  };

  const handleOpenModal = (index = null) => {
    if (index !== null && attendeeList[index]) {
      setAttendeeData(attendeeList[index]);
      setEditingIndex(index);
    } else {
      setAttendeeData({});
      setEditingIndex(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
    setAttendeeData({});
  };

  const handleAddAttendee = async () => {
    const newErrors = validateAttendeeData(attendeeData, requiredFields, apiData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const missingFields = requiredFields.filter((f) => !attendeeData[f] || attendeeData[f] === "");

    if (editingIndex !== null) {
      const updated = [...attendeeList];
      updated[editingIndex] = { ...attendeeData, missingFields };
      setAttendeesList(updated);
    } else {
      const updated = [...attendeeList, { ...attendeeData, missingFields }];
      setAttendeesList(updated);
    }

    handleCloseModal();
  };

  const handleDeleteAttendee = (index) => {
    AskAlert(
      "You won't be able to revert this!",
      "Yes, delete it!",
      "The attendee has been deleted."
    ).then((confirmed) => {
      if (!confirmed) return;

      // 1️⃣ Create the updated attendee list (remove deleted one)
      const updatedList = attendeeList.filter((_, i) => i !== index);
      setAttendeesList(updatedList);

      // 2️⃣ Keep only those selected attendees whose IDs are still present
      const validIds = new Set(updatedList.map((a) => a.id));
      const updatedSelected = selectedAttendees.filter((attendee) =>
        validIds.has(attendee.id)
      );
      setSelectedAttendees(updatedSelected);

      // 3️⃣ Success message
      successAlert?.("The attendee has been deleted.");
    });
  };

  // Add this helper function at the top of your component (after imports)
  // Add this helper function at the top of your component (after imports)
  const parseFieldOptions = (options) => {
    if (!options) return [];
    if (Array.isArray(options)) return options;

    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse field options:', e);
      return [];
    }
  };

  // Updated renderField function
  const renderField = (field) => {
    const { field_name, lable, field_type, field_options = [], field_required } = field;
    const required = field_required === true;
    const value = attendeeData[field_name] ?? "";
    const lbl = required ? `${lable} <span class="text-primary">*</span>` : lable;

    const onChange = async (e) => {
      // handle react-select option or native input
      const val = e?.target ? e.target.value : e;

      // file handling
      if (e?.target?.type === "file") {
        const file = e.target.files[0];
        if (!file) return;

        // If photo-like field: try face detect + crop
        if (
          field_name?.toLowerCase().includes("photo") ||
          lable?.toLowerCase().includes("photo") ||
          field_name?.toLowerCase().includes("passport_size_photo") ||
          lable?.toLowerCase().includes("passport_size_photo")
        ) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
            try {
              const faceImageBase64 = await FaceDetector.cropFaceFromImage(ev.target.result);
              if (faceImageBase64) {
                handleFieldChange(field_name, faceImageBase64);
              } else {
                ErrorAlert('Face Not Detected, Please Upload Proper Image')
                const processed = await processImageFile(file);
                handleFieldChange(field_name, processed || file);
              }
            } catch (err) {
              const processed = await processImageFile(file);
              handleFieldChange(field_name, processed || file);
            }
          };
          reader.readAsDataURL(file);
          return;
        }

        const processedFile = await processImageFile(file);
        handleFieldChange(field_name, processedFile || file);
        return;
      }

      // select components that return {label, value}
      if (val && typeof val === "object" && val.value !== undefined) {
        handleFieldChange(field_name, val.value);
        return;
      }

      // checkbox / radio may pass event
      handleFieldChange(field_name, val);
    };

    switch (field_type) {
      case "text":
      case "email":
        const isPhone = ["number", "phone number", "mobile number", "contact_number", "mo", "phone", "contact number"].includes(field_name.toLowerCase()) || /phone|contact|mobile/i.test(field_name);
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <Form.Control
              className={`card-glassmorphism__input ${errors[field_name] ? 'border-danger' : ''}`}
              style={{ fontSize: '12px', ... (errors[field_name] ? { border: '1px solid #b51515' } : {}) }}
              type={isPhone ? "tel" : field_type}
              size="sm"
              value={value}
              onChange={(e) => {
                const val = e.target.value;
                if (isPhone && val.length > 10) return;
                onChange(e);
              }}
              required={required}
              isInvalid={!!errors[field_name]}
              maxLength={isPhone ? 10 : undefined}
            />
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );

      case "select":
        const selectOptions = parseFieldOptions(field_options);
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <Form.Select
              className={`card-glassmorphism__input ${errors[field_name] ? 'border-danger' : ''}`}
              style={{ fontSize: '12px', ... (errors[field_name] ? { border: '1px solid #b51515' } : {}) }}
              size="sm"
              value={value}
              onChange={onChange}
              required={required}
              isInvalid={!!errors[field_name]}
            >
              <option value="">Select {lable}</option>
              {selectOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );

      case "radio":
        const radioOptions = parseFieldOptions(field_options);
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <div className="d-flex gap-3 flex-wrap">
              {radioOptions.map((option, idx) => (
                <div key={idx} className="form-check d-flex align-items-center gap-2" style={{ fontSize: '12px', paddingLeft: 0 }}>
                  <input
                    className={`form-check-input m-0 ${errors[field_name] ? 'border-danger' : ''}`}
                    style={{
                      width: '1.2rem',
                      height: '1.2rem',
                      position: 'relative',
                      ...(errors[field_name] ? { border: '1px solid #b51515' } : {})
                    }}
                    type="radio"
                    id={`${field_name}-${idx}`}
                    name={field_name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field_name, e.target.value)}
                    required={required}
                  />
                  <label
                    className="form-check-label text-white mt-1"
                    htmlFor={`${field_name}-${idx}`}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );

      case "checkbox":
        const checkboxOptions = parseFieldOptions(field_options);
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <div className="d-flex flex-row flex-wrap gap-3">
              {checkboxOptions.map((option, idx) => (
                <div key={idx} className="form-check d-flex align-items-center gap-2" style={{ fontSize: '12px', paddingLeft: 0 }}>
                  <input
                    className={`form-check-input m-0 ${errors[field_name] ? 'border-danger' : ''}`}
                    style={{
                      width: '1.2rem',
                      height: '1.2rem',
                      position: 'relative',
                      ...(errors[field_name] ? { border: '1px solid #b51515' } : {})
                    }}
                    type="checkbox"
                    id={`${field_name}-${idx}`}
                    value={option}
                    checked={(Array.isArray(value) ? value : []).includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleFieldChange(field_name, newValues);
                    }}
                    required={required && idx === 0}
                  />
                  <label
                    className="form-check-label text-white mt-1"
                    htmlFor={`${field_name}-${idx}`}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );

      case "textarea":
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <Form.Control
              className={`card-glassmorphism__input ${errors[field_name] ? 'border-danger' : ''}`}
              style={{ fontSize: '12px', ... (errors[field_name] ? { border: '1px solid #b51515' } : {}) }}
              as="textarea"
              rows={2}
              size="sm"
              value={value}
              onChange={onChange}
              required={required}
              isInvalid={!!errors[field_name]}
            />
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );

      case "number": {
        const isPhone = ["number", "phone number", "mobile number", "contact_number", "mo", "phone", "contact number"].includes(field_name.toLowerCase()) || /phone|contact|mobile/i.test(field_name);
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <Form.Control
              className={`card-glassmorphism__input ${errors[field_name] ? 'border-danger' : ''}`}
              style={{ fontSize: '12px', ... (errors[field_name] ? { border: '1px solid #b51515' } : {}) }}
              type={isPhone ? "tel" : "number"}
              size="sm"
              value={value}
              onChange={(e) => {
                const val = e.target.value;
                if (isPhone && val.length > 10) return;
                onChange(e);
              }}
              required={required}
              isInvalid={!!errors[field_name]}
              maxLength={isPhone ? 10 : undefined}
            />
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );
      }

      case "date":
        return (
          <Form.Group className="mb-2">
            <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
            <Form.Control
              className={`card-glassmorphism__input ${errors[field_name] ? 'border-danger' : ''}`}
              style={{ fontSize: '12px', ... (errors[field_name] ? { border: '1px solid #b51515' } : {}) }}
              type="date"
              size="sm"
              value={value}
              onChange={onChange}
              required={required}
              isInvalid={!!errors[field_name]}
            />
            {errors[field_name] && (
              <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
            )}
          </Form.Group>
        );

      case "file": {
        // Determine image preview source
        const getPreviewSrc = () => {
          if (!value) return null;
          // base64 string (from face detection or existing data)
          if (typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))) return value;
          // File or Blob object
          if (value instanceof File || value instanceof Blob) return URL.createObjectURL(value);
          return null;
        };
        const previewSrc = getPreviewSrc();

        return (
          <div className="mb-2">
            <Form.Group className="mb-1">
              <Form.Label className="text-white mb-1" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control
                className={`card-glassmorphism__input ${errors[field_name] ? 'border-danger' : ''}`}
                style={{ fontSize: '12px', ... (errors[field_name] ? { border: '1px solid #b51515' } : {}) }}
                type="file"
                size="sm"
                accept="image/*"
                onChange={onChange}
                required={required && !value}
                isInvalid={!!errors[field_name]}
              />
              {errors[field_name] && (
                <Form.Text className="fw-bold d-block mt-1" style={{ color: '#b51515', fontSize: '11px' }}>{errors[field_name]}</Form.Text>
              )}
            </Form.Group>

            {/* Image preview */}
            {previewSrc && (
              <div className="mt-1 d-flex align-items-center gap-2">
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="rounded-3 border border-secondary"
                  style={{ width: 48, height: 48, objectFit: 'cover' }}
                />
                <small className="text-success fw-semibold" style={{ fontSize: '11px' }}>Uploaded</small>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };


  // Back button
  const Back = () => {
    router.back();
  };

  const headerContent = (
    <div className="d-flex align-items-center justify-content-between w-100 px-3 py-2">
      <h5 className="m-0" style={{ fontSize: '16px' }}>{editingIndex !== null ? "Edit Attendee" : "Add Attendee Details"}</h5>
      {isMobile && <X size={20} className='text-muted cursor-pointer' onClick={handleCloseModal} />}
    </div>
  );

  const bodyContent = (
    <div className="p-3" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <Row className="g-2">
        {Array.isArray(apiData) && apiData.length > 0 ? (
          apiData.map((field, idx) => (
            <Col md={6} xs={12} key={idx} className="text-black mb-1">
              {renderField(field)}
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-muted" style={{ fontSize: '12px' }}>No fields configured.</p>
          </Col>
        )}
      </Row>
    </div>
  );

  const actionButtons = (
    <div className="d-flex gap-2 justify-content-center p-3 border-top border-secondary">
      {!isMobile && (
        <CustomBtn
          HandleClick={handleCloseModal}
          className="me-2 custom-dark-content-bg "
          icon={<i className="bi bi-x-lg"></i>}
          buttonText="Cancel"
          style={{ fontSize: '14px' }}
          size='sm'
        />
      )}
      <CustomBtn
        HandleClick={handleAddAttendee}
        className="custom-primary-bg border-0"
        icon={<i className="fa-solid fa-check"></i>}
        buttonText={editingIndex !== null ? "Update" : "Save"}
        style={{ fontSize: '14px' }}
        size='sm'
      />
    </div>
  );

  return (
    <>
      <Card className="mb-4 custom-dark-bg">
        <Card.Header className="d-flex custom-dark-bg justify-content-between align-items-center px-3 py-2">
          <h6 className="d-flex align-items-center gap-2 m-0" style={{ fontSize: '14px' }}>
            <Users className="custom-text-secondary" size={18} /> Attendees {`${attendeeList.length}/${quantity || 0}`}
          </h6>
          <div className="d-flex gap-2 align-items-center">
            <CustomBtn
              variant="secondary"
              className="d-flex align-items-center justify-content-center btn-sm py-1"
              HandleClick={Back}
              icon={<i className="fa-solid fa-arrow-left" style={{ fontSize: '12px' }}></i>}
            />
            {
              attendeeList?.length < quantity && (
                <CustomBtn
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-center btn-sm py-1"
                  HandleClick={() => setShowAddAttendeeModal(true)}
                  icon={<Users2Icon size={14} />}
                />
              )
            }
          </div>
        </Card.Header>
        <Card.Body className="custom-dark-bg p-3">
          {loadingCategory ? (
            <div className="d-flex align-items-center justify-content-center gap-2 py-3">
              <Spinner animation="border" size="sm" />
              <span className="text-muted" style={{ fontSize: '12px' }}>Loading attendee fields…</span>
            </div>
          ) : null}
          <BookingsAttendee
            attendeeList={attendeeList}
            apiData={apiData}
            handleOpenModal={handleOpenModal}
            handleDeleteAttendee={handleDeleteAttendee}
            ShowAction={showActions}
          />
          {attendeeList?.length < quantity && (
            <div className="d-flex justify-content-center mt-3">
              <CustomBtn
                HandleClick={() => handleOpenModal()}
                className="d-flex align-items-center gap-2 custom-primary-bg border-0 py-2"
                icon={<PlusIcon size={18} />}
                buttonText="Add Attendee"
                style={{ fontSize: '14px' }}
              />
            </div>
          )}
        </Card.Body>
      </Card>
      {/* {attendeeList?.length < quantity && showAttendeeSuggetion && attendeeList?.length === 0 && */}
      <AttendySugettion
        quantity={quantity}
        totalAttendee={attendeeList?.length}
        list={attendeeList}
        showAddAttendeeModal={showAddAttendeeModal}
        setShowAddAttendeeModal={setShowAddAttendeeModal}
        data={fetchedAttendees}
        openAddModal={setShowModal}
        requiredFields={requiredFields}
        setAttendeesList={setAttendeesList}
        selectedAttendees={selectedAttendees}
        setSelectedAttendees={setSelectedAttendees}
      />
      {/* }  */}
      {/* )} */}

      {/* Modal / Drawer for add/edit attendee */}
      {isMobile ? (
        <CustomDrawer
          showOffcanvas={showModal}
          setShowOffcanvas={setShowModal}
          title={headerContent}
          placement="bottom"
          className="bg-dark text-white"
          headerClassName="p-0 border-bottom border-secondary"
          style={{ height: '85vh' }}
        >
          {/* Scrollable Content */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              paddingBottom: '80px', // space for sticky footer
              minHeight: 0,         // critical: allows flex child to shrink & scroll
            }}
            className="px-2 pt-3"
          >
            <Row className="g-2">
              {Array.isArray(apiData) && apiData.length > 0 ? (
                apiData.map((field, idx) => (
                  <Col md={6} xs={12} key={idx} className="text-black mb-1">
                    {renderField(field)}
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-muted" style={{ fontSize: '12px' }}>No fields configured.</p>
                </Col>
              )}
            </Row>
          </div>

          {/* Sticky Footer */}
          <MobileTwoButtonFooter
            leftButton={
              <CustomBtn
                HandleClick={handleCloseModal}
                buttonText="Cancel"
                style={{ fontSize: '14px' }}
                size='sm'
                variant='secondary'
              />
            }
            rightButton={
              <CustomBtn
                HandleClick={handleAddAttendee}
                className=""
                buttonText={editingIndex !== null ? "Update" : "Save"}
                style={{ fontSize: '14px' }}
                size='sm'
              />
            }
          />
        </CustomDrawer>
      ) : (
        <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
          <Modal.Header className="p-0 border-bottom border-secondary" closeButton={false}>
            {headerContent}
          </Modal.Header>
          <Modal.Body className="p-0">
            {bodyContent}
            {actionButtons}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default DynamicAttendeeForm;
