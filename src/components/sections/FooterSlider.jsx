import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getSuccessfulEvents } from '@/services/home';
import ShopSectionSlider from '../slider/ShopSectionSlider';
import { A11y, Mousewheel, Navigation, Pagination } from 'swiper';

// Main FooterSlider component
const FooterSlider = ({ themeSchemeDirection = 'ltr' }) => {
  const { data: events, isLoading, error, isSuccess } = useQuery({
    queryKey: ['successfulEvents'],
    queryFn: getSuccessfulEvents,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });

  // Render a loading state
  if (isLoading) {
    return (
      <Container fluid>
        <div className="text-center p-5"><h4>Loading Categories...</h4></div>
      </Container>
    );
  }

  // Render an error state
  if (error) {
    return (
      <Container fluid>
        <div className="text-center p-5 text-danger"><h4>Error: Failed to load categories.</h4></div>
      </Container>
    );
  }

  // Render the slider only if data fetching is successful and events exist
  return (
    <div>
      <div className="">
        <h4 className="my-4 mt-md-3 mt-sm-3">Our Events</h4>
      </div>
      {isSuccess && events.length > 0 ? (
        <Swiper
          key={String(themeSchemeDirection)}
          dir={String(themeSchemeDirection)}
          navigation={{
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
          }}
          // Add these modules for touch/swipe functionality
          modules={[Navigation, Pagination, A11y, Mousewheel]}
          // Enable touch/swipe controls
          simulateTouch={true}
          touchRatio={1}
          touchAngle={45}
          grabCursor={true}
          // Enable mousewheel control
        //   mousewheel={true}
          // Add space between slides for better touch experience
          spaceBetween={20}
          breakpoints={{
            320: { slidesPerView: 1 },
            550: { slidesPerView: 2 },
            991: { slidesPerView: 4 },
            1400: { slidesPerView: 5 },
          }}
          loop={true}
          slidesPerView={4}
          tag="ul"
          className="position-relative swiper-card"
        >
          {events.map((item, index) => {
            return (
              <SwiperSlide className="slide-item" tag="li" key={index}>
                <ShopSectionSlider
                  shopsellingImg={item.thumbnail}
                  shopsellingText={''}
                  slug={''}
                />
              </SwiperSlide>
            );
          })}
          <div className="swiper-button swiper-button-next"></div>
          <div className="swiper-button swiper-button-prev"></div>
        </Swiper>
      ) : (
        <div className="text-center p-5"><h4>No categories found.</h4></div>
      )}
    </div>
  );
};

export default FooterSlider;