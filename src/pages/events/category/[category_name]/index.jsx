"use client";
import React from "react";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";
import { CategorySEO } from "../../../../components/events/SEO";
import EventsByCat from "../../../../components/events/CategoryPageComps/EventsByCat";

const fetchCategoryEvents = async (category_name) => {
  const response = await api.get(`/category-events/${category_name}`);
  return response.data;
};

export const fetchBannersForCategory = async (categoryName,type) => {
  
  // if backend expects a query param, pass it — otherwise remove the `?title=...` part
  const url = categoryName ? `/banner-list/${type}?title=${(categoryName)}` : `/banner-list/category`;
  const res = await api.get(url);
  const payload = res.data;

  // some backends return: [{ status: false, message: "Banner not found" }]
  if (Array.isArray(payload) && payload.length && payload[0]?.status === false) {
    return [];
  }

  // or: { status: false, message: "Banner not found" }
  if (payload && typeof payload === 'object' && payload.status === false) {
    return [];
  }

  // If response contains banner array under known keys – normalize and return the array
  if (payload?.banners && Array.isArray(payload.banners)) return payload.banners;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;

  // If payload itself is an array of banners, return it
  if (Array.isArray(payload)) return payload;

  // If payload is an object that *is* a single banner, wrap it in an array
  if (payload && typeof payload === 'object') {
    // sometimes API returns { data: { banners: [...] } } or { data: {...} }
    if (payload.data && Array.isArray(payload.data.banners)) return payload.data.banners;
    if (payload.data && Array.isArray(payload.data)) return payload.data;
    // fallback: treat as single banner object
    return [payload];
  }

  // anything else -> no banners
  return [];
};

const EventsByCategory = () => {
  const { convertSlugToTitle } = useMyContext();
  const router = useRouter();
  const { category_name } = router.query;
  const {
    data: categoryData,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorObj,
  } = useQuery({
    queryKey: ["category-events", category_name],
    queryFn: () => fetchCategoryEvents(category_name),
    enabled: !!category_name, // only runs when category_name is available
  });

  const {
    data: bannersRaw,
    isLoading: bannersLoading,
    isError: bannersError,
    error: bannersErrorObj,
  } = useQuery({
    queryKey: ['banners', category_name],
    queryFn: () => fetchBannersForCategory(category_name, 'category'),
    enabled: !!category_name,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30, // renamed from cacheTime in v5
    refetchOnWindowFocus: false,
    throwOnError: false, // prevent throwing errors, handle them manually
  });
  
  // Ensure bannerData is always a plain array (UI expects array)
  const bannerData = Array.isArray(bannersRaw) ? bannersRaw : (bannersRaw ? [bannersRaw] : []);


  if (eventsError) {
    return (
      <div className="mt-5 pt-5">
        Error fetching category data: {eventsErrorObj?.message || "Unknown error"}
      </div>
    );
  }

  // optional: if you want to show banner fetch error separately, you can log it
  if (bannersError) {
    console.error("Error fetching banners:", bannersErrorObj);
    // don't early-return — we can still render the page without banners
  }

  return (
    <>
      {/* Add CategorySEO component */}
      {categoryData && (
        <CategorySEO categoryData={categoryData} categorySlug={category_name} />
      )}

      <div className="mt-5 pt-5 p-3">
        <EventsByCat
          bannerData={bannerData}
          bannerLoading={bannersLoading}
          eventsData={categoryData?.events}
          eventLoading={eventsLoading}
          title={categoryData?.category}
        />
      </div>
    </>
  );
};

export default EventsByCategory;