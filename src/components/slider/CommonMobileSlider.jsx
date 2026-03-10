import React, { memo } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import Image from 'next/image';
import { BsYoutube } from "react-icons/bs";

const CommonMobileSlider = memo(({ banners = [], themeSchemeDirection, handleBannerNavigation, handleMediaClick }) => {
  return (
    <Swiper
      key={`mobile-${String(themeSchemeDirection)}`}
      dir={String(themeSchemeDirection)}
      navigation={{
        prevEl: ".swiper-banner-button-prev",
        nextEl: ".swiper-banner-button-next",
      }}
      loop={true}
      modules={[Navigation]}
      className="position-relative"
    >
      {banners.map((banner, index) => {
        const imgSrc = banner.sm_image?.trim() || banner.images?.trim() || "/assets/images/fallback-banner.jpg";
        const hasMedia = Boolean(banner?.media_url);

        return (
          <SwiperSlide className="slide m-0 p-0 home-slider" key={banner.id || index}>
            <div
              onClick={() => handleBannerNavigation(banner)}
              className="card-link d-block position-relative"
              style={{ cursor: 'pointer' }}
            >
              <Image
                height={606}
                width={1906}
                src={imgSrc}
                alt={banner?.title || "banner"}
                className="img-fluid w-100"
              />
              {hasMedia && (
                <div
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{ zIndex: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMediaClick(banner);
                  }}
                >
                  <div className="video-open playbtn" style={{ cursor: 'pointer' }}>
                    <BsYoutube size={60} color="#b51515" />
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        );
      })}

      <div className="swiper-banner-button-prev swiper-nav" id="home-banner-slider-prev">
        <i style={{ transform: 'rotate(180deg)', display: 'inline-block' }}></i>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="currentColor">
          <circle r="20" cy="22" cx="22"></circle>
        </svg>
      </div>
      <div className="swiper-banner-button-next swiper-nav" id="home-banner-slider-next">
        <i></i>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="currentColor">
          <circle r="20" cy="22" cx="22"></circle>
        </svg>
      </div>
    </Swiper>
  )
})

CommonMobileSlider.displayName = 'CommonMobileSlider';
export default CommonMobileSlider
