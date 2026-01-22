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
  grade: string;
  schoolName: string;
  studentPhone?: string;
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
      const applicationsResponse = await api.get(`/public/join-mission/mission/${missionData.missionId}`);
      
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
            {mission.scientists.map((scientist) => (
              <div
                key={scientist.applicationId}
                className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                {/* Scientist Image */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-200">
                  <img
                    src={getImageUrl(scientist.studentEmail)}
                    alt={`${scientist.studentFirstName} ${scientist.studentLastName}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Scientist Info */}
                <div className="p-6 bg-gradient-to-t from-gray-50 to-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {scientist.studentFirstName} {scientist.studentLastName}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    Mission Specialist
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{scientist.studentEmail}</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/95 to-primary-400/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 w-full">
                    <div className="space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span className="text-sm">Grade {scientist.grade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        <span className="text-sm truncate">{scientist.schoolName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
