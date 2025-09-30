import { Fragment, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import OrganisationEvents from "../slider/OrganisationEvents";
import { api } from "@/lib/axiosInterceptor";

// API function
const fetchOrganisations = async () => {
  const resp = await api.get("/landing-orgs");
  // assume response like: { status: true, organisations: [] }
  return resp.data;
};

const Organisations = memo(() => {
  // TanStack Query hook
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["organisations"], // cache key
    queryFn: fetchOrganisations,
    staleTime: 1000 * 60 * 5, // optional: 5 minutes
  });

  if (isLoading) return <div>Loading organisations...</div>;
  if (isError) return <div>Error: {(error).message}</div>;

  return (
    <Fragment>
      {/* Pass organisations data into OrganisationEvents */}
      <OrganisationEvents data={data?.data} />
    </Fragment>
  );
});

Organisations.displayName = "Organisations";
export default Organisations;
