import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User, Clock, Send, Pencil, X, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface Reply {
  replyId: string;
  content: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorRole: string;
  createdAt: string;
}

interface Thread {
  threadId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  replies: Reply[];
  replyCount: number;
  createdAt: string;
  isLocked: boolean;
}

export default function DiscussionThread() {
  const { id } = useParams<{ id: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchThread();
  }, [id]);

  const fetchThread = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/discussions/${id}`);
      if (response.success && response.data) {
        setThread(response.data as Thread);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Enter a message');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/discussions/${id}/replies`, { content: replyContent });
      toast.success('Reply posted successfully!');
      setReplyContent('');
      fetchThread();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thread not found</h3>
          <Link to="/discussions" className="text-primary-600 hover:text-primary-700">
            ← Back to discussions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link to="/discussions" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to discussions
        </Link>

        {/* Thread Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{thread.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="badge-primary">{thread.category}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(thread.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{thread.replyCount} replies</span>
                </div>
              </div>
            </div>
            {thread.isLocked && (
              <span className="badge-warning">Locked</span>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{thread.description}</p>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Replies ({thread.replyCount})</h2>
          {thread.replies && thread.replies.length > 0 ? (
            thread.replies.map((reply) => (
              <div key={reply.replyId} className="card">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {reply.authorName && reply.authorEmail && reply.authorName !== reply.authorEmail
                          ? `${reply.authorName} | ${reply.authorEmail}`
                          : (reply.authorEmail || reply.authorName || 'User')}
                      </span>
                      {reply.authorRole === 'admin' && (
                        <span className="badge-primary text-xs">Admin</span>
                      )}
                      {user?.userId === reply.authorId && !thread.isLocked && (
                        editingReplyId === reply.replyId ? (
                          <span className="flex items-center gap-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => { setEditingReplyId(null); setEditingContent(''); }}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" /> Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setEditingReplyId(reply.replyId); setEditingContent(reply.content); }}
                            className="text-sm text-primary-600 hover:text-primary-700 ml-auto"
                            title="Edit message"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )
                      )}
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!id || !window.confirm('Delete this message?')) return;
                            setDeletingReplyId(reply.replyId);
                            try {
                              await api.delete(`/admin/discussions/${id}/replies/${reply.replyId}`);
                              toast.success('Message deleted');
                              fetchThread();
                            } catch (err) {
                              toast.error(getErrorMessage(err));
                            } finally {
                              setDeletingReplyId(null);
                            }
                          }}
                          disabled={deletingReplyId === reply.replyId}
                          className="text-sm text-red-600 hover:text-red-700 ml-auto"
                          title="Delete message (admin)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(reply.createdAt)}</p>
                    {editingReplyId === reply.replyId ? (
                      <div className="mt-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="input w-full resize-none"
                          rows={3}
                          minLength={1}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!editingContent.trim()) return;
                              setIsSavingEdit(true);
                              try {
                                await api.put(`/discussions/${id}/replies/${reply.replyId}`, { content: editingContent.trim() });
                                toast.success('Message updated');
                                setEditingReplyId(null);
                                setEditingContent('');
                                fetchThread();
                              } catch (err) {
                                toast.error(getErrorMessage(err));
                              } finally {
                                setIsSavingEdit(false);
                              }
                            }}
                            disabled={isSavingEdit || !editingContent.trim()}
                            className="btn-primary"
                          >
                            {isSavingEdit ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingReplyId(null); setEditingContent(''); }}
                            className="btn-outline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-8 text-gray-500">
              No replies yet. Be the first to respond!
            </div>
          )}
        </div>

        {/* Reply Form */}
        {isAuthenticated && !thread.isLocked ? (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Reply</h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="input w-full"
                rows={4}
                required
                minLength={1}
              ></textarea>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        ) : thread.isLocked ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">This discussion has been locked and is no longer accepting replies.</p>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">You must be logged in to reply</p>
            <Link to="/login" className="btn-primary">
              Login to Reply
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
