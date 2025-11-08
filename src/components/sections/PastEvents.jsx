import { Fragment, memo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import SectionSlider from "../slider/SectionSlider";
import SectionList from "../slider/SectionList";
import ContinueWatchCard from "../cards/ContinueWatchCard";

// Utils
import { api } from "@/lib/axiosInterceptor";

const PastEvents = memo(({ type='events', viewSlider=true, hideViewAll=true }) => {
  const [title] = useState("Past Events");

  const {
    data: apiEvents = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["past-events", type || "all"],
    queryFn: async () => {
      const res = await api.get("/successfulEvent?type=events");
      return res?.data?.eventData || [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  console.log('api',apiEvents);

  // 🔸 Commented out placeholder logic
  /*
  const placeholders = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: `ph-${i}`,
        image: generateImgPath(`/assets/genre/${String(i + 1).padStart(2, "0")}.webp`),
        value: Math.floor(Math.random() * 100),
      })),
    []
  );
  */

  if (isLoading) {
    return <div>Loading past events...</div>;
  }

  if (isError) {
    return (
      <div className="text-danger">
        Failed to load past events: {error?.message || "Unknown error"}
      </div>
    );
  }

  // Handle case when no events are returned
  if (!apiEvents.length) {
    return <div>No past events found.</div>;
  }

  return (
    <Fragment>
      {
        viewSlider ?
      <SectionSlider
        title={title}
        list={apiEvents}
        className="continue-watching-block"
        slidesPerView={6}
        onViewAll='/events/past'
        hideViewAll={hideViewAll}
      >
        {(item) => (
          <ContinueWatchCard
            imagePath={item?.thumbnail || item?.banner || item?.posterUrl}
            progressValue={0}
            title={item?.title}
          link={item?.url}

          />
        )}
      </SectionSlider>
      : 
      <SectionList  title={title}
      list={apiEvents}
      className=""
      slidesPerView={6}
      onViewAll='/events/past'>
      {(item) => (
        <ContinueWatchCard
          imagePath={item?.thumbnail || item?.banner || item?.posterUrl}
          progressValue={0}
          title={item?.title}
        link={item?.url}
        hideViewAll={hideViewAll}

        />
      )}
    </SectionList>
      }
    </Fragment>
  );
});

PastEvents.displayName = "PastEvents";
export default PastEvents;
