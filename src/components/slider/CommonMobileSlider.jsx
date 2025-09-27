import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { extractImageUrl, toAbsolute } from './CommonBannerSlider';
import Link from 'next/link';
import Image from 'next/image';
import { useMyContext } from '@/Context/MyContextProvider';
const CommonMobileSlider = ({banners=[]},themeSchemeDirection) => {
    const  {createSlug} = useMyContext();
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
                  const raw = extractImageUrl(banner.images);
                  const imgSrc = toAbsolute(raw) || "/assets/images/fallback-banner.jpg";
                  const href = banner?.external_url || banner?.button_link || (banner?.event_key ? `/events/${banner.event_key}` : `/events/category/${createSlug(banner?.category || '').toLowerCase()}`);

                  return (
                    <SwiperSlide className="slide m-0 p-0 home-slider" key={banner.id || index}>
                      {banner?.external_url ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="card-link d-block">
                          <Image height={606} width={1906} src={imgSrc} alt={banner?.title || "banner"} className="img-fluid w-100" />
                        </a>
                      ) : (
                        <Link href={href} className="card-link d-block">
                          <Image height={606} width={1906} src={imgSrc} alt={banner?.title || "banner"} className="img-fluid w-100" />
                        </Link>
                      )}
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