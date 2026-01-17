import { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Eye } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface FileItem {
  fileId: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  downloadCount: number;
  uploadedAt: string;
}

export default function MissionArtifacts() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchFiles();
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
  }, [searchTerm, filterCategory, files]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/public/files');
      if (response.success && response.data && Array.isArray(response.data)) {
        setFiles(response.data as FileItem[]);
        setFilteredFiles(response.data as FileItem[]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (_fileId: string, originalName: string) => {
    try {
      // In a real implementation, this would download the file
      toast.success(`Downloading ${originalName}...`);
      // const response = await api.get(`/public/files/${fileId}/download`, { responseType: 'blob' });
      // Create download link and trigger download
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      document: 'bg-blue-100 text-blue-800',
      image: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mission Artifacts</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download resources, documents, and files from our missions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input pl-10 pr-8"
              >
                <option value="all">All Categories</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Files List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <div key={file.fileId} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{file.originalName}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge text-xs ${getCategoryColor(file.category)}`}>
                        {file.category}
                      </span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
                    </div>
                    {file.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{file.downloadCount} downloads</span>
                      </div>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(file.fileId, file.originalName)}
                      className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
