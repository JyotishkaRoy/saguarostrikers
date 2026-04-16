import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Mission {
  missionId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  imageUrl?: string;
}

const MISSIONS_PER_PAGE = 6;
type FilterStatus = 'all' | 'upcoming' | 'in-progress' | 'completed' | 'archived';

/** Plain text for mission cards so line-clamp counts lines correctly if HTML is stored. */
function missionCardDescription(description: string): string {
  if (!description) return '';
  const stripped = description.replace(/<[^>]*>/g, ' ');
  return stripped.replace(/\s+/g, ' ').trim();
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMissions();
  }, []);

  useEffect(() => {
    let filtered = missions;

    // Filter by status (skip when "All")
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => {
        const missionStatus = getMissionStatus(c.startDate, c.endDate, c.status);
        return missionStatus === activeFilter;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by start date descending (newest first)
    filtered = [...filtered].sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    setFilteredMissions(filtered);
  }, [searchTerm, missions, activeFilter]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  const totalPages = Math.ceil(filteredMissions.length / MISSIONS_PER_PAGE) || 1;
  const paginatedMissions = filteredMissions.slice(
    (currentPage - 1) * MISSIONS_PER_PAGE,
    currentPage * MISSIONS_PER_PAGE
  );

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/public/missions');
      if (response.success && response.data && Array.isArray(response.data)) {
        // Show all missions except drafts (published, completed, cancelled, archived)
        const visibleMissions = (response.data as Mission[]).filter(
          c => c.status !== 'draft'
        );
        setMissions(visibleMissions);
        setFilteredMissions(visibleMissions);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getMissionStatus = (startDate: string, endDate: string, dbStatus: string): FilterStatus => {
    // Use explicit database status directly
    if (dbStatus === 'archived') {
      return 'archived';
    }
    
    if (dbStatus === 'completed') {
      return 'completed';
    }
    
    if (dbStatus === 'in-progress') {
      return 'in-progress';
    }
    
    if (dbStatus === 'published') {
      return 'upcoming';
    }

    // Fallback: use upcoming as default for published missions
    return 'upcoming';
  };

  const getStatusColor = (status: FilterStatus) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Upcoming', class: 'badge-primary' };
      case 'in-progress':
        return { label: 'In Progress', class: 'badge-success' };
      case 'completed':
        return { label: 'Completed', class: 'badge-gray' };
      case 'archived':
        return { label: 'Archived', class: 'badge-warning' };
      default:
        return { label: 'Unknown', class: 'badge-gray' };
    }
  };

  const getFilterCount = (filter: FilterStatus) => {
    if (filter === 'all') return missions.length;
    return missions.filter(c => getMissionStatus(c.startDate, c.endDate, c.status) === filter).length;
  };

  const getEmptyStateMessages = () => {
    switch (activeFilter) {
      case 'all':
        return {
          title: 'No Missions',
          subtitle: 'No missions available at this time.'
        };
      case 'upcoming':
        return {
          title: 'No Upcoming Missions',
          subtitle: 'Check back soon for upcoming missions!'
        };
      case 'in-progress':
        return {
          title: 'No In Progress Missions',
          subtitle: 'There are no missions currently running. Check upcoming missions!'
        };
      case 'completed':
        return {
          title: 'No Completed Missions',
          subtitle: 'Completed missions will appear here once they finish.'
        };
      case 'archived':
        return {
          title: 'No Archived Missions',
          subtitle: 'Archived or cancelled missions will appear here.'
        };
      default:
        return {
          title: 'No Missions',
          subtitle: 'No missions available at this time.'
        };
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header: Title, Description, Search, Filters */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Our Missions</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Explore our exciting rocketry missions and join the journey to reach new heights
          </p>

          {/* Search Bar + Filter Buttons (same row) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="relative flex-1 min-w-0 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search missions by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12 w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-left ${
                    activeFilter === 'all'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>All</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getFilterCount('all')}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveFilter('upcoming')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-left ${
                    activeFilter === 'upcoming'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>Upcoming</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilter === 'upcoming' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getFilterCount('upcoming')}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveFilter('in-progress')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-left ${
                    activeFilter === 'in-progress'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>In Progress</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilter === 'in-progress' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getFilterCount('in-progress')}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-left ${
                    activeFilter === 'completed'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>Completed</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilter === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getFilterCount('completed')}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveFilter('archived')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-left ${
                    activeFilter === 'archived'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>Archived</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilter === 'archived' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getFilterCount('archived')}
                    </span>
                  </div>
                </button>
              </div>
          </div>
        </div>

        {/* Missions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="card text-center py-12 max-w-2xl mx-auto">
            <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No missions found' : getEmptyStateMessages().title}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : getEmptyStateMessages().subtitle}
            </p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedMissions.map((mission) => {
              const missionStatus = getMissionStatus(mission.startDate, mission.endDate, mission.status);
              const status = getStatusColor(missionStatus);
              return (
                <Link
                  key={mission.missionId}
                  to={`/missions/${mission.slug}`}
                  className="card group hover:shadow-xl transition-all duration-300 min-w-0"
                >
                  {/* Image/Video */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg overflow-hidden mb-4">
                    {mission.imageUrl ? (
                      // Check if it's a video file
                      /\.(mp4|webm|ogg)$/i.test(mission.imageUrl) ? (
                        <video
                          src={mission.imageUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={mission.imageUrl}
                          alt={mission.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Trophy className="h-20 w-20 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${status.class} shadow-lg`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {mission.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 break-words">
                      {missionCardDescription(mission.description)}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {new Date(mission.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(mission.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{mission.location}</span>
                      </div>
                    </div>

                    {/* View Details Link */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-primary-600 font-medium group-hover:text-primary-700">
                        View Details
                      </span>
                      <ArrowRight className="h-5 w-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
          </>
        )}

        {/* CTA Section */}
        {filteredMissions.length > 0 && (
          <div className="mt-16 text-center">
            <div className="card max-w-3xl mx-auto bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Join a Mission?
              </h2>
              <p className="text-gray-700 mb-6">
                Register your interest in any of our missions and become part of the Saguaro Strikers team!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/join-mission" className="btn-primary">
                  Join a Mission
                </Link>
                <Link to="/contact" className="btn-outline">
                  Reach Mission Control
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
