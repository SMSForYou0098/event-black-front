import { Fragment, memo, useMemo } from "react";
import { Spinner, Alert, Placeholder } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";
import { useMyContext } from "@/Context/MyContextProvider";
import CardStyle from "@/components/cards/CardStyle";
import ProductCard from "@/components/cards/ProductCard";
import SectionSlider from "@/components/slider/SectionSlider";
import TopTenCard from './TopTenCard';
import SkeletonLoader from '../SkeletonUtils/SkeletonLoader'

const EventsContainer = memo(({
  title = "Events",
  className = "recommended-block section-top-spacing streamit-block",
  loadingText = "Loading Events...",
  errorText = "Failed to load events. Please try again later.",
  queryKey = ['events'],
  queryFn = null,
  staleTime = 5 * 60 * 1000, // 5 minutes
  retry = 2,
  apiEndpoint = "events",
  isTopTenCard = false,
}) => {
  const { createSlug } = useMyContext();

  // Memoized default fetch function using axios interceptor
  const defaultFetchEvents = useMemo(() => async () => {
    const response = await api.get(apiEndpoint, {
      params: {
        fields: "id,name,thumbnail,eventMedia,city,organisation,event_key,house_full"
      }
    });
    if (response.data.status) {
      return response.data?.events || [];
    }
    return [];
  }, [apiEndpoint]);

  // React Query implementation
  const {
    data: eventsList = [],
    isLoading,
    isError
  } = useQuery({
    queryKey,
    queryFn: queryFn || defaultFetchEvents,
    staleTime,
    retry,
  });

  // Enhanced loading state with skeleton loader
  if (isLoading) {
    return (
      <div className={`${className}`} style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        minHeight: '400px'
      }}>
        <SkeletonLoader />
      </div>
    );
  }

  // Show message when no events found
  if (!eventsList || eventsList.length === 0) {
    return null;
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

          return isTopTenCard ? (
            <TopTenCard
              image={data?.thumbnail || data?.eventMedia?.thumbnail}
              countValue={finalIndex + 1} // ascending order 1,2,3...
              link={`/events/${createSlug(data?.city)}/${createSlug(
                data?.organisation
              )}/${createSlug(data?.name)}/${data?.event_key}`}
              houseFull={data?.house_full === 1}
            />
          ) : (
            <ProductCard
              thumbnail={data?.thumbnail || data?.eventMedia?.thumbnail}
              product_name={data.name}
              lowest_ticket_price={data.lowest_ticket_price}
              lowest_sale_price={data.lowest_sale_price}
              rating="5"
              count1={finalIndex + 1}
              on_sale={data.on_sale}
              city={data?.city}
              slug={data.slug}
              link={`/events/${createSlug(data?.city)}/${createSlug(
                data?.organisation
              )}/${createSlug(data?.name)}/${data?.event_key}`}
              houseFull={data?.house_full === 1}
            />
          );
        }}
      </SectionSlider>

    </Fragment>

  );
});

EventsContainer.displayName = 'EventsContainer';
export default EventsContainer;