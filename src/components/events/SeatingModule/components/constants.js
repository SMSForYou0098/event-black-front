import { PRIMARY, SECONDARY } from '../../../../utils/consts';

export const THEME = {
    primary: PRIMARY,
    primaryLight: '#ff3333',
    primaryDark: '#8a1010',
    canvasBg: SECONDARY,
    screenGradientStart: '#0a0a0a',
    screenGradientMid: '#1a0505',
    screenGradientEnd: '#0d0d0d',
    textPrimary: '#ffffff',
    textSecondary: '#e5e5e5',
    textMuted: '#9ca3af',
    seatAvailable: PRIMARY,
    seatSelected: PRIMARY,
    seatBooked: 'rgb(255 255 255 / 6%)',
    seatDisabled: '#1f2937',
    seatNoTicket: '#111827',
    buttonBg: 'rgba(181, 21, 21, 0.9)',
    buttonShadow: 'rgba(181, 21, 21, 0.4)',
    buttonSecondaryBg: 'rgba(30, 30, 30, 0.9)',
    hintBg: 'rgba(20, 5, 5, 0.9)',
    hintBorder: 'rgba(181, 21, 21, 0.5)',
    legendBg: SECONDARY,
    errorColor: '#ef4444',
};

export const IS_MOBILE = typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const PIXEL_RATIO = typeof window !== 'undefined' ?
    Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 2 : 3) : 1;

export const SEAT_COLORS = {
    available: THEME.seatAvailable,
    selected: THEME.seatSelected,
    booked: THEME.seatBooked,
    hold: '#B51515', // Orange for locked/hold seats
    disabled: THEME.seatDisabled,
    noTicket: THEME.seatNoTicket,
};
