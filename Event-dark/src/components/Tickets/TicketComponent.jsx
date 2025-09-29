import React from 'react';
import { useRouter } from 'next/router';
import TicketByEvent from '../Events/DashboardEvents/TicketByEvent';
import { Card } from 'react-bootstrap';

const TicketComponent = () => {
  const router = useRouter();
  const { id, name } = router.query;

  return (
    <Card>
      <Card.Body>
        {/* Only render when id is defined (client-side hydration check) */}
        {id && (
          <TicketByEvent eventId={id} eventName={name} showEventName={true} />
        )}
      </Card.Body>
    </Card>
  );
};

export default TicketComponent;
