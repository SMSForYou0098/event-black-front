import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "@/lib/axiosInterceptor";
import { useMyContext } from "@/Context/MyContextProvider";
import EventsContainerCat from "../../../../components/events/CategoryPageComps/EventsContainerCat";
import { fetchBannersForCategory } from "../../category/[category_name]";
import CommonBannerSlider from "../../../../components/slider/CommonBannerSlider";
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { SEOHead, generateOrganizationSchema } from '@/utils/seo/seo';
import { withSSR, withCache, withDevLogging } from '@/utils/seo/ssr';

// ---- API ----
const fetchOrgDetails = async ({ queryKey }) => {
    const [, { id, city }] = queryKey;
    if (!id) return null;
  
    const resp = await publicApi.get(`/landing-orgs/show-details/${id}`, {
      params: { city }, // attach city in query params
    });
  
    const { status, data } = resp?.data ?? {};
    return typeof status !== "undefined" ? (status ? data : null) : resp?.data;
  };

const EventsByOrgs = ({ organization: initialOrg, city: initialCity }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { convertSlugToTitle } = useMyContext();

  // Background refresh configuration
  const BANNER_REFRESH_INTERVAL = 1000 * 60 * 30; // 30 minutes
  const ORG_REFRESH_INTERVAL = 1000 * 60 * 5;    // 5 minutes

  // Extract and normalize query params
  const { key: idParam, organization: orgParam, city: cityParam } = router.query;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;                // ?key=9306
  const organization = Array.isArray(orgParam) ? orgParam[0] : orgParam;  // /events/[city]/[organization]
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;       // ?city=ahmedabad

  // Fetch banners for this organization by ID (single ?id param expected on the API)
  const {
    data: bannersRaw,
    isLoading: bannersLoading,
  } = useQuery({
    queryKey: ["banners", "organization", id],
    queryFn: () => fetchBannersForCategory(id, "organization"),
    enabled: !!id,
    staleTime: BANNER_REFRESH_INTERVAL,
    gcTime: BANNER_REFRESH_INTERVAL * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: BANNER_REFRESH_INTERVAL
  });

  // Fetch organization details
  const {
    data: orgData,
    isLoading: orgLoading,
    isError: orgError,
    error,
  } = useQuery({
    queryKey: ["landing-orgs-show-details", { id, city}],
    queryFn: fetchOrgDetails,
    enabled: Boolean(router.isReady && id),
    staleTime: ORG_REFRESH_INTERVAL,
    gcTime: ORG_REFRESH_INTERVAL * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: ORG_REFRESH_INTERVAL,
    retry: 1,
  });

  // Prefetch related data
  useEffect(() => {
    if (orgData) {
      // Prefetch other cities data
      orgData.cities?.forEach(city => {
        queryClient.prefetchQuery({
          queryKey: ["landing-orgs-show-details", { id, city }],
          queryFn: () => fetchOrgDetails({ queryKey: ["", { id, city }] }),
          staleTime: ORG_REFRESH_INTERVAL
        });
      });
    }
  }, [orgData, id, queryClient]);

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
  const displayTitle =
    (typeof convertSlugToTitle === "function"
      ? convertSlugToTitle(organization || "")
      : organization) || "Organization Events";

  // Generate SEO data
  const cityFormatted = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
  const seoTitle = `${displayTitle} Events in ${cityFormatted} | Get Your Ticket`;
  const seoDescription = `Book ${displayTitle} event tickets in ${cityFormatted}. Find upcoming events, shows, concerts & more. Best prices guaranteed. Easy & secure booking.`;

  // Generate organization schema
  const organizationSchema = {
    ...generateOrganizationSchema(),
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityFormatted,
        "addressCountry": "IN"
      }
    },
    "name": displayTitle,
    "image": orgData?.logo || `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
  };

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${displayTitle}, events, tickets, ${cityFormatted}, book online`}
        image={orgData?.logo}
        url={`/events/${city}/${organization}`}
        type="organization"
        structuredData={organizationSchema}
      />
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
    </>
  );
};

// Organization SSR handler with data fetching and caching
const getOrganizationSSR = async (context) => {
  const { query } = context;
  const { key: idParam, organization: orgParam, city: cityParam } = query;
  
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const organization = Array.isArray(orgParam) ? orgParam[0] : orgParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  if (!id || !organization || !city) {
    return { notFound: true };
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
      },
    },
  });

  try {
    // Prefetch organization details and banners in parallel with optimized settings
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["landing-orgs-show-details", { id, city }],
        queryFn: () => fetchOrgDetails({ queryKey: ["", { id, city }] }),
        staleTime: 1000 * 60 * 5, // 5 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: ["banners", "organization", id],
        queryFn: () => fetchBannersForCategory(id, "organization"),
        staleTime: 1000 * 60 * 30, // 30 minutes for static content
      })
    ]);

    // Set cache-control headers for CDN caching
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        organization,
        city,
      },
    };
  } catch (error) {
    console.error("Error in getOrganizationSSR:", error);
    return { notFound: true };
  }
};

// Export getServerSideProps with caching and development logging
const getServerSideProps = withDevLogging(
  withCache(
    withSSR(getOrganizationSSR),
    // Cache for 5 minutes in production, no cache in development
    process.env.NODE_ENV === 'production' ? 300 : 0
  )
);

export { getServerSideProps };
export default EventsByOrgs;
