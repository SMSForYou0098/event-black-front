// Simple key generation
export const generateDataKey = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomStr}`;
};

// Alternative: More readable keys
export const generateReadableKey = () => {
  const adjectives = ['quick', 'bright', 'calm', 'bold', 'swift'];
  const nouns = ['tiger', 'eagle', 'river', 'mountain', 'star'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}_${noun}_${num}`;
};

// UUID-style key (if you want something more unique)
export const generateUUIDKey = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const isValidCheckoutKey = (key) => {
  return key && typeof key === 'string' && key.startsWith('checkout_');
};