import { useEffect, useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import VideoCarousel from '@/components/VideoCarousel';
import { api } from '@/lib/api';
import type { HomepageContent, Mission } from '@/types';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  totalMissions: number;
  totalTeamMembers: number;
  totalEvents: number;
  completedMissions: number;
}

export default function HomePage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [upcomingMissions, setUpcomingMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMissions: 0, totalTeamMembers: 0, totalEvents: 0, completedMissions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMissions, setIsLoadingMissions] = useState(true);

  useEffect(() => {
    fetchHomepageContent();
    fetchUpcomingMissions();
    fetchStats();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      const response = await api.get<{ homepage: HomepageContent }>('/public/homepage');
      if (response.success && response.data) {
        setContent(response.data.homepage);
      }
    } catch (error) {
      console.error('Failed to fetch homepage content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingMissions = async () => {
    try {
      const response = await api.get<Mission[]>('/public/missions/upcoming');
      if (response.success && response.data) {
        // Limit to 3 missions for the homepage
        setUpcomingMissions(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch upcoming missions:', error);
    } finally {
      setIsLoadingMissions(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<{
        activeMissions: number;
        teamMembers: number;
        upcomingEvents: number;
        completedMissions: number;
      }>('/public/stats');
      if (response.success && response.data) {
        setStats({
          totalMissions: response.data.activeMissions,
          totalTeamMembers: response.data.teamMembers,
          totalEvents: response.data.upcomingEvents,
          completedMissions: response.data.completedMissions
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalMissions: 0,
        totalTeamMembers: 0,
        totalEvents: 0,
        completedMissions: 0
      });
    }
  };

  // Featured videos from settings (max 3), with fallback shape for VideoCarousel
  const featuredVideos = (content?.featuredVideos ?? [])
    .slice(0, 3)
    .map((v, i) => ({
      id: v.id ?? String(i + 1),
      title: v.title || 'Video',
      url: v.url,
      thumbnail: v.thumbnail
    }));

  return (
    <div className="min-h-screen">
      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Main Content - 2 Column Layout (60% / 40%) */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Column 1: 60% - Text Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Welcome to Saguaro Strikers
                </h2>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {content?.aboutUs ? (
                    <div dangerouslySetInnerHTML={{ __html: content.aboutUs }} />
                  ) : (
                    <>
                      <p>
                        Saguaro Strikers is a premier rocketry team dedicated to inspiring the next 
                        generation of aerospace engineers and scientists. We participate in national 
                        and international rocketry missions, pushing the boundaries of what's 
                        possible in amateur rocketry.
                      </p>
                      
                      <p>
                        Our team is composed of passionate students, mentors, and industry professionals 
                        who work together to design, build, and launch high-powered rockets. Through 
                        hands-on experience and rigorous testing, we develop the skills and knowledge 
                        needed to succeed in STEM fields.
                      </p>

                      <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                        Our Vision
                      </h3>
                      <p>
                        {content?.vision || 
                          'To be a leading force in amateur rocketry, inspiring innovation and excellence in aerospace education.'}
                      </p>

                      <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                        Our Mission
                      </h3>
                      <p>
                        {content?.mission || 
                          'To provide students with hands-on experience in rocket design, engineering, and flight operations while fostering teamwork, problem-solving, and scientific inquiry.'}
                      </p>

                      <div className="mt-8 flex flex-wrap gap-4">
                        <a
                          href="/join-mission"
                          className="btn-primary inline-flex items-center"
                        >
                          Join Our Team
                        </a>
                        <a
                          href="/missions"
                          className="btn-outline inline-flex items-center"
                        >
                          View Our Missions
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: 40% - Quick Stats */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.totalMissions}</div>
                  <div className="text-sm text-gray-600 mt-1">Active Missions</div>
                </div>
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.totalTeamMembers}+</div>
                  <div className="text-sm text-gray-600 mt-1">Team Members</div>
                </div>
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.totalEvents}+</div>
                  <div className="text-sm text-gray-600 mt-1">Events</div>
                </div>
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.completedMissions}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed Missions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Videos - below Welcome / About */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Featured Videos</h3>
          <VideoCarousel videos={featuredVideos} />
        </div>
      </div>

      {/* Upcoming Missions Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Upcoming Missions
          </h2>
          
          {isLoadingMissions ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg -mt-6 -mx-6 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : upcomingMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingMissions.map((mission) => (
                <Link
                  key={mission.missionId}
                  to={`/missions/${mission.slug}`}
                  className="card hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center overflow-hidden">
                    {mission.imageUrl ? (
                      <img
                        src={mission.imageUrl}
                        alt={mission.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-center p-4">
                        <div className="text-4xl font-bold mb-2">🚀</div>
                        <div className="text-lg font-semibold">{mission.title}</div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {mission.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {mission.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary-600" />
                      <span>
                        {new Date(mission.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {mission.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        <span>{mission.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Missions</h3>
              <p className="text-gray-600 mb-6">
                Check back soon for new exciting rocketry missions!
              </p>
              <Link to="/missions" className="btn-primary inline-flex items-center">
                View All Missions
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}
          
          {upcomingMissions.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/missions" className="btn-outline inline-flex items-center">
                View All Missions
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
