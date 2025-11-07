import { FC, Fragment, memo, useState } from "react";

// Component
import SectionSlider from "../slider/SectionSlider";
// import ContinueWatchCard from "../cards/ContinueWatchCard";

// Function
import { generateImgPath } from "../../StaticData/data";
import ProductCard from "../cards/ProductCard";

const OurEvents = memo(({type}) => {
  const [title] = useState("Events Categories");
  const [watching, setWatching] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      image: generateImgPath(`/assets/our-events/${String(i + 1).padStart(2, "0")}.webp`),
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
          <ProductCard
            thumbnail={data.image}
            imageOnly={true}
            // progressValue={data.value}
            // dataLeftTime={data.leftTime}
            // link="/movies/detail"
          />
        )}
      </SectionSlider>
    </Fragment>
  );
});

OurEvents.displayName = "OurEvents";
export default OurEvents;
