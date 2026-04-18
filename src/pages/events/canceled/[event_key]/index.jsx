import React from 'react';
import { useRouter } from 'next/router';
import PaymentCanceledComponent from '@/components/events/PaymentCanceledComponent';

const PaymentCanceledPage = () => {
  const router = useRouter();
  const { event_key, session_id } = router.query;

  return <PaymentCanceledComponent event_key={event_key} session_id={session_id} />;
};

PaymentCanceledPage.layout = 'events';
export default PaymentCanceledPage;
