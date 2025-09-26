import React from 'react'
import CategoryBanners from './CategoryBanners'
import EventsContainerCat from './EventsContainerCat'
import CommonBannerSlider from '../../slider/CommonBannerSlider'

const EventsByCat = ({bannerData=[], bannerLoading=false, eventsData=[], eventLoading=false}) => {
  return (
    <div className='mb-5'>
        <CommonBannerSlider type='category' banners={bannerData} loading={bannerLoading}/>
        <EventsContainerCat events={eventsData} loading={eventLoading}/>
    </div>
  )
}

export default EventsByCat