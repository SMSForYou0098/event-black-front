import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Row, Col, Card, Image, Form, InputGroup } from 'react-bootstrap';
import { useMyContext } from "@/Context/MyContextProvider";
import { PlusIcon, Search } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';

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

  return (
    <Modal show={showAddAttendeeModal} onHide={() => HandleClose()} size='xl' centered>
      <Modal.Header className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-between p-2 px-4">
        <div className='d-flex align-items-center'>
          <p className='m-0 p-0'>Attendees</p>
          <span className='text-muted h6 m-0 p-0'>&nbsp;(select max {quantity})</span>
        </div>
        <Form.Group className="mt-2" controlId="searchAttendees">
          <InputGroup>
            <Form.Control
              type="text"
              className="custom-dark-content-bg border-0 rounded-3 rounded-end-0"
              placeholder="Search Attendees..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              className="rounded-3 rounded-start-0" id="button-search">
              <Search size={16} className='fw-bold' />
            </Button>
          </InputGroup>
        </Form.Group>
      </Modal.Header>
      <Modal.Body className="p-3">
        <Row className='g-3 overflow-auto' style={{ maxHeight: isMobile ? '25rem' : '40rem' }}>
          {filteredAttendees?.map((attendee, index) => {
            const isSelected = isAttendeeSelected(attendee);
            const isDisabled = selectedAttendees.length >= quantity && !isSelected;

            return (
              <Col md={4} key={index}>
                <Card
                  className={`p-0 card-glassmorphism cursor-pointer shadow-none ${isSelected ? 'border-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                  onClick={() => !isDisabled && handleSelectAttendee(attendee, index)}
                  style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => { }} // Empty handler to prevent React warning
                        // className="me-2"
                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', width: '1.5rem', height: '1.5rem', transform: 'scale(1.3)' }}
                      />
                      <div className="d-flex align-items-center gap-2 w-100">
                        <div className="d-flex">
                          {attendee?.Photo &&
                            <Image
                              loading='lazy'
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              src={`${attendee?.Photo}?v=${new Date().getTime()}`}
                              alt='attendee Image'
                            />
                          }
                        </div>
                        <div className="d-flex flex-column">
                          <p className='m-0 p-0'>
                            <strong>Name:</strong> {attendee?.name}
                          </p>
                          <p className='m-0 p-0'>
                            <strong>Number:</strong> {attendee?.number}
                          </p>
                          {attendee?.email &&
                            <p className='m-0 p-0'>
                              <strong>Email:</strong> {attendee?.email}
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        <div className="d-flex justify-content-center m-3">
          <CustomBtn
            className="me-2 custom-dark-content-bg border-0"
            HandleClick={() => HandleClose()}
            icon={<PlusIcon />}
            disabled={quantity === selectedAttendees?.length}
            buttonText={`Add New ${!isMobile ? 'Attendee' : ''}`}
          />
          <CustomBtn
            variant="primary"
            icon={<i className="fa-solid fa-check"></i>}
            HandleClick={handleConfirmAttendees}
            buttonText={`Confirm${!isMobile ? ' Selection' : ''}`}
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default AttendySugettion