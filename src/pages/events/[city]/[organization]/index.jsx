import React, { useEffect, useMemo } from "react";
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

// ---- API (slug-based) ----
const fetchOrgDetailsBySlug = async ({ queryKey }) => {
  const [, { slug, city }] = queryKey;
  if (!slug) return null;

  // Backend must accept slug here:
  // e.g. GET /landing-orgs/show-details/:slug
  const resp = await publicApi.get(`/landing-orgs/show-details/${slug}`, {
    params: { city },
  });

  const { status, data } = resp?.data ?? {};
  return typeof status !== "undefined" ? (status ? data : null) : (resp?.data || null);
};

const EventsByOrgs = ({ organization: initialOrg, city: initialCity }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { convertSlugToTitle, createSlug } = useMyContext?.() || {};

  // Background refresh configuration
  const BANNER_REFRESH_INTERVAL = 1000 * 60 * 30; // 30 minutes
  const ORG_REFRESH_INTERVAL = 1000 * 60 * 5;    // 5 minutes

  // Extract and normalize path/query params
  const { organization: orgParam, city: cityParam } = router.query;
  const organization = (Array.isArray(orgParam) ? orgParam[0] : orgParam) || initialOrg;
  const city = (Array.isArray(cityParam) ? cityParam[0] : cityParam) || initialCity;

  // Compute slug from organization using context's createSlug
  const slug = useMemo(() => {
    if (!organization) return "";
    return typeof convertSlugToTitle === "function" && convertSlugToTitle(organization);
  }, [organization, createSlug]);

  // NOTE: Banner fetching kept as-is. If your banner API can accept slug, update this block.
  const {
    data: bannersRaw,
    isLoading: bannersLoading,
  } = useQuery({
    queryKey: ["banners", "organization", slug], // key by slug for cache separation
    queryFn: () => fetchBannersForCategory(slug, "organization"), // <-- change your backend if needed
    enabled: !!slug,
    staleTime: BANNER_REFRESH_INTERVAL,
    gcTime: BANNER_REFRESH_INTERVAL * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: BANNER_REFRESH_INTERVAL
  });

  // Fetch organization details by slug
  const {
    data: orgData,
    isLoading: orgLoading,
    isError: orgError,
    error,
  } = useQuery({
    queryKey: ["landing-orgs-show-details", { slug, city }],
    queryFn: fetchOrgDetailsBySlug,
    enabled: Boolean(router.isReady && slug),
    staleTime: ORG_REFRESH_INTERVAL,
    gcTime: ORG_REFRESH_INTERVAL * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: ORG_REFRESH_INTERVAL,
    retry: 1,
  });

  // Prefetch related data (other cities) using the same slug
  useEffect(() => {
    if (orgData?.cities?.length && slug) {
      orgData.cities.forEach(c =>
        queryClient.prefetchQuery({
          queryKey: ["landing-orgs-show-details", { slug, city: c }],
          queryFn: fetchOrgDetailsBySlug,
          staleTime: ORG_REFRESH_INTERVAL
        })
      );
    }
  }, [orgData, slug, queryClient]);

  // Early returns
  if (!router.isReady) return null;

  if (!organization) {
    return (
      <div className="p-3 text-center">
        <p className="text-muted">
          Missing organization in the URL. Expected route: <code>/events/[city]/[organization]</code>.
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

  // SEO
  const cityFormatted = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
  const seoTitle = `Events in ${cityFormatted} | Get Your Ticket`;
  const seoDescription = `Book ${displayTitle} event tickets in ${cityFormatted}. Find upcoming events, shows, concerts & more. Best prices guaranteed. Easy & secure booking.`;

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
    <div className="">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${displayTitle}, events, tickets, ${cityFormatted}, book online`}
        image={orgData?.logo}
        url={`/events/${city}/${organization}`}
        type="organization"
        structuredData={organizationSchema}
      />
      <div className="">
        <CommonBannerSlider
          type="organization"
          banners={bannersRaw}
          loading={bannersLoading}
        />
      </div>

      <section className="py-5 px-3">
        <EventsContainerCat
          events={orgData}
          loading={orgLoading}
          title={''}
        />
      </section>

    </div>
  );
};

const slugifyForSSR = (str = "") =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const getOrganizationSSR = async (context) => {
  const { query } = context;
  const { organization: orgParam, city: cityParam } = query;

  const organization = Array.isArray(orgParam) ? orgParam[0] : orgParam;
  const city = Array.isArray(cityParam) ? cityParam[0] : cityParam;

  // Only require path params now
  if (!organization || !city) {
    return { notFound: true };
  }

  const slug = slugifyForSSR(organization);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30,   // 30 minutes
      },
    },
  });

  try {
    // Prefetch org details by slug; banners left as-is (update if backend accepts slug)
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["landing-orgs-show-details", { slug, city }],
        queryFn: fetchOrgDetailsBySlug,
        staleTime: 1000 * 60 * 5,
      }),
    ]);

    // CDN caching
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
    process.env.NODE_ENV === 'production' ? 300 : 0
  )
);

export { getServerSideProps };
export default EventsByOrgs;
