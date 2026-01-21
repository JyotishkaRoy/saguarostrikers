import { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, CheckCircle, Rocket } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Mission } from '@/types';

interface Application {
  applicationId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentDob: string;
  schoolName: string;
  grade: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  missionId: string;
  fitReason: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
  });

  useEffect(() => {
    fetchMissions();
    fetchApplications();
  }, []);

  useEffect(() => {
    // Recalculate stats when mission or applications change
    if (selectedMissionId !== 'all') {
      const missionApps = applications.filter(app => app.missionId === selectedMissionId);
      setStats({
        total: missionApps.length,
        pending: missionApps.filter(app => app.status === 'pending').length,
        underReview: missionApps.filter(app => app.status === 'under_review').length,
        approved: missionApps.filter(app => app.status === 'approved').length,
        rejected: missionApps.filter(app => app.status === 'rejected').length,
        waitlisted: missionApps.filter(app => app.status === 'waitlisted').length,
      });
    } else {
      setStats({
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        underReview: applications.filter(app => app.status === 'under_review').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        waitlisted: applications.filter(app => app.status === 'waitlisted').length,
      });
    }
  }, [applications, selectedMissionId]);

  useEffect(() => {
    let filtered = applications;

    // Filter by mission
    if (selectedMissionId !== 'all') {
      filtered = filtered.filter(app => app.missionId === selectedMissionId);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        `${app.studentFirstName} ${app.studentLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [applications, selectedMissionId, filterStatus, searchTerm]);

  const fetchMissions = async () => {
    try {
      const response = await api.get<Mission[]>('/admin/missions');
      if (response.success && response.data) {
        // Only show upcoming and in-progress missions (missions that accept applications)
        const activeMissions = response.data.filter(m => 
          m.status === 'published' || m.status === 'in-progress'
        );
        setMissions(activeMissions);
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Application[]>('/admin/applications');
      if (response.success && response.data) {
        setApplications(response.data);
        setFilteredApplications(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    under_review: 'bg-blue-100 text-blue-800 border-blue-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    waitlisted: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  const statusLabels = {
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Mission Applications
        </h1>
        <p className="text-gray-600 mt-2">Review and manage student applications</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Rocket className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="input pl-10 font-medium"
            >
              <option value="all">All Missions</option>
              {missions.map(mission => (
                <option key={mission.missionId} value={mission.missionId}>
                  {mission.title}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or school..."
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
                <th className="text-left p-4 font-semibold text-gray-700">Mission</th>
                <th className="text-left p-4 font-semibold text-gray-700">School</th>
                <th className="text-left p-4 font-semibold text-gray-700">Grade</th>
                <th className="text-left p-4 font-semibold text-gray-700">Parent</th>
                <th className="text-left p-4 font-semibold text-gray-700">Submitted</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => {
                const mission = missions.find(m => m.missionId === app.missionId);
                return (
                  <tr key={app.applicationId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {app.studentFirstName} {app.studentLastName}
                      </div>
                      <div className="text-sm text-gray-500">{app.studentEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-primary-600">
                        {mission?.title || 'Unknown Mission'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{app.schoolName}</td>
                    <td className="p-4 text-gray-700">{app.grade}</td>
                    <td className="p-4">
                      <div className="text-gray-700">
                        {app.parentFirstName} {app.parentLastName}
                      </div>
                      <div className="text-sm text-gray-500">{app.parentPhone}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[app.status]}`}>
                        {statusLabels[app.status]}
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
                          onClick={() => handleReview(app)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Review Application"
                        >
                          <CheckCircle className="h-5 w-5" />
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

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          missions={missions}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <ReviewModal
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

// Application Detail Modal
interface ApplicationDetailModalProps {
  application: Application;
  missions: Mission[];
  onClose: () => void;
}

function ApplicationDetailModal({ application, missions, onClose }: ApplicationDetailModalProps) {
  const mission = missions.find(m => m.missionId === application.missionId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
            {mission && (
              <p className="text-sm text-primary-600 mt-1 flex items-center gap-1">
                <Rocket className="h-4 w-4" />
                {mission.title}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium">{application.studentFirstName} {application.studentLastName}</p>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth:</span>
                <p className="font-medium">{new Date(application.studentDob).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{application.studentEmail}</p>
              </div>
              <div>
                <span className="text-gray-600">School:</span>
                <p className="font-medium">{application.schoolName}</p>
              </div>
              <div>
                <span className="text-gray-600">Grade:</span>
                <p className="font-medium">{application.grade}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium">{application.parentFirstName} {application.parentLastName}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{application.parentEmail}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">{application.parentPhone}</p>
              </div>
            </div>
          </div>

          {/* Why Fit */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Fit for Mission?</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{application.fitReason}</p>
            </div>
          </div>

          {/* Review Information */}
          {application.reviewedAt && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm"><span className="font-medium">Reviewed At:</span> {new Date(application.reviewedAt).toLocaleString()}</p>
                {application.reviewNotes && (
                  <div>
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-gray-700 mt-1">{application.reviewNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Review Modal
interface ReviewModalProps {
  application: Application;
  onClose: () => void;
  onSave: () => void;
}

function ReviewModal({ application, onClose, onSave }: ReviewModalProps) {
  const [status, setStatus] = useState(application.status);
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await api.patch(`/admin/applications/${application.applicationId}/status`, {
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
          <p className="text-gray-600 mt-1">
            {application.studentFirstName} {application.studentLastName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes about this application..."
              className="input"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The student and parent will receive an email notification about the status change.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex-1"
            >
              {isSaving ? 'Saving...' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
