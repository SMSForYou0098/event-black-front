import React from 'react';
import { LEGEND_ITEMS, SEAT_STYLES } from '../utils/seatingGridUtils';

/**
 * Legend component showing seat status indicators.
 * Can be lazy-loaded if needed: React.lazy(() => import('./Legend'))
 */
const Legend = React.memo(function Legend({ hasInitialViewApplied }) {
  const overlayStyle = {
    position: 'absolute',
    pointerEvents: 'auto',
  };

  return (
    <div
      className="p-2 px-2 rounded-3 small text-white user-select-none"
      style={{
        ...overlayStyle,
        opacity: hasInitialViewApplied ? 1 : 0,
        pointerEvents: hasInitialViewApplied ? 'auto' : 'none',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.65)',
        fontSize: '12px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div className="d-flex align-items-center gap-2 flex-nowrap">
        {LEGEND_ITEMS.map((item) => (
          <span key={item.key} className="d-flex align-items-center gap-1 text-nowrap">
            <span
              className="rounded"
              style={{ width: 12, height: 12, ...SEAT_STYLES[item.styleKey] }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
});

export default Legend;
