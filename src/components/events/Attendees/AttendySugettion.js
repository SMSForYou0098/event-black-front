import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Row, Col, Card, Image, Form, InputGroup } from 'react-bootstrap';
import { useMyContext } from "@/Context/MyContextProvider";
import { PlusIcon, Search, X } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import CustomDrawer from '@/utils/CustomDrawer';

const AttendySugettion = (props) => {
  const { requiredFields, data, showAddAttendeeModal, setShowAddAttendeeModal, setAttendeesList, quantity, openAddModal, totalAttendee, selectedAttendees, setSelectedAttendees } = props;
  const [searchTerm, setSearchTerm] = useState("");
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


  const filteredAttendees = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter(attendee =>
      ["name", "number", "email"].some(key =>
        String(attendee[key] || "")
          ?.toLowerCase()
          ?.includes(searchLower)
      )
    );
  }, [searchTerm, data]);

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
              onChange={(e) => setSearchTerm(e.target.value)}
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
        {filteredAttendees?.map((attendee, index) => {
          const isSelected = isAttendeeSelected(attendee);
          const isDisabled = selectedAttendees.length >= quantity && !isSelected;

          return (
            <Col md={4} xs={12} key={index} className="mb-2">
              <Card
                className={`p-0 card-glassmorphism shadow-none ${isSelected ? 'border-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                onClick={() => !isDisabled && handleSelectAttendee(attendee, index)}
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              >
                <Card.Body className="py-2 px-3">
                  <Row className="align-items-center g-2 flex-nowrap">

                    {/* Checkbox */}
                    <Col xs="auto" className="d-flex align-items-center pe-1">
                      <input
                        type="checkbox"
                        className="form-check-input m-0"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => { }}
                        style={{
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          width: '1.2rem',
                          height: '1.2rem',
                          marginTop: 0,
                          alignSelf: 'center'
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
                    <Col className="min-w-0 ps-2">
                      <div className="d-flex flex-column">

                        <p className="mb-0 text-truncate fw-bold" style={{ fontSize: '13px', lineHeight: '1.2' }}>
                          {attendee?.name}
                        </p>

                        <p className="mb-0 text-truncate text-muted" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                          {attendee?.number}
                        </p>

                        {attendee?.email && (
                          <p className="mb-0 text-truncate text-muted" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                            {attendee?.email}
                          </p>
                        )}

                      </div>
                    </Col>

                  </Row>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
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
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
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