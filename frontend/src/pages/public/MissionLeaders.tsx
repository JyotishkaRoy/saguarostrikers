import { useEffect, useState } from 'react';
import { Mail, User, UsersRound } from 'lucide-react';
import { api } from '@/lib/api';
import type { BoardMember } from '@/types';

export default function MissionLeaders() {
  const [leaders, setLeaders] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const response = await api.get<BoardMember[]>('/public/board-members');
      if (response.success && response.data) {
        setLeaders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (memberId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <UsersRound className="h-10 w-10 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Meet the Leaders</h1>
          </div>
          <p className="text-lg text-white/90">
            The dedicated team driving innovation and excellence in various STEM initiatives
          </p>
        </div>

        {/* Leaders Grid - Responsive: 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {leaders.map((leader) => {
            const isFlipped = flippedCards.has(leader.boardMemberId);

            return (
              <div
                key={leader.boardMemberId}
                className="flip-card-container h-96 cursor-pointer"
                onClick={() => handleCardClick(leader.boardMemberId)}
                style={{ perspective: '1000px' }}
              >
                <div
                  className={`flip-card-inner relative w-full h-full transition-transform duration-700 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front of Card */}
                  <div
                    className="flip-card-front absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Background Image */}
                    <div className="flex h-full flex-col">
                      {/* Image header (stops before the name) */}
                      <div className="relative h-52">
                        {leader.imageUrl ? (
                          <img
                            src={leader.imageUrl}
                            alt={leader.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                            <User className="h-20 w-20 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </div>

                      {/* Content area (name should be on plain background) */}
                      <div className="flex-1 bg-white p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                        <p className="text-lg text-primary-700 mb-3">{leader.position}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{leader.email}</span>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
                          Click to see bio
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div
                    className="flip-card-back absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl bg-white"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="h-full flex flex-col">
                      {/* Header with gradient */}
                      <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-1 text-white">{leader.name}</h3>
                        <p className="text-lg text-white/90">{leader.position}</p>
                      </div>

                      {/* Bio Content */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <p className="text-gray-700 leading-relaxed">{leader.bio}</p>
                      </div>

                      {/* Footer */}
                      <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${leader.email}`}
                            className="text-primary-600 hover:text-primary-800 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {leader.email}
                          </a>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                          Click to flip back
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {leaders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-white/70 mb-4">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl">No leaders to display at this time</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for flip animation */}
      <style>{`
        .flip-card-container {
          perspective: 1000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.7s;
          transform-style: preserve-3d;
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
