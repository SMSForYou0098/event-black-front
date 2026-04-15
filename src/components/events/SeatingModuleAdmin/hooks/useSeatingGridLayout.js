import { useMemo, useCallback } from 'react';
import {
  getLayoutBounds,
  buildBookingSeatDisplayCoords,
  expandBoundsWithPaintedSeats,
  getSectionLayoutRectForCull,
  redistributeRowSeatX,
} from '../utils/seatingGridUtils';

export const useSeatingGridLayout = (stage, sections, zoom, pan, viewportSize) => {
  // Compute bounds and seat display coordinates
  const { bounds, seatDisplayCoords } = useMemo(() => {
    const base = getLayoutBounds(stage, sections);
    const coords = buildBookingSeatDisplayCoords(sections);
    const expanded = expandBoundsWithPaintedSeats(base, sections, coords);
    return { bounds: expanded, seatDisplayCoords: coords };
  }, [stage, sections]);

  // Compute total seats count
  const totalSeats = useMemo(
    () =>
      (sections || []).reduce(
        (sum, s) =>
          sum + (s.rows || []).reduce((rSum, r) => rSum + (r.seats || []).length, 0),
        0
      ),
    [sections]
  );

  // Filter visible sections based on viewport culling
  const visibleSections = useMemo(() => {
    if (!sections?.length) return [];
    if (!viewportSize) return sections;
    const pad = 50;
    const left = (-pan.x - pad) / zoom;
    const top = (-pan.y - pad) / zoom;
    const width = (viewportSize.width + pad * 2) / zoom;
    const height = (viewportSize.height + pad * 2) / zoom;
    return sections.filter((s) => {
      const { sx, sy, sw, sh } = getSectionLayoutRectForCull(s, seatDisplayCoords, bounds);
      return !(left > sx + sw || left + width < sx || top > sy + sh || top + height < sy);
    });
  }, [sections, bounds, seatDisplayCoords, pan.x, pan.y, zoom, viewportSize]);

  // Get selected seat IDs from selectedSeats prop
  const getSelectedSeatIds = useCallback((selectedSeats) => {
    const ids = new Set();
    (selectedSeats || []).forEach((ticket) => {
      (ticket.seats || []).forEach((s) => ids.add(s.seat_id));
    });
    return ids;
  }, []);

  // Get section layout rect for rendering
  const getSectionRect = useCallback(
    (section) => {
      return getSectionLayoutRectForCull(section, seatDisplayCoords, bounds);
    },
    [seatDisplayCoords, bounds]
  );

  return {
    bounds,
    seatDisplayCoords,
    totalSeats,
    visibleSections,
    getSelectedSeatIds,
    getSectionRect,
  };
};
