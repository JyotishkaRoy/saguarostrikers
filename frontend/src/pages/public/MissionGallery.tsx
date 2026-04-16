import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image, ArrowLeft, Rocket, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  missionId?: string;
  status?: string;
  uploadedAt: string;
  viewCount: number;
}

interface Mission {
  missionId: string;
  title: string;
  slug: string;
}

function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
}

function mediaSrc(imageUrl: string): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/')) return imageUrl;
  return `/uploads/${imageUrl}`;
}

export default function MissionGallery() {
  const { missionSlug } = useParams<{ missionSlug: string }>();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  const lightboxItem = lightboxIndex !== null ? images[lightboxIndex] ?? null : null;

  useEffect(() => {
    if (missionSlug) {
      fetchMissionAndGallery();
    }
  }, [missionSlug]);

  const closeLightbox = useCallback(() => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
    }
    setLightboxIndex(null);
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && images.length > 0) {
        setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
      }
      if (e.key === 'ArrowRight' && images.length > 0) {
        setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, images.length, closeLightbox]);

  useEffect(() => {
    if (!lightboxItem || isImage(lightboxItem.imageUrl) || isVideoUrl(lightboxItem.imageUrl) === false) return;
    const id = window.setTimeout(() => {
      lightboxVideoRef.current?.play().catch(() => {});
    }, 200);
    return () => window.clearTimeout(id);
  }, [lightboxItem]);

  const fetchMissionAndGallery = async () => {
    try {
      setIsLoading(true);

      const missionResponse = await api.get<Mission>(`/public/missions/slug/${missionSlug}`);
      if (missionResponse.success && missionResponse.data) {
        setMission(missionResponse.data);
      }

      const galleryResponse = await api.get<GalleryImage[]>(`/public/missions/${missionSlug}/gallery`);
      if (galleryResponse.success && galleryResponse.data) {
        setImages(galleryResponse.data);
      }
    } catch (error) {
      console.error('Error fetching mission gallery:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null || images.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null || images.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission Not Found</h1>
            <Link to="/missions" className="text-primary-600 hover:underline">
              Back to Missions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <Link
            to={`/missions/${missionSlug}`}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mission
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {mission.title} <span className="text-gray-400 mx-2">|</span> Mission Gallery
            </h1>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="card text-center py-12">
            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No gallery items available for this mission</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item, index) => {
              const imageLike = isImage(item.imageUrl);
              const videoLike = isVideoUrl(item.imageUrl);
              return (
                <button
                  key={item.galleryId}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="gallery-tile group relative block overflow-hidden rounded-xl border border-gray-200 bg-black text-left shadow-sm transition-shadow duration-300 ease-out hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-900">
                    <div className="gallery-tile-media-inner h-full w-full">
                      {imageLike ? (
                        <img
                          src={mediaSrc(item.imageUrl)}
                          alt={item.title}
                          className="h-full w-full object-cover will-change-transform"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : videoLike ? (
                        <>
                          <video
                            src={mediaSrc(item.imageUrl)}
                            className="h-full w-full object-cover will-change-transform"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-white">
                            <Video className="h-4 w-4" />
                            <span className="text-xs">Video</span>
                          </div>
                        </>
                      ) : (
                        <img
                          src={mediaSrc(item.imageUrl)}
                          alt={item.title}
                          className="h-full w-full object-cover will-change-transform"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="mb-1 font-semibold">{item.title}</h3>
                        {item.description ? (
                          <p className="line-clamp-2 text-sm text-gray-200">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightboxItem !== null && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery viewer"
          className="gallery-lightbox-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-[60] -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-900 shadow-lg transition hover:bg-white sm:left-6"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-[60] -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-900 shadow-lg transition hover:bg-white sm:right-6"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="gallery-lightbox-panel relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-10 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-medium text-gray-900 shadow hover:bg-white"
            >
              Close
            </button>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-black px-4 pb-4 pt-14">
              {isImage(lightboxItem.imageUrl) ? (
                <img
                  key={lightboxItem.galleryId}
                  src={mediaSrc(lightboxItem.imageUrl)}
                  alt={lightboxItem.title}
                  className="max-h-[72vh] max-w-full object-contain"
                />
              ) : isVideoUrl(lightboxItem.imageUrl) ? (
                <video
                  key={lightboxItem.galleryId}
                  ref={lightboxVideoRef}
                  src={mediaSrc(lightboxItem.imageUrl)}
                  className="max-h-[72vh] max-w-full"
                  controls
                  playsInline
                />
              ) : (
                <img
                  key={lightboxItem.galleryId}
                  src={mediaSrc(lightboxItem.imageUrl)}
                  alt={lightboxItem.title}
                  className="max-h-[72vh] max-w-full object-contain"
                />
              )}
            </div>

            <div className="border-t border-gray-800 bg-gray-950 px-4 py-3 text-white sm:px-6">
              <p className="text-xs text-gray-400">
                {lightboxIndex + 1} / {images.length}
              </p>
              <h3 className="text-lg font-bold">{lightboxItem.title}</h3>
              {lightboxItem.description ? (
                <p className="mt-2 text-sm text-gray-300">{lightboxItem.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Hover: gentle zoom inside tile (clip), ease-out — distinct from click/lightbox */
        .gallery-tile-media-inner {
          transform: scale(1);
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gallery-tile:hover .gallery-tile-media-inner,
        .gallery-tile:focus-visible .gallery-tile-media-inner {
          transform: scale(1.08);
        }

        /* Click / lightbox: pop-in with slight overshoot (Webflow-style interaction) */
        @keyframes galleryLightboxBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes galleryLightboxPanelIn {
          0% {
            opacity: 0;
            transform: scale(0.86);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .gallery-lightbox-backdrop {
          background: rgba(0, 0, 0, 0.88);
          animation: galleryLightboxBackdropIn 0.35s ease-out both;
        }
        .gallery-lightbox-panel {
          animation: galleryLightboxPanelIn 0.5s cubic-bezier(0.34, 1.45, 0.64, 1) both;
        }
      `}</style>
    </div>
  );
}
