import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { api } from '@/lib/api';
import type { BoardMember } from '@/types';

export default function MissionLeaders() {
  const [leaders, setLeaders] = useState<BoardMember[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

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

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mission Leaders
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated individuals who guide our team to success. Click on any photo to learn more about their background and expertise.
          </p>
        </div>

        {/* Leaders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {leaders.map((leader) => (
            <div
              key={leader.boardMemberId}
              className="relative h-96 perspective-1000"
              style={{ perspective: '1000px' }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
                  flippedCards.has(leader.boardMemberId) ? 'rotate-y-180' : ''
                }`}
                onClick={() => toggleCard(leader.boardMemberId)}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards.has(leader.boardMemberId) ? 'rotateY(180deg)' : 'rotateY(0)',
                }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden shadow-lg"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="relative h-full bg-white">
                    {/* Image */}
                    <div className="h-64 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
                      {leader.imageUrl ? (
                        <img
                          src={leader.imageUrl}
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                          {leader.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {leader.name}
                      </h3>
                      <p className="text-primary-600 font-medium mb-3">
                        {leader.position}
                      </p>
                      <p className="text-sm text-gray-500 italic">
                        Click to see bio
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden shadow-lg bg-white"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="h-full p-6 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {leader.name}
                      </h3>
                      <p className="text-primary-600 font-medium mb-4">
                        {leader.position}
                      </p>
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {leader.bio || 'Bio coming soon...'}
                      </div>
                    </div>
                    
                    {/* Contact */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={`mailto:${leader.name.toLowerCase().replace(/\s+/g, '.')}@saguarostrikers.org`}
                        className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </a>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-4 italic">
                      Click to flip back
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {leaders.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No mission leaders found. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
