import { memo } from "react"
import EventsSection from "@/components/sections/EventsSection";
import HighDemand from "@/components/sections/HighDemand";

const Events = memo(() => {

  return <>
    <div className="mt-5">

      <HighDemand />
      <EventsSection />
    </div>
  </>
})

export default Events;