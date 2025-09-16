import { useState, Fragment, memo } from "react";

//components
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";

//static data
import { recommendedforYou } from "../../StaticData/data";
import { useMyContext } from "@/Context/MyContextProvider";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const ExpiredEvents = memo(() => {
  const [title] = useState("Past Events");

  const { api, authToken, createSlug } = useMyContext();

  // TanStack Query for fetching past events
  const { data: pastEvents, isLoading, error } = useQuery({
    queryKey: ['pastEvents'],
    queryFn: async () => {
      const response = await axios.get(`${api}expired-events`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.data.status) {
        return response.data.events || [];
      }
      throw new Error('Failed to fetch past events');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
  });


  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={pastEvents}
        className="recommended-block streamit-block"
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
})

ExpiredEvents.displayName = 'ExpiredEvents';
export default ExpiredEvents;
