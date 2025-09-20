import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import CommentBox from './CommentBox';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMyContext } from "@/Context/MyContextProvider"; //done

// import CommentsSectionSkeleton from '../skeletons/CommentsSectionSkeleton';
import { Heart, MessageCircle, Trash } from 'lucide-react';
import moment from 'moment';

const MAX_COMMENT_DEPTH = 1;
const MAX_COMMENTS_LIMIT = 10;

const CommentsSection = ({ comments = [], id, refreshComments, loading }) => {
  const [commentList, setCommentList] = useState(comments);
  const [replyTo, setReplyTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const { api, authToken, UserData ,ErrorAlert } = useMyContext();

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const handleOpenComment = () => {
    if (commentList.length >= MAX_COMMENTS_LIMIT) {
      ErrorAlert('Limit Reached', `Maximum of ${MAX_COMMENTS_LIMIT} comments allowed.`, 'info');
      return;
    }
    setReplyTo(null);
  };

  const handleReply = (commentId, depth) => {
    if (depth >= MAX_COMMENT_DEPTH) {
      ErrorAlert('Cannot Reply', 'You cannot reply to a reply.', 'info');
      return;
    }
    if (commentList.length >= MAX_COMMENTS_LIMIT) {
      ErrorAlert('Limit Reached', `Maximum of ${MAX_COMMENTS_LIMIT} comments allowed.`, 'info');
      return;
    }
    setReplyTo(commentId);
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleLike = async (commentId, currentStatus) => {
    try {
      const res = await axios.post(
        `${api}blog-comments/${commentId}/like`,
        { like: !currentStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const { likes } = res.data;

      setCommentList((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes }
            : {
                ...comment,
                replies: comment.replies?.map((r) =>
                  r.id === commentId ? { ...r, likes } : r
                ) || [],
              }
        )
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
      ErrorAlert('Error', 'Could not update like status.', 'error');
    }
  };

  const handleDelete = async (commentId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This comment will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${api}blog-comment-destroy/${commentId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCommentList((prev) => prev.filter((c) => c.id !== commentId));
        refreshComments();
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire('Error', 'Failed to delete the comment.', 'error');
      }
    }
  };

  const renderComment = (comment, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplies = expandedReplies[comment.id];
    const isLiked = comment?.likes?.includes(UserData?.id);
    const userName = comment?.user_data?.name || 'Anonymous';
    const isCurrentUser = Number(comment?.user_id) === Number(UserData?.id);

    return (
      <div key={comment.id} className={`mb-2 ${depth > 0 ? 'ms-4 ps-3 border-start border-light' : ''}`}>
        <div className="d-flex">
          <div className="flex-shrink-0 me-2">
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px', border: '1px solid black' }}>
              <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="fw-bold me-2" style={{ fontSize: '14px' }}>{userName}</span>
              <span className="text-muted" style={{ fontSize: '12px' }}>
                {moment(comment?.created_at).fromNow()}
              </span>
            </div>

            <p className="mb-1" style={{ fontSize: '14px' }}>{comment?.comment}</p>

            <div className="d-flex align-items-center mt-1 gap-3">
              <button
                className="btn p-0 border-0 bg-transparent d-flex align-items-center gap-1"
                onClick={() => toggleLike(comment.id, isLiked)}
              >
                <Heart
                  size={16}
                  fill={isLiked ? 'red' : 'none'}
                  color={isLiked ? 'red' : 'currentColor'}
                />
                <span className="small text-muted">{comment?.likes?.length || 0}</span>
              </button>

              {depth < MAX_COMMENT_DEPTH && (
                <button
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => handleReply(comment.id, depth)}
                >
                  <MessageCircle size={16} />
                </button>
              )}

              {isCurrentUser && (
                <button
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash size={16} />
                </button>
              )}
            </div>

            {replyTo === comment.id && (
              <div className="mt-2 ms-4 ps-3">
                <CommentBox
                  id={id}
                  parentId={comment.id}
                  onCommentAdded={() => {
                    refreshComments();
                    setReplyTo(null);
                  }}
                  onCancel={() => setReplyTo(null)}
                />
              </div>
            )}

            {hasReplies && (
              <button
                className="btn p-0 mt-1 border-0 bg-transparent text-muted"
                onClick={() => toggleReplies(comment.id)}
                style={{ fontSize: '12px' }}
              >
                {showReplies ? 'Hide replies' : `View replies (${comment.replies.length})`}
              </button>
            )}

            {hasReplies && showReplies && (
              <div className="mt-2">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // if (loading) return <CommentsSectionSkeleton />;
  if (loading) return <p>loading</p>;

  return (
    <Container fluid className="mt-3 px-0">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="px-3">

            {replyTo === null && (
              <CommentBox
                id={id}
                onCommentAdded={() => {
                  refreshComments();
                  setReplyTo(null);
                }}
                onCancel={() => setReplyTo(null)}
              />
            )}

            {commentList.length === 0 && replyTo === null ? (
              <div className="text-center py-4">
                <p className="text-muted">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="comment-list">
                {commentList?.map((comment) => renderComment(comment))}
              </div>
            )}
          </div>
          {commentList.length >= MAX_COMMENTS_LIMIT && (
            <div className="alert alert-info mt-3 mx-3">
              This post has reached the maximum comment limit ({MAX_COMMENTS_LIMIT}).
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CommentsSection;