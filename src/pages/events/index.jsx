import { memo } from "react"
import EventsSection from "@/components/sections/EventsSection";
import HighDemand from "@/components/sections/HighDemand";

const Events = memo(() => {

  return <>
    <div >
      {/* <HomeOrgs/> */}
      <HighDemand />
      <EventsSection />
    </div>
  </>
})

export default Events;