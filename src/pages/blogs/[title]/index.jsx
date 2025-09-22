import React, { useEffect } from 'react';
import { useMyContext } from "@/Context/MyContextProvider"; //done

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Alert, Col, Row } from 'react-bootstrap';
import { useRouter } from 'next/router';
// import PostById from '../../../components/blog/PostPage';
import CommentsSection from '../../../components/events/blogs/comments/CommentSection';
import PostById from '../../../components/events/blogs/PostPage';
import DetailMetaList from '../../../components/blog/DetailMetaList';
// import RelatedPosts from '../components/RelatedPosts';

const PostPage = () => {
  const { authToken, api } = useMyContext();
  const router = useRouter()
  const { key, title } = router.query;

  // Helper function to transform flat comments into nested replies structure
  const transformComments = (commentsData) => {
    const commentMap = {};
    const rootComments = [];

    // First pass: create a map of all comments
    commentsData.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });

    // Second pass: build the hierarchy
    commentsData.forEach(comment => {
      if (comment.replier_id) {
        const parent = commentMap[comment.replier_id];
        if (parent) {
          parent.replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  // Fetch post data
  const { data: postData, error: postError, isLoading: postLoading } = useQuery({
    queryKey: ['post', key],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${authToken}` };
      const response = await axios.get(`${api}blog-show/${key}`, { headers });

      if (!response.data?.status) {
        throw new Error(response.data?.message || 'Invalid post data format.');
      }

      return response.data;
    },
    enabled: !!key,
    retry: 2,
  });

  console.log('postData', postData)

  // Fetch related posts
  const { data: relatedPostsData, isLoading: relatedLoading } = useQuery({
    queryKey: ['related-posts', key],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${authToken}` };
      const response = await axios.get(`${api}related-blogs/${key}`, { headers });
      return response.data?.data || [];
    },
    enabled: !!key && !!postData,
    retry: 2,
  });

  // Fetch comments
  const { data: commentsData, error: commentsError, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['comments', key],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${authToken}` };
      const response = await axios.get(`${api}blog-comment-show/${key}`, { headers });

      if (response.data?.status) {
        const commentsData = response.data.data || [];
        return transformComments(commentsData);
      }
      return [];
    },
    enabled: !!key,
    retry: 2,
  });

  // Scroll to top when component mounts
  useEffect(() => {
    if (key) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [key]);

  // Handle loading and error states
  const isLoading = postLoading || commentsLoading;
  const error = postError?.message || commentsError?.message;

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className='pt-5'>
      <Row>
          <Col lg={12} sm={12}>
          <PostById
            post={postData?.data}
            categories={postData?.categories || []}
            loading={postLoading}
          />
          <CommentsSection
            comments={commentsData || []}
            id={key}
            refreshComments={refetchComments}
            loading={commentsLoading}
          />
          </Col>
      {/* <Col lg={3} sm={12}>
        <DetailMetaList />
      </Col> */}
      </Row>
      {/* <RelatedPosts 
        posts={relatedPostsData || []} 
        loading={relatedLoading} 
      /> */}
    </div>
  );
};

export default PostPage;