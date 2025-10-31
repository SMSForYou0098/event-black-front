import React, { Fragment, memo, useState } from "react";
import Link from "next/link";
import { Col, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "../../store/setting/selectors";
import FsLightbox from "fslightbox-react";
import { useQuery } from "@tanstack/react-query";
import { useMyContext } from "@/Context/MyContextProvider";
import { api } from "@/lib/axiosInterceptor";
import BannerSkeleton from "../../utils/SkeletonUtils/BannerSkeleton";
import CustomBtn from "@/utils/CustomBtn";
import { useRouter } from "next/router";
import CommonMobileSlider from "./CommonMobileSlider"
import { MobileOnly, DesktopOnly } from "@/utils/ResponsiveRenderer";

/* --------- Helpers ---------- */
export const getBanners = async () => {
  const response = await api.get('/banner-list/main');
  return response.data.data;
};

export const extractImageUrl = (images) => {
  if (!images) return '';

  if (typeof images === 'object' && images !== null && (images.url || images.path)) {
    const candidate = images.url ?? images.path;
    return String(candidate).replace(/\\\//g, '/').replace(/^"+|"+$/g, '');
  }

  if (typeof images === 'string') {
    const s = images.trim();
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && parsed.length) return String(parsed[0]).replace(/\\\//g, '/').replace(/^"+|"+$/g, '');
      if (parsed && typeof parsed === 'object' && (parsed.url || parsed.path)) {
        const candidate = parsed.url ?? parsed.path;
        return String(candidate).replace(/\\\//g, '/').replace(/^"+|"+$/g, '');
      }
    } catch (e) {
      // not JSON — continue
    }
    const unquoted = s.replace(/^"+|"+$/g, '');
    return unquoted.replace(/\\\//g, '/');
  }

  return String(images).replace(/\\\//g, '/').replace(/^"+|"+$/g, '');
};

export const toAbsolute = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.NEXT_PUBLIC_ASSET_HOST || process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!base) return url;
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

/* --------- Combined Component ---------- */
/**
 * Props:
 * - type: 'main' | 'category' | other (default 'main')
 * - banners: [] (used when type !== 'main')
 * - loading: boolean (used when type !== 'main')
 */
const CommonBannerSlider = memo(({ type = 'main', banners: propBanners = [], loading: propLoading = false }) => {
  const themeSchemeDirection = useSelector(theme_scheme_direction);
  const [toggler, setToggler] = useState(false);
  const {  createSlug } = useMyContext();
  const router = useRouter();
  const [currentMediaUrl, setCurrentMediaUrl] = useState(''); // NEW: Track current media URL

  // Only call API when type is 'main'
  const { data: apiBanners, isLoading: apiLoading, isError } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    enabled: type === 'main',
    cacheTime: 1000 * 60 * 30, // 30 min
    staleTime: 1000 * 60 * 30, // 30 min
  });
  // decide which banners & loading to use
  const rawBanners = type === 'main'
    ? (apiBanners || [])
    : (Array.isArray(propBanners) ? propBanners : (propBanners ? [propBanners] : []));
  const loading = type === 'main' ? apiLoading : propLoading;

  // fallback banner when there's no banners
  const fallbackBanner = {
    id: 'fallback',
    title: 'No banners available',
    description: 'Currently there are no banners.',
    button_text: 'Browse Events',
    button_link: '/events',
    images: '/assets/images/no-banner.jpg' // replace with your fallback image
  };
  if(rawBanners?.length === 0) {
    return null
  }
  // use a banner array to render; if empty use the fallbackBanner
  const bannersToRender = rawBanners && rawBanners?.length > 0 ? rawBanners : [];

  // show skeleton while loading
  if (loading) {
    return <BannerSkeleton themeSchemeDirection={themeSchemeDirection} />;
  }

  // show error message on network error (only for main type)
  if (isError && type === 'main') {
    return (
      <section className="banner-container section-padding-bottom">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '450px' }}>
          <p className="text-danger">Could not load banners.</p>
        </div>
      </section>
    );
  }


  const handleBannerNavigation = (banner) => {
    // treat fallback banner like an internal link to /events
    if (banner?.id === 'fallback') {
      router.push(banner.button_link || '/events');
      return;
    }

    // If component prop type is 'main' -> default behavior (category listing)
    if (type === 'main') {
      router.push(`/events/category/${createSlug(banner?.category.title).toLowerCase()}?key=${banner?.category?.id}`);
      return;
    }

    // If component prop type is 'category' and banner.category is not 'main'
    if (type === 'category' && String(banner?.category).toLowerCase() !== 'main') {
      if (banner?.external_url) {
        window.open(banner.external_url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (banner?.event_key) {
        router.push(`/events/${banner?.event?.venue?.city}/${createSlug(banner.event?.user?.organisation)}/${createSlug(banner.event.name)}/${banner.event_key}`);
        return;
      }
      if (banner?.button_link) {
        const isExternal = /^(https?:)?\/\//i.test(banner.button_link);
        if (isExternal) {
          window.open(banner.button_link, '_blank', 'noopener,noreferrer');
        } else {
          router.push(banner.button_link);
        }
        return;
      }
      router.push(`/events/category/${createSlug(banner?.category).toLowerCase()}`);
      return;
    }

    // conditiion for orgs
    if(type=== 'organization'){
      if (banner?.external_url) {
        window.open(banner.external_url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (banner?.event_key) {
        router.push(`/events/${banner?.event?.venue?.city}/${createSlug(banner.event?.user?.organisation)}/${createSlug(banner.event.name)}/${banner.event_key}`);
        return;
      }
      if (banner?.button_link) {
        const isExternal = /^(https?:)?\/\//i.test(banner.button_link);
        if (isExternal) {
          window.open(banner.button_link, '_blank', 'noopener,noreferrer');
        } else {
          router.push(banner.button_link);
        }
        return;
      }
    }

    // fallback: prefer button_link if available, else go to category page
    if (banner?.button_link) {
      const isExternal = /^(https?:)?\/\//i.test(banner.button_link);
      if (isExternal) {
        window.open(banner.button_link, '_blank', 'noopener,noreferrer');
      } else {
        router.push(banner.button_link);
      }
      return;
    }

    router.push(`/events/category/${createSlug(banner?.category).toLowerCase()}`);
  };

  const handleMediaClick = (banner) => {
    if (!banner?.media_url) return;

    if (banner?.display_in_popup) {
      // Open in lightbox
      setCurrentMediaUrl(banner.media_url);
      setToggler(!toggler);
    } else {
      // Open in new tab
      window.open(banner.media_url, '_blank', 'noopener,noreferrer');
    }
  };

  const desktopSwiperConfig = {
    dir: String(themeSchemeDirection),
    navigation: {
      prevEl: ".swiper-banner-button-prev",
      nextEl: ".swiper-banner-button-next",
    },
    slidesPerView: 1.2,
    modules: [Navigation],
    loop: true,
    centeredSlides: true,
    className: "swiper-banner-container"
  };
 
  return (
    <Fragment>
      <section className="banner-container section-padding-bottom pb-0">
        <div className="movie-banner">
          <div id="banner-detail-slider" className="banner-container">
            <MobileOnly>
              <CommonMobileSlider
                banners={bannersToRender}
                themeSchemeDirection={themeSchemeDirection}
                createSlug={createSlug}
                type={type}
                handleBannerNavigation={handleBannerNavigation}
              />
            </MobileOnly>

            <DesktopOnly>
              <Swiper key={`desktop-${String(themeSchemeDirection)}`} {...desktopSwiperConfig}>
                {bannersToRender.map((banner, index) => {
                  // Direct usage - no extraction needed
                  const imageUrl = banner.images || ''; // fallback to empty string if null
                  const backgroundStyle = imageUrl ? `url("${imageUrl}")` : 'none';
                  const isFallback = banner.id === 'fallback';
                  const hasMedia = Boolean(banner?.media_url);

                  return (
                    <SwiperSlide key={banner.id || index}>
                      <div
                        className="movie-banner-image"
                        style={{
                          backgroundImage: backgroundStyle,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          height: '450px',
                          position: 'relative'
                        }}
                      >
                        <div className="shows-content h-100">
                          <Row className="row align-items-center h-100">
                            <Col lg="7" md="12">
                              <h1 className=" big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two" data-animation-in="fadeInLeft" data-delay-in="0.6">
                                {banner?.title}
                              </h1>
                              <div className="flex-wrap align-items-center fadeInLeft animated" data-animation-in="fadeInLeft" style={{ opacity: 1 }}>
                                <p className="movie-banner-text line-count-3 mt-3" data-animation-in="fadeInUp" data-delay-in="1.2">
                                  {banner?.description}
                                </p>
                              </div>

                              <CustomBtn
                                buttonText={banner?.button_text || (isFallback ? 'Browse Events' : 'Explore Now')}
                                HandleClick={() => handleBannerNavigation(banner)}
                                customClass="mt-4 btn-sm"
                              />
                            </Col>
                            {hasMedia && (
            <Col lg="5" md="12" className="trailor-video iq-slider d-none d-lg-block">
              <div
                onClick={() => handleMediaClick(banner)}   // ← use your function here
                className="video-open playbtn"
                style={{ cursor: 'pointer' }}
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 213.7 213.7">
                  <polygon className="triangle" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" points="73.5,62.5 148.5,105.8 73.5,149.1 " />
                  <circle className="circle" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" cx="106.8" cy="106.8" r="103.3" />
                </svg>
                <span className="w-trailor text-uppercase">Watch Trailer</span>
              </div>
            </Col>
          )}
                          </Row>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}

                <div className="swiper-banner-button-next">
                  <i className="iconly-Arrow-Right-2 icli arrow-icon"></i>
                </div>
                <div className="swiper-banner-button-prev">
                  <i className="iconly-Arrow-Left-2 icli arrow-icon"></i>
                </div>
              </Swiper>
            </DesktopOnly>
          </div>
        </div>
      </section>

      {
        currentMediaUrl && 
      <FsLightbox
        toggler={toggler}
        sources={currentMediaUrl ? [currentMediaUrl] : ["/assets/images/video/trailer.mp4"]}
      />
      }          
    </Fragment>
  );
});

CommonBannerSlider.displayName = 'CommonBannerSlider';
export default CommonBannerSlider;
