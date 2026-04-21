import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, Plus, Trash2, ArrowLeft, Download, Eye, EyeOff } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/apiConfig';
import toast from 'react-hot-toast';

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

interface Outreach {
  outreachId: string;
  title: string;
}

export default function AdminOutreachArtifacts() {
  const [searchParams] = useSearchParams();
  const outreachId = searchParams.get('outreachId');

  const [outreach, setOutreach] = useState<Outreach | null>(null);
  const [artifacts, setArtifacts] = useState<OutreachArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (outreachId) {
      fetchOutreach();
      fetchArtifacts();
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

  const fetchArtifacts = async () => {
    if (!outreachId) return;
    try {
      setLoading(true);
      const res = await api.get(`/admin/outreaches/${outreachId}/artifacts`);
      if (res.success && res.data) setArtifacts(res.data as OutreachArtifact[]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachId || !description.trim() || !file) {
      toast.error('Description and file are required');
      return;
    }
    const formData = new FormData();
    formData.append('outreachId', outreachId);
    formData.append('description', description.trim());
    formData.append('file', file);
    try {
      setUploading(true);
      const response = await fetch(`${getApiBaseUrl()}/admin/outreach-artifacts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Artifact uploaded');
        setModalOpen(false);
        setDescription('');
        setFile(null);
        fetchArtifacts();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (artifactId: string) => {
    if (!confirm('Delete this artifact?')) return;
    try {
      await api.delete(`/admin/outreach-artifacts/${artifactId}`);
      toast.success('Artifact deleted');
      fetchArtifacts();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleToggleStatus = async (a: OutreachArtifact) => {
    const next = a.status === 'published' ? 'unpublished' : 'published';
    try {
      await api.put(`/admin/outreach-artifacts/${a.artifactId}`, { status: next });
      toast.success(`Artifact ${next}`);
      fetchArtifacts();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const downloadUrl = (artifact: OutreachArtifact) => `/uploads/${artifact.filePath}`;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{outreach?.title ?? 'Outreach'} – Artifacts</h1>
          <p className="text-gray-600">Upload PDF, DOC, or image files.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload artifact
        </button>
      </div>

      {loading ? (
        <div className="card flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : artifacts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No artifacts yet.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">Upload artifact</button>
        </div>
      ) : (
        <div className="space-y-3">
          {artifacts.map((a) => (
            <div key={a.artifactId} className="card flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{a.description || a.originalFileName}</p>
                <p className="text-sm text-gray-500">{a.originalFileName}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${a.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span>
                <a href={downloadUrl(a)} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <button type="button" onClick={() => handleToggleStatus(a)} className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1.5">
                  {a.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {a.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button type="button" onClick={() => handleDelete(a.artifactId)} className="btn-danger text-sm py-1.5 px-3 flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Upload artifact</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full" placeholder="Brief description" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File (PDF, DOC, image)</label>
                <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input w-full" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={uploading} className="btn-primary flex-1">{uploading ? 'Uploading…' : 'Upload'}</button>
                <button type="button" onClick={() => { setModalOpen(false); setDescription(''); setFile(null); }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
