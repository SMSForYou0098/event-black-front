import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";
import ProductCard from "@/components/cards/ProductCard";
import { useMyContext } from "../../Context/MyContextProvider";
import SectionList from "../../components/slider/SectionList";
import { getErrorMessage } from "@/utils/errorUtils";
import NoDataFound from "../../components/CustomComponents/NoDataFound";


// Make this accept params (even if you keep them static for now)
export const fetchGlobalSearch = async (searchQuery, categoryFilter) => {
  const response = await api.get("/global-search", {
    params: {
      search: searchQuery || 'offer',
    },
  });
  return response.data;
};

const OffersPage = () => {


  const searchQuery = "offer"; // you can take this from state or props
  const categoryFilter = "concert"; // same here if dynamic
  const { createSlug } = useMyContext();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["global-search", searchQuery, categoryFilter],
    queryFn: () => fetchGlobalSearch(searchQuery, categoryFilter),
    enabled: !!searchQuery, // prevents call if searchQuery is empty
  });

  if (isLoading) return <div>Loading offers...</div>;
  if (isError) return <div>Error: {getErrorMessage(error)}</div>;


  const items = data?.data || [];

  return (
    <div className="py-3">
      <SectionList title="Offers" list={items} columns={6}>
        {(item, index) => (
          <ProductCard
            key={item?.event_key || item?.id || index}
            thumbnail={item?.event_media?.thumbnail}
            product_name={item?.name}
            noPrice={true}
            count1={index + 1}
            on_sale={item?.on_sale}
            city={item?.city}
            slug={item?.slug}
            link={`/events/${createSlug(item?.venue?.city)}/${createSlug(
              item?.organizer?.organisation
            )}/${createSlug(item?.name)}/${item?.event_key}`}
          />
        )}
      </SectionList>

      {/* No Data Found */}
      {items.length === 0 &&
        <div className="container-fluid">
          <NoDataFound />
        </div>
      }
    </div>
  );
};

export default OffersPage;
