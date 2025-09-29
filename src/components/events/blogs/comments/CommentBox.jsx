import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useMyContext } from "@/Context/MyContextProvider"; //done
import { publicApi,api } from "@/lib/axiosInterceptor";

const CommentBox = ({ id, parentId = null, onCommentAdded, onCancel }) => {
  const [formData, setFormData] = useState({ text: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      await api.post(
        `/blog-comment-store/${id}`,
        {
          comment: formData.text,
          id: parentId,
        },
      );

      onCommentAdded?.();
      setFormData({ text: '' });
      onCancel?.();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(
        err.response?.data?.message || 
        'An unexpected error occurred. Please try again later.'
      );
    }
  };

  return (
    <div className="mb-3">
      {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Control
            as="textarea"
            rows={2}
            placeholder={parentId ? 'Write your reply...' : 'Add a comment...'}
            value={formData.text}
            onChange={(e) => setFormData({ text: e.target.value })}
            style={{ borderRadius: '20px', padding: '10px 15px' }}
            
          />
        </Form.Group>
        
        <div className="d-flex justify-content-end gap-2">
          {onCancel && (
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="primary" 
            size="sm"
            disabled={!formData.text.trim()}
          >
            {parentId ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CommentBox;