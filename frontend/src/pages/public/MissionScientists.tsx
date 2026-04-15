import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, User as UserIcon, ArrowLeft, Rocket } from 'lucide-react';
import { api } from '@/lib/api';
import type { Mission, User } from '@/types';

interface Scientist {
  applicationId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone?: string;
  missionRole?: string;
  shortBio?: string;
}

interface MissionWithScientists extends Mission {
  scientists: Scientist[];
}

export default function MissionScientists() {
  const { missionSlug } = useParams<{ missionSlug: string }>();
  const [mission, setMission] = useState<MissionWithScientists | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (missionSlug) {
      fetchMissionScientists();
    }
  }, [missionSlug]);

  const fetchMissionScientists = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch mission details and users in parallel
      const [missionResponse, usersResponse] = await Promise.all([
        api.get<Mission>(`/public/missions/slug/${missionSlug}`),
        api.get<User[]>('/public/users'),
      ]);

      if (!missionResponse.success || !missionResponse.data) {
        throw new Error('Mission not found');
      }

      const missionData = missionResponse.data;

      // Store users data
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      // Fetch all applications for this mission
      const applicationsResponse = await api.get<Scientist[]>(`/public/join-mission/mission/${missionData.missionId}`);
      
      // Filter only approved applications
      const approvedScientists = applicationsResponse.success && applicationsResponse.data
        ? applicationsResponse.data.filter((app: any) => app.status === 'approved')
        : [];

      setMission({
        ...missionData,
        scientists: approvedScientists,
      });
    } catch (err: any) {
      console.error('Failed to fetch mission scientists:', err);
      setError(err.message || 'Failed to load mission scientists');
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (email: string) => {
    // Find user by email and return their profile image
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user?.profileImageUrl) {
      // Use relative path to leverage Vite proxy (avoids CORS issues)
      return user.profileImageUrl;
    }
    // Fallback to placeholder if no profile image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&size=400&background=random`;
  };

  const handleCardClick = (applicationId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      return next;
    });
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

  if (error || !mission) {
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
              {mission.title} <span className="text-gray-400 mx-2">|</span> Meet the Crew
            </h1>
          </div>
        </div>

        {/* Scientists Grid */}
        {mission.scientists.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No scientists assigned to this mission yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {mission.scientists.map((scientist) => {
              const isFlipped = flippedCards.has(scientist.applicationId);
              return (
                <div
                  key={scientist.applicationId}
                  className="flip-card-container h-96 cursor-pointer"
                  onClick={() => handleCardClick(scientist.applicationId)}
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
                      <div className="flex h-full flex-col">
                        <div className="relative h-52">
                          <img
                            src={getImageUrl(scientist.studentEmail)}
                            alt={`${scientist.studentFirstName} ${scientist.studentLastName}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        </div>

                        <div className="flex-1 bg-white p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {scientist.studentFirstName} {scientist.studentLastName}
                          </h3>
                          <p className="text-lg text-primary-700 mb-3">{scientist.missionRole || 'Mission Specialist'}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{scientist.studentEmail}</span>
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
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
                          <h3 className="text-2xl font-bold mb-1 text-white">
                            {scientist.studentFirstName} {scientist.studentLastName}
                          </h3>
                          <p className="text-lg text-white/90">{scientist.missionRole || 'Mission Specialist'}</p>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                          <p className="text-gray-700 leading-relaxed">
                            {scientist.shortBio || 'Bio will be added soon.'}
                          </p>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${scientist.studentEmail}`}
                              className="text-primary-600 hover:text-primary-800 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {scientist.studentEmail}
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
