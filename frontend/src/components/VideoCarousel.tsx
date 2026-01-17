import { useState } from 'react';
import { Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string; // YouTube embed URL or video file URL
  thumbnail?: string;
}

interface VideoCarouselProps {
  videos: Video[];
}

export default function VideoCarousel({ videos }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No videos available</p>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className="w-full">
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {!isPlaying ? (
          <div className="relative w-full h-full">
            <img
              src={currentVideo.thumbnail || '/images/video-placeholder.jpg'}
              alt={currentVideo.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
            >
              <div className="bg-white/90 group-hover:bg-white rounded-full p-4 transition-colors">
                <Play className="h-12 w-12 text-primary-600" fill="currentColor" />
              </div>
            </button>
          </div>
        ) : (
          <iframe
            src={currentVideo.url}
            title={currentVideo.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Video Title */}
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-gray-900">{currentVideo.title}</h3>
      </div>

      {/* Dots Navigation */}
      {videos.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
