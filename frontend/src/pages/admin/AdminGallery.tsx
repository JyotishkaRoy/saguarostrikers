import { useState, useEffect } from 'react';
import { Image, Search, Filter, Eye, Upload, Trash2, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  isPublic: boolean;
  viewCount: number;
  tags?: string[];
  missionId?: string;
  uploadedAt: string;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublic, setFilterPublic] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalImages: 0,
    publicImages: 0,
    privateImages: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, []);

  useEffect(() => {
    let filtered = images;

    if (filterPublic !== 'all') {
      const isPublic = filterPublic === 'public';
      filtered = filtered.filter(img => img.isPublic === isPublic);
    }

    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredImages(filtered);
  }, [searchTerm, filterPublic, images]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/gallery');
      if (response.success && response.data && Array.isArray(response.data)) {
        setImages(response.data as GalleryImage[]);
        setFilteredImages(response.data as GalleryImage[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/gallery');
      if (response.success && response.data && Array.isArray(response.data)) {
        const allImages = response.data as GalleryImage[];
        setStats({
          totalImages: allImages.length,
          publicImages: allImages.filter((img: GalleryImage) => img.isPublic).length,
          privateImages: allImages.filter((img: GalleryImage) => !img.isPublic).length,
          totalViews: allImages.reduce((sum: number, img: GalleryImage) => sum + img.viewCount, 0),
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleTogglePublic = async (imageId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/gallery/${imageId}`, { isPublic: !currentStatus });
      toast.success(`Image ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchImages();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/admin/gallery/${imageId}`);
      toast.success('Image deleted successfully');
      fetchImages();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await api.post('/admin/gallery/upload', formData);
      toast.success('Image uploaded successfully');
      setIsUploadModalOpen(false);
      fetchImages();
      fetchStats();
      e.currentTarget.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedImage) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get('title'),
      description: formData.get('description'),
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(t => t),
      isPublic: formData.get('isPublic') === 'true',
    };

    try {
      await api.put(`/admin/gallery/${selectedImage.galleryId}`, updates);
      toast.success('Image updated successfully');
      setIsEditModalOpen(false);
      setSelectedImage(null);
      fetchImages();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Gallery Management</h1>
        <p className="text-gray-600">Upload and manage mission photos and videos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalImages}</p>
            </div>
            <Image className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Public</p>
              <p className="text-2xl font-bold text-success-600">{stats.publicImages}</p>
            </div>
            <Eye className="h-8 w-8 text-success-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Private</p>
              <p className="text-2xl font-bold text-warning-600">{stats.privateImages}</p>
            </div>
            <ToggleLeft className="h-8 w-8 text-warning-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-primary-600">{stats.totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-primary-600" />
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
                placeholder="Search images by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterPublic}
                  onChange={(e) => setFilterPublic(e.target.value)}
                  className="input pl-10 pr-8"
                >
                  <option value="all">All Images</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="card text-center py-12">
          <Image className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-4">Upload your first mission photo or video</p>
          <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary">
            Upload Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image.galleryId} className="card group hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {image.isPublic ? (
                    <span className="badge-success">Public</span>
                  ) : (
                    <span className="badge-warning">Private</span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2 h-10">{image.description || 'No description'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Eye className="h-4 w-4" />
                <span>{image.viewCount} views</span>
              </div>
              {image.tags && image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {image.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="badge-gray text-xs">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedImage(image);
                    setIsEditModalOpen(true);
                  }}
                  className="btn-outline flex-1 text-sm py-1.5"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleTogglePublic(image.galleryId, image.isPublic)}
                  className="btn-secondary text-sm py-1.5 px-3"
                  title={image.isPublic ? 'Make private' : 'Make public'}
                >
                  {image.isPublic ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(image.galleryId)}
                  className="btn-danger text-sm py-1.5 px-3"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Image</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image File</label>
                <input type="file" name="image" accept="image/*,video/*" required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" name="title" required className="input" placeholder="Mission launch photo" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" className="input" rows={3} placeholder="Describe this image..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input type="text" name="tags" className="input" placeholder="launch, rocket, test-flight" />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPublic" value="true" />
                  <span className="text-sm">Make public immediately</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Upload</button>
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Image</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" name="title" defaultValue={selectedImage.title} required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" defaultValue={selectedImage.description} className="input" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input type="text" name="tags" defaultValue={selectedImage.tags?.join(', ')} className="input" />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPublic" value="true" defaultChecked={selectedImage.isPublic} />
                  <span className="text-sm">Public</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Update</button>
                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedImage(null); }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
