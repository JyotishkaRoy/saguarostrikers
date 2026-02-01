import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { toYouTubeEmbedUrl, isEmbedVideoUrl, getVideoThumbnailUrl } from '@/lib/utils';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
}

interface VideoCarouselProps {
  videos: Video[];
}

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // When playing index changes, pause any native video elements that are no longer active
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (el && i !== playingIndex) {
        el.pause();
      }
    });
  }, [playingIndex]);

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No videos available</p>
      </div>
    );
  }

  const handlePlay = (index: number) => {
    setPlayingIndex(index);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video, index) => {
        const isEmbed = isEmbedVideoUrl(video.url);
        const embedSrc = isEmbed ? toYouTubeEmbedUrl(video.url) : video.url;
        const isThisPlaying = playingIndex === index;

        const thumbnailUrl = getVideoThumbnailUrl(video.url, video.thumbnail);

        return (
          <div key={video.id || index} className="flex flex-col rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
            <div className="relative aspect-video bg-gray-200">
              {!isThisPlaying ? (
                <>
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Uploaded video: show first frame as thumbnail (muted, no autoplay) */
                    <video
                      src={video.url}
                      className="w-full h-full object-cover pointer-events-none"
                      preload="auto"
                      muted
                      playsInline
                      aria-hidden
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handlePlay(index)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  >
                    <div className="bg-white/90 group-hover:bg-white rounded-full p-3 sm:p-4 transition-colors">
                      <Play className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" fill="currentColor" />
                    </div>
                  </button>
                </>
              ) : isEmbed ? (
                <iframe
                  src={`${embedSrc}${embedSrc.includes('?') ? '&' : '?'}autoplay=1`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={video.url}
                  title={video.title}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                  onPause={() => setPlayingIndex(null)}
                />
              )}
            </div>
            <div className="p-3 bg-white border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
              {isThisPlaying && !isEmbed && (
                <button
                  type="button"
                  onClick={() => setPlayingIndex(null)}
                  className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                >
                  Click video controls to stop
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
