import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Form, Row, Col, Dropdown } from 'react-bootstrap';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const toDateOnly = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const isSameDay = (a, b) =>
  a && b && toDateOnly(a).getTime() === toDateOnly(b).getTime();

const isBetween = (date, start, end) => {
  if (!start || !end) return false;
  const d = toDateOnly(date).getTime();
  const s = toDateOnly(start).getTime();
  const e = toDateOnly(end).getTime();
  return d > Math.min(s, e) && d < Math.max(s, e);
};

const formatDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CustomDateRangePicker = ({
  value = [],
  onChange,
  placeholder = 'Select date range',
  className = '',
  isSingle = false,
  minDate = null,
  maxDate = null,
}) => {
  const [show, setShow] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value?.length > 0) return new Date(value[0]);
    return new Date();
  });
  const [selecting, setSelecting] = useState(null); // first picked date while choosing
  const [hovered, setHovered] = useState(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShow(false);
        setSelecting(null);
        setHovered(null);
      }
    };
    if (show) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show]);

  // Derive start/end from value prop
  const startDate = value?.length >= 1 ? toDateOnly(value[0]) : null;
  const endDate = value?.length >= 2 ? toDateOnly(value[1]) : null;

  const displayValue = useMemo(() => {
    if (startDate && endDate) return `${formatDisplay(startDate)}  to  ${formatDisplay(endDate)}`;
    if (startDate) return formatDisplay(startDate);
    return '';
  }, [startDate, endDate]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, current: false, date: new Date(year, month - 1, daysInPrev - i) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, current: true, date: new Date(year, month, d) });
    }

    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false, date: new Date(year, month + 1, d) });
    }

    return cells;
  }, [viewDate]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const isDateDisabled = useCallback((date) => {
    const d = toDateOnly(date).getTime();
    if (minDate) {
      const min = toDateOnly(minDate).getTime();
      if (d < min) return true;
    }
    if (maxDate) {
      const max = toDateOnly(maxDate).getTime();
      if (d > max) return true;
    }
    return false;
  }, [minDate, maxDate]);

  const handleDayClick = useCallback(
    (date) => {
      if (isDateDisabled(date)) return;

      if (isSingle) {
        onChange?.([date]);
        setShow(false);
        return;
      }

      if (!selecting) {
        // First click – set start
        setSelecting(date);
        onChange?.([date]);
      } else {
        // Second click – set full range
        let s = selecting;
        let e = date;
        if (toDateOnly(s).getTime() > toDateOnly(e).getTime()) [s, e] = [e, s];
        onChange?.([s, e]);
        setSelecting(null);
        setHovered(null);
        setShow(false);
      }
    },
    [selecting, onChange, isSingle, isDateDisabled]
  );

  const getDayClasses = (cell) => {
    const classes = ['text-center', 'py-1', 'rounded-1', 'calendar-day'];
    const d = toDateOnly(cell.date);

    if (isDateDisabled(cell.date)) {
      classes.push('text-muted', 'opacity-25');
      return classes.join(' ');
    }

    if (!cell.current) {
      classes.push('text-muted', 'opacity-50');
    }

    const effectiveStart = selecting || startDate;
    const effectiveEnd = selecting ? (hovered || null) : endDate;

    if (isSameDay(d, effectiveStart) || isSameDay(d, effectiveEnd)) {
      classes.push('bg-primary', 'text-white');
    } else if (effectiveStart && effectiveEnd && isBetween(d, effectiveStart, effectiveEnd)) {
      classes.push('bg-primary', 'bg-opacity-25');
    }

    return classes.join(' ');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.([]);
    setSelecting(null);
    setHovered(null);
  };

  return (
    <div ref={containerRef} className={`position-relative ${className}`}>
      {/* Input display */}
      <div
        className="form-control d-flex align-items-center justify-content-between cursor-pointer w-100"
        style={{ cursor: 'pointer', minHeight: '38px' }}
        onClick={() => setShow((s) => !s)}
      >
        <span className={displayValue ? '' : 'text-muted'}>
          {displayValue || placeholder}
        </span>
        <span className="d-flex align-items-center gap-1">
          {displayValue && (
            <X size={14} className="text-muted" onClick={handleClear} style={{ cursor: 'pointer' }} />
          )}
          <Calendar size={16} className="text-muted" />
        </span>
      </div>

      {/* Calendar dropdown */}
      {show && (
        <div
          className="position-absolute z-3 bg-body border rounded-3 shadow-lg p-3 mt-1"
          style={{ minWidth: '300px', zIndex: 1055 }}
        >
          {/* Month / Year header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button type="button" className="btn btn-sm btn-outline-secondary border-0 p-1" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <span className="fw-semibold">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" className="btn btn-sm btn-outline-secondary border-0 p-1" onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {DAYS.map((d) => (
              <div key={d} className="text-center fw-semibold small text-muted py-1">
                {d}
              </div>
            ))}

            {/* Day cells */}
            {calendarDays.map((cell, idx) => (
              <div
                key={idx}
                className={getDayClasses(cell)}
                style={{
                  cursor: isDateDisabled(cell.date) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  lineHeight: '2'
                }}
                onClick={() => handleDayClick(cell.date)}
                onMouseEnter={() => selecting && !isDateDisabled(cell.date) && setHovered(cell.date)}
              >
                {cell.day}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          {selecting && (
            <div className="text-center text-muted small mt-2">
              Select end date
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDateRangePicker;
