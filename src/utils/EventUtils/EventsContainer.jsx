import { useState, Fragment, memo, useEffect, useMemo } from "react";
import { Spinner, Alert, Placeholder } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMyContext } from "@/Context/MyContextProvider";
import CardStyle from "@/components/cards/CardStyle";
import SectionSlider from "@/components/slider/SectionSlider";
import TopTenCard from './TopTenCard';
import SkeletonLoader from '../SkeletonUtils/SkeletonLoader'
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

  // Memoized default fetch function
  const defaultFetchEvents = useMemo(() => async () => {
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
    } finally {
      setLoading(false);
    }
  }, [api, apiEndpoint, authToken]);

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
  }, [useReactQuery, customFetchFunction, defaultFetchEvents]);

  // Determine which data and states to use
  const isLoading = useReactQuery ? queryLoading : loading;
  const isError = useReactQuery ? queryError : error;
  const eventsList = useReactQuery ? queryData : events;

  // Enhanced loading state with both skeleton and spinner options
  if (isLoading) {
    return (
      <div className={`${className}`} style={{ 
        backgroundColor: '#000000', 
        color: '#ffffff',
        minHeight: '400px'
      }}>
        {/* You can switch between SkeletonLoader and SimpleLoader */}
        <SkeletonLoader />
        {/* Uncomment below and comment above if you prefer simple spinner */}
        {/* <SimpleLoader /> */}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="section-top-spacing">
        <Alert variant="danger" className="mx-3">
          <Alert.Heading>Oops! Something went wrong</Alert.Heading>
          <p className="mb-0">{errorText}</p>
        </Alert>
      </div>
    );
  }

  // Show message when no events found
  if (!eventsList || eventsList.length === 0) {
    return (
      <div className={`${className} text-center py-5`}>
        <div className="text-light">
          <h3>No Events Available</h3>
          <p className="text-muted">Check back later for upcoming events!</p>
        </div>
      </div>
    );
  }

  return (
<Fragment>
<SectionSlider title={title} list={eventsList} className={className}>
   {(data, index) => {
          // Ensure index is a valid number, fallback to array index if needed
          const safeIndex = typeof index === 'number' && !isNaN(index) 
            ? index 
            : eventsList.findIndex(item => item === data);
          
          const finalIndex = safeIndex >= 0 ? safeIndex : 0;
          
          return title === 'High Demand' ? (
            <TopTenCard
              image={data.thumbnail}
              countValue={finalIndex + 1} // ascending order 1,2,3...
              link={`/events/${createSlug(data?.city)}/${createSlug(
                data?.user?.organisation
              )}/${createSlug(data?.name)}/${data?.event_key}`}
            />
          ) : (
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
          );
        }}
</SectionSlider>

</Fragment>

  );
});

EventsContainer.displayName = 'EventsContainer';
export default EventsContainer;