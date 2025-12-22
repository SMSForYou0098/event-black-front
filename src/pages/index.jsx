import { memo, useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useEnterExit } from "@/utilities/usePage";
import BannerSkeleton from "@/utils/SkeletonUtils/BannerSkeleton";

// ============================================================================
// INTERSECTION OBSERVER HOOK - Optimized with stable config
// ============================================================================
const useLoadOnce = (threshold = 0.1, rootMargin = '50px') => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef(null);

  // Memoize observer options to prevent recreation
  const options = useMemo(() => ({
    threshold,
    rootMargin
  }), [threshold, rootMargin]);

  useEffect(() => {
    if (hasLoaded || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true);
          observer.disconnect(); // Immediate cleanup after load
        }
      },
      options
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, options]);

  return [ref, hasLoaded];
};

// ============================================================================
// LAZY LOADING WRAPPER COMPONENTS
// ============================================================================
const LazySection = memo(({
  children,
  fallback = null,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
  minHeight = 'auto'
}) => {
  const [ref, hasLoaded] = useLoadOnce(threshold, rootMargin);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {hasLoaded ? children : fallback}
    </div>
  );
});

LazySection.displayName = "LazySection";

// PreloadSection - Start loading earlier for better UX
const PreloadSection = memo(({
  children,
  fallback = null,
  preloadMargin = '200px',
  className = '',
  minHeight = 'auto'
}) => {
  const [ref, hasLoaded] = useLoadOnce(0.1, preloadMargin);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {hasLoaded ? children : fallback}
    </div>
  );
});

PreloadSection.displayName = "PreloadSection";

// ============================================================================
// SKELETON COMPONENTS - Optimized placeholders
// ============================================================================
const SectionSkeleton = memo(({ title = "Loading", itemCount = 6 }) => (
  <section className="py-5">
    <div className="container">
      {/* Header Skeleton */}
      <div className="d-flex align-items-center mb-4">
        <div className="spinner-border spinner-border-sm text-primary me-3" role="status">
          <span className="visually-hidden">Loading {title}...</span>
        </div>
        <div className="placeholder-glow w-100">
          <span className="placeholder col-4 col-md-3 bg-secondary rounded"></span>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="row g-4">
        {Array.from({ length: itemCount }, (_, i) => (
          <div key={i} className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="placeholder-glow">
                <div
                  className="placeholder bg-light rounded-top w-100"
                  style={{ height: '200px' }}
                />
              </div>
              <div className="card-body">
                <div className="placeholder-glow">
                  <span className="placeholder col-8 d-block mb-2 bg-secondary rounded"></span>
                  <span className="placeholder col-6 d-block mb-2 bg-secondary rounded"></span>
                  <span className="placeholder col-4 d-block bg-secondary rounded"></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

SectionSkeleton.displayName = "SectionSkeleton";

const FooterSkeleton = memo(() => (
  <footer className="bg-dark py-5">
    <div className="container text-center">
      <div className="spinner-border spinner-border-sm text-light mb-3" role="status">
        <span className="visually-hidden">Loading footer...</span>
      </div>
      <div className="placeholder-glow">
        <span className="placeholder col-4 col-md-2 mx-auto d-block bg-secondary rounded"></span>
      </div>
    </div>
  </footer>
));

FooterSkeleton.displayName = "FooterSkeleton";

// ============================================================================
// DYNAMIC IMPORTS - Aggressive code splitting for performance
// ============================================================================

// Critical: Above fold only (SSR enabled)
const CommonBannerSlider = dynamic(
  () => import("@/components/slider/CommonBannerSlider"),
  { loading: () => <BannerSkeleton />, ssr: true }
);

// High Priority: Near fold (Client-side only for better initial load)
const HighDemand = dynamic(
  () => import("@/components/sections/HighDemand"),
  { loading: () => <SectionSkeleton title="High Demand" />, ssr: false }
);

const EventsSection = dynamic(
  () => import("@/components/sections/EventsSection"),
  { loading: () => <SectionSkeleton title="Events" />, ssr: false }
);

// Below fold: All client-side only to reduce initial bundle
const OurEvents = dynamic(
  () => import("@/components/sections/OurEvents"),
  { loading: () => <SectionSkeleton title="Our Events" />, ssr: false }
);

const PastEvents = dynamic(
  () => import("@/components/sections/PastEvents"),
  { loading: () => <SectionSkeleton title="Past Events" />, ssr: false }
);

const PromotionalEvents = dynamic(
  () => import("@/components/sections/PromotionalEvents"),
  { loading: () => <SectionSkeleton title="Promotional Events" />, ssr: false }
);

const HomeArtists = dynamic(
  () => import("@/components/sections/HomeArtists"),
  { loading: () => <SectionSkeleton title="Artists" />, ssr: false }
);

const BlogSection = dynamic(
  () => import("@/components/sections/BlogSection"),
  { loading: () => <SectionSkeleton title="Blog" />, ssr: false }
);

const OTT = memo(() => {
  useEnterExit();

  return (
    <>
      {/* Critical: Load immediately - Above fold only */}
      <CommonBannerSlider />

      {/* High Priority: Preload when user scrolls close */}
      <PreloadSection
        className='pt-2'
        preloadMargin='300px'
        fallback={<SectionSkeleton title="High Demand" itemCount={4} />}
      >
        <HighDemand />
      </PreloadSection>

      {/* Medium Priority: Lazy load with aggressive threshold */}
      <LazySection
        className='pt-2'
        threshold={0.05}
        rootMargin='200px'
        fallback={<SectionSkeleton title="Events" itemCount={6} />}
      >
        <EventsSection />
      </LazySection>

      {/* Low Priority: Lazy load all below-fold sections */}
      <LazySection
        className='pt-2'
        threshold={0.01}
        rootMargin='100px'
        fallback={<SectionSkeleton title="Our Events" itemCount={4} />}
      >
        <OurEvents />
      </LazySection>

      <LazySection
        className='pt-2'
        threshold={0.01}
        rootMargin='100px'
        fallback={<SectionSkeleton title="Past Events" itemCount={4} />}
      >
        <PastEvents />
      </LazySection>

      <LazySection
        className='pt-2'
        threshold={0.01}
        rootMargin='100px'
        fallback={<SectionSkeleton title="Promotional Events" itemCount={4} />}
      >
        <PromotionalEvents />
      </LazySection>

      <LazySection
        className='pt-2'
        threshold={0.01}
        rootMargin='50px'
        fallback={<SectionSkeleton title="Artists" itemCount={4} />}
      >
        <HomeArtists />
      </LazySection>

      <LazySection
        className='pt-2'
        threshold={0.01}
        rootMargin='50px'
        fallback={<SectionSkeleton title="Blog" itemCount={3} />}
      >
        <BlogSection />
      </LazySection>
    </>
  );
});

OTT.displayName = "OTT";

export default OTT;
