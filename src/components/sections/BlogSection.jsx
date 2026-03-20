import { useQuery } from '@tanstack/react-query';
import React, { Fragment, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import CardBlogGrid from "../cards/CardBlogGrid";
import { publicApi } from '@/lib/axiosInterceptor';
import { useMyContext } from '@/Context/MyContextProvider';

const BlogSection = () => {
  const { createSlug, formatDateDDMMYYYY } = useMyContext();
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

  if (allBlogs.length === 0) return null;

  return (
    <Fragment>
      <div className="section-padding">
        <Container fluid>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="main-title text-capitalize mb-0">{title}</h4>
          </div>
          <Row>
            {allBlogs.slice(0, 10).map((data, index) => (
              <Col lg="3" md="4" sm="6" key={index} className="mb-4">
                <CardBlogGrid
                  thumbnail={data.thumbnail}
                  username={data.user_data?.name || data.username || "Admin"}
                  title={data.title}
                  link={`/blogs/${createSlug(data?.title)}?key=${data?.id}`}
                  date={data?.created_at ? formatDateDDMMYYYY(data.created_at) : "Date"}
                  description={data?.description || ""}
                  categories={data?.categories?.map(c => c.title).join(', ') || ""}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </Fragment>

  )
}

export default BlogSection