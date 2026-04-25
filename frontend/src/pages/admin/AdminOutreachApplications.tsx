import { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, CheckCircle, FileText, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface OutreachApplication {
  messageId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  applicationPdfPath?: string;
  createdAt: string;
}

export default function AdminOutreachApplications() {
  const [applications, setApplications] = useState<OutreachApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<OutreachApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<OutreachApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((app) =>
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.subject.toLowerCase().includes(q) ||
        app.message.toLowerCase().includes(q)
      );
    }

    setFilteredApplications(filtered);
    updateStats(filtered);
  }, [applications, searchTerm, filterStatus]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<OutreachApplication[]>('/admin/outreach-queries');
      if (response.success && response.data) {
        setApplications(response.data.map((x) => ({
          ...x,
          status: x.status === 'new' ? 'pending' : x.status,
        })));
      } else {
        toast.error(response.message || 'Failed to fetch outreach applications.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (apps: OutreachApplication[]) => {
    setStats({
      total: apps.length,
      pending: apps.filter((a) => a.status === 'pending' || a.status === 'new').length,
      underReview: apps.filter((a) => a.status === 'under_review').length,
      approved: apps.filter((a) => a.status === 'approved').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
      waitlisted: apps.filter((a) => a.status === 'waitlisted').length,
    });
  };

  const handleViewDetails = (application: OutreachApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const openPrintableApplication = (application: OutreachApplication) => {
    if (application.applicationPdfPath) {
      window.open(`/uploads/applications/outreach-${application.messageId}.pdf`, '_blank');
      return;
    }
    toast.error('PDF is not available for this application.');
  };

  const handleReview = (application: OutreachApplication) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const handleDeleteApplication = async (app: OutreachApplication) => {
    if (!window.confirm(`Delete outreach application for ${app.name}?`)) return;
    try {
      setDeletingId(app.messageId);
      const response = await api.delete(`/admin/contact-messages/${app.messageId}`);
      if (response.success) {
        toast.success('Application deleted');
        if (selectedApplication?.messageId === app.messageId) {
          setShowDetailModal(false);
          setShowReviewModal(false);
          setSelectedApplication(null);
        }
        await fetchApplications();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    under_review: 'bg-blue-100 text-blue-800 border-blue-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    waitlisted: 'bg-orange-100 text-orange-800 border-orange-300',
    new: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    responded: 'bg-green-100 text-green-800 border-green-300',
    archived: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    new: 'New',
    responded: 'Responded',
    archived: 'Archived',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Outreach Applications
        </h1>
        <p className="text-gray-600 mt-2">Review and manage outreach applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.underReview}</div>
          <div className="text-sm text-gray-600">Reviewing</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.waitlisted}</div>
          <div className="text-sm text-gray-600">Waitlisted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input pl-10"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                <th className="text-left p-4 font-semibold text-gray-700">Outreach</th>
                <th className="text-left p-4 font-semibold text-gray-700">Submitted</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => {
                const outreachLine = app.message.split('\n').find((line) => line.startsWith('Outreach Event Name:'));
                const outreachName = outreachLine?.replace('Outreach Event Name:', '').trim() || 'Outreach Event';
                return (
                  <tr key={app.messageId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{app.name}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </td>
                    <td className="p-4 text-gray-700">{outreachName}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[app.status] || statusColors.pending}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openPrintableApplication(app)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View PDF"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReview(app)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Review Application"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app)}
                          disabled={deletingId === app.messageId}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete application"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showDetailModal && selectedApplication && (
        <OutreachApplicationDetailModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {showReviewModal && selectedApplication && (
        <OutreachReviewModal
          application={selectedApplication}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
          }}
          onSave={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}

interface OutreachApplicationDetailModalProps {
  application: OutreachApplication;
  onClose: () => void;
}

function OutreachApplicationDetailModal({ application, onClose }: OutreachApplicationDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div><span className="text-gray-600">Name:</span> <p className="font-medium">{application.name}</p></div>
          <div><span className="text-gray-600">Email:</span> <p className="font-medium">{application.email}</p></div>
          <div><span className="text-gray-600">Subject:</span> <p className="font-medium">{application.subject}</p></div>
          <div><span className="text-gray-600">Submitted:</span> <p className="font-medium">{new Date(application.createdAt).toLocaleString()}</p></div>
          <div>
            <span className="text-gray-600">Application Content:</span>
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <p className="text-gray-700 whitespace-pre-wrap">{application.message}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="btn-primary w-full">Close</button>
        </div>
      </div>
    </div>
  );
}

interface OutreachReviewModalProps {
  application: OutreachApplication;
  onClose: () => void;
  onSave: () => void;
}

function OutreachReviewModal({ application, onClose, onSave }: OutreachReviewModalProps) {
  const [status, setStatus] = useState(
    ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'].includes(application.status)
      ? application.status
      : 'pending'
  );
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.patch(`/admin/contact-messages/${application.messageId}/status`, {
        status,
        reviewNotes,
      });
      if (response.success) {
        toast.success('Application status updated successfully');
        onSave();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Review Application</h2>
          <p className="text-gray-600 mt-1">{application.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
            <select required value={status} onChange={(e) => setStatus(e.target.value as any)} className="input">
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes about this application..."
              className="input"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isSaving} className="btn-primary flex-1">
              {isSaving ? 'Saving...' : 'Update Status'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
