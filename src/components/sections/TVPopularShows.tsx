import { useState, Fragment, memo } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";

// Components
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";
import { useMyContext } from "@/Context/MyContextProvider";
import { FeatureEvent, getFeatureEvents } from "@/services/home";

// Services

const TVPopularShows = memo(() => {
  const { createSlug } = useMyContext();

  // Fetch feature events using TanStack Query and the dedicated service
  const { data: featureEvents = [], isLoading, isError } = useQuery<FeatureEvent[], Error>({
    queryKey: ['featureEvents'],
    queryFn: getFeatureEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center section-top-spacing">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading Popular Shows...</span>
      </div>
    );
  }

  if (isError) {
    return (
        <div className="section-top-spacing">
            <Alert variant="danger">Failed to load popular shows. Please try again later.</Alert>
        </div>
    );
  }

  return (
    <Fragment>
      <SectionSlider
        title={'High Demand'}
        list={featureEvents}
        className="recommended-block section-top-spacing ms-3"  
      >
        {(data) => (
          <CardStyle
            image={data.thumbnail}
            title={data.name}
            movieTime={data.date_range}
            watchlistLink="/play-list"
            link={`/events/${createSlug(data?.city)}/${createSlug(
              data?.user?.organisation
            )}/${createSlug(data?.name)}/${data?.event_key}`}
            lowest_ticket_price={data.lowest_ticket_price}
              lowest_sale_price={data.lowest_sale_price}
              on_sale={data.on_sale}
          />
        )}
      </SectionSlider>
    </Fragment>
  );
});

TVPopularShows.displayName = 'TVPopularShows';
export default TVPopularShows;
