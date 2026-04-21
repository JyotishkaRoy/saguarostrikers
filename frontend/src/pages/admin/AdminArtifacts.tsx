import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Download, Eye, EyeOff, Package, Search, Trophy } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/apiConfig';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';

interface Mission {
  missionId: string;
  title: string;
  slug: string;
  status: string;
}

interface Artifact {
  artifactId: string;
  missionId: string;
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

interface MissionWithArtifacts extends Mission {
  artifacts: Artifact[];
}

export default function AdminArtifacts() {
  const [searchParams] = useSearchParams();
  const urlMissionId = searchParams.get('missionId');
  
  const [missions, setMissions] = useState<MissionWithArtifacts[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<MissionWithArtifacts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    unpublished: 0,
  });
  const [formData, setFormData] = useState({
    description: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  // Calculate stats
  useEffect(() => {
    const allArtifacts = missions.flatMap(m => m.artifacts);
    setStats({
      total: allArtifacts.length,
      published: allArtifacts.filter(a => a.status === 'published').length,
      draft: allArtifacts.filter(a => a.status === 'draft').length,
      unpublished: allArtifacts.filter(a => a.status === 'unpublished').length,
    });
  }, [missions]);

  // Auto-expand and filter by missionId, search, and status from URL params
  useEffect(() => {
    let filtered = missions;
    
    // Filter by missionId from URL params
    if (urlMissionId) {
      filtered = missions.filter(m => m.missionId === urlMissionId);
      setExpandedMissions(new Set([urlMissionId]));
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.artifacts.some(artifact =>
          artifact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artifact.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.map(mission => ({
        ...mission,
        artifacts: mission.artifacts.filter(a => a.status === filterStatus)
      })).filter(mission => mission.artifacts.length > 0);
    }
    
    setFilteredMissions(filtered);
  }, [urlMissionId, missions, searchTerm, filterStatus]);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<MissionWithArtifacts[]>('/admin/artifacts');
      if (response.success && response.data) {
        setMissions(response.data);
        // Apply URL filter if present
        if (urlMissionId) {
          const filtered = response.data.filter(m => m.missionId === urlMissionId);
          setFilteredMissions(filtered);
          setExpandedMissions(new Set([urlMissionId]));
        } else {
          setFilteredMissions(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMission = (missionId: string) => {
    const newExpanded = new Set(expandedMissions);
    if (newExpanded.has(missionId)) {
      newExpanded.delete(missionId);
    } else {
      newExpanded.add(missionId);
    }
    setExpandedMissions(newExpanded);
  };

  const handleAddArtifact = (missionId: string) => {
    setSelectedMissionId(missionId);
    setEditingArtifact(null);
    setFormData({ description: '', file: null });
    setIsModalOpen(true);
  };

  const handleEditArtifact = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setSelectedMissionId(artifact.missionId);
    setFormData({ description: artifact.description, file: null });
    setIsModalOpen(true);
  };

  const handleDeleteArtifact = async (artifactId: string) => {
    if (!confirm('Are you sure you want to delete this artifact?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/artifacts/${artifactId}`);
      if (response.success) {
        toast.success('Artifact deleted successfully');
        fetchMissions();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleStatus = async (artifact: Artifact) => {
    const newStatus = artifact.status === 'published' ? 'unpublished' : 'published';
    try {
      const response = await api.put(`/admin/artifacts/${artifact.artifactId}`, {
        status: newStatus,
      });
      if (response.success) {
        toast.success(`Artifact ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        fetchMissions();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (editingArtifact) {
      // Update existing artifact
      try {
        const response = await api.put(`/admin/artifacts/${editingArtifact.artifactId}`, {
          description: formData.description,
        });
        if (response.success) {
          toast.success('Artifact updated successfully');
          setIsModalOpen(false);
          fetchMissions();
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    } else {
      // Create new artifact
      if (!formData.file) {
        toast.error('Please select a file');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('missionId', selectedMissionId);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('file', formData.file);

      try {
        const response = await fetch(`${getApiBaseUrl()}/admin/artifacts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: formDataToSend,
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Artifact created successfully');
          setIsModalOpen(false);
          setFormData({ description: '', file: null });
          fetchMissions();
        } else {
          toast.error(data.message || 'Failed to create artifact');
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success-100 text-success-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'unpublished':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-8 w-8" />
          Mission Artifacts
        </h1>
        <p className="text-gray-600 mt-2">Manage artifacts for each mission</p>
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
              <p className="text-sm text-gray-600">Unpublished</p>
              <p className="text-2xl font-bold text-primary-600">{stats.unpublished}</p>
            </div>
            <EyeOff className="h-8 w-8 text-primary-600" />
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
                placeholder="Search artifacts..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMissions.map((mission) => {
          const isExpanded = expandedMissions.has(mission.missionId);
          const artifactCount = mission.artifacts.length;
          const publishedCount = mission.artifacts.filter(a => a.status === 'published').length;

          return (
            <div key={mission.missionId} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleMission(mission.missionId)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <Link
                      to={`/admin/missions?missionId=${mission.missionId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600 hover:underline block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {mission.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {artifactCount} artifact{artifactCount !== 1 ? 's' : ''} • {publishedCount} published
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddArtifact(mission.missionId);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Artifact
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t">
                  {mission.artifacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No artifacts for this mission</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Sl.No.</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Description</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">File Name</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Size</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mission.artifacts.map((artifact, index) => (
                            <tr key={artifact.artifactId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{index + 1}</td>
                              <td className="py-3 px-4">{artifact.description}</td>
                              <td className="py-3 px-4">
                                <a
                                  href={`/uploads/${artifact.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:underline flex items-center gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  {artifact.originalFileName}
                                </a>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(artifact.status)}`}>
                                  {artifact.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{formatFileSize(artifact.fileSize)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleStatus(artifact)}
                                    className="p-1 text-gray-600 hover:text-primary-600"
                                    title={artifact.status === 'published' ? 'Unpublish' : 'Publish'}
                                  >
                                    {artifact.status === 'published' ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleEditArtifact(artifact)}
                                    className="p-1 text-gray-600 hover:text-primary-600"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArtifact(artifact.artifactId)}
                                    className="p-1 text-red-600 hover:text-red-700"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ description: '', file: null });
          setEditingArtifact(null);
        }}
        title={editingArtifact ? 'Edit Artifact' : 'Add Artifact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          {!editingArtifact && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File *
              </label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={!editingArtifact}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ description: '', file: null });
                setEditingArtifact(null);
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingArtifact ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
