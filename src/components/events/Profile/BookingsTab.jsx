import React from 'react';
import { Card, Form } from 'react-bootstrap';
import BookingCard from './BookingCard';
import GlassCard from './../../../utils/ProfileUtils/GlassCard';

const BookingsTab = ({ bookings ,userBookings,loading}) => {
  console.log('bbb',userBookings,loading);
  return(
  <GlassCard>
    <Card.Header className="d-flex justify-content-between align-items-center">
      <h5 className="mb-0">My Bookings</h5>
      <div className="d-flex gap-2">
        {['All Types', 'All Status'].map((placeholder, index) => (
          <Form.Select key={index} size="sm" className="bg-primary border-primary text-white fw-bold">
            <option>{placeholder}</option>
          </Form.Select>
        ))}
      </div>
    </Card.Header>
    <Card.Body className='px-0 px-sm-4'>
      {/* {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))} */}
      {userBookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </Card.Body>
  </GlassCard>
  )
};

export default BookingsTab;