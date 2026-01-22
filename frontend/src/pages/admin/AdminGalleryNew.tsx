import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Image, Plus, Edit, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Package, Search } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';

interface Mission {
  missionId: string;
  title: string;
  slug: string;
  status: string;
}

interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  missionId?: string;
  status?: 'draft' | 'published' | 'unpublished';
  uploadedBy: string;
  uploadedAt: string;
  viewCount: number;
}

interface MissionWithGalleries extends Mission {
  galleryImages: GalleryImage[];
}

export default function AdminGallery() {
  const [searchParams] = useSearchParams();
  const urlMissionId = searchParams.get('missionId');
  
  const [missions, setMissions] = useState<MissionWithGalleries[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<MissionWithGalleries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    unpublished: 0,
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published' | 'unpublished',
    files: [] as File[],
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  // Calculate stats
  useEffect(() => {
    const allGalleryItems = missions.flatMap(m => m.galleryImages);
    setStats({
      total: allGalleryItems.length,
      published: allGalleryItems.filter(img => img.status === 'published').length,
      draft: allGalleryItems.filter(img => img.status === 'draft').length,
      unpublished: allGalleryItems.filter(img => img.status === 'unpublished').length,
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
        mission.galleryImages.some(img =>
          img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.map(mission => ({
        ...mission,
        galleryImages: mission.galleryImages.filter(img => img.status === filterStatus)
      })).filter(mission => mission.galleryImages.length > 0);
    }
    
    setFilteredMissions(filtered);
  }, [urlMissionId, missions, searchTerm, filterStatus]);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<MissionWithGalleries[]>('/admin/gallery');
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

  const handleAddImage = (missionId: string) => {
    setSelectedMissionId(missionId);
    setEditingImage(null);
    setFormData({ title: '', description: '', status: 'draft', files: [] });
    setIsModalOpen(true);
  };

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setSelectedMissionId(image.missionId || '');
    setFormData({
      title: image.title,
      description: image.description || '',
      status: image.status || 'draft',
      files: [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteImage = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/gallery/${galleryId}`);
      if (response.success) {
        toast.success('Gallery image deleted successfully');
        fetchMissions();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleStatus = async (image: GalleryImage) => {
    const newStatus = image.status === 'published' ? 'unpublished' : 'published';
    try {
      const response = await api.put(`/admin/gallery/${image.galleryId}`, {
        status: newStatus,
        isPublic: newStatus === 'published',
      });
      if (response.success) {
        toast.success(`Gallery image ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        fetchMissions();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Title is only required when editing or when uploading a single file
    if (editingImage && !formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!editingImage && formData.files.length === 1 && !formData.title.trim()) {
      toast.error('Title is required when uploading a single file');
      return;
    }

    if (editingImage) {
      // Update existing image
      try {
        const response = await api.put(`/admin/gallery/${editingImage.galleryId}`, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          isPublic: formData.status === 'published',
        });
        if (response.success) {
          toast.success('Gallery image updated successfully');
          setIsModalOpen(false);
          fetchMissions();
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    } else {
      // Create new images (multiple files)
      if (formData.files.length === 0) {
        toast.error('Please select at least one file');
        return;
      }

      // Upload files one by one
      setIsUploading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const file of formData.files) {
        const formDataToSend = new FormData();
        formDataToSend.append('missionId', selectedMissionId);
        formDataToSend.append('title', formData.title || file.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('file', file);

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/gallery`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formDataToSend,
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to upload ${file.name}:`, data.message);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error uploading ${file.name}:`, error);
        }
      }

      setIsUploading(false);
      
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        setIsModalOpen(false);
        setFormData({ title: '', description: '', status: 'draft', files: [] });
        fetchMissions();
      } else {
        toast.error(`Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
      }
    }
  };

  const getStatusColor = (status?: string) => {
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

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
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
          Mission Gallery
        </h1>
        <p className="text-gray-600 mt-2">Manage gallery images and videos for each mission</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Image className="h-8 w-8 text-primary-600" />
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
                placeholder="Search gallery items..."
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
          const imageCount = mission.galleryImages.length;
          const publishedCount = mission.galleryImages.filter(img => img.status === 'published').length;

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
                    <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                    <p className="text-sm text-gray-600">
                      {imageCount} item{imageCount !== 1 ? 's' : ''} • {publishedCount} published
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddImage(mission.missionId);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Image/Video
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t">
                  {mission.galleryImages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No gallery items for this mission</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mission.galleryImages.map((image) => (
                        <div key={image.galleryId} className="border rounded-lg overflow-hidden bg-white">
                          <div className="relative aspect-video bg-gray-100">
                            {isImage(image.imageUrl) ? (
                              <img
                                src={`/uploads/${image.imageUrl}`}
                                alt={image.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={`/uploads/${image.imageUrl}`}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(image.status)}`}>
                                {image.status || 'draft'}
                              </span>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">{image.title}</h4>
                            {image.description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{image.description}</p>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleStatus(image)}
                                  className="p-1 text-gray-600 hover:text-primary-600"
                                  title={image.status === 'published' ? 'Unpublish' : 'Publish'}
                                >
                                  {image.status === 'published' ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleEditImage(image)}
                                  className="p-1 text-gray-600 hover:text-primary-600"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteImage(image.galleryId)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
          setFormData({ title: '', description: '', status: 'draft', files: [] });
          setEditingImage(null);
        }}
        title={editingImage ? 'Edit Gallery Item' : 'Add Gallery Items'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title {editingImage || formData.files.length === 1 ? '*' : '(Optional - will use file name if empty)'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={formData.files.length > 1 ? "Leave empty to use file names" : "Enter title"}
              required={!!editingImage || formData.files.length === 1}
            />
            {formData.files.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                When uploading multiple files, leave empty to use each file's name as the title
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'unpublished' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          {!editingImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Files (Images or Videos) * - Select multiple files
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData({ ...formData, files });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={!editingImage}
              />
              {formData.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 font-medium">
                    Selected files ({formData.files.length}):
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {formData.files.map((file, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center justify-between">
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-gray-400 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = formData.files.filter((_, i) => i !== index);
                            setFormData({ ...formData, files: newFiles });
                          }}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ title: '', description: '', status: 'draft', files: [] });
                setEditingImage(null);
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Uploading...
                </>
              ) : (
                editingImage ? 'Update' : `Upload ${formData.files.length > 0 ? `${formData.files.length} ` : ''}File${formData.files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
