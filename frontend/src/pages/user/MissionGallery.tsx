import { useState, useEffect } from 'react';
import { Image as ImageIcon, Search, Filter, Eye, X } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import ProtectedImage from '@/components/ProtectedImage';

interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  viewCount: number;
  tags?: string[];
  uploadedAt: string;
}

export default function MissionGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    let filtered = images;

    if (selectedTag !== 'all') {
      filtered = filtered.filter(img => img.tags?.includes(selectedTag));
    }

    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredImages(filtered);
  }, [searchTerm, selectedTag, images]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/public/gallery');
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

  const allTags = Array.from(new Set(images.flatMap(img => img.tags || [])));

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mission Gallery</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse photos and videos from our missions and events
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="input pl-10 pr-8"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="card text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.galleryId}
                className="card group cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <ProtectedImage
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Eye className="h-4 w-4" />
                  <span>{image.viewCount} views</span>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="badge-gray text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <ProtectedImage
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                watermark={true}
                watermarkText="© Saguaro Strikers"
              />
              <div className="bg-white rounded-b-lg p-6 -mt-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedImage.title}</h2>
                {selectedImage.description && (
                  <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{selectedImage.viewCount} views</span>
                  </div>
                  <span>{new Date(selectedImage.uploadedAt).toLocaleDateString()}</span>
                </div>
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedImage.tags.map((tag, idx) => (
                      <span key={idx} className="badge-primary">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
