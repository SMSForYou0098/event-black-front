export const DEVICE_OS = {
  ANDROID: "android",
  IOS: "ios",
  MAC: "mac",
  WINDOWS: "windows",
  UNKNOWN: "unknown",
};

export const detectDeviceOs = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return DEVICE_OS.UNKNOWN;
  }

  const userAgent = navigator.userAgent || navigator.vendor || "";
  const platform = navigator.platform || "";

  if (/android/i.test(userAgent)) {
    return DEVICE_OS.ANDROID;
  }

  // iPad on iPadOS 13+ can report as Mac, so include touch-capable Macs.
  const isTouchMac =
    /Mac/.test(platform) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(userAgent) || isTouchMac) {
    return DEVICE_OS.IOS;
  }

  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) {
    return DEVICE_OS.WINDOWS;
  }

  if (/Mac/i.test(platform) || /Macintosh|Mac OS X/i.test(userAgent)) {
    return DEVICE_OS.MAC;
  }

  return DEVICE_OS.UNKNOWN;
};
