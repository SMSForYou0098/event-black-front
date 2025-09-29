// components/events/Profile/UserProfileModal.tsx
import React, { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { X, Save, LoaderCircle } from "lucide-react";
import CustomBtn from "../../../utils/CustomBtn";
import { CustomHeader } from "../../../utils/ModalUtils/CustomModalHeader";

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
        <CustomHeader title="Edit Profile" closable onClose={handleCloseEdit}/>
        <Modal.Body className="p-0 p-3">
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
              className="card-glassmorphism__input"
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
              className="card-glassmorphism__input"
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

          <div className="text-muted text-center small">
            To change your photo, click the camera icon below the profile picture.
          </div>

        </Modal.Body>
        <Modal.Footer>
          <CustomBtn
            type="button"
            className="btn-sm"
            variant="secondary"
            disabled={updateMutation?.isPending}
            icon={<X size={20}/>}
            buttonText={"Cancel"}
            HandleClick={handleCloseEdit}
          />

          <CustomBtn
            type="submit"
            variant="primary"
            className="btn-sm"
            disabled={updateMutation?.isPending}
            icon={
              updateMutation?.isPending ? (
                <LoaderCircle className="spin" />
              ) : (
                <Save size={20}/>
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
