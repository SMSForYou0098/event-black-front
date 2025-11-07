import { useQuery } from '@tanstack/react-query';
import React, { Fragment, useState } from 'react'
import SectionSlider from "../slider/SectionSlider";
import ContinueWatchCard from "../cards/ContinueWatchCard";
import { publicApi } from '@/lib/axiosInterceptor';
import { useMyContext } from '@/Context/MyContextProvider';

const BlogSection = () => {
    const {createSlug} = useMyContext();
    const [title] = useState("Explore Blogs");
    const {
        data: allBlogs = [],
        isLoading,
        error,
        refetch
      } = useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
          // const res = await publicApi.get(`/blog-status`);
          const res = await publicApi.get(`/blogs?type=home`);
          if (!res?.data?.status) {
            throw new Error(res?.data?.message || "Failed to fetch blogs");
          }
          return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: 2,
        retryDelay: 1000,
      });

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={allBlogs}
        className="continue-watching-block"
        slidesPerView={6}
      >
        {(data) => (
          <ContinueWatchCard
          imagePath={data.thumbnail}
          progressValue={data.title}
          title={data.title}
          link={`/blogs/${createSlug(data?.title)}?key=${data?.id}`}
        />
        )}
      </SectionSlider>
    </Fragment>

  )
}

export default BlogSection