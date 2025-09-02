import { memo } from "react"
import BestOfInternationalShows from "@/components/sections/BestOfInternationalShows";
import TVPopularShows from "@/components/sections/TVPopularShows";

const Events = memo(() => {

    return <>
    <div className="mt-5">

    <TVPopularShows />
      <BestOfInternationalShows />
    </div>
    </>
})

export default Events;