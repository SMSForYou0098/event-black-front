// DynamicAttendeeForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Button, Card, Form, Modal, InputGroup, Spinner } from "react-bootstrap";
import Select from "react-select";
import { api } from "@/lib/axiosInterceptor";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMyContext } from "@/Context/MyContextProvider";
import AttendySugettion from "./AttendySugettion";
import { Plus as PlusIcon, Users } from "lucide-react";
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
  loadingCategory

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
    if (!UserData?.id || !categoryId) return [];

    const url = isCorporate
      ? `/corporate-attendee/${UserData.id}/${categoryId}`
      : `/user-attendee/${UserData.id}/${categoryId}?isAgent=${isAgent ? 1 : 0}`;

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
    queryKey: ["existingAttendees", UserData?.id, categoryId, isCorporate, isAgent],
    queryFn: fetchExistingAttendees,
    enabled: !!UserData?.id && !!categoryId && showAttendeeSuggetion,
    staleTime: 5 * 60 * 1000,
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
  };

  // Basic validation function (keeps logic from your desired version)
  const validateAttendeeData = (attData = {}, requiredFieldsList = []) => {
    const newErrors = {};
    requiredFieldsList.forEach((field) => {
      const value = attData[field] ?? "";
      if (value instanceof File) {
        if (!value) newErrors[field] = `${field} is required`;
        return;
      }
      if (typeof value === "string" && !value.trim()) {
        newErrors[field] = `${field} is required`;
      }
      // number-ish checks for commonly named fields
      const lower = field.toLowerCase();
      if (["number", "phone number", "mobile number", "contact_number", "mo"].includes(lower)) {
        if (!/^\d{10}$/.test(String(value || ""))) newErrors[field] = `${field} must be a valid 10-digit number`;
      }
      if (/email/i.test(field)) {
        if (typeof value !== "string" || !value.trim()) newErrors[field] = `${field} is required`;
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[field] = `${field} must be a valid email address`;
      }
    });

    // if no explicit required email field, still validate any email typed
    if (!requiredFieldsList.includes("email")) {
      const emailField = Object.keys(attData).find((f) => /email/i.test(f));
      if (emailField && typeof attData[emailField] === "string" && attData[emailField].trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attData[emailField])) {
          newErrors[emailField] = `${emailField} must be a valid email address`;
        }
      }
    }

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
    const newErrors = validateAttendeeData(attendeeData, requiredFields);
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
    AskAlert("You won't be able to revert this!", "Yes, delete it!", "The attendee has been deleted.")
      .then((confirmed) => {
        if (confirmed) {
          const updatedList = attendeeList.filter((_, i) => i !== index);
          setAttendeesList(updatedList);
          successAlert?.("The attendee has been deleted.");
        }
      });
  };




  // renderField - similar to your version but uses handleFieldChange
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
                // fallback to raw file
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
              <Form.Control className="card-glassmorphism__input" type={field_type} value={value} onChange={onChange} required={required} />
            </Form.Group>
            <Form.Text className="text-primary fw-bold">{errors[field_name] || ""}</Form.Text>
          </>
        );

      case "select":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Select
                value={value ? { label: value, value } : null}
                options={(() => {
                  try {
                    return JSON.parse(field_options).map((opt) => ({ label: opt, value: opt }));
                  } catch (e) {
                    return [];
                  }
                })()}
                className="card-glassmorphism__input"
                onChange={(opt) => onChange(opt)}
                isRequired={required}
              />
            </Form.Group>
            <Form.Text className="text-primary fw-bold">{errors[field_name] || ""}</Form.Text>
          </>
        );

      case "textarea":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control className="card-glassmorphism__input" as="textarea" rows={3} value={value} onChange={onChange} required={required} />
            </Form.Group>
            <Form.Text className="text-primary fw-bold">{errors[field_name] || ""}</Form.Text>
          </>
        );

      case "number":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control className="card-glassmorphism__input" type="number" value={value} onChange={onChange} required={required} />
            </Form.Group>
            <Form.Text className="text-primary fw-bold">{errors[field_name] || ""}</Form.Text>
          </>
        );

      case "date":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control className="card-glassmorphism__input" type="date" value={value} onChange={onChange} required={required} />
            </Form.Group>
            <Form.Text className="text-primary fw-bold">{errors[field_name] || ""}</Form.Text>
          </>
        );

      case "file":
        return (
          <>
            <Form.Group>
              <Form.Label className="text-white" dangerouslySetInnerHTML={{ __html: lbl }} />
              <Form.Control className="card-glassmorphism__input" type="file" accept="image/*" onChange={onChange} required={required} />
            </Form.Group>
            <Form.Text className="text-primary fw-bold">{errors[field_name] || ""}</Form.Text>
          </>
        );

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
          <h5 className="d-flex align-items-center gap-2"><Users className="custom-text-secondary" /> Attendees {`${attendeeList.length}/${quantity || 0}`}</h5>
          <CustomBtn
            variant="outline-secondary"
            className="d-flex align-items-center gap-2  border-secondary"
            HandleClick={Back}
            icon={<i className="fa-solid fa-arrow-left"></i>}
          />
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
