import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UsersRound, Trophy, Mail, Phone, User, Search, Edit, UserPlus, X, Filter, Eye } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import type { Mission } from '@/types';

interface ApprovedMember {
  applicationId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone?: string;
  missionRole?: string;
  shortBio?: string;
  missionId: string;
  status: string;
  approvedAt?: string;
}

interface MissionWithMembers extends Mission {
  approvedMembers: ApprovedMember[];
}

interface RegisteredUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
}

export default function AdminScientists() {
  const [searchParams] = useSearchParams();
  const urlMissionId = searchParams.get('missionId');
  
  const [missionsWithMembers, setMissionsWithMembers] = useState<MissionWithMembers[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<MissionWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionWithMembers | null>(null);
  const [editingScientist, setEditingScientist] = useState<ApprovedMember | null>(null);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editSelectedUserId, setEditSelectedUserId] = useState('');
  const [editFormData, setEditFormData] = useState({
    studentFirstName: '',
    studentLastName: '',
    studentEmail: '',
    studentPhone: '',
    missionRole: '',
    shortBio: '',
  });
  const [missionStats, setMissionStats] = useState({
    total: 0,
    published: 0,
    inProgress: 0,
    completed: 0,
  });
  const [scientistStats, setScientistStats] = useState({
    total: 0,
    published: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchMissionsWithMembers();
  }, []);

  useEffect(() => {
    let filtered = missionsWithMembers;

    // Filter by missionId from URL params
    if (urlMissionId) {
      filtered = filtered.filter(mission => mission.missionId === urlMissionId);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(mission => mission.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.approvedMembers.some(member =>
          `${member.studentFirstName} ${member.studentLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredMissions(filtered);
  }, [searchTerm, filterStatus, missionsWithMembers, urlMissionId]);

  const fetchMissionsWithMembers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all missions
      const missionsResponse = await api.get<Mission[]>('/admin/missions');
      if (!missionsResponse.success || !missionsResponse.data) {
        throw new Error('Failed to fetch missions');
      }

      const missions = missionsResponse.data;

      // Fetch all applications
      const applicationsResponse = await api.get<ApprovedMember[]>('/admin/applications');
      if (!applicationsResponse.success || !applicationsResponse.data) {
        throw new Error('Failed to fetch applications');
      }

      const applications = applicationsResponse.data;

      // Filter approved applications and group by mission
      const approvedApplications = applications.filter((app: ApprovedMember) => app.status === 'approved');

      // Create missions with their approved members
      const missionsWithMembersData: MissionWithMembers[] = missions.map(mission => ({
        ...mission,
        approvedMembers: approvedApplications.filter((app: ApprovedMember) => app.missionId === mission.missionId),
      }));

      setMissionsWithMembers(missionsWithMembersData);
      setFilteredMissions(missionsWithMembersData);

      // Calculate mission stats
      setMissionStats({
        total: missionsWithMembersData.length,
        published: missionsWithMembersData.filter(m => m.status === 'published').length,
        inProgress: missionsWithMembersData.filter(m => m.status === 'in-progress').length,
        completed: missionsWithMembersData.filter(m => m.status === 'completed').length,
      });

      // Calculate scientist stats
      const publishedMissions = missionsWithMembersData.filter(m => m.status === 'published');
      const inProgressMissions = missionsWithMembersData.filter(m => m.status === 'in-progress');
      const completedMissions = missionsWithMembersData.filter(m => m.status === 'completed');

      setScientistStats({
        total: missionsWithMembersData.reduce((sum, m) => sum + m.approvedMembers.length, 0),
        published: publishedMissions.reduce((sum, m) => sum + m.approvedMembers.length, 0),
        inProgress: inProgressMissions.reduce((sum, m) => sum + m.approvedMembers.length, 0),
        completed: completedMissions.reduce((sum, m) => sum + m.approvedMembers.length, 0),
      });

    } catch (error) {
      console.error('Error fetching missions with members:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get<RegisteredUser[]>('/admin/users');
      if (response.success && response.data) {
        // Filter to only active users (including both 'user' and 'admin' roles)
        const activeUsers = response.data.filter(u => u.status === 'active');
        setAllUsers(activeUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleManageScientists = async (mission: MissionWithMembers) => {
    setSelectedMission(mission);
    await fetchAllUsers();
    setShowManageModal(true);
  };

  const handleAddScientist = async () => {
    if (!selectedUserId || !selectedMission) return;

    try {
      setIsSubmitting(true);
      const user = allUsers.find(u => u.userId === selectedUserId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      // Check if user is already a scientist for this mission
      const alreadyAdded = selectedMission.approvedMembers.some(
        m => m.studentEmail === user.email
      );

      if (alreadyAdded) {
        toast.error('This user is already a scientist for this mission');
        return;
      }

      // Create a synthetic approved application for this user
      const applicationData = {
        studentFirstName: user.firstName,
        studentLastName: user.lastName,
        studentEmail: user.email,
        studentPhone: user.phone || '',
        studentDob: '2000-01-01', // Default DOB (no max age limit)
        schoolName: 'Direct Assignment',
        grade: '12',
        studentAddressLine1: 'N/A',
        studentCity: 'N/A',
        studentState: 'AZ',
        studentZip: '00000',
        parentFirstName: 'N/A',
        parentLastName: 'N/A',
        parentEmail: user.email,
        parentPhone: user.phone || '',
        parentAddressLine1: 'N/A',
        parentCity: 'N/A',
        parentState: 'AZ',
        parentZip: '00000',
        missionId: selectedMission.missionId,
        missionRole: 'Mission Specialist',
        shortBio: '',
        fitReason: 'Direct assignment by admin',
        studentSignature: `${user.firstName} ${user.lastName}`,
        parentSignature: `${user.firstName} ${user.lastName}`,
        agreementFinancial: true,
        agreementPhotograph: true,
        agreementLiability: true,
        isDirectAssignment: true, // Skip detailed validation
      };

      // Submit application
      const submitResponse = await api.post<{ applicationId: string }>('/public/join-mission', applicationData);
      
      if (!submitResponse.success) {
        throw new Error('Failed to create application');
      }

      // Get the created application ID
      const applicationId = submitResponse.data.applicationId;

      // Immediately approve it
      await api.patch(`/admin/applications/${applicationId}/status`, {
        status: 'approved',
        reviewNotes: 'Direct assignment by admin',
      });

      toast.success(`${user.firstName} ${user.lastName} added as scientist`);
      setSelectedUserId('');
      
      // Refresh data
      await fetchMissionsWithMembers();
      
      // Update selected mission
      const updatedMission = missionsWithMembers.find(m => m.missionId === selectedMission.missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }

    } catch (error) {
      console.error('Error adding scientist:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditScientist = (member: ApprovedMember) => {
    setEditingScientist(member);
    const matchingUser = allUsers.find((u) => u.email.toLowerCase() === member.studentEmail.toLowerCase());
    setEditSelectedUserId(matchingUser?.userId || '');
    setEditFormData({
      studentFirstName: member.studentFirstName || '',
      studentLastName: member.studentLastName || '',
      studentEmail: member.studentEmail || '',
      studentPhone: member.studentPhone || '',
      missionRole: member.missionRole || 'Mission Specialist',
      shortBio: member.shortBio || '',
    });
  };

  const handleEditUserSelect = (userId: string) => {
    setEditSelectedUserId(userId);
    const user = allUsers.find((u) => u.userId === userId);
    if (!user) return;
    setEditFormData((prev) => ({
      ...prev,
      studentFirstName: user.firstName,
      studentLastName: user.lastName,
      studentEmail: user.email,
      studentPhone: user.phone || prev.studentPhone,
    }));
  };

  const handleSaveScientist = async () => {
    if (!editingScientist) return;
    if (!editFormData.studentFirstName || !editFormData.studentLastName || !editFormData.studentEmail) {
      toast.error('First name, last name, and email are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/admin/applications/${editingScientist.applicationId}`, {
        studentFirstName: editFormData.studentFirstName,
        studentLastName: editFormData.studentLastName,
        studentEmail: editFormData.studentEmail,
        studentPhone: editFormData.studentPhone,
        missionRole: editFormData.missionRole,
        shortBio: editFormData.shortBio,
      });
      toast.success('Scientist updated successfully');
      setEditingScientist(null);
      setEditSelectedUserId('');
      await fetchMissionsWithMembers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveScientist = async (applicationId: string, scientistName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${scientistName} from this mission?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Delete the application
      await api.delete(`/admin/applications/${applicationId}`);
      
      toast.success(`${scientistName} removed from mission`);
      
      // Refresh data
      await fetchMissionsWithMembers();
      
      // Update selected mission if modal is open
      if (selectedMission) {
        const updatedMission = missionsWithMembers.find(m => m.missionId === selectedMission.missionId);
        if (updatedMission) {
          setSelectedMission(updatedMission);
        }
      }

    } catch (error) {
      console.error('Error removing scientist:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableUsers = () => {
    // Return all active users (duplicates are prevented in handleAddScientist)
    return allUsers;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      published: 'bg-blue-100 text-blue-800 border-blue-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      archived: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Draft',
      published: 'Upcoming',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      archived: 'Archived',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <UsersRound className="h-8 w-8" />
          Mission Scientists
        </h1>
        <p className="text-gray-600 mt-2">View approved team members for each mission</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:divide-x lg:divide-gray-300">
        {/* Mission Stats */}
        <div className="lg:pr-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary-600" />
            Missions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-xl font-bold text-primary-600">{missionStats.total}</p>
                </div>
                <Trophy className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Published</p>
                  <p className="text-xl font-bold text-primary-600">{missionStats.published}</p>
                </div>
                <Eye className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">In Progress</p>
                  <p className="text-xl font-bold text-primary-600">{missionStats.inProgress}</p>
                </div>
                <Edit className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-primary-600">{missionStats.completed}</p>
                </div>
                <Trophy className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Scientist Stats */}
        <div className="lg:pl-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary-600" />
            Scientists
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-xl font-bold text-primary-600">{scientistStats.total}</p>
                </div>
                <User className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Published</p>
                  <p className="text-xl font-bold text-primary-600">{scientistStats.published}</p>
                </div>
                <User className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">In Progress</p>
                  <p className="text-xl font-bold text-primary-600">{scientistStats.inProgress}</p>
                </div>
                <User className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-primary-600">{scientistStats.completed}</p>
                </div>
                <User className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search missions, scientists, or emails..."
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
              <option value="draft">Draft</option>
              <option value="published">Published (Upcoming)</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading mission scientists...</p>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">
            {searchTerm ? 'No missions found matching your search' : 'No approved scientists yet'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Scientists will appear here once applications are approved
          </p>
        </div>
      ) : (
        /* Mission Cards Grid */
        <div className="space-y-8">
          {filteredMissions.map((mission) => (
            <div key={mission.missionId} className="card">
              {/* Mission Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6 text-primary-600" />
                    <Link
                      to={`/admin/missions?missionId=${mission.missionId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600 hover:underline"
                    >
                      {mission.title}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mission.status)}`}>
                      {getStatusLabel(mission.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 ml-9">{mission.description}</p>
                  <div className="flex items-center gap-4 mt-2 ml-9 text-sm text-gray-500">
                    <span>{new Date(mission.startDate).toLocaleDateString()} - {new Date(mission.endDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{mission.location}</span>
                  </div>
                </div>
                <div className="text-right space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-primary-600">{mission.approvedMembers.length}</div>
                    <div className="text-sm text-gray-600">Scientists</div>
                  </div>
                  {(mission.status === 'published' || mission.status === 'in-progress') && (
                    <button
                      onClick={() => handleManageScientists(mission)}
                      className="btn-primary inline-flex items-center gap-2 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      Manage Scientists
                    </button>
                  )}
                </div>
              </div>

              {/* Scientists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mission.approvedMembers.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <UsersRound className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No scientists assigned yet</p>
                    {(mission.status === 'published' || mission.status === 'in-progress') && (
                      <button
                        onClick={() => handleManageScientists(mission)}
                        className="btn-primary inline-flex items-center gap-2 text-sm mt-3"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Scientists
                      </button>
                    )}
                  </div>
                ) : (
                  mission.approvedMembers.map((member) => (
                    <div
                      key={member.applicationId}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      {/* Member Avatar & Name */}
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">
                            {member.studentFirstName} {member.studentLastName}
                          </h3>
                          <p className="text-xs text-primary-700 truncate">
                            {member.missionRole || 'Mission Specialist'}
                          </p>
                        </div>
                      </div>

                      {/* Member Details */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{member.studentEmail}</span>
                        </div>
                        {member.studentPhone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{member.studentPhone}</span>
                          </div>
                        )}
                        {member.shortBio ? (
                          <p className="text-gray-500 line-clamp-2">{member.shortBio}</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Scientists Modal */}
      {showManageModal && selectedMission && (
        <Modal
          isOpen={showManageModal}
          onClose={() => {
            setShowManageModal(false);
            setSelectedMission(null);
            setSelectedUserId('');
            setEditingScientist(null);
            setEditSelectedUserId('');
          }}
          title={`Manage Scientists - ${selectedMission.title}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Add New Scientist Section */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Scientist
              </h3>
              <div className="flex gap-3">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input flex-1"
                  disabled={isSubmitting}
                >
                  <option value="">Select a user...</option>
                  {getAvailableUsers().map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddScientist}
                  disabled={!selectedUserId || isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
              {allUsers.length === 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ No active users found
                </p>
              )}
            </div>

            {/* Current Scientists List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UsersRound className="h-5 w-5" />
                Current Scientists ({selectedMission.approvedMembers.length})
              </h3>
              
              {selectedMission.approvedMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <UsersRound className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No scientists assigned yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedMission.approvedMembers.map((member) => (
                    <div
                      key={member.applicationId}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">
                            {member.studentFirstName} {member.studentLastName}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">{member.studentEmail}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.missionRole || 'Mission Specialist'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveScientist(
                          member.applicationId,
                          `${member.studentFirstName} ${member.studentLastName}`
                        )}
                        disabled={isSubmitting}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove scientist"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditScientist(member)}
                        disabled={isSubmitting}
                        className="ml-2 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit scientist"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editingScientist && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Scientist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    className="input md:col-span-2"
                    value={editSelectedUserId}
                    onChange={(e) => handleEditUserSelect(e.target.value)}
                  >
                    <option value="">Select user to pre-populate First/Last/Email</option>
                    {allUsers.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    placeholder="First Name"
                    value={editFormData.studentFirstName}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, studentFirstName: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Last Name"
                    value={editFormData.studentLastName}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, studentLastName: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Email"
                    type="email"
                    value={editFormData.studentEmail}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, studentEmail: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Phone"
                    value={editFormData.studentPhone}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, studentPhone: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Mission Role"
                    value={editFormData.missionRole}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, missionRole: e.target.value }))}
                  />
                  <textarea
                    className="input md:col-span-2"
                    placeholder="Short Bio"
                    value={editFormData.shortBio}
                    rows={3}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, shortBio: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveScientist}
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingScientist(null)}
                    disabled={isSubmitting}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
