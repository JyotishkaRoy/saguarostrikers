import { useState, useEffect } from 'react';
import { MessageSquare, Search, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Thread {
  threadId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  replyCount: number;
  createdAt: string;
  lastReplyAt?: string;
  isPinned: boolean;
}

export default function DiscussionBoard() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchThreads();
  }, [selectedCategory]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await api.get(`/discussions?${params.toString()}`);
      if (response.success && response.data && Array.isArray(response.data)) {
        setThreads(response.data as Thread[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.trim().length < 3) {
      return fetchThreads();
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/discussions/search?query=${encodeURIComponent(searchTerm)}`);
      if (response.success && response.data) {
        setThreads(response.data as Thread[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Discussions' },
    { value: 'general', label: 'General' },
    { value: 'competitions', label: 'Competitions' },
    { value: 'technical', label: 'Technical Help' },
    { value: 'events', label: 'Events' },
    { value: 'announcements', label: 'Announcements' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <MessageSquare className="h-10 w-10 text-primary-600" />
            Discussion Board
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the conversation, ask questions, and connect with fellow strikers
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button onClick={handleSearch} className="btn-primary whitespace-nowrap">
              Search
            </button>
          </div>
        </div>

        {/* Threads List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600">Be the first to start a conversation!</p>
            {!isAuthenticated && (
              <Link to="/login" className="btn-primary mt-4 inline-block">
                Login to Participate
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.threadId}
                to={`/discussions/${thread.threadId}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          {thread.isPinned && (
                            <span className="badge-primary text-xs">Pinned</span>
                          )}
                          {thread.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{thread.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className={`badge ${thread.category === 'announcements' ? 'badge-primary' : 'badge-gray'}`}>
                        {thread.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{thread.replyCount} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDate(thread.lastReplyAt || thread.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
