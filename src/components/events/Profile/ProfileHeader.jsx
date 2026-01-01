import React, { useRef } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { CheckCircle, Camera, PenLine } from 'lucide-react';
import AvatarImage from '../../../utils/ProfileUtils/AvatarImage';
import { useIsMobile } from '../../../utils/consts';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import Link from 'next/link';

const ProfileHeader = ({ user = {}, onEditClick, onAvatarUpload, loading }) => {
  const fileInputRef = useRef(null);
  const isMobile = useIsMobile();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);
      onAvatarUpload?.(formData);
    }
  };

  const avatarSrc =
    user?.photo ||
    `https://ui-avatars.com/api/?background=222222&color=fff&name=${encodeURIComponent(
      user?.name || 'U'
    )}`;

  return (
    <Container
      className="profile-header-bar position-relative"
      style={{
        background: '#151415',
        borderRadius: 12,
        padding: isMobile ? '12px 14px' : '16px 20px',
        height: '10rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Mobile: top-right tiny edit icon */}
      <Button
        type="button"
        onClick={onEditClick}
        disabled={!!loading}
        className="position-absolute d-flex d-md-none align-items-center justify-content-center"
        style={{
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: 8,
          padding: 0,
        }}
        variant="primary"
        aria-label="Edit profile"
      >
        <PenLine size={16} />
      </Button>

      <Container fluid className="px-0">
        <Row className="align-items-center g-3">
          {/* Left: Avatar + text */}
          <Col xs={12} md={9}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="position-relative"
                style={{ width: 100, height: 100 }}
              >
                <AvatarImage
                  src={avatarSrc}
                  alt={user?.name || 'User'}
                  name={user?.name}
                  size={100}
                />

                {/* loader overlay */}
                {loading && (
                  <div
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ zIndex: 2 }}
                  >
                    <Spinner animation="border" size="sm" variant="light" />
                  </div>
                )}

                {/* hidden input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  disabled={loading}
                />

                {/* camera button */}
                <Button
                  variant="warning"
                  size="sm"
                  className="position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    bottom: -6,
                    right: -6,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    padding: 0,
                    background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  aria-label="Change avatar"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" variant="dark" />
                  ) : (
                    <Camera size={14} />
                  )}
                </Button>
              </div>

              {/* Name + Verified badge + metadata */}
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <h5 className="mb-0 text-white fw-semibold" style={{ lineHeight: 1.1 }}>
                    {user?.name || '-'}
                  </h5>

                  {user?.name && (
                    <CustomBadge
                      variant="outline-success"
                      className="py-0 px-2 d-inline-flex align-items-center"
                      style={{ lineHeight: 2 }}
                    >
                      <CheckCircle size={14} className="me-1" />
                      <span className="small">Verified</span>
                    </CustomBadge>
                  )}
                </div>

                <div className="text-muted small mt-1">{user?.email || '-'}</div>
                <div className="text-muted small">{user?.username || user?.number || ''}</div>
                <Link href='/my-bookings'>View My Bookings</Link>
              </div>
            </div>
          </Col>

          {/* Desktop: Edit button on the right */}
          <Col xs={12} md="auto" className="ms-auto text-md-end d-none d-md-block">
            <Button
              type="button"
              onClick={onEditClick}
              disabled={!!loading}
              className="d-inline-flex align-items-center gap-1 px-2 py-1"
              variant="primary"
              style={{
                fontSize: '0.8rem',
                height: '28px',
                borderRadius: '8px',
              }}
            >
              <PenLine size={14} />
              Edit
            </Button>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ProfileHeader;
