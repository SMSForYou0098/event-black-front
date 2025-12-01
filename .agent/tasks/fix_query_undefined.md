---
description: Fix React Query "Query data cannot be undefined" errors
---

1. Modify `src/components/slider/CommonBannerSlider.jsx` to ensure `getBanners` returns an array (or null) instead of undefined.
2. Modify `src/services/home.js` to ensure `getFeatureEvents` returns an array instead of undefined.
