// components/events/Profile/UserProfileModal.tsx
import React, { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { X, Save, LoaderCircle } from "lucide-react";
import CustomBtn from "../../../utils/CustomBtn";

const UserProfileModal = ({
  isEditing,
  formValues,
  handleChange,
  handleCloseEdit,
  handleEditSubmit,
  updateMutation,
}) => {
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validate = () => {
    const next = { name: "", email: "", phone: "" };
    let ok = true;

    // Name required
    if (!formValues.name?.trim()) {
      next.name = "Name is required";
      ok = false;
    }

    // Email required + basic format
    if (!formValues.email?.trim()) {
      next.email = "Email is required";
      ok = false;
    } else {
      // simple email regex
      // eslint-disable-next-line no-useless-escape
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(formValues.email)) {
        next.email = "Enter a valid email";
        ok = false;
      }
    }

    setErrors(next);
    return ok;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // don't allow double submit while pending
    if (updateMutation?.isPending) return;
    if (!validate()) return;
    // forward to parent handler
    handleEditSubmit(e);
  };

  return (
    <Modal show={isEditing} onHide={handleCloseEdit} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={formValues.name}
              onChange={(e) => {
                // clear error for this field as user types
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                handleChange(e);
              }}
              placeholder="Enter name"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formValues.email}
              onChange={(e) => {
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                handleChange(e);
              }}
              placeholder="Enter email"
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="text-muted small">
            Changing avatar? Click the camera icon on the header to upload.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <CustomBtn
            type="button"
            variant="secondary"
            disabled={updateMutation?.isPending}
            icon={<X />}
            buttonText={"Cancel"}
            HandleClick={handleCloseEdit}
          />

          <CustomBtn
            type="submit"
            variant="primary"
            disabled={updateMutation?.isPending}
            icon={
              updateMutation?.isPending ? (
                <LoaderCircle className="spin" />
              ) : (
                <Save />
              )
            }
            buttonText={updateMutation?.isPending ? "Saving..." : "Save"}
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserProfileModal;
