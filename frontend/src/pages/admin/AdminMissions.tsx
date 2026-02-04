import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trophy, Plus, Edit, Trash2, Eye, Calendar, MapPin, Search, Users, UserRound, Package, Image, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatUtcToLocalDate, localDateToUtcIso, utcIsoToLocalDateInput } from '@/lib/dateUtils';

interface Mission {
  missionId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  imageUrl?: string;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEventOption {
  eventId: string;
  title: string;
  date: string;
  type: string;
}

export default function AdminMissions() {
  const [searchParams] = useSearchParams();
  const urlMissionId = searchParams.get('missionId');
  
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [calendarEventsForMission, setCalendarEventsForMission] = useState<CalendarEventOption[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchCalendarEventsForMission = async () => {
    try {
      const res = await api.get<CalendarEventOption[]>('/admin/calendar-events/for-association?context=mission');
      if (res.success && Array.isArray(res.data)) setCalendarEventsForMission(res.data);
    } catch {
      setCalendarEventsForMission([]);
    }
  };

  useEffect(() => {
    if (isModalOpen) fetchCalendarEventsForMission();
  }, [isModalOpen]);

  useEffect(() => {
    let filtered = missions;

    // Filter by missionId from URL params
    if (urlMissionId) {
      filtered = filtered.filter(m => m.missionId === urlMissionId);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMissions(filtered);
  }, [searchTerm, filterStatus, missions, urlMissionId]);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/missions');
      if (response.success && response.data && Array.isArray(response.data)) {
        setMissions(response.data as Mission[]);
        setFilteredMissions(response.data as Mission[]);
        calculateStats(response.data as Mission[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Mission[]) => {
    setStats({
      total: data.length,
      published: data.filter(c => c.status === 'published').length,
      draft: data.filter(c => c.status === 'draft').length,
      completed: data.filter(c => c.status === 'completed').length,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const calendarEventId = formData.get('calendarEventId') as string;
    const startDateLocal = formData.get('startDate') as string;
    const endDateLocal = formData.get('endDate') as string;
    const data: any = {
      title: formData.get('title'),
      description: formData.get('description'),
      startDate: startDateLocal ? localDateToUtcIso(startDateLocal) : '',
      endDate: endDateLocal ? localDateToUtcIso(endDateLocal) : '',
      location: formData.get('location'),
      status: formData.get('status'),
      calendarEventId: calendarEventId && calendarEventId.trim() ? calendarEventId : undefined,
    };

    try {
      // For editing: upload file first if selected, then update mission
      if (editingMission) {
        const heroMediaFile = formData.get('heroMedia') as File;
        
        // Only upload if a file was actually selected (has a name and size)
        if (heroMediaFile && heroMediaFile.name && heroMediaFile.size > 0) {
          try {
            // Use the dedicated uploadFile method with mission details
            const uploadResponse = await api.uploadFile('/admin/upload', heroMediaFile, {
              folder: 'missions',
              missionTitle: editingMission.title,
              missionId: editingMission.missionId
            });
            
            if (uploadResponse.success && uploadResponse.data?.url) {
              data.imageUrl = uploadResponse.data.url;
            }
          } catch (uploadError) {
            console.error('File upload failed:', uploadError);
            toast.error('Failed to upload media file');
            return;
          }
        }

        await api.put(`/admin/missions/${editingMission.missionId}`, data);
        toast.success('Mission updated successfully');
      } else {
        // For creating: create mission first, then upload file if selected
        const createResponse = await api.post('/admin/missions', data);
        
        if (createResponse.success && createResponse.data) {
          const newMission = createResponse.data as any;
          const heroMediaFile = formData.get('heroMedia') as File;
          
          // Upload file after mission creation if file was selected
          if (heroMediaFile && heroMediaFile.name && heroMediaFile.size > 0) {
            try {
              const uploadResponse = await api.uploadFile('/admin/upload', heroMediaFile, {
                folder: 'missions',
                missionTitle: newMission.title,
                missionId: newMission.missionId
              });
              
              if (uploadResponse.success && uploadResponse.data?.url) {
                // Update mission with image URL
                await api.put(`/admin/missions/${newMission.missionId}`, {
                  ...data,
                  imageUrl: uploadResponse.data.url
                });
              }
            } catch (uploadError) {
              console.error('File upload failed:', uploadError);
              // Mission was created, but file upload failed - still show success
              toast.warning('Mission created, but media upload failed');
            }
          }
        }
        
        toast.success('Mission created successfully');
      }
      
      setIsModalOpen(false);
      setEditingMission(null);
      fetchMissions();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) return;

    try {
      await api.delete(`/admin/missions/${id}`);
      toast.success('Mission deleted successfully');
      fetchMissions();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      published: 'badge-success',
      draft: 'badge-warning',
      completed: 'badge-primary',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-gray';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Missions Management</h1>
        <p className="text-gray-600">Create and manage mission missions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Trophy className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-success-600">{stats.published}</p>
            </div>
            <Eye className="h-8 w-8 text-success-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-warning-600">{stats.draft}</p>
            </div>
            <Edit className="h-8 w-8 text-warning-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-primary-600">{stats.completed}</p>
            </div>
            <Trophy className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search missions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
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
          <button
            onClick={() => {
              setEditingMission(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Create Mission
          </button>
        </div>
      </div>

      {/* Missions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No missions found</h3>
          <p className="text-gray-600 mb-4">Create your first mission to get started</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Create Mission
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMissions.map((mission) => (
            <div key={mission.missionId} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{mission.title}</h3>
                    <span className={`badge ${getStatusBadge(mission.status)}`}>
                      {mission.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{mission.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatUtcToLocalDate(mission.startDate)} – {formatUtcToLocalDate(mission.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mission.location}</span>
                    </div>
                  </div>
                  {/* Quick Navigation Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link
                      to={`/admin/applications?missionId=${mission.missionId}`}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Applications
                    </Link>
                    <Link
                      to={`/admin/scientists?missionId=${mission.missionId}`}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      Scientists
                    </Link>
                    <Link
                      to={`/admin/artifacts?missionId=${mission.missionId}`}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Package className="h-3.5 w-3.5" />
                      Artifacts
                    </Link>
                    <Link
                      to={`/admin/gallery?missionId=${mission.missionId}`}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Image className="h-3.5 w-3.5" />
                      Gallery
                    </Link>
                    <Link
                      to={`/admin/discussions?missionId=${mission.missionId}`}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Discussions
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingMission(mission);
                      setIsModalOpen(true);
                    }}
                    className="btn-outline text-sm py-1.5 px-3"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mission.missionId)}
                    className="btn-danger text-sm py-1.5 px-3"
                    title="Delete"
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
              {editingMission ? 'Edit Mission' : 'Create Mission'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingMission?.title}
                  required
                  className="input w-full"
                  placeholder="NASA USLI 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingMission?.description}
                  required
                  rows={4}
                  className="input w-full"
                  placeholder="Describe the mission..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={editingMission?.startDate ? utcIsoToLocalDateInput(editingMission.startDate) : undefined}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={editingMission?.endDate ? utcIsoToLocalDateInput(editingMission.endDate) : undefined}
                    required
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingMission?.location}
                  required
                  className="input w-full"
                  placeholder="Huntsville, AL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hero Image/Video <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="heroMedia"
                  accept="image/*,video/*"
                  className="input w-full"
                />
                {editingMission?.imageUrl && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current: {editingMission.imageUrl.split('/').pop()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image or video to display in the mission detail page hero section
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calendar Event</label>
                <select name="calendarEventId" defaultValue={editingMission?.calendarEventId ?? ''} className="input w-full">
                  <option value="">None — standalone mission</option>
                  {calendarEventsForMission.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.title} ({formatUtcToLocalDate(ev.date)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: link this mission to an upcoming/ongoing Rocketry, Robotics, or Other calendar event
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" defaultValue={editingMission?.status || 'draft'} className="input w-full">
                  <option value="draft">Draft</option>
                  <option value="published">Published (Upcoming)</option>
                  <option value="in-progress">In Progress</option>
                  {editingMission && (
                    <>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="archived">Archived</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingMission ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMission(null);
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
