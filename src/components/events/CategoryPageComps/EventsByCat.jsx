import React from 'react'
import CommonBannerSlider from '../../slider/CommonBannerSlider'
import EventsContainerCat from './EventsContainerCat'

const EventsByCat = (props) => {
  const { bannerData = [], bannerLoading = false, bannerError = null, eventsData = [], eventLoading = false, eventError = null, title } = props;

  return (
    <div className=''>
      <CommonBannerSlider type='category' banners={bannerData} loading={bannerLoading} error={bannerError} />
      <EventsContainerCat events={eventsData} loading={eventLoading} error={eventError} />

    </div>
  )
}

export default EventsByCat