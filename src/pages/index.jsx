import { memo, useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useEnterExit } from "@/utilities/usePage";
import BannerSkeleton from "@/utils/SkeletonUtils/BannerSkeleton";

// Enhanced intersection observer hook - LOAD ONCE + CLEANUP
const useLoadOnce = (threshold = 0.1, rootMargin = '50px') => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef();
  const observerRef = useRef();

  useEffect(() => {
    if (hasLoaded || !ref.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true);
          // Disconnect observer after loading once
          observerRef.current?.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasLoaded, threshold, rootMargin]);

  return [ref, hasLoaded];
};

// Enhanced lazy section with better performance
const LazySection = memo(({ children, fallback, threshold = 0.1, rootMargin = '100px' }) => {
  const [ref, hasLoaded] = useLoadOnce(threshold, rootMargin);
  
  return (
    <div ref={ref}>
      {hasLoaded ? children : fallback}
    </div>
  );
});

LazySection.displayName = "LazySection";

// Preload strategy - start loading when user is close
const PreloadSection = memo(({ children, fallback, preloadMargin = '200px' }) => {
  const [ref, hasLoaded] = useLoadOnce(0.1, preloadMargin);
  
  return (
    <div ref={ref}>
      {hasLoaded ? children : fallback}
    </div>
  );
});

PreloadSection.displayName = "PreloadSection";

// Dynamic imports with better error handling
const createDynamicComponent = (importFunction, loadingComponent, options = {}) => {
  return dynamic(importFunction, {
    loading: loadingComponent,
    ssr: options.ssr !== false, // Default to true
    ...options,
  });
};

// Component definitions with progressive loading strategy
const CommonBannerSlider = createDynamicComponent(
  () => import("@/components/slider/CommonBannerSlider"),
  () => <BannerSkeleton />
);

const HighDemand = createDynamicComponent(
  () => import("@/components/sections/HighDemand"),
  () => <SectionSkeleton title="High Demand" />
);

const EventsSection = createDynamicComponent(
  () => import("@/components/sections/EventsSection"),
  () => <SectionSkeleton title="Events" />
);

const ExpiredEvents = createDynamicComponent(
  () => import("@/components/sections/ExpiredEvents"),
  () => <SectionSkeleton title="Past Events" />,
  { ssr: false } // Below fold content
);

const FooterSlider = createDynamicComponent(
  () => import("@/components/sections/FooterSlider"),
  () => <FooterSkeleton />,
  { ssr: false }
);


const SectionSkeleton = memo(({ title }) => (
  <section className="py-5">
    <div className="container">
      <div className="d-flex align-items-center mb-4">
        <div className="spinner-border spinner-border-sm text-primary me-3" role="status">
          <span className="visually-hidden">Loading {title}...</span>
        </div>
        <div className="placeholder-glow">
          <h2 className="placeholder col-6 mb-0 bg-secondary"></h2>
        </div>
      </div>
      
      <div className="row g-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="placeholder-glow">
                <div 
                  className="placeholder bg-light rounded-top" 
                  style={{ height: '200px' }}
                ></div>
              </div>
              <div className="card-body">
                <div className="placeholder-glow">
                  <h5 className="placeholder col-8 bg-secondary"></h5>
                  <p className="placeholder col-6 bg-secondary"></p>
                  <small className="placeholder col-4 bg-secondary"></small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const FooterSkeleton = memo(() => (
  <footer className="bg-dark py-5">
    <div className="container text-center">
      <div className="spinner-border spinner-border-sm text-light mb-3" role="status">
        <span className="visually-hidden">Loading footer...</span>
      </div>
      <div className="placeholder-glow">
        <p className="placeholder col-4 mx-auto bg-secondary"></p>
      </div>
    </div>
  </footer>
));

SectionSkeleton.displayName = "SectionSkeleton";
FooterSkeleton.displayName = "FooterSkeleton";

const OTT = memo(() => {
  useEnterExit();

  return (
    <>
      {/* Critical: Above the fold - load immediately */}
      <CommonBannerSlider />
      {/* <HomeBannerSlider /> */}
      
      {/* High priority: Preload when user is getting close */}
      <PreloadSection 
        fallback={<SectionSkeleton title="High Demand" />}
        preloadMargin="150px"
      >
        <HighDemand />
      </PreloadSection>
      
      {/* Medium priority: Load when in view */}
      <LazySection 
        fallback={<SectionSkeleton title="Events" />}
        threshold={0.1}
        rootMargin="100px"
      >
        <EventsSection />
      </LazySection>
      
      {/* Low priority: Load only when visible */}
      <LazySection 
        fallback={<SectionSkeleton title="Past Events" />}
        threshold={0.1}
        rootMargin="50px"
      >
        <ExpiredEvents />
      </LazySection>
      
      {/* Footer: Load when approaching */}
      <LazySection 
        fallback={<FooterSkeleton />}
        threshold={0.1}
        rootMargin="100px"
      >
        <FooterSlider />
      </LazySection>
    </>
  );
});

OTT.displayName = "OTT";
export default OTT;