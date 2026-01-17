import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

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
  createdAt: string;
}

export default function CompetitionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (slug) {
      fetchCompetition();
    }
  }, [slug]);

  const fetchCompetition = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/public/competitions/slug/${slug}`);
      if (response.success && response.data) {
        setCompetition(response.data as Competition);
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
      return { label: 'Active Now', class: 'badge-success' };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mission not found</h3>
            <p className="text-gray-600 mb-4">The mission you're looking for doesn't exist or has been removed.</p>
            <Link to="/competitions" className="btn-primary">
              View All Missions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusColor(competition.startDate, competition.endDate);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Link
          to="/competitions"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Missions
        </Link>

        {/* Hero Image */}
        <div className="relative h-96 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl overflow-hidden mb-8">
          {competition.imageUrl ? (
            <img
              src={competition.imageUrl}
              alt={competition.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Trophy className="h-32 w-32 text-white opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className={`badge ${status.class} text-base px-4 py-2`}>{status.label}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{competition.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Mission</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{competition.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-start gap-3">
                  <Calendar className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Competition Dates</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Starts:</strong>{' '}
                      {new Date(competition.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Ends:</strong>{' '}
                      {new Date(competition.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                    <p className="text-gray-700">{competition.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Resources (Placeholder) */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mission Resources</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Competition Guidelines</p>
                    <p className="text-sm text-gray-600">Download the official rules and requirements</p>
                  </div>
                  <button className="btn-outline text-sm py-1.5 px-3">Download</button>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Mission Gallery</p>
                    <p className="text-sm text-gray-600">View photos and videos from this mission</p>
                  </div>
                  <Link to="/mission-gallery" className="btn-outline text-sm py-1.5 px-3">
                    View Gallery
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Join CTA */}
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <Trophy className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interested in Joining?</h3>
              <p className="text-gray-700 mb-6">
                Register your interest and our team will get in touch with you about joining this mission.
              </p>
              {isAuthenticated ? (
                <Link to="/join-mission" className="btn-primary w-full justify-center">
                  Register Interest
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link to="/register" className="btn-primary w-full justify-center">
                    Sign Up to Join
                  </Link>
                  <Link to="/login" className="btn-outline w-full justify-center">
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">{status.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {Math.ceil(
                      (new Date(competition.endDate).getTime() - new Date(competition.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">Rocketry Competition</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Have Questions?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact our team if you have any questions about this mission.
              </p>
              <Link to="/contact" className="btn-outline w-full justify-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
