import React, { useEffect, useState, useRef } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import CommentBox from './CommentBox';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useMyContext } from "@/Context/MyContextProvider"; //done
import { publicApi, api } from "@/lib/axiosInterceptor";
import { getErrorMessage } from "@/utils/errorUtils";


// import CommentsSectionSkeleton from '../skeletons/CommentsSectionSkeleton';
import { Heart, MessageCircle, Trash } from 'lucide-react';
import moment from 'moment';

const MAX_COMMENT_DEPTH = 1;
const MAX_COMMENTS_LIMIT = 10;

const CommentsSection = ({ comments = [], id, refreshComments, loading }) => {
  const [commentList, setCommentList] = useState(comments);
  const [replyTo, setReplyTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const { UserData, ErrorAlert, AskAlert } = useMyContext();

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

  const likeTimeouts = useRef({});
  const pendingStatus = useRef({});
  const originalStatuses = useRef({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = likeTimeouts.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  const toggleLike = (commentId, isCurrentlyLiked) => {
    // If no timeout is running, this is the start of a new interaction sequence.
    // Store the original status to compare later.
    if (!likeTimeouts.current[commentId]) {
      originalStatuses.current[commentId] = isCurrentlyLiked;
    }

    // 1. Determine "base" status: use pending status if exists, else use current prop
    const baseStatus = pendingStatus.current[commentId] !== undefined
      ? pendingStatus.current[commentId]
      : isCurrentlyLiked;

    const newStatus = !baseStatus;
    pendingStatus.current[commentId] = newStatus;

    // 2. Optimistic Update (UI)
    setCommentList((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          const newLikes = newStatus
            ? [...(comment.likes || []), UserData?.id]
            : (comment.likes || []).filter((id) => id !== UserData?.id);
          return { ...comment, likes: newLikes };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: (comment.replies || []).map((r) => {
              if (r.id === commentId) {
                const newLikes = newStatus
                  ? [...(r.likes || []), UserData?.id]
                  : (r.likes || []).filter((id) => id !== UserData?.id);
                return { ...r, likes: newLikes };
              }
              return r;
            }),
          };
        }
        return comment;
      })
    );

    // 3. Debounce API Call (3 seconds)
    if (likeTimeouts.current[commentId]) {
      clearTimeout(likeTimeouts.current[commentId]);
    }

    likeTimeouts.current[commentId] = setTimeout(async () => {
      const statusToSend = pendingStatus.current[commentId];
      const original = originalStatuses.current[commentId];

      // If user toggled back to original state, avoid unnecessary API call
      if (statusToSend === original) {
        delete likeTimeouts.current[commentId];
        delete pendingStatus.current[commentId];
        delete originalStatuses.current[commentId];
        console.log("Like toggle cancelled: back to original state");
        return;
      }

      try {
        const res = await api.post(
          `/blog-comments/${commentId}/like`,
          { like: statusToSend },
        );

        // Sync with server's actual likes array to handle multiple clients
        if (res.data?.likes) {
          setCommentList((prevComments) =>
            prevComments.map((comment) => {
              if (comment.id === commentId) return { ...comment, likes: res.data.likes };
              if (comment.replies) {
                return {
                  ...comment,
                  replies: (comment.replies || []).map((r) =>
                    r.id === commentId ? { ...r, likes: res.data.likes } : r
                  ),
                };
              }
              return comment;
            })
          );
        }
      } catch (error) {
        console.error('Failed to toggle like:', error);
        // ErrorAlert('Error', getErrorMessage(error, 'Could not update like status.'), 'error');
      } finally {
        delete likeTimeouts.current[commentId];
        delete pendingStatus.current[commentId];
        delete originalStatuses.current[commentId];
      }
    }, 1000); // 3 second debounce as requested
  };

  const handleDelete = async (commentId) => {
    // Use reusable AskAlert
    const confirmed = await AskAlert(
      "This comment will be permanently deleted.", // title
      "Yes, delete it!",                           // confirm button text
      "Comment deleted successfully!"              // success message
    );

    if (confirmed) {
      try {
        await api.delete(`/blog-comment-destroy/${commentId}`);

        setCommentList((prev) => prev.filter((c) => c.id !== commentId));
        refreshComments();
      } catch (error) {
        console.error("Delete failed:", error);
        ErrorAlert("Error", getErrorMessage(error, "Failed to delete the comment."), "error");
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
              <span className="text-dark fw-bold" style={{ fontSize: '14px' }}>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="fw-bold me-2" style={{ fontSize: '14px' }}>{userName}</span>
              <span className="text-muted" style={{ fontSize: '14px' }}>
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
                style={{ fontSize: '14px' }}
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