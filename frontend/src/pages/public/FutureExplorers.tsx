import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Rocket, Calendar, MapPin } from 'lucide-react';
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

interface PublishedOutreach {
  outreachId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  imageUrl?: string;
  slug: string;
}

export default function FutureExplorers() {
  const [content, setContent] = useState<FutureExplorersContent | null>(null);
  const [outreaches, setOutreaches] = useState<PublishedOutreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const [contentRes, outreachesRes] = await Promise.all([
          api.get('/public/future-explorers'),
          api.get('/public/outreaches'),
        ]);
        if (contentRes.success && contentRes.data) setContent(contentRes.data as FutureExplorersContent);
        if (outreachesRes.success && Array.isArray(outreachesRes.data)) {
          setOutreaches((outreachesRes.data as PublishedOutreach[]).slice(0, 6));
        }
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
        {/* Header: same style as Missions page – icon + title, then subtitle */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Future Explorers' Program</h1>
          </div>
          <p className="text-lg text-gray-600">
            Inspiring the next generation of aerospace engineers through hands-on learning and mentorship
          </p>
        </div>

        {/* Row 1: Left = About the Program + Carousel, Right = Outreach event cards (empty) */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Column 1: Left – About the Program on top, then image carousel (same width) */}
            <div className="lg:col-span-2 space-y-6 order-1">
              {/* About the Program – same width as carousel */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: content?.row1Col1Html ?? '<p>Content will appear here.</p>',
                  }}
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/contact?subject=outreach" className="btn-outline">
                    Learn More
                  </a>
                </div>
              </div>

              {/* Image carousel – same width as About the Program */}
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

            {/* Column 2: Right – Published outreach event cards (max 6) */}
            <div className="lg:col-span-3 min-h-[400px] order-2 flex flex-col">
              {outreaches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex items-center justify-center min-h-[400px] text-gray-500">
                  No upcoming outreach events at the moment.
                </div>
              ) : (
                <div
                  className="grid gap-3 h-full min-h-[400px] flex-1"
                  style={{
                    gridTemplateColumns:
                      outreaches.length === 1
                        ? '1fr'
                        : outreaches.length === 2
                          ? '1fr'
                          : outreaches.length === 3
                            ? '1fr'
                            : outreaches.length === 4
                              ? '1fr 1fr'
                              : outreaches.length === 5
                                ? '1fr 1fr'
                                : '1fr 1fr 1fr',
                    gridTemplateRows:
                      outreaches.length === 1
                        ? '1fr'
                        : outreaches.length === 2
                          ? '1fr 1fr'
                          : outreaches.length === 3
                            ? '1fr 1fr 1fr'
                            : outreaches.length === 4
                              ? '1fr 1fr'
                              : outreaches.length === 5
                                ? '1fr 1fr 1fr'
                                : '1fr 1fr',
                  }}
                >
                  {outreaches.map((outreach, index) => (
                    <div
                      key={outreach.outreachId}
                      className="relative rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0 bg-gray-200"
                      style={
                        outreaches.length === 5 && index === 4
                          ? { gridColumn: '1 / -1' }
                          : undefined
                      }
                    >
                      {/* Background: image or video */}
                      {outreach.imageUrl ? (
                        <>
                          {outreach.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video
                              src={outreach.imageUrl.startsWith('http') ? outreach.imageUrl : outreach.imageUrl}
                              className="absolute inset-0 w-full h-full object-cover"
                              muted
                              playsInline
                              aria-hidden
                            />
                          ) : (
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${outreach.imageUrl.startsWith('http') ? outreach.imageUrl : outreach.imageUrl})`,
                              }}
                              aria-hidden
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" aria-hidden />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gray-700" aria-hidden />
                      )}
                      {/* Content on top */}
                      <div className="relative z-10 p-4 flex-1 flex flex-col min-h-0 text-white">
                        <h3 className="font-bold text-white mb-1 line-clamp-2 drop-shadow-sm">{outreach.title}</h3>
                        <p className="text-sm text-white/90 line-clamp-2 mb-2 drop-shadow-sm">{outreach.description}</p>
                        <div className="mt-auto space-y-1 text-xs text-white/80">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              {new Date(outreach.startDate).toLocaleDateString()}
                              {outreach.endDate && outreach.endDate !== outreach.startDate
                                ? ` – ${new Date(outreach.endDate).toLocaleDateString()}`
                                : ''}
                            </span>
                          </div>
                          {outreach.location ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{outreach.location}</span>
                            </div>
                          ) : null}
                        </div>
                        <Link
                          to={`/outreach/${outreach.slug}`}
                          className="mt-3 text-sm font-medium text-white hover:text-white/90 underline underline-offset-2"
                        >
                          Learn more →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
