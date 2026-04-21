import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trophy, Plus, Edit, Trash2, Eye, EyeOff, Calendar, MapPin, Search, UserRound, Package, Image, ChevronDown, ChevronUp, UserPlus, Download } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { getApiBaseUrl, getBackendOrigin } from '@/lib/apiConfig';
import toast from 'react-hot-toast';
import { formatUtcToLocalDate, localDateToUtcIso, utcIsoToLocalDateInput } from '@/lib/dateUtils';

const API_BASE = getBackendOrigin();

interface Outreach {
  outreachId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled' | 'in-progress' | 'archived';
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

interface Participant {
  outreachParticipantId: string;
  outreachId: string;
  userId: string;
  role?: string;
  addedAt: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface OutreachArtifact {
  artifactId: string;
  outreachId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: 'draft' | 'published' | 'unpublished';
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  outreachId?: string;
  status?: 'draft' | 'published' | 'unpublished';
  uploadedBy: string;
  uploadedAt: string;
  viewCount: number;
}

interface ActiveUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface UploadResult {
  url: string;
}

export default function AdminOutreaches() {
  const [searchParams] = useSearchParams();
  const urlOutreachId = searchParams.get('outreachId');

  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [filteredOutreaches, setFilteredOutreaches] = useState<Outreach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutreach, setEditingOutreach] = useState<Outreach | null>(null);
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');
  const [calendarEventsForOutreach, setCalendarEventsForOutreach] = useState<CalendarEventOption[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    completed: 0,
  });

  // Inline sections: which card + which section is expanded
  const [expandedSection, setExpandedSection] = useState<{ outreachId: string; section: 'participants' | 'artifacts' | 'gallery' } | null>(null);
  const [participantsByOutreach, setParticipantsByOutreach] = useState<Record<string, Participant[]>>({});
  const [artifactsByOutreach, setArtifactsByOutreach] = useState<Record<string, OutreachArtifact[]>>({});
  const [galleryByOutreach, setGalleryByOutreach] = useState<Record<string, GalleryImage[]>>({});
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [selectedParticipantUserId, setSelectedParticipantUserId] = useState('');
  // Artifact upload modal
  const [artifactModalOutreachId, setArtifactModalOutreachId] = useState<string | null>(null);
  const [artifactDescription, setArtifactDescription] = useState('');
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [artifactUploading, setArtifactUploading] = useState(false);
  // Gallery upload modal
  const [galleryModalOutreachId, setGalleryModalOutreachId] = useState<string | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryStatus, setGalleryStatus] = useState<'draft' | 'published'>('draft');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    fetchOutreaches();
  }, []);

  const fetchCalendarEventsForOutreach = async () => {
    try {
      const res = await api.get<CalendarEventOption[]>('/admin/calendar-events/for-association?context=outreach');
      if (res.success && Array.isArray(res.data)) setCalendarEventsForOutreach(res.data);
    } catch {
      setCalendarEventsForOutreach([]);
    }
  };

  useEffect(() => {
    if (isModalOpen) fetchCalendarEventsForOutreach();
  }, [isModalOpen]);

  useEffect(() => {
    if (expandedSection) {
      fetchSectionData(expandedSection.outreachId, expandedSection.section);
    }
  }, [expandedSection?.outreachId, expandedSection?.section]);

  const fetchSectionData = async (outreachId: string, section: 'participants' | 'artifacts' | 'gallery') => {
    setSectionLoading(true);
    try {
      if (section === 'participants') {
        const [res, usersRes] = await Promise.all([
          api.get(`/admin/outreaches/${outreachId}/participants`),
          activeUsers.length === 0 ? api.get('/admin/users?status=active') : Promise.resolve({ success: true, data: activeUsers }),
        ]);
        if (res.success && res.data) setParticipantsByOutreach(prev => ({ ...prev, [outreachId]: res.data as Participant[] }));
        if (usersRes?.success && usersRes.data && activeUsers.length === 0) setActiveUsers(usersRes.data as ActiveUser[]);
      } else if (section === 'artifacts') {
        const res = await api.get(`/admin/outreaches/${outreachId}/artifacts`);
        if (res.success && res.data) setArtifactsByOutreach(prev => ({ ...prev, [outreachId]: res.data as OutreachArtifact[] }));
      } else {
        const res = await api.get(`/admin/gallery/outreach/${outreachId}`);
        if (res.success && res.data) setGalleryByOutreach(prev => ({ ...prev, [outreachId]: res.data as GalleryImage[] }));
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSectionLoading(false);
    }
  };

  const toggleSection = (outreachId: string, section: 'participants' | 'artifacts' | 'gallery') => {
    setExpandedSection(prev =>
      prev?.outreachId === outreachId && prev?.section === section ? null : { outreachId, section }
    );
  };

  const refreshSection = (outreachId: string, section: 'participants' | 'artifacts' | 'gallery') => {
    fetchSectionData(outreachId, section);
  };

  const handleAddParticipant = async (outreachId: string) => {
    if (!selectedParticipantUserId) {
      toast.error('Select a user');
      return;
    }
    try {
      setAddingParticipant(true);
      await api.post(`/admin/outreaches/${outreachId}/participants`, { userId: selectedParticipantUserId });
      toast.success('Participant added');
      setSelectedParticipantUserId('');
      refreshSection(outreachId, 'participants');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (outreachId: string, userId: string) => {
    if (!confirm('Remove this participant?')) return;
    try {
      await api.delete(`/admin/outreaches/${outreachId}/participants/${userId}`);
      toast.success('Participant removed');
      refreshSection(outreachId, 'participants');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleArtifactUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artifactModalOutreachId || !artifactDescription.trim() || !artifactFile) {
      toast.error('Description and file required');
      return;
    }
    const formData = new FormData();
    formData.append('outreachId', artifactModalOutreachId);
    formData.append('description', artifactDescription.trim());
    formData.append('file', artifactFile);
    try {
      setArtifactUploading(true);
      const response = await fetch(`${getApiBaseUrl()}/admin/outreach-artifacts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Artifact uploaded');
        setArtifactModalOutreachId(null);
        setArtifactDescription('');
        setArtifactFile(null);
        if (expandedSection?.outreachId === artifactModalOutreachId && expandedSection?.section === 'artifacts') {
          refreshSection(artifactModalOutreachId, 'artifacts');
        }
      } else toast.error(data.message || 'Upload failed');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setArtifactUploading(false);
    }
  };

  const handleArtifactDelete = async (artifactId: string, outreachId: string) => {
    if (!confirm('Delete this artifact?')) return;
    try {
      await api.delete(`/admin/outreach-artifacts/${artifactId}`);
      toast.success('Deleted');
      refreshSection(outreachId, 'artifacts');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleArtifactToggleStatus = async (a: OutreachArtifact) => {
    const next = a.status === 'published' ? 'unpublished' : 'published';
    try {
      await api.put(`/admin/outreach-artifacts/${a.artifactId}`, { status: next });
      toast.success(`Artifact ${next}`);
      refreshSection(a.outreachId, 'artifacts');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryModalOutreachId || galleryFiles.length === 0) {
      toast.error('Select at least one file');
      return;
    }
    setGalleryUploading(true);
    let successCount = 0;
    let errorCount = 0;
    for (const file of galleryFiles) {
      const formData = new FormData();
      formData.append('outreachId', galleryModalOutreachId);
      formData.append('title', galleryTitle.trim() || file.name);
      formData.append('description', galleryDescription);
      formData.append('status', galleryStatus);
      formData.append('file', file);
      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/gallery`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          body: formData,
        });
        const data = await response.json();
        if (data.success) successCount++;
        else errorCount++;
      } catch {
        errorCount++;
      }
    }
    setGalleryUploading(false);
    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      setGalleryModalOutreachId(null);
      setGalleryTitle('');
      setGalleryDescription('');
      setGalleryFiles([]);
      if (expandedSection?.outreachId === galleryModalOutreachId && expandedSection?.section === 'gallery') {
        refreshSection(galleryModalOutreachId, 'gallery');
      }
    } else toast.error('Upload failed');
  };

  const handleGalleryDelete = async (galleryId: string, outreachId: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/admin/gallery/${galleryId}`);
      toast.success('Deleted');
      refreshSection(outreachId, 'gallery');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleGalleryToggleStatus = async (img: GalleryImage, outreachId: string) => {
    const next = img.status === 'published' ? 'unpublished' : 'published';
    try {
      await api.put(`/admin/gallery/${img.galleryId}`, { status: next, isPublic: next === 'published' });
      toast.success(`Item ${next}`);
      refreshSection(outreachId, 'gallery');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const galleryImageUrl = (path: string) => (path.startsWith('http') ? path : `${API_BASE}/uploads/${path}`);

  useEffect(() => {
    let filtered = outreaches;

    if (urlOutreachId) {
      filtered = filtered.filter(o => o.outreachId === urlOutreachId);
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

    setFilteredOutreaches(filtered);
  }, [searchTerm, filterStatus, outreaches, urlOutreachId]);

  const fetchOutreaches = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/outreaches');
      if (response.success && response.data && Array.isArray(response.data)) {
        setOutreaches(response.data as Outreach[]);
        setFilteredOutreaches(response.data as Outreach[]);
        calculateStats(response.data as Outreach[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Outreach[]) => {
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
      if (editingOutreach) {
        const heroMediaFile = formData.get('heroMedia') as File;

        if (heroMediaFile && heroMediaFile.name && heroMediaFile.size > 0) {
          try {
            const uploadResponse = await api.uploadFile<UploadResult>('/admin/upload', heroMediaFile, {
              folder: 'outreaches',
              outreachTitle: editingOutreach.title,
              outreachId: editingOutreach.outreachId
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

        await api.put(`/admin/outreaches/${editingOutreach.outreachId}`, data);
        toast.success('Outreach updated successfully');
      } else {
        const createResponse = await api.post('/admin/outreaches', data);

        if (createResponse.success && createResponse.data) {
          const newOutreach = createResponse.data as any;
          const heroMediaFile = formData.get('heroMedia') as File;

          if (heroMediaFile && heroMediaFile.name && heroMediaFile.size > 0) {
            try {
              const uploadResponse = await api.uploadFile<UploadResult>('/admin/upload', heroMediaFile, {
                folder: 'outreaches',
                outreachTitle: newOutreach.title,
                outreachId: newOutreach.outreachId
              });

              if (uploadResponse.success && uploadResponse.data?.url) {
                await api.put(`/admin/outreaches/${newOutreach.outreachId}`, {
                  ...data,
                  imageUrl: uploadResponse.data.url
                });
              }
            } catch (uploadError) {
              console.error('File upload failed:', uploadError);
              toast.error('Outreach created, but media upload failed');
            }
          }
        }

        toast.success('Outreach created successfully');
      }

      setIsModalOpen(false);
      setEditingOutreach(null);
      fetchOutreaches();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this outreach?')) return;

    try {
      await api.delete(`/admin/outreaches/${id}`);
      toast.success('Outreach deleted successfully');
      fetchOutreaches();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outreaches Management</h1>
        <p className="text-gray-600">Create and manage outreach events</p>
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
                placeholder="Search outreaches..."
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
              setEditingOutreach(null);
              setModalStartDate('');
              setModalEndDate('');
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Create Outreach
          </button>
        </div>
      </div>

      {/* Outreaches List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredOutreaches.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No outreaches found</h3>
          <p className="text-gray-600 mb-4">Create your first outreach to get started</p>
          <button
            onClick={() => {
              setEditingOutreach(null);
              setModalStartDate('');
              setModalEndDate('');
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            Create Outreach
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOutreaches.map((outreach) => (
            <div key={outreach.outreachId} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{outreach.title}</h3>
                    <span className={`badge ${getStatusBadge(outreach.status)}`}>
                      {outreach.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{outreach.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatUtcToLocalDate(outreach.startDate)} – {formatUtcToLocalDate(outreach.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{outreach.location}</span>
                    </div>
                  </div>
                  {/* Section toggles */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => toggleSection(outreach.outreachId, 'participants')}
                      className={`btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 ${expandedSection?.outreachId === outreach.outreachId && expandedSection?.section === 'participants' ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      Coordinators
                      {expandedSection?.outreachId === outreach.outreachId && expandedSection?.section === 'participants' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection(outreach.outreachId, 'artifacts')}
                      className={`btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 ${expandedSection?.outreachId === outreach.outreachId && expandedSection?.section === 'artifacts' ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      <Package className="h-3.5 w-3.5" />
                      Artifacts
                      {expandedSection?.outreachId === outreach.outreachId && expandedSection?.section === 'artifacts' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection(outreach.outreachId, 'gallery')}
                      className={`btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 ${expandedSection?.outreachId === outreach.outreachId && expandedSection?.section === 'gallery' ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      <Image className="h-3.5 w-3.5" />
                      Gallery
                      {expandedSection?.outreachId === outreach.outreachId && expandedSection?.section === 'gallery' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Inline section content */}
                  {expandedSection?.outreachId === outreach.outreachId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {sectionLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                        </div>
                      ) : expandedSection.section === 'participants' ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[180px]">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Add user</label>
                              <select
                                value={selectedParticipantUserId}
                                onChange={(e) => setSelectedParticipantUserId(e.target.value)}
                                className="input w-full text-sm"
                              >
                                <option value="">Select active user…</option>
                                {(activeUsers || []).filter(u => !(participantsByOutreach[outreach.outreachId] || []).some(p => p.userId === u.userId)).map(u => (
                                  <option key={u.userId} value={u.userId}>{u.firstName} {u.lastName} ({u.email})</option>
                                ))}
                              </select>
                            </div>
                            <button type="button" onClick={() => handleAddParticipant(outreach.outreachId)} disabled={addingParticipant || !selectedParticipantUserId} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                              <UserPlus className="h-3.5 w-3.5" /> Add
                            </button>
                          </div>
                          <ul className="divide-y divide-gray-100 text-sm">
                            {(participantsByOutreach[outreach.outreachId] || []).map(p => (
                              <li key={p.outreachParticipantId} className="py-2 flex justify-between items-center">
                                <span>{p.firstName} {p.lastName} <span className="text-gray-500">({p.email})</span></span>
                                <button type="button" onClick={() => handleRemoveParticipant(outreach.outreachId, p.userId)} className="btn-danger text-xs py-1 px-2">Remove</button>
                              </li>
                            ))}
                          </ul>
                          {(participantsByOutreach[outreach.outreachId] || []).length === 0 && (
                            <p className="text-gray-500 text-sm">No participants yet.</p>
                          )}
                        </div>
                      ) : expandedSection.section === 'artifacts' ? (
                        <div className="space-y-3">
                          <button type="button" onClick={() => { setArtifactModalOutreachId(outreach.outreachId); setArtifactDescription(''); setArtifactFile(null); }} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5" /> Upload artifact
                          </button>
                          <div className="space-y-2">
                            {(artifactsByOutreach[outreach.outreachId] || []).map(a => (
                              <div key={a.artifactId} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-100 text-sm">
                                <span className="font-medium truncate">{a.description || a.originalFileName}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`badge text-xs ${a.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span>
                                  <a href={`/uploads/${a.filePath}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1 px-2 flex items-center gap-1"><Download className="h-3 w-3" /> Download</a>
                                  <button type="button" onClick={() => handleArtifactToggleStatus(a)} className="btn-outline text-xs py-1 px-2">{a.status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                                  <button type="button" onClick={() => handleArtifactDelete(a.artifactId, outreach.outreachId)} className="btn-danger text-xs py-1 px-2"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                          {(artifactsByOutreach[outreach.outreachId] || []).length === 0 && (
                            <p className="text-gray-500 text-sm">No artifacts yet.</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button type="button" onClick={() => { setGalleryModalOutreachId(outreach.outreachId); setGalleryTitle(''); setGalleryDescription(''); setGalleryFiles([]); }} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5" /> Upload images / videos
                          </button>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {(galleryByOutreach[outreach.outreachId] || []).map(img => (
                              <div key={img.galleryId} className="rounded border border-gray-200 overflow-hidden">
                                <div className="aspect-video bg-gray-100">
                                  {img.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video src={galleryImageUrl(img.imageUrl)} className="w-full h-full object-cover" controls />
                                  ) : (
                                    <img src={galleryImageUrl(img.imageUrl)} alt={img.title} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="p-1.5 flex items-center justify-between gap-1">
                                  <span className="text-xs truncate">{img.title}</span>
                                  <div className="flex gap-0.5">
                                    <button type="button" onClick={() => handleGalleryToggleStatus(img, outreach.outreachId)} className="btn-outline text-xs p-1">{img.status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                                    <button type="button" onClick={() => handleGalleryDelete(img.galleryId, outreach.outreachId)} className="btn-danger text-xs p-1"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {(galleryByOutreach[outreach.outreachId] || []).length === 0 && (
                            <p className="text-gray-500 text-sm">No gallery items yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingOutreach(outreach);
                      setModalStartDate(outreach.startDate ? utcIsoToLocalDateInput(outreach.startDate) : '');
                      setModalEndDate(outreach.endDate ? utcIsoToLocalDateInput(outreach.endDate) : '');
                      setIsModalOpen(true);
                    }}
                    className="btn-outline text-sm py-1.5 px-3"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(outreach.outreachId)}
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
              {editingOutreach ? 'Edit Outreach' : 'Create Outreach'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingOutreach?.title}
                  required
                  className="input w-full"
                  placeholder="Outreach Event 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingOutreach?.description}
                  required
                  rows={4}
                  className="input w-full"
                  placeholder="Describe the outreach..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={modalStartDate}
                    onChange={(e) => {
                      const nextStartDate = e.target.value;
                      setModalStartDate(nextStartDate);
                      if (!nextStartDate) {
                        setModalEndDate('');
                        return;
                      }
                      if (modalEndDate && modalEndDate < nextStartDate) {
                        setModalEndDate('');
                      }
                    }}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={modalEndDate}
                    onChange={(e) => setModalEndDate(e.target.value)}
                    min={modalStartDate || undefined}
                    disabled={!modalStartDate}
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingOutreach?.location}
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
                {editingOutreach?.imageUrl && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current: {editingOutreach.imageUrl.split('/').pop()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image or video to display in the outreach detail page hero section
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calendar Event</label>
                <select name="calendarEventId" defaultValue={editingOutreach?.calendarEventId ?? ''} className="input w-full">
                  <option value="">None — standalone outreach</option>
                  {calendarEventsForOutreach.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.title} ({formatUtcToLocalDate(ev.date)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: link this outreach to an upcoming/ongoing Community Outreach, Summer Camp (STEM), or Other calendar event
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" defaultValue={editingOutreach?.status || 'draft'} className="input w-full">
                  <option value="draft">Draft</option>
                  <option value="published">Published (Upcoming)</option>
                  <option value="in-progress">In Progress</option>
                  {editingOutreach && (
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
                  {editingOutreach ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingOutreach(null);
                    setModalStartDate('');
                    setModalEndDate('');
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

      {/* Artifact upload modal */}
      {artifactModalOutreachId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Upload artifact</h2>
            <form onSubmit={handleArtifactUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={artifactDescription} onChange={(e) => setArtifactDescription(e.target.value)} className="input w-full" placeholder="Brief description" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File (PDF, DOC, image)</label>
                <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setArtifactFile(e.target.files?.[0] || null)} className="input w-full" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={artifactUploading} className="btn-primary flex-1">{artifactUploading ? 'Uploading…' : 'Upload'}</button>
                <button type="button" onClick={() => { setArtifactModalOutreachId(null); setArtifactDescription(''); setArtifactFile(null); }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery upload modal */}
      {galleryModalOutreachId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Upload images / videos</h2>
            <form onSubmit={handleGalleryUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (used if one file)</label>
                <input type="text" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="input w-full" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea value={galleryDescription} onChange={(e) => setGalleryDescription(e.target.value)} className="input w-full" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={galleryStatus} onChange={(e) => setGalleryStatus(e.target.value as 'draft' | 'published')} className="input w-full">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Files (images and videos)</label>
                <input type="file" accept="image/*,video/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} className="input w-full" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={galleryUploading} className="btn-primary flex-1">{galleryUploading ? 'Uploading…' : 'Upload'}</button>
                <button type="button" onClick={() => { setGalleryModalOutreachId(null); setGalleryFiles([]); }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
