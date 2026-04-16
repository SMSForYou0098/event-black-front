import React from 'react';
import { useRouter } from 'next/router';
import PaymentWaitingComponent from '@/components/PaymentWaitingComponent';

const PaymentWaiting = () => {
    const router = useRouter();
    const { event_key, session_id } = router.query;

    const getSuccessRedirectPath = () => {
        return `/events/summary/${encodeURIComponent(event_key)}?session_id=${encodeURIComponent(session_id)}`;
    };

    const getFailureRedirectPath = () => {
        return `/events/cart/${encodeURIComponent(event_key)}`;
    };

    const getTimeoutRedirectPath = () => {
        return `/events/cart/${encodeURIComponent(event_key)}`;
    };

    return (
        <PaymentWaitingComponent
            event_key={event_key}
            session_id={session_id}
            getSuccessRedirectPath={getSuccessRedirectPath}
            getFailureRedirectPath={getFailureRedirectPath}
            getTimeoutRedirectPath={getTimeoutRedirectPath}
            showTimeoutAsSuccess={true}
        />
    );
};

PaymentWaiting.layout = 'events';
export default PaymentWaiting;
