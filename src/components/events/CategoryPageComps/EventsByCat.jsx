import React from 'react'
import CommonBannerSlider from '../../slider/CommonBannerSlider'
import EventsContainerCat from './EventsContainerCat'

const EventsByCat = (props) => {
 const {bannerData=[], bannerLoading=false, eventsData=[], eventLoading=false  , title} = props;
  return (
    <div className='mb-5'>
        <CommonBannerSlider type='category' banners={bannerData} loading={bannerLoading}/>
        <EventsContainerCat events={eventsData} loading={eventLoading} title={title}/>
    </div>
  )
}

export default EventsByCat