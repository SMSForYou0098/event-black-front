// utils/crypto.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || 'default-secret-key-change-me';

export const encrypt = (data) => {
  try {
    if (!data) {
      return null;
    }

    // Convert to JSON
    const jsonString = JSON.stringify(data);

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();

    // Make URL safe
    const urlSafe = btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return urlSafe;
  } catch (error) {
    return null;
  }
};

export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) {
      return null;
    }

    // Restore base64
    let base64 = encryptedData.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const decodedData = atob(base64);
    const decrypted = CryptoJS.AES.decrypt(decodedData, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!jsonString) {
      throw new Error('Failed to decrypt');
    }

    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};
