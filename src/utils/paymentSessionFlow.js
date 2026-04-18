const PAYMENT_FLOW_KEY = 'ticketPaymentFlow';
const FLOW_TTL_MS = 15 * 60 * 1000;

const isBrowser = () => typeof window !== 'undefined';

const getStorage = () => {
  if (!isBrowser()) return null;

  try {
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
};

const safeParse = (raw) => {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const isExpired = (payload) => {
  if (!payload?.expires_at) return true;
  return Date.now() > Number(payload.expires_at);
};

export const setPendingPaymentFlow = (data) => {
  const storage = getStorage();
  if (!storage) return false;

  const payload = {
    status: 'pending',
    session_id: data?.session_id || null,
    event_key: data?.event_key || null,
    event_id: data?.event_id || null,
    quantity: Number(data?.quantity || 0),
    is_master: Boolean(data?.is_master),
    payment_url: data?.payment_url || null,
    gateway: data?.gateway || null,
    created_at: Date.now(),
    expires_at: Date.now() + FLOW_TTL_MS,
  };

  try {
    storage.setItem(PAYMENT_FLOW_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    return false;
  }
};

export const getPendingPaymentFlow = () => {
  const storage = getStorage();
  if (!storage) return null;

  const parsed = safeParse(storage.getItem(PAYMENT_FLOW_KEY));
  if (!parsed) return null;

  if (isExpired(parsed)) {
    storage.removeItem(PAYMENT_FLOW_KEY);
    return null;
  }

  return parsed;
};

export const clearPendingPaymentFlow = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(PAYMENT_FLOW_KEY);
};

export const hasPendingPaymentForEvent = (eventKey) => {
  const data = getPendingPaymentFlow();
  if (!data) return false;
  if (!eventKey) return false;
  return data.event_key?.toString() === eventKey.toString();
};

export const markPaymentFlowResolved = () => {
  const storage = getStorage();
  if (!storage) return;

  const current = getPendingPaymentFlow();
  if (!current) return;

  const resolvedPayload = {
    ...current,
    status: 'resolved',
    resolved_at: Date.now(),
  };

  try {
    storage.setItem(PAYMENT_FLOW_KEY, JSON.stringify(resolvedPayload));
  } catch (error) {
    storage.removeItem(PAYMENT_FLOW_KEY);
  }
};
