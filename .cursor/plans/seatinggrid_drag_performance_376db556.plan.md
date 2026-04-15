---
name: SeatingGrid drag performance
overview: Optimize SeatingGrid pan/zoom performance on tablets and low-end devices by reducing React re-renders during drag, GPU-accelerating the transform layer, and throttling pan updates with requestAnimationFrame.
todos:
  - id: will-change
    content: "Add will-change: transform to the layout layer div"
    status: completed
  - id: raf-throttle
    content: RAF-throttle mouse drag and touch pan setPan calls (add panRafRef/pendingPanRef)
    status: completed
  - id: disable-transition-drag
    content: Set disableTransformTransition true/false on drag start/end (not just pinch)
    status: completed
  - id: memo-components
    content: Wrap SeatButton and SectionBlock in React.memo
    status: completed
  - id: lift-context
    content: Lift useMyContext() out of SeatButton, pass isMobile as prop from SeatingGrid
    status: completed
  - id: viewport-ref
    content: Replace getBoundingClientRect() in pan callbacks with viewportSizeRef.current
    status: completed
isProject: false
---

# SeatingGrid Drag Performance Optimization

All changes are in [SeatingGrid.jsx](src/components/events/SeatingModuleAdmin/components/SeatingGrid.jsx).

## Problem Analysis

During a drag, every `pointermove` / `touchmove` fires `setPan()` which triggers a full React re-render of SeatingGrid, recomputes `visibleSections`, and re-renders every visible `SeatButton` -- each of which calls `useMyContext()` and recalculates styles. On a 500-seat hall this is extremely expensive per frame.

---

## Optimizations (ordered by impact)

### 1. GPU-accelerate the layout layer with `will-change: transform`

**What:** Add `willChange: 'transform'` to the main layout div (line ~1167).

**Benefit:** Promotes the entire seat map to a GPU-composited layer. During drag the browser moves a pre-painted bitmap instead of re-painting hundreds of DOM nodes. This alone can eliminate most visible jank.

**Risk:** Very low. Uses slightly more GPU memory (one extra texture). On extremely old devices with < 512MB GPU RAM and a very large layout this could theoretically cause a blank/flicker, but in practice this is the standard approach and works on all modern tablets/phones.

**Verdict:** Safe, high impact, do it.

---

### 2. RAF-throttle mouse and touch pan (like pinch already does)

**What:** Pinch zoom already batches `setPan` via `requestAnimationFrame` (lines 1044-1046), but mouse drag (line 1108) and touch-pan (line 1065) call `setPan()` on **every** move event -- often 120-240 events/sec on high-refresh tablets. Add the same `pendingPanRef` + `panRafRef` pattern.

**Benefit:** Caps React re-renders to max 60fps (one per animation frame) instead of firing on every raw pointer event. Reduces CPU work by 2-4x during drag on high-refresh devices.

**Risk:** Low. Pinch already uses this exact pattern with no issues. The only theoretical concern is a 1-frame (16ms) visual delay, which is imperceptible.

**Verdict:** Safe, high impact, do it.

---

### 3. Disable CSS transition during all drag, not just pinch

**What:** Currently `disableTransformTransition` is only set `true` during pinch (line 981). Mouse drag and touch pan leave the `0.28s ease` CSS transition active, which fights with real-time position updates causing visible easing/lag. Set it `true` on drag start, `false` on drag end.

**Benefit:** Eliminates the "sluggish follow" feeling where the layout seems to lag behind the finger/cursor because CSS is easing toward the target position instead of snapping immediately.

**Risk:** None. The transition is only meant for animated zoom-to-seat and reset-view. Disabling it during active drag is correct behavior -- you want instant 1:1 tracking.

**Verdict:** Safe, medium impact, do it.

---

### 4. Wrap `SeatButton` and `SectionBlock` in `React.memo`

**What:** Neither component is memoized. During drag, pan/zoom state changes trigger SeatingGrid re-render, which cascades to every SectionBlock and every SeatButton even though seat data hasn't changed.

**Benefit:** With `React.memo`, React compares props and skips re-rendering unchanged seats entirely. On a 500-seat layout this means ~500 fewer component renders per frame during drag. Massive CPU savings.

**Risk:** Medium. `React.memo` does shallow comparison. If any prop is a new object/function reference on every render, memo becomes useless (or worse -- adds comparison overhead for no benefit). Specifically:
- `onSeatClick` / `onStandingSectionClick` are wrapped in `useCallback` already -- OK
- `selectedSeatIds` is a `Set` from `useMemo` -- OK, only changes on selection
- `bounds` comes from `useMemo` -- OK
- `seatDisplayCoords` comes from `useMemo` -- OK
- The `seat` object in `SectionBlock` does `{ ...seat, sectionId, rowId }` on every render (line 521) which creates a new object -- this would break memo for `SeatButton`. **Need to fix:** memoize or restructure so the spread doesn't happen every render.

**Verdict:** High impact but needs care with the seat spread. Worth doing.

---

### 5. Lift `useMyContext()` out of per-seat components

**What:** `SeatButton` calls `useMyContext()` (line 279) for every seat. This subscribes each seat to the full context -- if any context value changes, all 500+ seats re-render.

**Benefit:** Removes 500+ context subscriptions. `isMobile` and `toTitleCase` are read once in `SeatingGrid` and passed as plain props, which are cheap to compare in `React.memo`.

**Risk:** Low. It's just moving where the context is read. The only concern is if `SeatButton` is used elsewhere and expects context -- but it's a local function component, not exported.

**Verdict:** Safe, medium impact (enables React.memo to work properly), do it.

---

### 6. Use `viewportSizeRef` instead of `getBoundingClientRect()` in pan callbacks

**What:** Lines 1067-1068 and 1110-1111 call `getBoundingClientRect()` inside every pan update `setPan` callback, which forces the browser to synchronously compute layout (layout thrashing).

**Benefit:** Eliminates forced layout recalculations during drag. `viewportSizeRef` is already kept up to date by the ResizeObserver, so it's always accurate.

**Risk:** Very low. The only edge case is if the container resizes during an active drag (e.g. on-screen keyboard appearing). The ResizeObserver updates `viewportSizeRef` asynchronously so it would catch up within one frame.

**Verdict:** Safe, low-medium impact, easy fix, do it.

---

## Risk Summary

| # | Optimization | Impact | Risk | Do it? |
|---|---|---|---|---|
| 1 | will-change: transform | High | Very low | Yes |
| 2 | RAF-throttle pan | High | Very low | Yes |
| 3 | Disable transition on drag | Medium | None | Yes |
| 4 | React.memo on components | High | Medium (seat spread) | Yes, with fix |
| 5 | Lift useMyContext | Medium | Low | Yes |
| 6 | viewportSizeRef in callbacks | Low-Medium | Very low | Yes |
