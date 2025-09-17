import { Fragment, memo, useState } from "react";

// react-bootstrap
import { Col, Row, Spinner, Placeholder } from "react-bootstrap";

// Next-Link
import Link from "next/link";

// Next-Image
import Image from 'next/image';

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";

// Redux Selector / Action
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "../../store/setting/selectors";

// react-fs-lightbox
import FsLightbox from "fslightbox-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Custom Service and Context
import { useMyContext } from "@/Context/MyContextProvider";
import { getBanners } from "@/services/home";

const HomeBannerSlider = memo(() => {
  const themeSchemeDirection = useSelector(theme_scheme_direction);
  const [toggler, setToggler] = useState(false);
  const { isMobile } = useMyContext();

  // Fetch banners using TanStack Query
  const { data: banners, isLoading, isError } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const displayedBanners = isMobile ? banners?.mobile : banners?.pc;

  // Skeleton loader component
  const BannerSkeleton = () => {
    return (
      <section className="banner-container section-padding-bottom">
        <div className="movie-banner">
          <div id="banner-detail-slider" className="banner-container">
            <Swiper
              key={String(themeSchemeDirection)}
              dir={String(themeSchemeDirection)}
              navigation={{
                prevEl: ".swiper-banner-button-prev",
                nextEl: ".swiper-banner-button-next",
              }}
              slidesPerView={1.2}
              modules={[Navigation]}
              loop={true}
              centeredSlides={true}
              className="swiper-banner-container"
            >
              {[...Array(3)].map((_, index) => (
                <SwiperSlide key={index}>
                  <div className="movie-banner-image position-relative">
                    <Placeholder animation="glow">
                      <Placeholder 
                        xs={12} 
                        style={{ height: '450px' }} 
                        bg="dark" 
                        className="w-100 d-block" 
                      />
                    </Placeholder>
                  </div>
                  <div className="shows-content h-100 position-absolute top-0 start-0 w-100">
                    <Row className="row align-items-center h-100">
                      <Col lg="7" md="12">
                        <Placeholder animation="glow" className="d-flex flex-column gap-3">
                          <Placeholder xs={4} bg="secondary" style={{ height: '40px' }} />
                          <Placeholder xs={6} bg="secondary" style={{ height: '20px' }} />
                          <Placeholder xs={8} bg="secondary" style={{ height: '20px' }} />
                          <Placeholder xs={5} bg="secondary" style={{ height: '20px' }} />
                          <Placeholder xs={3} bg="secondary" style={{ height: '50px' }} className="mt-3" />
                        </Placeholder>
                      </Col>
                      <Col lg="5" md="12" className="trailor-video iq-slider d-none d-lg-block">
                        <Placeholder animation="glow" className="d-flex justify-content-center">
                          <Placeholder 
                            xs={1} 
                            bg="secondary" 
                            style={{ height: '80px', width: '80px', borderRadius: '50%' }} 
                          />
                        </Placeholder>
                      </Col>
                    </Row>
                  </div>
                </SwiperSlide>
              ))}
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
    );
  };

  if (isLoading) {
    return <BannerSkeleton />;
  }

  if (isError || !displayedBanners || displayedBanners.length === 0) {
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
              {displayedBanners.map((banner, index) => (
                <SwiperSlide key={index}>
                    <div className="movie-banner-image">
                        {banner.url && (
                          <Image 
                            src={banner.url} 
                            alt="movie-banner-image" 
                            layout="fill" 
                            objectFit="cover" 
                          />
                        )}
                    </div>
                     <div className="shows-content h-100">
                        <Row className="row align-items-center h-100">
                          <Col lg="7" md="12">
                            {/* NOTE: The API doesn't provide title/description, so static content is used as a template. */}
                            {/* <h1
                              className="texture-text big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two"
                              data-animation-in="fadeInLeft"
                              data-delay-in="0.6"
                            >
                              Featured Shows
                            </h1> */}
                            {/* <div
                              className="flex-wrap align-items-center fadeInLeft animated"
                              data-animation-in="fadeInLeft"
                              style={{ opacity: 1 }}
                            >
                              <div className="slider-ratting d-flex align-items-center gap-3">
                                <ul className="ratting-start p-0 m-0 list-inline text-primary d-flex align-items-center justify-content-left">
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                  <li><i className="fa fa-star-half" aria-hidden="true"></i></li>
                                </ul>
                                <span className="text-white">4.5 (IMDB)</span>
                              </div>
                              <p
                                className="movie-banner-text line-count-3 mt-3"
                                data-animation-in="fadeInUp"
                                data-delay-in="1.2"
                              >
                                Discover our latest collection of exclusive shows and movies. Available now for streaming.
                              </p>
                            </div> */}
                            <div
                              className="iq-button"
                              data-animation-in="fadeInUp"
                              data-delay-in="1.2"
                            >
                              {/* <Link
                                href={banner.redirectUrl || '/tv-shows/detail'}
                                className="btn text-uppercase position-relative"
                              >
                                <span className="button-text">Explore Now</span>
                                <i className="fa-solid fa-play"></i>
                              </Link> */}
                            </div>
                          </Col>
                          {/* <Col lg="5" md="12" className="trailor-video iq-slider d-none d-lg-block">
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
                          </Col> */}
                        </Row>
                      </div>
                </SwiperSlide>
              ))}
              {/* <div className="swiper-banner-button-next">
                <i className="iconly-Arrow-Right-2 icli arrow-icon"></i>
              </div>
              <div className="swiper-banner-button-prev">
                <i className="iconly-Arrow-Left-2 icli arrow-icon"></i>
              </div> */}
            </Swiper>
          </div>
        </div>
      </section>

      {/* <FsLightbox
        toggler={toggler}
        sources={["/assets/images/video/trailer.mp4"]}
      /> */}
    </Fragment>
  );
});

HomeBannerSlider.displayName = 'HomeBannerSlider';
export default HomeBannerSlider;