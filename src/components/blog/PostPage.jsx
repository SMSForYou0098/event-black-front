
import React from 'react';
import { Container, Row, Col, Badge, Card } from 'react-bootstrap';
import parse from 'html-react-parser';
// import MetaTags from './MetaTags';
// import PostSkeleton from './skeletons/PostSkeletons';
import { useMyContext } from "@/Context/MyContextProvider"; //done

const PostById = ({ post, categories, loading }) => {
  const { isMobile } = useMyContext();

  const parseContentWithImages = (html) => {
  const options = {
    replace: (domNode) => {
      if (domNode.name === 'img') {
        return (
          <div className="text-center my-3">
            <img
              src={domNode.attribs.src}
              alt={domNode.attribs.alt || ''}
              className="img-fluid"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                maxHeight: 'none', // Remove any max-height restriction
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        );
      }
    }
  };
  return parse(html, options);
};

//   if (loading) return <PostSkeleton />;
  if (loading) return <>loading</>;

  // Strip HTML to get content length
  const getContentLength = (htmlContent) => {
    if (!htmlContent) return 0;
    const text = htmlContent.replace(/<[^>]*>/g, '');
    return text.length;
  };

  // Calculate estimated read time (1 min per 1000 characters)
  const estimatedReadTime = Math.max(1, Math.ceil(getContentLength(post?.content) / 1000));

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="border-0 shadow-sm">
            {post?.thumbnail && (
              <Card.Img
                variant="top"
                src={post?.thumbnail}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  backgroundColor: '#f8f9fa',
                }}
              />
            )}
            <Card.Body className="p-4">
              {isMobile ? (
                <h5>{post.title}</h5>
              ) : (
                <h1 className="mb-3 fw-bold">{post?.title}</h1>
              )}

              <div className="d-flex flex-wrap gap-2 mb-3">
                {categories.map((cat) => (
                  <Badge key={cat?.id} bg="secondary">
                    {cat?.title}
                  </Badge>
                ))}
              </div>

              {/* Meta info */}
              <div className="text-muted mb-4 d-flex align-items-center gap-3 flex-wrap">
                <div>
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(post?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                {post?.user_data?.name && (
                  <div>
                    <i className="bi bi-person-circle me-1"></i>
                    {post.user_data.name}
                  </div>
                )}
                <div>
                  <i className="bi bi-clock me-1"></i>
                  {estimatedReadTime} min read
                </div>
              </div>

              {/* Content */}
              {
                isMobile ? parseContentWithImages(post?.content) : parse(post?.content)
              }
            </Card.Body>
          </Card>
        </Col>

        {/* Meta Tags for SEO */}
        {/* <MetaTags
          title={post?.meta_title || post?.title}
          description={
            post?.meta_description ||
            post?.content?.replace(/<[^>]+>/g, '').slice(0, 160)
          }
          image={post?.thumbnail}
          keywords={[
            ...(post?.meta_keyword ? post.meta_keyword.split(',') : []),
            ...(post?.tags || []),
          ]}
        /> */}
      </Row>
    </Container>
  );
};

export default PostById;
