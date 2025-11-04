import React, { useRef } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { CheckCircle, Camera, Settings } from 'lucide-react';
import GlassCard from '../../../utils/ProfileUtils/GlassCard';
import AvatarImage from '../../../utils/ProfileUtils/AvatarImage';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import { useIsMobile } from './../../../utils/consts';

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
  const isMobile = useIsMobile()
  return (
    <div className="custom-dark-bg">
      <Container>
        <GlassCard>
          <Row className="align-items-center" xs={2}>
            <Col md={2} xs={4} className="text-center mb-3 mb-md-0">
              <div className="position-relative d-inline-block">
                <AvatarImage
                  src={user.photo}
                  alt="Profile"
                  name={user.name}
                  size={isMobile ? 40 : 100}
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
                    bottom: isMobile ? "-20px" : "-5px",
                    right: isMobile ? "-20px" : "-5px",
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

            <Col md={7} xs={8}>
              <Row>
                {[
                  { label: "Name", value: user.name },
                  { label: "Number", value: user.phone },
                  { label: "Email", value: user.email, col: 8 },
                ].map((stat, index) => (
                  <Col key={index} xs={stat?.col ?? 6} md={4} className="mb-2 d-flex align-items-center gap-2 flex-column">
                    <small className="text-muted">{stat.label}</small>
                    <div className='d-flex align-items-center gap-2'>
                      <h6 className="mb-0">{stat.value}</h6>
                      {stat.label == "Name" &&
                        <CustomBadge variant="outline-success" className="me-2">
                          <CheckCircle size={14} className="me-1" />
                          Verified
                        </CustomBadge>
                      }
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>

            <Col md="auto" xs={12} className=''>
              <CustomBadge
                variant="outline-primary"
                className="py-2 d-flex align-items-center cursor-pointer justify-content-center"
                onClick={onEditClick}
              >
                <Settings size={16} className="me-1" />
                Edit
              </CustomBadge>
            </Col>
          </Row>
        </GlassCard>
      </Container>
    </div>
  );
};

export default ProfileHeader;
