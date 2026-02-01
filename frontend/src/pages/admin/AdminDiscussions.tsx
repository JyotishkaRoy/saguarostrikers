import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageSquare, Plus, Edit, Trash2, Lock, Unlock, Pin, Rocket, ChevronDown, ChevronUp, User, X } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Mission {
  missionId: string;
  title: string;
  slug: string;
  status: string;
}

interface Reply {
  replyId: string;
  content: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorRole?: string;
  createdAt: string;
}

interface Thread {
  threadId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  missionId?: string;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

interface ThreadWithReplies extends Thread {
  replies: Reply[];
}

export default function AdminDiscussions() {
  const [searchParams] = useSearchParams();
  const urlMissionId = searchParams.get('missionId');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [stats, setStats] = useState({
    totalThreads: 0,
    openThreads: 0,
    closedThreads: 0,
    totalReplies: 0,
  });
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [threadDetail, setThreadDetail] = useState<ThreadWithReplies | null>(null);
  const [loadingThreadDetail, setLoadingThreadDetail] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [expandedMissionGroups, setExpandedMissionGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchThreads();
    fetchStats();
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await api.get('/admin/missions');
      if (response.success && response.data && Array.isArray(response.data)) {
        setMissions((response.data as Mission[]).filter((m) => m.status !== 'draft'));
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    }
  };

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
    const missionIdValue = formData.get('missionId');
    const missionId = missionIdValue && String(missionIdValue).trim() ? String(missionIdValue).trim() : '';
    if (!missionId) {
      toast.error('Please select a mission');
      return;
    }
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      missionId,
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

  const getMissionTitle = (missionId: string | undefined) => {
    if (!missionId) return null;
    return missions.find((m) => m.missionId === missionId)?.title ?? missionId;
  };

  // Group threads by mission (key: missionId or '__none__' for no mission)
  const threadsByMission = (() => {
    const map = new Map<string, Thread[]>();
    threads.forEach((t) => {
      const key = t.missionId ?? '__none__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  })();

  const missionGroupKeys = Array.from(threadsByMission.keys()).sort((a, b) => {
    if (a === '__none__') return 1;
    if (b === '__none__') return -1;
    const titleA = getMissionTitle(a) ?? a;
    const titleB = getMissionTitle(b) ?? b;
    return titleA.localeCompare(titleB);
  });

  // When URL has missionId, show only that mission's discussions
  const displayGroupKeys = urlMissionId
    ? (missionGroupKeys.includes(urlMissionId) ? [urlMissionId] : [urlMissionId])
    : missionGroupKeys;
  const filteredByMission = Boolean(urlMissionId);

  const toggleMissionGroup = (key: string) => {
    setExpandedMissionGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Default expand mission groups when threads load; if URL has missionId, expand only that group
  useEffect(() => {
    if (threads.length === 0) return;
    const keys = Array.from(
      threads.reduce((acc, t) => acc.add(t.missionId ?? '__none__'), new Set<string>())
    );
    if (keys.length > 0) {
      setExpandedMissionGroups((prev) => {
        if (prev.size > 0) return prev;
        if (urlMissionId && keys.includes(urlMissionId)) return new Set([urlMissionId]);
        return new Set(keys);
      });
    }
  }, [threads, urlMissionId]);

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
      if (expandedThreadId === threadId) {
        setExpandedThreadId(null);
        setThreadDetail(null);
      }
      fetchThreads();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleViewMessages = async (thread: Thread) => {
    if (expandedThreadId === thread.threadId) {
      setExpandedThreadId(null);
      setThreadDetail(null);
      return;
    }
    setExpandedThreadId(thread.threadId);
    setLoadingThreadDetail(true);
    setThreadDetail(null);
    try {
      const res = await api.get(`/discussions/${thread.threadId}`);
      if (res.success && res.data) setThreadDetail(res.data as ThreadWithReplies);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setExpandedThreadId(null);
    } finally {
      setLoadingThreadDetail(false);
    }
  };

  const handleDeleteReply = async (threadId: string, replyId: string) => {
    if (!window.confirm('Delete this message?')) return;
    setDeletingReplyId(replyId);
    try {
      await api.delete(`/admin/discussions/${threadId}/replies/${replyId}`);
      toast.success('Message deleted');
      const res = await api.get(`/discussions/${threadId}`);
      if (res.success && res.data) setThreadDetail(res.data as ThreadWithReplies);
      fetchThreads();
      fetchStats();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeletingReplyId(null);
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
          {filteredByMission && (
            <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-primary-50 border border-primary-200">
              <span className="text-sm text-primary-800">
                Showing discussions for: <strong>{getMissionTitle(urlMissionId!) ?? urlMissionId}</strong>
              </span>
              <Link
                to="/admin/discussions"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Show all discussions
              </Link>
            </div>
          )}
          {displayGroupKeys.map((missionKey) => {
            const groupThreads = threadsByMission.get(missionKey) ?? [];
            const groupTitle = missionKey === '__none__' ? 'No mission' : (getMissionTitle(missionKey) ?? missionKey);
            const isGroupExpanded = expandedMissionGroups.has(missionKey);
            return (
              <div key={missionKey} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleMissionGroup(missionKey)}
                  className="w-full flex items-center justify-between gap-3 py-2 px-1 -mx-1 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                    <Rocket className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    {missionKey === '__none__' ? (
                      groupTitle
                    ) : (
                      <Link
                        to={`/admin/missions?missionId=${missionKey}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {groupTitle}
                      </Link>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {groupThreads.length} discussion{groupThreads.length !== 1 ? 's' : ''}
                  </span>
                  {isGroupExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {isGroupExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {groupThreads.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4">No discussions for this mission yet.</p>
                    ) : null}
                    {groupThreads.map((thread) => (
                      <div key={thread.threadId} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                              {thread.isPinned && <Pin className="h-4 w-4 text-primary-600" />}
                              {thread.isLocked && <Lock className="h-4 w-4 text-warning-600" />}
                              <span className={`badge ${thread.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                                {thread.status}
                              </span>
                              <span className="badge-gray">{thread.category}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{thread.description}</p>
                            <div className="flex items-center gap-3">
                              <p className="text-sm text-gray-500">{thread.replyCount} replies</p>
                              <button
                                type="button"
                                onClick={() => toggleViewMessages(thread)}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                              >
                                {expandedThreadId === thread.threadId ? (
                                  <>Hide messages <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                  <>View messages <ChevronDown className="h-4 w-4" /></>
                                )}
                              </button>
                            </div>
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

                        {/* Expanded messages */}
                        {expandedThreadId === thread.threadId && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {loadingThreadDetail ? (
                              <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
                              </div>
                            ) : threadDetail?.threadId === thread.threadId ? (
                              <>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Messages</h4>
                                {threadDetail.replies && threadDetail.replies.length > 0 ? (
                                  <ul className="space-y-3">
                                    {threadDetail.replies.map((reply) => (
                                      <li key={reply.replyId} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                          <User className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-gray-900">
                                              {reply.authorName && reply.authorEmail && reply.authorName !== reply.authorEmail
                                                ? `${reply.authorName} | ${reply.authorEmail}`
                                                : (reply.authorEmail || reply.authorName || 'User')}
                                            </span>
                                            {reply.authorRole === 'admin' && (
                                              <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 text-primary-800">Admin</span>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(reply.createdAt).toLocaleString()}
                                          </p>
                                          <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap break-words">{reply.content}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteReply(thread.threadId, reply.replyId)}
                                            disabled={deletingReplyId === reply.replyId}
                                            className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                                            title="Delete message"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 py-2">No messages yet.</p>
                                )}
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
                  <option value="technical">Technical Help</option>
                  <option value="events">Events</option>
                  <option value="announcements">Announcements</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mission <span className="text-red-600">*</span></label>
                <select name="missionId" className="input w-full" required defaultValue={editingThread?.missionId ?? ''}>
                  <option value="">Select a mission</option>
                  {missions.map((m) => (
                    <option key={m.missionId} value={m.missionId}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the mission for this discussion.</p>
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
