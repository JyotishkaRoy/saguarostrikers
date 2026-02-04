import { useState, useEffect } from 'react';
import { Mail, Search, Filter, Trash2, Eye, EyeOff, Inbox, CheckCircle, Send, FileText } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContactMessage {
  messageId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived';
  createdAt: string;
  respondedBy?: string;
  respondedAt?: string;
  response?: string;
}

export default function AdminOutreachApplications() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    responded: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(msg => msg.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
    updateStats(filtered);
  }, [messages, searchTerm, filterStatus]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ContactMessage[]>('/admin/outreach-queries');
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch outreach queries.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (msgs: ContactMessage[]) => {
    setStats({
      total: msgs.length,
      new: msgs.filter(m => m.status === 'new').length,
      responded: msgs.filter(m => m.status === 'responded' || m.status === 'archived').length,
    });
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);

    if (message.status === 'new') {
      handleToggleStatus(message.messageId, 'archived');
    }
  };

  const handleToggleStatus = async (messageId: string, newStatus: 'new' | 'archived' | 'responded') => {
    try {
      const response = await api.patch(`/admin/contact-messages/${messageId}/status`, { status: newStatus });
      if (response.success) {
        setMessages(messages.map(msg =>
          msg.messageId === messageId ? { ...msg, status: newStatus } : msg
        ));
        if (selectedMessage?.messageId === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
        toast.success(`Message marked as ${newStatus}`);
      } else {
        toast.error(response.message || 'Failed to update status.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await api.delete(`/admin/contact-messages/${messageId}`);
      if (response.success) {
        setMessages(messages.filter(msg => msg.messageId !== messageId));
        toast.success('Message deleted successfully!');
        if (selectedMessage?.messageId === messageId) {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }
      } else {
        toast.error(response.message || 'Failed to delete message.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRespondClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setResponseText(`Dear ${message.name},\n\nThank you for contacting Saguaro Strikers regarding outreach.\n\n`);
    setIsResponseModalOpen(true);
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) {
      toast.error('Please enter a response message.');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const response = await api.post(`/admin/contact-messages/${selectedMessage.messageId}/respond`, {
        response: responseText
      });

      if (response.success) {
        toast.success('Response sent successfully via email!');
        setIsResponseModalOpen(false);
        setResponseText('');

        setMessages(messages.map(msg =>
          msg.messageId === selectedMessage.messageId
            ? { ...msg, status: 'responded' }
            : msg
        ));

        if (isModalOpen && selectedMessage.messageId === selectedMessage.messageId) {
          setSelectedMessage({ ...selectedMessage, status: 'responded' });
        }

        fetchMessages();
      } else {
        toast.error(response.message || 'Failed to send response.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Outreach Applications
        </h1>
        <p className="text-gray-600 mt-2">Queries and applications with subject &quot;Outreach Queries&quot;</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5 flex items-center justify-between bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div>
            <p className="text-sm opacity-80">Total</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <Inbox className="h-10 w-10 opacity-70" />
        </div>
        <div className="card p-5 flex items-center justify-between bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div>
            <p className="text-sm opacity-80">New</p>
            <p className="text-3xl font-bold">{stats.new}</p>
          </div>
          <Mail className="h-10 w-10 opacity-70" />
        </div>
        <div className="card p-5 flex items-center justify-between bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div>
            <p className="text-sm opacity-80">Responded</p>
            <p className="text-3xl font-bold">{stats.responded}</p>
          </div>
          <CheckCircle className="h-10 w-10 opacity-70" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="input pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="input pl-9 w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="responded">Responded</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-10 card">
          <Inbox className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No outreach queries found.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr
                    key={message.messageId}
                    className={`hover:bg-gray-50 transition-colors ${message.status === 'new' ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.status === 'new' ? (
                        <span className="badge badge-warning">New</span>
                      ) : message.status === 'responded' ? (
                        <span className="badge badge-success">Responded</span>
                      ) : (
                        <span className="badge badge-gray">Archived</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{message.name}</p>
                        <p className="text-xs text-gray-500">{message.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 truncate max-w-xs">{message.subject}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleViewMessage(message)} className="text-primary-600 hover:text-primary-900 mr-3" title="View"><Eye className="h-5 w-5" /></button>
                      <button onClick={() => handleRespondClick(message)} className="text-success-600 hover:text-success-900 mr-3" title="Respond via Email"><Send className="h-5 w-5" /></button>
                      <button onClick={() => handleToggleStatus(message.messageId, message.status === 'new' ? 'archived' : 'new')} className="text-gray-600 hover:text-gray-900 mr-3" title={message.status === 'new' ? 'Mark as Read' : 'Mark as New'}>
                        {message.status === 'new' ? <CheckCircle className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button onClick={() => handleDelete(message.messageId)} className="text-danger-600 hover:text-danger-900" title="Delete"><Trash2 className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">From</label>
                  <p className="text-sm font-medium text-gray-900">{selectedMessage.name}</p>
                  <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                <div>
                  <label className="form-label">Received</label>
                  <p className="text-sm text-gray-900">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.status === 'new' ? <span className="badge badge-warning">New</span> : selectedMessage.status === 'responded' ? <span className="badge badge-success">Responded</span> : <span className="badge badge-gray">Archived</span>}
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button onClick={() => setIsModalOpen(false)} className="btn-outline">Close</button>
                  <div className="flex space-x-2">
                    <button onClick={() => { setIsModalOpen(false); handleRespondClick(selectedMessage); }} className="btn-success btn-sm"><Send className="h-4 w-4 mr-2" />Respond via Email</button>
                    <button onClick={() => handleToggleStatus(selectedMessage.messageId, selectedMessage.status === 'new' ? 'archived' : 'new')} className="btn-outline btn-sm">Mark as {selectedMessage.status === 'new' ? 'Read' : 'New'}</button>
                    <button onClick={() => handleDelete(selectedMessage.messageId)} className="btn-danger btn-sm"><Trash2 className="h-4 w-4 mr-2" />Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {isResponseModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsResponseModalOpen(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Respond via Email</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="form-label">To:</label>
                      <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                      <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                    </div>
                    <div>
                      <label className="form-label">Re:</label>
                      <p className="font-medium text-gray-900">{selectedMessage.subject}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="form-label">Original Message:</label>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                <div>
                  <label className="form-label">Your Response: *</label>
                  <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="input w-full" rows={10} placeholder="Type your response here..." required />
                  <p className="text-xs text-gray-500 mt-1">This email will be sent from your configured Gmail account to {selectedMessage.email}</p>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button onClick={() => { setIsResponseModalOpen(false); setResponseText(''); }} className="btn-outline" disabled={isSubmittingResponse}>Cancel</button>
                <button onClick={handleSendResponse} className="btn-success" disabled={isSubmittingResponse || !responseText.trim()}>
                  <Send className="h-4 w-4 mr-2" />{isSubmittingResponse ? 'Sending...' : 'Send Email Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
