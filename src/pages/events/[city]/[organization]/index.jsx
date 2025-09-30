import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/axiosInterceptor";
import { useMyContext } from "@/Context/MyContextProvider";
import EventsContainerCat from "../../../../components/events/CategoryPageComps/EventsContainerCat";
import { fetchBannersForCategory } from "../../category/[category_name]";
import CommonBannerSlider from "../../../../components/slider/CommonBannerSlider";

// ---- API ----
const fetchOrgDetails = async ({ queryKey }) => {
  const [, { id }] = queryKey;
  
  const resp = await publicApi.get(`/landing-orgs/show-details/${id}`);
  const { status, data } = resp?.data ?? {};
  
  // Return data if status is truthy, otherwise return raw response data
  return typeof status !== "undefined" ? (status ? data : null) : resp?.data;
};

const EventsByOrgs = () => {
  const router = useRouter();
  const { convertSlugToTitle } = useMyContext();

  // Extract and normalize query params
  const { key: idParam, organization: orgParam } = router.query;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const organization = Array.isArray(orgParam) ? orgParam[0] : orgParam;

  // Fetch banners
  const {
    data: bannersRaw,
    isLoading: bannersLoading,
  } = useQuery({
    queryKey: ['banners', organization],
    queryFn: () => fetchBannersForCategory(organization, 'organization'),
    enabled: !!organization,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // Fetch organization details
  const {
    data: orgData,
    isLoading: orgLoading,
    isError: orgError,
    error,
  } = useQuery({
    queryKey: ["landing-orgs-show-details", { id }],
    queryFn: fetchOrgDetails,
    enabled: Boolean(router.isReady && id),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Early returns for loading and error states
  if (!router.isReady) return null;

  if (!id) {
    return (
      <div className="p-3 text-center">
        <p className="text-muted">
          Missing organization ID. Please provide a valid <code>?key=ID</code> parameter.
        </p>
      </div>
    );
  }

  if (orgLoading) {
    return (
      <div className="p-3 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading organization details...</span>
        </div>
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="p-3">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error?.message || "Failed to load organization details."}
        </div>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="p-3">
        <div className="alert alert-info" role="alert">
          No details found for this organization.
        </div>
      </div>
    );
  }

  // Generate display title
  const displayTitle = convertSlugToTitle?.(organization || "") || organization || "Organization Events";

  return (
    <div className="section-padding">
      <CommonBannerSlider 
        type="organization" 
        banners={bannersRaw} 
        loading={bannersLoading}
      />
      
      <EventsContainerCat
        events={orgData}
        loading={orgLoading}
        title={displayTitle}
      />
    </div>
  );
};

export default EventsByOrgs;