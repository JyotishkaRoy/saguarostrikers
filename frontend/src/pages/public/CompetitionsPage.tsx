import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Search, ArrowRight } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Competition {
  competitionId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  imageUrl?: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = competitions.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompetitions(filtered);
    } else {
      setFilteredCompetitions(competitions);
    }
  }, [searchTerm, competitions]);

  const fetchCompetitions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/public/competitions');
      if (response.success && response.data && Array.isArray(response.data)) {
        // Only show published competitions
        const publishedCompetitions = (response.data as Competition[]).filter(
          c => c.status === 'published'
        );
        setCompetitions(publishedCompetitions);
        setFilteredCompetitions(publishedCompetitions);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { label: 'Upcoming', class: 'badge-primary' };
    } else if (now > end) {
      return { label: 'Completed', class: 'badge-gray' };
    } else {
      return { label: 'Active', class: 'badge-success' };
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Our Missions</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our exciting rocketry competitions and join the journey to reach new heights
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search missions by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12 w-full text-lg py-3"
            />
          </div>
        </div>

        {/* Competitions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredCompetitions.length === 0 ? (
          <div className="card text-center py-12 max-w-2xl mx-auto">
            <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No missions found' : 'No active missions'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Check back soon for upcoming competitions!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompetitions.map((competition) => {
              const status = getStatusColor(competition.startDate, competition.endDate);
              return (
                <Link
                  key={competition.competitionId}
                  to={`/competitions/${competition.slug}`}
                  className="card group hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg overflow-hidden mb-4">
                    {competition.imageUrl ? (
                      <img
                        src={competition.imageUrl}
                        alt={competition.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
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
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {competition.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{competition.description}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {new Date(competition.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(competition.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{competition.location}</span>
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
        )}

        {/* CTA Section */}
        {filteredCompetitions.length > 0 && (
          <div className="mt-16 text-center">
            <div className="card max-w-3xl mx-auto bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Join a Mission?
              </h2>
              <p className="text-gray-700 mb-6">
                Register your interest in any of our competitions and become part of the Saguaro Strikers team!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/join-mission" className="btn-primary">
                  Join a Mission
                </Link>
                <Link to="/contact" className="btn-outline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
