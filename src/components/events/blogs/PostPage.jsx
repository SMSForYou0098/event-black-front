import React, { Fragment, useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import parse from 'html-react-parser';
import { useMyContext } from "@/Context/MyContextProvider";
import Image from 'next/image';
import PostSkeleton from '../../../utils/SkeletonUtils/blogs/PostSkeleton';
import { CustomTooltip } from '../../../utils/CustomTooltip';

const PostById = ({ post, categories, loading }) => {
  const { isMobile } = useMyContext();

  const postTags = useMemo(() => {
    let tags = post?.tags;

    // If tags are missing, try to use categories as fallback
    if (!tags || (Array.isArray(tags) && tags.length === 0)) {
      if (post?.categories && Array.isArray(post.categories)) {
        return post.categories.map(c => typeof c === 'object' ? c.title : c);
      }
      return [];
    }

    if (Array.isArray(tags)) return tags.map(t => typeof t === 'object' ? t.title || t.name : t);
    if (typeof tags === 'string') return tags.split(',').map(t => t.trim());
    return [];
  }, [post?.tags, post?.categories]);

  const visibleTags = postTags.slice(0, 3);
  const hiddenTags = postTags.slice(3);

  const formattedDate = useMemo(() => {
    if (!post?.created_at) return "";
    try {
      const d = new Date(post.created_at);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
      }
    } catch (e) { }
    return post.created_at;
  }, [post?.created_at]);

  const parseContentWithImages = (html) => {
    if (!html || typeof html !== 'string') {
      return <div className="text-muted">Content not available</div>;
    }

    const options = {
      replace: (domNode) => {
        if (domNode.name === 'img') {
          return (
            <div className="text-center my-4">
              <img
                src={domNode.attribs.src}
                alt={domNode.attribs.alt || ''}
                className="img-fluid rounded-3 shadow"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'inline-block'
                }}
              />
            </div>
          );
        }
        // Style blockquote if it appears
        if (domNode.name === 'blockquote') {
          return (
            <blockquote className="my-5 p-4 border-start border-danger border-4 rounded-end" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              {domNode.children.map((child, i) => {
                const content = child.data || (child.children && child.children[0]?.data) || "";
                return <p key={i} className="mb-0 text-white font-italic fs-5" style={{ fontStyle: 'italic' }}>"{content}"</p>
              })}
            </blockquote>
          );
        }
      }
    };
    return parse(html, options);
  };

  if (loading) return <PostSkeleton />;

  return (
    <Row className="">
      <Col lg={12} className=''>
        {/* 1. Featured Image */}
        {post?.thumbnail && (
          <div className="post-featured-image mb-4 overflow-hidden rounded-4">
            <Image
              src={post?.thumbnail || 'https://placehold.co/1200x628'}
              alt={post?.title}
              width={1200}
              height={628}
              layout="responsive"
              objectFit="cover"
              className="img-fluid"
            />
          </div>
        )}

        {/* 2. Meta Info */}
        <div className="iq-blog-meta d-flex flex-wrap align-items-center gap-3 mb-3 text-uppercase" style={{ fontSize: '13px', fontWeight: '600', color: '#ADB5BD' }}>
          <div className="author-meta d-flex align-items-center">
            <i className="fa fa-user-o me-2" aria-hidden="true" style={{ color: '#b51515' }}></i>
            <span className="text-white">{post?.user_data?.name || 'ADMIN'}</span>
          </div>
          <div className="date-meta d-flex align-items-center">
            <i className="fa fa-calendar-o me-2" aria-hidden="true" style={{ color: '#b51515' }}></i>
            <span className="text-white">{formattedDate}</span>
          </div>
          <div className="categories-meta d-flex align-items-center">
            <i className="fa fa-tags me-2" aria-hidden="true" style={{ color: '#b51515' }}></i>
            <span className="text-white">
              {visibleTags.length > 0 ? (
                <>
                  {visibleTags.map((tag, i) => (
                    <Fragment key={i}>
                      {tag}{i < visibleTags.length - 1 ? ', ' : ''}
                    </Fragment>
                  ))}
                  {hiddenTags.length > 0 && (
                    <CustomTooltip text={hiddenTags.join(', ')}>
                      <span className="ms-1" style={{ cursor: 'pointer', color: '#b51515' }}>
                        +{hiddenTags.length}
                      </span>
                    </CustomTooltip>
                  )}
                </>
              ) : 'NO TAGS'}
            </span>
          </div>
        </div>

        {/* 3. Title */}
        <h5 className="post-title fw-bold mb-4" style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>
          {post?.title}
        </h5>

        {/* 4. Content */}
        <div className="post-body text-body" style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#D1D1D1' }}>
          {post?.content ? (
            parseContentWithImages(post.content)
          ) : (
            <div className="text-muted">Content not available</div>
          )}
        </div>

        {/* 5. Bottom Tags */}
        <div className="post-footer p-2 border-bottom border-secondary">
          <div className="d-flex flex-wrap gap-2">
            {postTags.map((tag, idx) => (
              <div key={idx} className="px-3 py-1 rounded-pill bg-dark border border-secondary text-white-50" style={{ fontSize: '12px', cursor: 'pointer' }}>
                {tag}
              </div>
            ))}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default PostById;
