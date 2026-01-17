import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit, Trash2, Lock, Unlock, Pin } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Thread {
  threadId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

export default function AdminDiscussions() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [stats, setStats] = useState({
    totalThreads: 0,
    openThreads: 0,
    closedThreads: 0,
    totalReplies: 0,
  });

  useEffect(() => {
    fetchThreads();
    fetchStats();
  }, []);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/discussions');
      if (response.success && response.data && Array.isArray(response.data)) {
        setThreads(response.data as Thread[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/discussions/stats');
      if (response.success && response.data && typeof response.data === 'object') {
        setStats(response.data as typeof stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      isPinned: formData.get('isPinned') === 'on',
      isLocked: formData.get('isLocked') === 'on',
    };

    try {
      if (editingThread) {
        await api.put(`/admin/discussions/${editingThread.threadId}`, data);
        toast.success('Thread updated successfully');
      } else {
        await api.post('/admin/discussions', data);
        toast.success('Thread created successfully');
      }
      setIsModalOpen(false);
      setEditingThread(null);
      fetchThreads();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleStatus = async (threadId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await api.patch(`/admin/discussions/${threadId}/status`, { status: newStatus });
      toast.success(`Thread ${newStatus === 'closed' ? 'closed' : 'opened'} successfully`);
      fetchThreads();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (threadId: string) => {
    if (!window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) return;

    try {
      await api.delete(`/admin/discussions/${threadId}`);
      toast.success('Thread deleted successfully');
      fetchThreads();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussion Board Management</h1>
        <p className="text-gray-600">Create and manage discussion threads</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Threads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalThreads}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-success-600">{stats.openThreads}</p>
            </div>
            <Unlock className="h-8 w-8 text-success-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-warning-600">{stats.closedThreads}</p>
            </div>
            <Lock className="h-8 w-8 text-warning-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Replies</p>
              <p className="text-2xl font-bold text-primary-600">{stats.totalReplies}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingThread(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Thread
        </button>
      </div>

      {/* Threads List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : threads.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No threads yet</h3>
          <p className="text-gray-600 mb-4">Create your first discussion thread</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Create Thread
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div key={thread.threadId} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                    {thread.isPinned && <Pin className="h-4 w-4 text-primary-600" />}
                    {thread.isLocked && <Lock className="h-4 w-4 text-warning-600" />}
                    <span className={`badge ${thread.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                      {thread.status}
                    </span>
                    <span className="badge-gray">{thread.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{thread.description}</p>
                  <p className="text-sm text-gray-500">{thread.replyCount} replies</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingThread(thread);
                      setIsModalOpen(true);
                    }}
                    className="btn-outline text-sm py-1.5 px-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(thread.threadId, thread.status)}
                    className="btn-secondary text-sm py-1.5 px-3"
                    title={thread.status === 'open' ? 'Close thread' : 'Open thread'}
                  >
                    {thread.status === 'open' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(thread.threadId)}
                    className="btn-danger text-sm py-1.5 px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingThread ? 'Edit Thread' : 'Create Thread'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingThread?.title}
                  required
                  minLength={5}
                  className="input w-full"
                  placeholder="Enter thread title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingThread?.description}
                  required
                  minLength={10}
                  rows={4}
                  className="input w-full"
                  placeholder="Enter thread description..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="category" defaultValue={editingThread?.category || 'general'} className="input w-full">
                  <option value="general">General</option>
                  <option value="competitions">Competitions</option>
                  <option value="technical">Technical Help</option>
                  <option value="events">Events</option>
                  <option value="announcements">Announcements</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPinned" defaultChecked={editingThread?.isPinned} />
                  <span className="text-sm">Pin this thread</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isLocked" defaultChecked={editingThread?.isLocked} />
                  <span className="text-sm">Lock this thread</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingThread ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingThread(null);
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
