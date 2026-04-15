import { PRIMARY } from '@/utils/consts';
import { getBackgroundWithOpacity } from '@/components/setting/elements/getBackgroundWithOpacity';

const BOOKING_MIN_SEAT_GAP_PX = 4;

export const SEAT_STYLES = {
  available: {
    background: 'transparent',
    border: `2px solid ${PRIMARY}`,
    color: '#fff',
    cursor: 'pointer',
  },
  booked: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'not-allowed',
  },
  selected: {
    background: PRIMARY,
    border: `2px solid ${PRIMARY}`,
    color: '#fff',
    cursor: 'pointer',
  },
  reserved: {
    background: 'rgb(152, 124, 39)',
    border: '2px solid rgb(152, 124, 39)',
    color: '#000',
    cursor: 'not-allowed',
  },
  disabled: {
    background: '#1f2937',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
  },
  noTicket: {
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.25)',
    cursor: 'not-allowed',
  },
};

export const LEGEND_ITEMS = [
  { key: 'available', label: 'Available', styleKey: 'available' },
  { key: 'selected', label: 'Selected', styleKey: 'selected' },
  { key: 'booked', label: 'Booked', styleKey: 'booked' },
  { key: 'reserved', label: 'Reserved', styleKey: 'reserved' },
  { key: 'disabled', label: 'Disabled', styleKey: 'disabled' },
];

export function getSeatStyle(seat, isSelected) {
  if (!seat.ticket) return SEAT_STYLES.noTicket;
  if (seat.status === 'reserved') return SEAT_STYLES.reserved;
  if (seat.status === 'booked') return SEAT_STYLES.booked;
  if (seat.status === 'disabled') return SEAT_STYLES.disabled;
  if (seat.status === 'hold' || seat.status === 'locked') return SEAT_STYLES.booked;
  const seatColor = seat?.color || PRIMARY;
  if (isSelected || seat.status === 'selected') {
    return {
      ...SEAT_STYLES.selected,
      background: seatColor,
      border: `2px solid ${seatColor}`,
      color: '#fff',
    };
  }
  return {
    ...SEAT_STYLES.available,
    background: getBackgroundWithOpacity(seatColor, 0.12),
    border: `2px solid ${seatColor}`,
    color: seatColor,
  };
}

export function getLayoutBounds(stage, sections) {
  if (!sections || sections.length === 0) {
    const w = stage ? stage.width + (stage.x || 0) : 1000;
    const h = stage ? stage.height + (stage.y || 0) : 600;
    return { minX: 0, minY: 0, width: w, height: h };
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  if (stage) {
    minX = Math.min(minX, stage.x, (stage.x || 0) + (stage.width || 800));
    minY = Math.min(minY, stage.y, (stage.y || 0) + (stage.height || 50));
    maxX = Math.max(maxX, stage.x, (stage.x || 0) + (stage.width || 800));
    maxY = Math.max(maxY, stage.y, (stage.y || 0) + (stage.height || 50));
  }
  sections.forEach((s) => {
    const sx = Number(s.x) || 0,
      sy = Number(s.y) || 0;
    const sw = Number(s.width) || 600,
      sh = Number(s.height) || 250;
    minX = Math.min(minX, sx);
    minY = Math.min(minY, sy);
    maxX = Math.max(maxX, sx + sw);
    maxY = Math.max(maxY, sy + sh);
  });
  if (minX === Infinity) minX = 0;
  if (minY === Infinity) minY = 0;
  if (maxX === -Infinity) maxX = 1000;
  if (maxY === -Infinity) maxY = 600;
  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getRowMinCenterPitch(seats) {
  const maxR = Math.max(...(seats || []).map((s) => Number(s.radius) || 12));
  return Math.max(28, maxR * 2) + BOOKING_MIN_SEAT_GAP_PX;
}

export function redistributeRowSeatX(seats) {
  if (!seats || seats.length < 2) return null;
  const pitch = getRowMinCenterPitch(seats);
  const sorted = [...seats].sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0));
  let minGap = Infinity;
  for (let i = 0; i < sorted.length - 1; i++) {
    const d = (Number(sorted[i + 1].x) || 0) - (Number(sorted[i].x) || 0);
    if (d < minGap) minGap = d;
  }
  if (!Number.isFinite(minGap) || minGap >= pitch) return null;

  const out = new Map();
  let prevX = null;
  for (const s of sorted) {
    const x = Number(s.x) || 0;
    let nx = x;
    if (prevX !== null) nx = Math.max(x, prevX + pitch);
    out.set(s.id, nx);
    prevX = nx;
  }
  const oldMin = Number(sorted[0].x) || 0;
  const oldMax = Number(sorted[sorted.length - 1].x) || 0;
  const oldCenter = (oldMin + oldMax) / 2;
  const newVals = sorted.map((s) => out.get(s.id));
  const newMin = Math.min(...newVals);
  const newMax = Math.max(...newVals);
  const newCenter = (newMin + newMax) / 2;
  const shift = oldCenter - newCenter;
  sorted.forEach((s) => out.set(s.id, out.get(s.id) + shift));
  return out;
}

export function buildBookingSeatDisplayCoords(sections) {
  const map = new Map();
  for (const section of sections || []) {
    if (section.type === 'Standing') continue;
    for (const row of section.rows || []) {
      const seats = row.seats || [];
      const xById = redistributeRowSeatX(seats);
      if (!xById) continue;
      for (const seat of seats) {
        const nx = xById.get(seat.id);
        if (nx !== undefined) {
          map.set(seat.id, { x: nx, y: Number(seat.y) || 0 });
        }
      }
    }
  }
  return map;
}

export function expandBoundsWithPaintedSeats(baseBounds, sections, seatDisplayCoords) {
  let minX = baseBounds.minX;
  let minY = baseBounds.minY;
  let maxX = baseBounds.minX + baseBounds.width;
  let maxY = baseBounds.minY + baseBounds.height;
  const pad = 8;

  for (const s of sections || []) {
    if (s.type === 'Standing') continue;
    const sx = Number(s.x) || 0;
    const sy = Number(s.y) || 0;
    for (const row of s.rows || []) {
      for (const seat of row.seats || []) {
        const disp = seatDisplayCoords.get(seat.id);
        const px = disp ? disp.x : Number(seat.x) || 0;
        const py = disp ? disp.y : Number(seat.y) || 0;
        const r = Number(seat.radius) || 12;
        const half = Math.max(14, r);
        const wx = sx + px;
        const wy = sy + py;
        minX = Math.min(minX, wx - half - pad);
        maxX = Math.max(maxX, wx + half + pad);
        minY = Math.min(minY, wy - half - pad);
        maxY = Math.max(maxY, wy + half + pad);
      }
    }
  }

  return {
    minX,
    minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function getSectionLayoutRectForCull(section, seatDisplayCoords, boundsMin) {
  const sx0 = Number(section.x) || 0;
  const sy0 = Number(section.y) || 0;
  let minX = sx0;
  let minY = sy0;
  let maxX = sx0 + (Number(section.width) || 600);
  let maxY = sy0 + (Number(section.height) || 250);

  if (section.type !== 'Standing') {
    for (const row of section.rows || []) {
      for (const seat of row.seats || []) {
        const disp = seatDisplayCoords.get(seat.id);
        const px = disp ? disp.x : Number(seat.x) || 0;
        const py = disp ? disp.y : Number(seat.y) || 0;
        const r = Number(seat.radius) || 12;
        const half = Math.max(14, r);
        const wx = sx0 + px;
        const wy = sy0 + py;
        minX = Math.min(minX, wx - half);
        maxX = Math.max(maxX, wx + half);
        minY = Math.min(minY, wy - half);
        maxY = Math.max(maxY, wy + half);
      }
    }
  }

  return {
    sx: minX - boundsMin.minX,
    sy: minY - boundsMin.minY,
    sw: Math.max(1, maxX - minX),
    sh: Math.max(1, maxY - minY),
  };
}
