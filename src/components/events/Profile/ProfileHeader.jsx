import React, { useRef } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { CheckCircle, Camera, Settings } from 'lucide-react';
import GlassCard from '../../../utils/ProfileUtils/GlassCard';
import AvatarImage from '../../../utils/ProfileUtils/AvatarImage';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';

const ProfileHeader = ({ user, onEditClick, onAvatarUpload, loading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("photo", file); // backend should expect `photo`
      onAvatarUpload(formData);       // call parent updateMutation
    }
  };
  return (
    <div className="custom-dark-bg">
      <Container>
        <GlassCard>
          <Row className="align-items-center">
            <Col md={2} className="text-center mb-3 mb-md-0">
              <div className="position-relative d-inline-block">
                <AvatarImage
                  src={user.avatar}
                  alt="Profile"
                  name={user.name}
                  size={100}
                />

                {/* Loader overlay when uploading */}
                {loading && (
                  <div
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ zIndex: 2 }}
                  >
                    <Spinner animation="border" size="sm" variant="light" />
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={loading}
                />

                <Button
                  variant="warning"
                  size="sm"
                  className="position-absolute px-1 px-3"
                  style={{
                    bottom: "-5px",
                    right: "-5px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ffc107, #fd7e14)",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" variant="dark" />
                  ) : (
                    <Camera size={16} />
                  )}
                </Button>
              </div>
            </Col>

            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <h2 className="mb-0 me-3">{user.name}</h2>
                {user.verified && (
                  <CustomBadge variant="outline-success" className="me-2">
                    <CheckCircle size={14} className="me-1" />
                    Verified
                  </CustomBadge>
                )}
              </div>
              <Row>
                {[
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email },
                  { label: "Number", value: user.phone },
                ].map((stat, index) => (
                  <Col key={index} xs={6} md={4} className="text-center mb-2">
                    <small className="text-muted">{stat.label}</small>
                    <h6 className="mb-0">{stat.value}</h6>
                  </Col>
                ))}
              </Row>
            </Col>

            <Col md={2} className="text-center">
              <CustomBadge
                variant="outline-primary"
                className="py-2 d-flex align-items-center w-50 cursor-pointer"
                onClick={onEditClick}
              >
                <Settings size={16} className="me-1" />
                Edit Profile
              </CustomBadge>
            </Col>
          </Row>
        </GlassCard>
      </Container>
    </div>
  );
};

export default ProfileHeader;
