import { Fragment, memo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Link from "next/link";
import Image from 'next/image';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "../../store/setting/selectors";
import FsLightbox from "fslightbox-react";
import { useQuery } from "@tanstack/react-query";
import { useMyContext } from "@/Context/MyContextProvider";
import { api } from "@/lib/axiosInterceptor";
import BannerSkeleton from "../../utils/SkeletonUtils/BannerSkeleton"
import CustomBtn from "@/utils/CustomBtn";
import { useRouter } from "next/router";

export const getBanners = async () => {
  const response = await api.get('/banner-list/main');
  return response.data.data;
};

export const extractImageUrl = (images) => {
  if (!images) return '';

  // If it's an object with url property
  if (typeof images === 'object' && images !== null && (images.url || images.path)) {
    const candidate = images.url ?? images.path;
    return String(candidate).replace(/\\\//g, '/').replace(/^"+|"+$/g, '');
  }

  // If it's a string (could be JSON array or JSON object or plain string)
  if (typeof images === 'string') {
    const s = images.trim();

    // try parse JSON
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

    // remove surrounding quotes if present & fix escaped slashes
    const unquoted = s.replace(/^"+|"+$/g, '');
    return unquoted.replace(/\\\//g, '/');
  }

  // fallback: stringify and replace escapes
  return String(images).replace(/\\\//g, '/').replace(/^"+|"+$/g, '');
};

export const toAbsolute = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.NEXT_PUBLIC_ASSET_HOST || process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!base) return url; // no base configured — return relative
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const HomeBannerSlider = memo(({type='main'}) => {
  const themeSchemeDirection = useSelector(theme_scheme_direction);
  const [toggler, setToggler] = useState(false);
  const { isMobile, createSlug } = useMyContext();
  const router = useRouter();

  const { data: banners, isLoading, isError } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return <BannerSkeleton themeSchemeDirection={themeSchemeDirection} />;
  }

  if (isError || !banners || banners.length === 0) {
    return (
      <section className="banner-container section-padding-bottom">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '450px' }}>
          <p className="text-danger">Could not load banners.</p>
        </div>
      </section>
    );
  }

  const swiperConfig = {
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
            <Swiper
              key={String(themeSchemeDirection)}
              {...swiperConfig}
            >
              {banners.map((banner, index) => {
                // extract and normalize
                const raw = extractImageUrl(banner.images);
                const fixedImageUrl = toAbsolute(raw);

                // Helpful debug logs — remove or comment out in production
                // eslint-disable-next-line no-console
                // console.log('banner.images (raw):', banner.images);
                // eslint-disable-next-line no-console
                // console.log('extracted raw:', raw, ' | fixedImageUrl:', fixedImageUrl);

                // fallback background — you can replace with a local fallback path
                const backgroundStyle = fixedImageUrl
                  ? `url("${fixedImageUrl}")`
                  : 'none';

                return (
                  <SwiperSlide key={banner.id || index}>
                    <div className="movie-banner-image" style={{backgroundImage : backgroundStyle , backgroundSize: 'cover', backgroundPosition: 'center', height: '450px', position: 'relative' }}>
                     <div className="shows-content h-100">
                        <Row className="row align-items-center h-100">
                          <Col lg="7" md="12">
                            {/* NOTE: The API doesn't provide title/description, so static content is used as a template. */}
                            <h1
                              className=" big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two"
                              data-animation-in="fadeInLeft"
                              data-delay-in="0.6"
                            >
                              {banner?.title}
                            </h1>
                            <div
                              className="flex-wrap align-items-center fadeInLeft animated"
                              data-animation-in="fadeInLeft"
                              style={{ opacity: 1 }}
                            >
                              {/* <div className="slider-ratting d-flex align-items-center gap-3">
                                <ul className="ratting-start p-0 m-0 list-inline text-primary d-flex align-items-center justify-content-left">
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fa fa-star-half" aria-hidden="true"></i></li>
                                </ul>
                                <span className="text-white">4.5 (IMDB)</span>
                              </div> */}
                              <p
                                className="movie-banner-text line-count-3 mt-3"
                                data-animation-in="fadeInUp"
                                data-delay-in="1.2"
                              >
                                {banner?.description}
                              </p>
                            </div>
                            <CustomBtn 
                              buttonText={banner?.button_text || 'Explore Now'}
                              HandleClick={() => {router.push(banner.redirectUrl || `/events/category/${createSlug(banner?.category).toLowerCase()}` ||'/tv-shows/detail')}}
                              customClass="mt-4 btn-sm"
                            />
                          </Col>
                          <Col lg="5" md="12" className="trailor-video iq-slider d-none d-lg-block">
                            <div onClick={() => setToggler(!toggler)} className="video-open playbtn" style={{cursor: 'pointer'}}>
                              <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                width="80px"
                                height="80px"
                                viewBox="0 0 213.7 213.7"
                                enableBackground="new 0 0 213.7 213.7"
                                xmlSpace="preserve"
                              >
                                <polygon
                                  className="triangle"
                                  fill="none"
                                  strokeWidth="7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeMiterlimit="10"
                                  points="73.5,62.5 148.5,105.8 73.5,149.1 "
                                ></polygon>
                                <circle
                                  className="circle"
                                  fill="none"
                                  strokeWidth="7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeMiterlimit="10"
                                  cx="106.8"
                                  cy="106.8"
                                  r="103.3"
                                ></circle>
                              </svg>
                              <span
                                className="w-trailor text-uppercase"
                              >
                                Watch Trailer
                              </span>
                            </div>
                          </Col>
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
          </div>
        </div>
      </section>

      <FsLightbox
        toggler={toggler}
        sources={'https://youtu.be/fqySz1Me2pI?si=XoYWlztoTBOWX8_i'}
      />
    </Fragment>
  );
});

HomeBannerSlider.displayName = 'HomeBannerSlider';
export default HomeBannerSlider;
