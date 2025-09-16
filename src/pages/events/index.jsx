import { memo } from "react"
import EventsSection from "@/components/sections/EventsSection";
import TVPopularShows from "@/components/sections/TVPopularShows";

const Events = memo(() => {

    return <>
    <div className="mt-5">

    <TVPopularShows />
      <EventsSection />
    </div>
    </>
})

export default Events;