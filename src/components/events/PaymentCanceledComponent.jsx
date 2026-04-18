import React, { useEffect, useMemo, useRef } from 'react';
import { Card, Container, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axiosInterceptor';
import { getErrorMessage } from '@/utils/errorUtils';
import { clearPendingPaymentFlow, getPendingPaymentFlow } from '@/utils/paymentSessionFlow';

const PaymentCanceledComponent = ({ event_key, session_id }) => {
  const router = useRouter();
  const hasRequestedRef = useRef(false);
  const redirectTimeoutRef = useRef(null);

  const scheduleCartRedirect = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    redirectTimeoutRef.current = setTimeout(() => {
      router.replace(`/events/cart/${encodeURIComponent(event_key)}`);
    }, 1000);
  };

  const pendingFlow = useMemo(() => getPendingPaymentFlow(), []);
  const resolvedSessionId = session_id || pendingFlow?.session_id || null;
  const resolvedEventId = pendingFlow?.event_id || null;
  const resolvedIsMaster = Boolean(pendingFlow?.is_master);

  const unlockMutation = useMutation({
    mutationFn: (payload) => api.post('/seats/unlock-pending-payment', payload),
    onSettled: () => {
      clearPendingPaymentFlow();
      scheduleCartRedirect();
    },
  });

  useEffect(() => {
    if (!router.isReady || !event_key || hasRequestedRef.current) return;

    hasRequestedRef.current = true;

    if (!resolvedSessionId) {
      clearPendingPaymentFlow();
      scheduleCartRedirect();
      return;
    }

    unlockMutation.mutate({
      session_id: resolvedSessionId,
      is_master: resolvedIsMaster,
      event_id: resolvedEventId,
    });

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [
    router,
    router.isReady,
    event_key,
    resolvedSessionId,
    resolvedEventId,
    resolvedIsMaster,
    unlockMutation,
  ]);

  const isLoading = unlockMutation.isPending;
  const status = unlockMutation.isSuccess ? 'success' : unlockMutation.isError ? 'error' : 'processing';
  const message =
    status === 'processing'
      ? 'We are checking your booking cancellation.'
      : status === 'success'
        ? 'Your booking request has been successfully cancelled. Redirecting you to the Tickets.'
        : null  
        // : getErrorMessage(unlockMutation.error, 'We could not complete cancellation confirmation at this time. Redirecting you to the cart.');

  return (
    <div className="cart-page">
      <Container className="py-5">
        <Card className="custom-dark-bg text-center mx-auto" style={{ maxWidth: '520px' }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              {isLoading && (
                <>
                  <Spinner animation="border" variant="warning" />
                  <div className="mt-3">
                    <AlertCircle size={46} className="text-warning" />
                  </div>
                </>
              )}
              {!isLoading && status === 'success' && <CheckCircle2 size={58} className="text-success" />}
              {!isLoading && status === 'error' && <XCircle size={58} className="text-danger" />}
            </div>

            <h4 className="text-white mb-3">
              {status === 'processing' && 'Booking Cancellation in Progress'}
              {status === 'success' && 'Booking Cancelled'}
              {/* {status === 'error' && 'Unable to Confirm Cancellation'} */}
            </h4>

            <p className="text-muted mb-0">{message}</p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PaymentCanceledComponent;
