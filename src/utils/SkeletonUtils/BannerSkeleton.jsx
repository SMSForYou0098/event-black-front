import { memo } from "react";
import { Col, Row, Placeholder } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "../../store/setting/selectors";

const BannerSkeleton = memo(() => {
  const themeSchemeDirection = useSelector(theme_scheme_direction);

  return (
    <section className="banner-container section-padding">
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
            className="h-50"
          >
            {[...Array(3)].map((_, index) => (
              <SwiperSlide key={index}>
                <div className="movie-banner-image position-relative">
                  <Placeholder animation="glow">
                    <Placeholder 
                      xs={12} 
                      style={{ height: '150px' }} 
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
});

BannerSkeleton.displayName = 'BannerSkeleton';
export default BannerSkeleton;