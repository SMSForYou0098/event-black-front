import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Row, Col, Card, Image, Form, InputGroup } from 'react-bootstrap';
import { useMyContext } from "@/Context/MyContextProvider"; //done
import { PlusIcon, Search } from 'lucide-react';
import { CustomCheckbox } from '../../CustomComponents/CustomFormFields';
import CustomBtn from '../../../utils/CustomBtn';
const AttendySugettion = (props) => {
  const { requiredFields, data, showAddAttendeeModal, setShowAddAttendeeModal, setAttendeesList, quantity, openAddModal, totalAttendee } = props;
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { ErrorAlert, isMobile } = useMyContext()

  const handleSelectAttendee = (e, attendee, index) => {
    const isChecked = e.target.checked;

    // helper to extract a stable id from attendee object (try common fields)
    const getId = (a) => a?.id ?? a?._id ?? a?.iud ?? a?.uuid ?? null;
    const attId = getId(attendee);

    const missingFields = requiredFields
      .filter((field) => attendee[field] == null)
      .map((field) => field);

    setSelectedAttendees((prevSelected) => {
      // find-by-id helpers
      const alreadySelected = attId
        ? prevSelected.some((s) => getId(s) === attId)
        : prevSelected.includes(attendee);

      if (isChecked) {
        if (alreadySelected) {
          // already present — no change
          return prevSelected;
        }

        if (prevSelected.length < quantity) {
          const updatedSelected = [...prevSelected, attendee];

          // also add to attendeeList but avoid duplicates there too (compare by id)
          setAttendeesList((prevList) => {
            const existsInList = attId
              ? prevList.some((p) => getId(p) === attId)
              : prevList.some((p) => p === attendee);

            if (existsInList) return prevList;

            return [...prevList, { ...attendee, missingFields, index }];
          });

          return updatedSelected;
        } else {
          ErrorAlert("Maximum number of attendees reached");
          return prevSelected;
        }
      } else {
        // unchecked -> remove by id (if available) or by reference fallback
        const updatedSelected = attId
          ? prevSelected.filter((item) => getId(item) !== attId)
          : prevSelected.filter((item) => item !== attendee);

        setAttendeesList((prevList) =>
          attId ? prevList.filter((item) => getId(item) !== attId) : prevList.filter((item) => item !== attendee)
        );

        return updatedSelected;
      }
    });
  };

  const handleConfirmAttendees = () => {

    setShowAddAttendeeModal(false);
  };
  const HandleClose = () => {
    console.log('Selected Attendees:', selectedAttendees);
    if (quantity !== totalAttendee) {
      openAddModal(true)
    }
    setShowAddAttendeeModal(false);
  }
  const filteredAttendees = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter(attendee =>
      ["Name", "Mo", "Email"].some(key =>
        String(attendee[key] || "")
          ?.toLowerCase()
          ?.includes(searchLower)
      )
    );
  }, [searchTerm, data]);
  // console.log('isMobile', isMobile);
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
          {filteredAttendees?.map((attendee, index) => (
            <Col md={4} key={index}>
              <Card className='p-0 card-glassmorphism cursor-pointer shadow-none'>
                <Card.Body>
                  <div className=" d-flex align-items-center gap-2">
                    <CustomCheckbox
                      disabled={
                        selectedAttendees.length >= quantity &&
                        !selectedAttendees.includes(attendee)
                      }
                      validationMessage="Checkbox is required"
                      onChange={(e) => handleSelectAttendee(e, attendee, index)}
                    />
                    <div className="custom-checkbox-label">
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex">
                          {attendee?.Photo &&
                            <Image
                              loading='lazy'
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                              src={`${attendee?.Photo}?v=${new Date().getTime()}`} // forces reload
                              alt='attendee Image'
                            />
                          }
                        </div>
                        <div className="d-flex flex-column">
                          <p className='m-0 p-0'>
                            <strong>Name:</strong> {attendee?.Name}
                          </p>
                          <p className='m-0 p-0'>
                            <strong>Number:</strong> {attendee?.Mo}
                          </p>
                          {
                            attendee?.Email &&
                            <p>
                              <strong>Email:</strong> {attendee?.Email}
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="d-flex justify-content-center m-3">
          <CustomBtn
            // variant="secondary"
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