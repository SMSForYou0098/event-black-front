import React from 'react'
import CategoryBanners from './CategoryBanners'
import EventsContainerCat from './EventsContainerCat'

const EventsByCat = (props) => {
 const {bannerData=[], bannerLoading=false, eventsData=[], eventLoading=false  , title} = props;
  return (
    <div className='mb-5'>
        <CategoryBanners banners={bannerData} loading={bannerLoading}/>
        <EventsContainerCat events={eventsData} loading={eventLoading} title={title}/>
    </div>
  )
}

export default EventsByCat