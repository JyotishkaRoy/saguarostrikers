import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Image as ImageIcon, Plus, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface Outreach {
  outreachId: string;
  title: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');

export default function AdminOutreachGalleries() {
  const [searchParams] = useSearchParams();
  const outreachId = searchParams.get('outreachId');

  const [outreach, setOutreach] = useState<Outreach | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (outreachId) {
      fetchOutreach();
      fetchImages();
    }
  }, [outreachId]);

  const fetchOutreach = async () => {
    if (!outreachId) return;
    try {
      const res = await api.get(`/admin/outreaches/${outreachId}`);
      if (res.success && res.data) setOutreach(res.data as Outreach);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchImages = async () => {
    if (!outreachId) return;
    try {
      setLoading(true);
      const res = await api.get(`/admin/gallery/outreach/${outreachId}`);
      if (res.success && res.data) setImages(res.data as GalleryImage[]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachId || files.length === 0) {
      toast.error('Select at least one file (image or video)');
      return;
    }
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append('outreachId', outreachId);
      formData.append('title', title.trim() || file.name);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('file', file);
      try {
        const response = await fetch(`${API_BASE}/api/admin/gallery`, {
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
    setUploading(false);
    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setFiles([]);
      fetchImages();
    } else {
      toast.error('Upload failed');
    }
  };

  const handleDelete = async (galleryId: string) => {
    if (!confirm('Delete this gallery item?')) return;
    try {
      await api.delete(`/admin/gallery/${galleryId}`);
      toast.success('Deleted');
      fetchImages();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleToggleStatus = async (img: GalleryImage) => {
    const next = img.status === 'published' ? 'unpublished' : 'published';
    try {
      await api.put(`/admin/gallery/${img.galleryId}`, { status: next, isPublic: next === 'published' });
      toast.success(`Item ${next}`);
      fetchImages();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const imageUrl = (path: string) => (path.startsWith('http') ? path : `${API_BASE}/uploads/${path}`);

  if (!outreachId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">No outreach selected. <Link to="/admin/outreaches" className="text-primary-600 underline">Go to Outreaches</Link></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/outreaches" className="btn-outline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Outreaches
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{outreach?.title ?? 'Outreach'} – Gallery</h1>
          <p className="text-gray-600">Upload multiple images and videos.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload images / videos
        </button>
      </div>

      {loading ? (
        <div className="card flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : images.length === 0 ? (
        <div className="card text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No gallery items yet.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">Upload images / videos</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.galleryId} className="card p-0 overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {img.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={imageUrl(img.imageUrl)} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={imageUrl(img.imageUrl)} alt={img.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 truncate">{img.title}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`badge ${img.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{img.status}</span>
                  <button type="button" onClick={() => handleToggleStatus(img)} className="btn-outline text-xs py-1 px-2 flex items-center gap-1">
                    {img.status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  <button type="button" onClick={() => handleDelete(img.galleryId)} className="btn-danger text-xs py-1 px-2 flex items-center gap-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Upload images / videos</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (used if one file)</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input w-full" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="input w-full">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Files (images and videos)</label>
                <input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="input w-full" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={uploading} className="btn-primary flex-1">{uploading ? 'Uploading…' : 'Upload'}</button>
                <button type="button" onClick={() => { setModalOpen(false); setFiles([]); }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
