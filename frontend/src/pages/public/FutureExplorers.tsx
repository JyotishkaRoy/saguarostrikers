import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface CarouselImage {
  imageId: string;
  url: string;
  sequence: number;
  active: boolean;
}

interface FutureExplorersContent {
  row1Col1Html: string;
  carouselImages: CarouselImage[];
  row2Html: string;
}

export default function FutureExplorers() {
  const [content, setContent] = useState<FutureExplorersContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await api.get('/public/future-explorers');
        if (res.success && res.data) setContent(res.data as FutureExplorersContent);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const activeCarouselImages = (content?.carouselImages ?? [])
    .filter((img) => img.active)
    .sort((a, b) => a.sequence - b.sequence);

  const nextImage = () => {
    if (activeCarouselImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % activeCarouselImages.length);
  };

  const prevImage = () => {
    if (activeCarouselImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + activeCarouselImages.length) % activeCarouselImages.length);
  };

  const imageUrl = (url: string) => (url.startsWith('/') ? url : `/${url}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Future Explorers' Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inspiring the next generation of aerospace engineers through hands-on learning and mentorship
          </p>
        </div>

        {/* Row 1: 2 columns – 60% / 40% */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Column 1: 60% – Rich text (admin-editable) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: content?.row1Col1Html ?? '<p>Content will appear here.</p>',
                  }}
                />
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="/join-mission" className="btn-primary">
                    Apply to Join
                  </a>
                  <a href="/contact" className="btn-outline">
                    Learn More
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: 40% – Image carousel */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {activeCarouselImages.length > 0 ? (
                    <>
                      <div className="relative h-96 bg-gray-900">
                        <img
                          src={imageUrl(activeCarouselImages[currentImageIndex].url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {activeCarouselImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="h-6 w-6 text-gray-900" />
                            </button>
                            <button
                              type="button"
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                              aria-label="Next image"
                            >
                              <ChevronRight className="h-6 w-6 text-gray-900" />
                            </button>
                          </>
                        )}
                      </div>
                      {activeCarouselImages.length > 1 && (
                        <div className="flex justify-center gap-2 p-4">
                          {activeCarouselImages.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-3 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? 'bg-primary-600 w-8'
                                  : 'bg-gray-300 hover:bg-gray-400 w-3'
                              }`}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-96 bg-gray-200 flex items-center justify-center text-gray-500">
                      No carousel images yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Full width – Rich text (admin-editable) */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{
                __html: content?.row2Html ?? '<p>Content will appear here.</p>',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
