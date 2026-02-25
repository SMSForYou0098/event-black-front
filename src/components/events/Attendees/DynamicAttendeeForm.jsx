// DynamicAttendeeForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Button, Card, Form, Modal, InputGroup, Spinner } from "react-bootstrap";
import { api } from "@/lib/axiosInterceptor";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMyContext } from "@/Context/MyContextProvider";
import AttendySugettion from "./AttendySugettion";
import { Plus as PlusIcon, Users, Users2Icon } from "lucide-react";
import Swal from "sweetalert2";
import BookingsAttendee from "./BookingsAttendee";
import { processImageFile } from "../../CustomComponents/AttendeeStroreUtils";
import FaceDetector from "./FaceDetector";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectCheckoutDataByKey, updateAttendees } from "@/store/customSlices/checkoutDataSlice";
import CustomBtn from "../../../utils/CustomBtn";

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
  showAttendeeSuggetion = true,
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
      ErrorAlert(err?.response?.data?.message || "Failed to fetch existing attendees");
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
    const required = field_required === 1;
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
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control
                className="card-glassmorphism__input"
                type={field_type}
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={!!errors[field_name]}
              />
              {errors[field_name] && (
                <Form.Text className="text-danger fw-bold d-block mt-1">{errors[field_name]}</Form.Text>
              )}
            </Form.Group>
          </>
        );

      case "select":
        const selectOptions = parseFieldOptions(field_options);
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="text-white mb-2" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Select
                className="card-glassmorphism__input"
                value={value}
                onChange={onChange}
                required={required}
              >
                <option value="">Select {lable}</option>
                {selectOptions.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {errors[field_name] && (
              <Form.Text className="text-danger fw-bold d-block mb-2">
                {errors[field_name]}
              </Form.Text>
            )}
          </>
        );

      case "radio":
        const radioOptions = parseFieldOptions(field_options);
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="text-white mb-2" dangerouslySetInnerHTML={{ __html: lbl }} />
              <div className="d-flex gap-3 flex-wrap">
                {radioOptions.map((option, idx) => (
                  <div key={idx} className="form-check">
                    <input
                      className="form-check-input p-2"
                      type="radio"
                      id={`${field_name}-${idx}`}
                      name={field_name}
                      value={option}
                      checked={value === option}
                      onChange={(e) => handleFieldChange(field_name, e.target.value)}
                      required={required}
                    />
                    <label
                      className="form-check-label text-white"
                      htmlFor={`${field_name}-${idx}`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>
            {errors[field_name] && (
              <Form.Text className="text-danger fw-bold d-block mb-2">
                {errors[field_name]}
              </Form.Text>
            )}
          </>
        );

      case "checkbox":
        const checkboxOptions = parseFieldOptions(field_options);
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="text-white mb-2" dangerouslySetInnerHTML={{ __html: lbl }} />
              <div className="d-flex flex-column gap-2">
                {checkboxOptions.map((option, idx) => (
                  <div key={idx} className="form-check">
                    <input
                      className="form-check-input"
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
                      className="form-check-label text-white"
                      htmlFor={`${field_name}-${idx}`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>
            {errors[field_name] && (
              <Form.Text className="text-danger fw-bold d-block mb-2">
                {errors[field_name]}
              </Form.Text>
            )}
          </>
        );

      case "textarea":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control
                className="card-glassmorphism__input"
                as="textarea"
                rows={3}
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={!!errors[field_name]}
              />
              {errors[field_name] && (
                <Form.Text className="text-danger fw-bold d-block mt-1">{errors[field_name]}</Form.Text>
              )}
            </Form.Group>
          </>
        );

      case "number":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control
                className="card-glassmorphism__input"
                type="number"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={!!errors[field_name]}
              />
              {errors[field_name] && (
                <Form.Text className="text-danger fw-bold d-block mt-1">{errors[field_name]}</Form.Text>
              )}
            </Form.Group>
          </>
        );

      case "date":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control
                className="card-glassmorphism__input"
                type="date"
                value={value}
                onChange={onChange}
                required={required}
                isInvalid={!!errors[field_name]}
              />
              {errors[field_name] && (
                <Form.Text className="text-danger fw-bold d-block mt-1">{errors[field_name]}</Form.Text>
              )}
            </Form.Group>
          </>
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
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control
                className="card-glassmorphism__input"
                type="file"
                accept="image/*"
                onChange={onChange}
                required={required && !value}
              />
              {errors[field_name] && (
                <Form.Text className="text-danger fw-bold d-block mt-1">{errors[field_name]}</Form.Text>
              )}
            </Form.Group>

            {/* Image preview */}
            {previewSrc && (
              <div className="mt-2 d-flex align-items-center gap-2">
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="rounded-3 border border-secondary"
                  style={{ width: 64, height: 64, objectFit: 'cover' }}
                />
                <small className="text-success fw-semibold">Image uploaded</small>
              </div>
            )}
          </>
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

  return (
    <>
      <Card className="mb-4 custom-dark-bg">
        <Card.Header className="d-flex custom-dark-bg justify-content-between align-items-center">
          <h5 className="d-flex align-items-center gap-2">
            <Users className="custom-text-secondary" /> Attendees {`${attendeeList.length}/${quantity || 0}`}
          </h5>
          <div className="d-flex gap-2 align-items-center">
            <CustomBtn
              variant="outline-secondary"
              className="d-flex align-items-center justify-content-center  btn-sm w-25"
              HandleClick={Back}
              icon={<i className="fa-solid fa-arrow-left"></i>}
            />
            <CustomBtn
              variant="outline-primary"
              className="d-flex align-items-center justify-content-center  btn-sm w-25"
              HandleClick={() => setShowAddAttendeeModal(true)}
              icon={<Users2Icon size={16} />}
            />
          </div>
        </Card.Header>
        <Card.Body className="custom-dark-bg">
          {loadingCategory ? (
            <div className="d-flex align-items-center justify-content-center gap-2 py-4">
              <Spinner animation="border" size="sm" />
              <span className="text-muted">Loading attendee fields…</span>
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
            <div className="d-flex justify-content-center">
              <CustomBtn
                HandleClick={() => handleOpenModal()}
                className="d-flex align-items-center gap-2 custom-primary-bg border-0"
                icon={<PlusIcon size={20} />}
                buttonText="Add Attendee"
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

      {/* Modal for add/edit attendee */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header className="border-0 p-0 p-4" closeButton>
          <h4>{editingIndex !== null ? "Edit Attendee" : "Add Attendee Details"}</h4>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            {Array.isArray(apiData) && apiData.length > 0 ? (
              apiData.map((field, idx) => (
                <Col md={6} key={idx} className="text-black mb-2">
                  {renderField(field)}
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-muted">No fields configured.</p>
              </Col>
            )}
          </Row>

          <div className="d-flex gap-3 justify-content-end mt-3">
            <CustomBtn
              HandleClick={handleCloseModal}
              className="me-2 custom-dark-content-bg border-0"
              icon={<i className="bi bi-x-lg"></i>}
              buttonText="Cancel"
            />
            <CustomBtn
              HandleClick={handleAddAttendee}
              className="custom-primary-bg border-0"
              icon={<i className="fa-solid fa-check"></i>}
              buttonText={editingIndex !== null ? "Update" : "Save"}
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DynamicAttendeeForm;
