import { memo } from "react";
import HomeBannerSlider from "@/components/slider/HomeBannerSlider";
import HighDemand from "@/components/sections/HighDemand";
import EventsSection from "@/components/sections/EventsSection";
import ExpiredEvents from "@/components/sections/ExpiredEvents";
import { useEnterExit } from "@/utilities/usePage";
import FooterSlider from "@/components/sections/FooterSlider";

const OTT = memo(() => {
  useEnterExit()

  return (
    <>
      <HomeBannerSlider />
      <HighDemand />
      <EventsSection />
      <ExpiredEvents />
      <FooterSlider />
    </>
  );
});

OTT.displayName = "OTT";
export default OTT;
