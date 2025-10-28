import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import Image from 'next/image';

const CommonMobileSlider = ({ banners = [], themeSchemeDirection, handleBannerNavigation }) => {
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

        return (
          <SwiperSlide className="slide m-0 p-0 home-slider" key={banner.id || index}>
            <div 
              onClick={() => handleBannerNavigation(banner)} 
              className="card-link d-block"
              style={{ cursor: 'pointer' }}
            >
              <Image 
                height={606} 
                width={1906} 
                src={imgSrc} 
                alt={banner?.title || "banner"} 
                className="img-fluid w-100" 
              />
            </div>
          </SwiperSlide>
        );
      })}

      <div className="swiper-banner-button-prev swiper-nav" id="home-banner-slider-prev">
        <i></i>
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
}

export default CommonMobileSlider
