import { FC, Fragment, memo, useState } from "react";

// Component
import SectionSlider from "../slider/SectionSlider";
import ContinueWatchCard from "../cards/ContinueWatchCard";

// Function
import { generateImgPath } from "../../StaticData/data";

const PastEvents = memo(({type}) => {
  const [title] = useState("Past Events");
  const [watching, setWatching] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      image: generateImgPath(`/assets/genre/${String(i + 1).padStart(2, "0")}.webp`),
      value: Math.floor(Math.random() * 100), // Optional: random progress for demo
    }))
  );
  

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={watching}
        className="continue-watching-block"
        slidesPerView={6}
      >
        {(data) => (
          <ContinueWatchCard
          imagePath={data.image}
          progressValue={data.value}
        />
        )}
      </SectionSlider>
    </Fragment>
  );
});

PastEvents.displayName = "PastEvents";
export default PastEvents;
