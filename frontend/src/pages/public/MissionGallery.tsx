import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image, ArrowLeft, Rocket, Video, Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
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

export default function MissionGallery() {
  const { missionSlug } = useParams<{ missionSlug: string }>();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [videoStates, setVideoStates] = useState<{ [key: string]: { isPlaying: boolean; volume: number; isMuted: boolean } }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    if (missionSlug) {
      fetchMissionAndGallery();
    }
  }, [missionSlug]);

  // Handle video playback when expanded
  useEffect(() => {
    if (expandedId) {
      const expandedItem = images.find(img => img.galleryId === expandedId);
      if (expandedItem && !isImage(expandedItem.imageUrl)) {
        // It's a video, play it after a short delay
        setTimeout(() => {
          const video = videoRefs.current[expandedId];
          if (video) {
            // Initialize video state
            if (!videoStates[expandedId]) {
              setVideoStates(prev => ({
                ...prev,
                [expandedId]: {
                  isPlaying: false,
                  volume: video.volume,
                  isMuted: video.muted,
                },
              }));
            }
            // Auto-play when expanded
            video.play().then(() => {
              setPlayingVideoId(expandedId);
              setVideoStates(prev => ({
                ...prev,
                [expandedId]: {
                  ...(prev[expandedId] || { volume: video.volume, isMuted: video.muted }),
                  isPlaying: true,
                },
              }));
            }).catch(err => {
              console.error('Error playing video:', err);
            });
          }
        }, 100);
      }
    } else {
      // Pause all videos when collapsed
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
        }
      });
      setPlayingVideoId(null);
    }
  }, [expandedId, images]);

  const handlePlayPause = (e: React.MouseEvent, galleryId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRefs.current[galleryId];
    if (!video) return;

    // Get current state or initialize
    const currentState = videoStates[galleryId] || {
      isPlaying: !video.paused,
      volume: video.volume,
      isMuted: video.muted,
    };

    if (video.paused) {
      // Play video
      video.play().then(() => {
        setPlayingVideoId(galleryId);
        setVideoStates(prev => ({
          ...prev,
          [galleryId]: {
            isPlaying: true,
            volume: video.volume,
            isMuted: video.muted,
          },
        }));
      }).catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      // Pause video
      video.pause();
      setPlayingVideoId(prev => prev === galleryId ? null : prev);
      setVideoStates(prev => ({
        ...prev,
        [galleryId]: {
          isPlaying: false,
          volume: video.volume,
          isMuted: video.muted,
        },
      }));
      setForceUpdate(prev => prev + 1);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent, galleryId: string, action: 'up' | 'down' | 'mute') => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRefs.current[galleryId];
    if (!video) return;

    // Get current state or initialize from video element
    const currentState = videoStates[galleryId] || {
      volume: video.volume,
      isMuted: video.muted,
      isPlaying: !video.paused,
    };
    
    let newVolume = currentState.volume;
    let newMuted = currentState.isMuted;
    
    if (action === 'mute') {
      newMuted = !video.muted;
      video.muted = newMuted;
    } else if (action === 'up') {
      newMuted = false;
      newVolume = Math.min(1, currentState.volume + 0.1);
      video.muted = false;
      video.volume = newVolume;
    } else if (action === 'down') {
      newMuted = false;
      newVolume = Math.max(0, currentState.volume - 0.1);
      video.muted = false;
      video.volume = newVolume;
    }

    // Update state immediately and force re-render
    setVideoStates(prev => ({
      ...prev,
      [galleryId]: {
        ...currentState,
        volume: newVolume,
        isMuted: newMuted,
      },
    }));
    setForceUpdate(prev => prev + 1);
  };

  const fetchMissionAndGallery = async () => {
    try {
      setIsLoading(true);
      
      // Fetch mission details
      const missionResponse = await api.get<Mission>(`/public/missions/slug/${missionSlug}`);
      if (missionResponse.success && missionResponse.data) {
        setMission(missionResponse.data);
      }

      // Fetch published gallery images
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

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
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
        {/* Header */}
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

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="card text-center py-12">
            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No gallery items available for this mission</p>
          </div>
        ) : (
          <div className={`flex flex-row gap-2 w-full ${expandedId ? 'flex-nowrap' : 'flex-wrap'}`}>
            {images.map((item) => {
              const isExpanded = expandedId === item.galleryId;
              const itemCount = images.length;
              
              // Calculate width: expanded item takes 60%, others share remaining 40%
              let widthPercent: number;
              if (isExpanded) {
                widthPercent = 60;
              } else if (expandedId) {
                // When another item is expanded, remaining items share 40%
                widthPercent = 40 / (itemCount - 1);
              } else {
                // No expansion: all items share equally
                widthPercent = 100 / itemCount;
              }
              
              // Adjust for gap spacing (8px gap = 0.5rem)
              // Total gap space is (itemCount - 1) * 0.5rem
              // Each item should account for its share
              const totalGaps = (itemCount - 1) * 0.5;
              const gapAdjustment = totalGaps / itemCount;
              
              const handleItemClick = () => {
                if (isExpanded) {
                  // If already expanded, collapse it
                  setExpandedId(null);
                  setPlayingVideoId(null);
                  // Pause video if playing
                  if (videoRefs.current[item.galleryId]) {
                    videoRefs.current[item.galleryId]?.pause();
                  }
                } else {
                  // Expand the item
                  setExpandedId(item.galleryId);
                  // If it's a video, start playing
                  if (!isImage(item.imageUrl)) {
                    setPlayingVideoId(item.galleryId);
                    // Play video after a short delay to ensure it's rendered
                    setTimeout(() => {
                      const video = videoRefs.current[item.galleryId];
                      if (video) {
                        video.play().catch(err => {
                          console.error('Error playing video:', err);
                        });
                      }
                    }, 100);
                  }
                }
              };

              return (
                <div
                  key={item.galleryId}
                  onClick={handleItemClick}
                  className="relative bg-black overflow-hidden cursor-pointer transition-all duration-500 ease-in-out group h-[400px] md:h-[500px]"
                  style={{
                    width: `calc(${widthPercent}% - ${gapAdjustment}rem)`,
                    minWidth: expandedId ? '60px' : '120px', // Smaller min width when expanded to prevent wrapping
                    flexShrink: expandedId ? 1 : 0, // Allow shrinking when expanded
                    flexGrow: 0,
                    maxWidth: '100%',
                  }}
                >
                  {/* Media Container */}
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {isImage(item.imageUrl) ? (
                      <img
                        src={`/uploads/${item.imageUrl}`}
                        alt={item.title}
                        className={`w-full h-full transition-all duration-500 group-hover:scale-105 ${
                          isExpanded ? 'object-contain' : 'object-cover'
                        }`}
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center group/video">
                        <video
                          ref={(el) => {
                            videoRefs.current[item.galleryId] = el;
                          }}
                          src={`/uploads/${item.imageUrl}`}
                          className={`w-full h-full ${
                            isExpanded ? 'object-contain' : 'object-cover'
                          }`}
                          controls={false}
                          muted={videoStates[item.galleryId]?.isMuted ?? false}
                          autoPlay={false}
                          loop
                          playsInline
                          onPlay={() => {
                            setPlayingVideoId(item.galleryId);
                            setVideoStates(prev => ({
                              ...prev,
                              [item.galleryId]: { ...(prev[item.galleryId] || { volume: 1, isMuted: false }), isPlaying: true },
                            }));
                          }}
                          onPause={() => {
                            if (playingVideoId === item.galleryId) {
                              setPlayingVideoId(null);
                            }
                            setVideoStates(prev => ({
                              ...prev,
                              [item.galleryId]: { ...(prev[item.galleryId] || { volume: 1, isMuted: false }), isPlaying: false },
                            }));
                          }}
                          onVolumeChange={(e) => {
                            const video = e.currentTarget;
                            setVideoStates(prev => ({
                              ...prev,
                              [item.galleryId]: {
                                ...(prev[item.galleryId] || { isPlaying: !video.paused }),
                                volume: video.volume,
                                isMuted: video.muted,
                              },
                            }));
                          }}
                          onLoadedMetadata={(e) => {
                            const video = e.currentTarget;
                            // Initialize video state when metadata loads
                            if (!videoStates[item.galleryId]) {
                              setVideoStates(prev => ({
                                ...prev,
                                [item.galleryId]: {
                                  isPlaying: false,
                                  volume: video.volume,
                                  isMuted: video.muted,
                                },
                              }));
                            }
                          }}
                        />
                        
                        {/* Video label when not expanded */}
                        {!isExpanded && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded flex items-center gap-1 z-10">
                            <Video className="h-4 w-4" />
                            <span className="text-xs">Video</span>
                          </div>
                        )}

                        {/* Custom Video Controls */}
                        {!isImage(item.imageUrl) && (
                          <div 
                            className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-70 rounded-lg px-3 py-2 z-50 pointer-events-auto transition-opacity duration-300 ${
                              isExpanded ? 'opacity-100' : 'opacity-0 group-hover/video:opacity-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            style={{ pointerEvents: 'auto' }}
                          >
                            {/* Play/Pause Button */}
                            <button
                              type="button"
                              onClick={(e) => handlePlayPause(e, item.galleryId)}
                              className="p-2 hover:bg-white/20 rounded transition-colors flex items-center justify-center cursor-pointer"
                              title={videoStates[item.galleryId]?.isPlaying ? 'Pause' : 'Play'}
                            >
                              {(() => {
                                const video = videoRefs.current[item.galleryId];
                                const isPlaying = video ? !video.paused : (videoStates[item.galleryId]?.isPlaying ?? false);
                                return isPlaying ? (
                                  <Pause className="h-5 w-5 text-white" />
                                ) : (
                                  <Play className="h-5 w-5 text-white" />
                                );
                              })()}
                            </button>

                            {/* Volume Down Button */}
                            <button
                              type="button"
                              onClick={(e) => handleVolumeChange(e, item.galleryId, 'down')}
                              className="p-2 hover:bg-white/20 rounded transition-colors flex items-center justify-center"
                              title="Volume Down"
                            >
                              <Volume1 className="h-5 w-5 text-white" />
                            </button>

                            {/* Mute/Unmute Button */}
                            <button
                              type="button"
                              onClick={(e) => handleVolumeChange(e, item.galleryId, 'mute')}
                              className="p-2 hover:bg-white/20 rounded transition-colors flex items-center justify-center cursor-pointer"
                              title={(() => {
                                const video = videoRefs.current[item.galleryId];
                                const isMuted = video ? video.muted : (videoStates[item.galleryId]?.isMuted ?? false);
                                return isMuted ? 'Unmute' : 'Mute';
                              })()}
                            >
                              {(() => {
                                const video = videoRefs.current[item.galleryId];
                                const isMuted = video ? video.muted : (videoStates[item.galleryId]?.isMuted ?? false);
                                return isMuted ? (
                                  <VolumeX className="h-5 w-5 text-white" />
                                ) : (
                                  <Volume2 className="h-5 w-5 text-white" />
                                );
                              })()}
                            </button>

                            {/* Volume Up Button */}
                            <button
                              type="button"
                              onClick={(e) => handleVolumeChange(e, item.galleryId, 'up')}
                              className="p-2 hover:bg-white/20 rounded transition-colors flex items-center justify-center"
                              title="Volume Up"
                            >
                              <Volume2 className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Overlay with title */}
                    {!isExpanded && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-200 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Expanded overlay with full details */}
                    {isExpanded && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-30">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="font-bold text-2xl mb-2">{item.title}</h3>
                          {item.description && (
                            <p className="text-base text-gray-200 mb-2">{item.description}</p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                            className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors pointer-events-auto"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
