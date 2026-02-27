/**
 * SESSION CONFIGURATION — Single Source of Truth
 *
 * ⚠️  Both AppContent.jsx (runtime timer) and store/index.js (rehydration check)
 *     import from this file. Change values HERE only.
 *
 * 🧪  FOR TESTING: set TEST_MODE = true → all roles use INACTIVITY_TEST_DURATION
 */

// ─── Test mode ────────────────────────────────────────────────────────────────
const TEST_MODE = false;
const INACTIVITY_TEST_DURATION = 30 * 1000; // 30 seconds (for quick testing)

// ─── Debounce on activity events ──────────────────────────────────────────────
// mousemove fires 100s of times/sec — debounce prevents hammering the timer.
// For testing, reduce this to 2s so resets happen quickly.
export const ACTIVITY_DEBOUNCE_MS = TEST_MODE ? 2_000 : 10_000;

// ─── Inactivity limits per role ───────────────────────────────────────────────
export const INACTIVITY_LIMITS = {
    User: TEST_MODE ? INACTIVITY_TEST_DURATION : 30 * 60 * 1000,       // 30 min
    Scanner: TEST_MODE ? INACTIVITY_TEST_DURATION : 4 * 60 * 60 * 1000,   // 4 hours
    Agent: TEST_MODE ? INACTIVITY_TEST_DURATION : 4 * 60 * 60 * 1000,   // 4 hours
    Organizer: TEST_MODE ? INACTIVITY_TEST_DURATION : 8 * 60 * 60 * 1000,   // 8 hours
};

// Fallback if user role is unknown / not in the map
export const DEFAULT_INACTIVITY_MS = TEST_MODE ? INACTIVITY_TEST_DURATION : 30 * 60 * 1000;

/**
 * Returns the inactivity timeout (ms) for a given role.
 * Used in both AppContent.jsx and store/index.js.
 */
export const getInactivityLimit = (role) => {
    return INACTIVITY_LIMITS[role] ?? DEFAULT_INACTIVITY_MS;
};
