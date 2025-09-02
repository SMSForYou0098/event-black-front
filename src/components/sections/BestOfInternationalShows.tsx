import { useState, Fragment, memo, useEffect } from "react";

//components
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";

//static data
import { latestMovie } from "../../StaticData/data";
import { useMyContext } from "@/Context/MyContextProvider";
import axios from "axios";

const BestOfInternationalShows = memo(()=> {
  const { api, authToken, createSlug } = useMyContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title] = useState("Events");
    const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api}events`, {
        headers: { Authorization: "Bearer " + authToken },
      });

      if (response.data.status) {
        setEvents(response.data?.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={events}
        className="recommended-block section-top-spacing streamit-block"
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

BestOfInternationalShows.displayName = 'BestOfInternationalShows';
export default BestOfInternationalShows;
