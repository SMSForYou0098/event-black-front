import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Row, Col, Card, Image, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useMyContext } from "@/Context/MyContextProvider";
import { PlusIcon, Search, X } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import CustomDrawer from '@/utils/CustomDrawer';
import { useInView } from 'react-intersection-observer';

const AttendySugettion = (props) => {
  const {
    requiredFields, data, showAddAttendeeModal, setShowAddAttendeeModal, setAttendeesList, quantity, openAddModal, totalAttendee, selectedAttendees, setSelectedAttendees,
    searchQuery, setSearchQuery, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading
  } = props;

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ErrorAlert, isMobile } = useMyContext()

  // Helper function to get a stable ID from attendee object
  const getId = (a) => a?.id ?? a?._id ?? a?.iud ?? a?.uuid ?? null;

  // Check if an attendee is selected
  const isAttendeeSelected = (attendee) => {
    const attId = getId(attendee);
    return attId
      ? selectedAttendees.some(s => getId(s) === attId)
      : selectedAttendees.includes(attendee);
  };

  const handleSelectAttendee = (attendee, index) => {
    const attId = getId(attendee);
    const isSelected = isAttendeeSelected(attendee);

    // If already selected, deselect it
    if (isSelected) {
      setSelectedAttendees(prev =>
        attId
          ? prev.filter(item => getId(item) !== attId)
          : prev.filter(item => item !== attendee)
      );

      setAttendeesList(prevList =>
        attId
          ? prevList.filter(item => getId(item) !== attId)
          : prevList.filter(item => item !== attendee)
      );
      return;
    }

    // If not selected, check if we can add more
    if (selectedAttendees.length >= quantity) {
      ErrorAlert("Maximum number of attendees reached");
      return;
    }

    // Add to selected attendees
    const missingFields = requiredFields
      .filter((field) => attendee[field] == null)
      .map((field) => field);

    setSelectedAttendees(prev => [...prev, attendee]);

    // Add to attendees list if not already there
    setAttendeesList(prevList => {
      const existsInList = attId
        ? prevList.some(p => getId(p) === attId)
        : prevList.includes(attendee);

      if (existsInList) return prevList;

      return [...prevList, { ...attendee, missingFields, index }];
    });
  };

  const handleConfirmAttendees = () => {
    setShowAddAttendeeModal(false);
  };

  const HandleClose = () => {
    if (quantity !== totalAttendee) {
      openAddModal(true)
    }
    setShowAddAttendeeModal(false);
  }

  // Auto-close modal when required quantity is reached
  useEffect(() => {
    if (selectedAttendees?.length === quantity && showAddAttendeeModal) {
      setShowAddAttendeeModal(false);
    }
  }, [selectedAttendees?.length, quantity, showAddAttendeeModal, setShowAddAttendeeModal]);


  // Remote filtering handled by query already

  const headerContent = (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-between w-100 px-3 py-2">
      <div className='d-flex align-items-center'>
        <p className='m-0 p-0 fw-bold' style={{ fontSize: '14px' }}>Attendees</p>
        <span className='text-muted m-0 p-0' style={{ fontSize: '12px' }}>&nbsp;(select max {quantity})</span>
      </div>
      <div className='d-flex align-items-center gap-2'>
        <Form.Group className="mt-2 mt-md-0" controlId="searchAttendees">
          <InputGroup size="sm">
            <Form.Control
              type="text"
              className="custom-dark-content-bg border-0 rounded-3 rounded-end-0"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '12px', minWidth: isMobile ? '120px' : '200px' }}
            />
            <Button
              variant="primary"
              className="rounded-3 rounded-start-0 py-1" id="button-search">
              <Search size={14} className='fw-bold' />
            </Button>
          </InputGroup>
        </Form.Group>
        {isMobile && <X size={20} className='text-muted cursor-pointer ms-2' onClick={() => HandleClose()} />}
      </div>
    </div>
  );

  const bodyContent = (
    <div className={`${isMobile ? 'p-2' : 'p-3'}`}>
      <Row className='g-3 overflow-auto custom-scrollbar' style={{ maxHeight: isMobile ? '70vh' : '40rem' }}>
        {isLoading && (
          <Col xs={12} className="text-center py-3">
            <Spinner animation="border" size="sm" variant="primary" />
          </Col>
        )}
        {data?.map((attendee, index) => {
          const isSelected = isAttendeeSelected(attendee);
          const isDisabled = selectedAttendees.length >= quantity && !isSelected;

          return (
            <Col md={4} xs={12} key={index} className="mb-2">
              <Card
                className={`h-100 p-0 card-glassmorphism shadow-sm attendee-card ${isSelected ? 'border-primary border-2' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                onClick={() => !isDisabled && handleSelectAttendee(attendee, index)}
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : '' }}
              >
                <Card.Body className="py-2 px-3">
                  <Row className="align-items-center g-2 flex-nowrap">

                    {/* Checkbox */}
                    <Col xs="auto" className="d-flex align-items-center pe-2">
                      <input
                        type="checkbox"
                        className="form-check-input m-0 cursor-pointer"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => { }}
                        style={{
                          width: '18px',
                          height: '18px',
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.4)',
                        }}
                      />
                    </Col>

                    {/* Image */}
                    <Col xs="auto" className="d-flex align-items-center px-1">
                      {attendee?.Photo && (
                        <Image
                          loading="lazy"
                          src={`${attendee?.Photo}?v=${new Date().getTime()}`}
                          alt="attendee Image"
                          style={{
                            width: '42px',
                            height: '42px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                    </Col>

                    {/* Details */}
                    <Col className="min-w-0 ps-2 d-flex flex-column justify-content-center">
                      <p className="mb-1 text-truncate fw-semibold text-white" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                        {attendee?.name || <span className="text-muted fst-italic">No Name Provided</span>}
                      </p>

                      {attendee?.number && (
                        <p className="mb-1 text-truncate text-white-50 d-flex align-items-center gap-1" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                          <i className="fa-solid fa-phone" style={{ fontSize: '10px' }}></i> {attendee.number}
                        </p>
                      )}

                      {attendee?.email && (
                        <p className="mb-0 text-truncate text-white-50 d-flex align-items-center gap-1" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                          <i className="fa-solid fa-envelope" style={{ fontSize: '10px' }}></i> {attendee.email}
                        </p>
                      )}
                    </Col>

                  </Row>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        {isFetchingNextPage && (
          <Col xs={12} className="text-center py-2">
            <Spinner animation="border" size="sm" variant="primary" />
          </Col>
        )}
        <div ref={ref} style={{ height: '10px' }}></div>
      </Row>
      <div className="d-flex justify-content-center mt-3 gap-2">
        <CustomBtn
          className=""
          HandleClick={() => HandleClose()}
          icon={<PlusIcon size={16} />}
          disabled={quantity === selectedAttendees?.length}
          buttonText={`Add New ${!isMobile ? 'Attendee' : ''}`}
          style={{ fontSize: '14px' }}
          variant="secondary"
          size='sm'
        />
        <CustomBtn
          variant="primary"
          icon={<i className="fa-solid fa-check" style={{ fontSize: '14px' }}></i>}
          HandleClick={handleConfirmAttendees}
          buttonText={`Confirm${!isMobile ? ' Selection' : ''}`}
          style={{ fontSize: '14px' }}
          size='sm'
        />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media (min-width: 992px) {
          .custom-wide-modal {
            max-width: 90vw !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
        .attendee-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .attendee-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3) !important;
        }
        .attendee-card.border-primary {
          box-shadow: 0 0 0 1px var(--bs-primary) !important;
        }
      `}</style>

      {isMobile ? (
        <CustomDrawer
          showOffcanvas={showAddAttendeeModal}
          setShowOffcanvas={setShowAddAttendeeModal}
          title={headerContent}
          placement="bottom"
          className="bg-dark text-white"
          headerClassName="p-0 border-bottom border-secondary"
          style={{ height: '85vh' }}
        >
          {bodyContent}
        </CustomDrawer>
      ) : (
        <Modal dialogClassName="custom-wide-modal" show={showAddAttendeeModal} onHide={() => HandleClose()} size='xl' centered>
          <Modal.Header className="p-0 border-bottom border-secondary">
            {headerContent}
          </Modal.Header>
          <Modal.Body className="p-0">
            {bodyContent}
          </Modal.Body>
        </Modal>
      )}
    </>
  )
}

export default AttendySugettion