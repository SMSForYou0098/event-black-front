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

const fetchBannersForCategory = async (type) => {
  // calls banner-list/{type}
  // const response = await api.get(`/banner-list/category?title=${type}`);
  const response = await api.get(`/banner-list/category`);
  return response.data;
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
    queryKey: ["banners", category_name],
    queryFn: () => fetchBannersForCategory(category_name),
    enabled: !!category_name, // only run once we have the category_name
  });

  // normalize banner payload to an array the UI expects
  const bannerData =
    (bannersRaw && (bannersRaw.banners || bannersRaw.data || bannersRaw)) || [];

  console.log("category events", categoryData);
  console.log("banners for category", bannerData);

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
        />
      </div>
    </>
  );
};

export default EventsByCategory;
