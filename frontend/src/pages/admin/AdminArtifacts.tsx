import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, Upload, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface FileItem {
  fileId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  isPublic: boolean;
  downloadCount: number;
  competitionId?: string;
  uploadedAt: string;
}

export default function AdminArtifacts() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    totalFiles: 0,
    publicFiles: 0,
    privateFiles: 0,
    totalSize: 0,
  });

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  useEffect(() => {
    let filtered = files;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(f => f.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
  }, [files, filterCategory, searchTerm]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<FileItem[]>('/admin/files');
      if (response.success && response.data) {
        setFiles(response.data);
        setFilteredFiles(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<typeof stats>('/admin/files/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleToggleVisibility = async (fileId: string) => {
    try {
      const response = await api.patch(`/admin/files/${fileId}/toggle-visibility`);
      if (response.success) {
        toast.success('File visibility toggled successfully');
        fetchFiles();
        fetchStats();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await api.delete(`/admin/files/${fileId}`);
      if (response.success) {
        toast.success('File deleted successfully');
        fetchFiles();
        fetchStats();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Mission Artifacts Management
          </h1>
          <p className="text-gray-600 mt-2">Manage downloadable files and documents</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload File
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.totalFiles}</div>
          <div className="text-sm text-gray-600">Total Files</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{stats.publicFiles}</div>
          <div className="text-sm text-gray-600">Public</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.privateFiles}</div>
          <div className="text-sm text-gray-600">Private</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{formatFileSize(stats.totalSize)}</div>
          <div className="text-sm text-gray-600">Total Size</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input pl-10"
            >
              <option value="all">All Categories</option>
              <option value="project">Project Files</option>
              <option value="document">Documents</option>
              <option value="artifact">Artifacts</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No files found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">File Name</th>
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Size</th>
                <th className="text-left p-4 font-semibold text-gray-700">Downloads</th>
                <th className="text-left p-4 font-semibold text-gray-700">Visibility</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.fileId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{file.originalName}</div>
                    {file.description && (
                      <div className="text-sm text-gray-500">{file.description}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      {file.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{formatFileSize(file.fileSize)}</td>
                  <td className="p-4 text-gray-700">{file.downloadCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${file.isPublic ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {file.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(file.fileId)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Toggle Visibility"
                      >
                        {file.isPublic ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.fileId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
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
  );
}
