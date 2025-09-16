import { useState, Fragment, memo, useEffect } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Components
// import SectionSlider from "../slider/SectionSlider";
// import CardStyle from "../cards/CardStyle";
import { useMyContext } from "@/Context/MyContextProvider";
import CardStyle from "@/components/cards/CardStyle";
import SectionSlider from "@/components/slider/SectionSlider";

const EventsContainer = memo(({ 
  title = "Events",
  className = "recommended-block section-top-spacing streamit-block",
  loadingText = "Loading Events...",
  errorText = "Failed to load events. Please try again later.",
  useReactQuery = false,
  queryKey = ['events'],
  queryFn = null,
  staleTime = 5 * 60 * 1000, // 5 minutes
  retry = 2,
  apiEndpoint = "events",
  customFetchFunction = null
}) => {
  const { api, authToken, createSlug } = useMyContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Default fetch function using axios
  const defaultFetchEvents = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${api}${apiEndpoint}`, {
        headers: { Authorization: "Bearer " + authToken },
      });

      if (response.data.status) {
        setEvents(response.data?.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(true);
    }
    setLoading(false);
  };

  // React Query implementation
  const { 
    data: queryData = [], 
    isLoading: queryLoading, 
    isError: queryError 
  } = useQuery({
    queryKey,
    queryFn: queryFn || (() => Promise.resolve([])),
    staleTime,
    retry,
    enabled: useReactQuery && !!queryFn
  });

  // Effect for non-React Query approach
  useEffect(() => {
    if (!useReactQuery) {
      if (customFetchFunction) {
        customFetchFunction(setEvents, setLoading, setError);
      } else {
        defaultFetchEvents();
      }
    }
  }, [useReactQuery, apiEndpoint, api, authToken]);

  // Determine which data and states to use
  const isLoading = useReactQuery ? queryLoading : loading;
  const isError = useReactQuery ? queryError : error;
  const eventsList = useReactQuery ? queryData : events;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center section-top-spacing">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">{loadingText}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="section-top-spacing">
        <Alert variant="danger">{errorText}</Alert>
      </div>
    );
  }

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={eventsList}
        className={className}
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

EventsContainer.displayName = 'EventsContainer';
export default EventsContainer;