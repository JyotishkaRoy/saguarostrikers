import { useState, useEffect } from 'react';
import { 
  Trophy, Users, FileText, Image, Calendar, 
  TrendingUp, Clock, CheckCircle, AlertCircle, LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface UserStats {
  missions: { active: number; completed: number };
  teams: { current: number };
  applications: { pending: number; approved: number };
  downloads: number;
}

interface RecentActivity {
  id: string;
  type: 'mission' | 'team' | 'file' | 'application' | 'event';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'warning';
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Mock data - in real app, these would be API calls
      setStats({
        missions: { active: 3, completed: 5 },
        teams: { current: 2 },
        applications: { pending: 1, approved: 2 },
        downloads: 12,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'mission',
          title: 'Registered for NASA USLI 2024',
          description: 'Successfully registered for the mission',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success',
        },
        {
          id: '2',
          type: 'application',
          title: 'Mission Application Submitted',
          description: 'Your application for Summer Launch Mission is under review',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
        {
          id: '3',
          type: 'team',
          title: 'Added to Team Alpha',
          description: 'You have been added to the Alpha Launch Team',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'success',
        },
        {
          id: '4',
          type: 'file',
          title: 'Downloaded Mission Guidelines',
          description: 'Downloaded Safety_Procedures.pdf',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          type: 'event',
          title: 'Upcoming: Team Meeting',
          description: 'Team meeting scheduled for next Monday',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'warning',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mission':
        return <Trophy className="h-5 w-5 text-primary-600" />;
      case 'team':
        return <Users className="h-5 w-5 text-success-600" />;
      case 'file':
        return <FileText className="h-5 w-5 text-gray-600" />;
      case 'application':
        return <CheckCircle className="h-5 w-5 text-warning-600" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-primary-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <span className="badge-success text-xs">Completed</span>;
      case 'pending':
        return <span className="badge-warning text-xs">Pending</span>;
      case 'warning':
        return <span className="badge-primary text-xs">Upcoming</span>;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <LayoutDashboard className="h-10 w-10 text-primary-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
        </div>
        <p className="text-lg text-gray-600">Here's what's happening with your missions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/my-missions" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Missions</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.missions.active}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{stats?.missions.completed} completed</span>
              </div>
            </div>
            <Trophy className="h-10 w-10 text-primary-600" />
          </div>
        </Link>

        <Link to="/my-teams" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Teams</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.teams.current}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success-600 font-medium">Active</span>
              </div>
            </div>
            <Users className="h-10 w-10 text-primary-600" />
          </div>
        </Link>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Applications</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.applications.approved}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-warning-600 font-medium">{stats?.applications.pending} pending</span>
              </div>
            </div>
            <CheckCircle className="h-10 w-10 text-primary-600" />
          </div>
        </div>

        <Link to="/my-files" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.downloads}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">files accessed</span>
              </div>
            </div>
            <FileText className="h-10 w-10 text-primary-600" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                    {activity.status && getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="space-y-3">
            <Link to="/missions" className="btn-outline w-full justify-start">
              <Trophy className="h-5 w-5 mr-2" />
              Browse Missions
            </Link>
            <Link to="/mission-calendar" className="btn-outline w-full justify-start">
              <Calendar className="h-5 w-5 mr-2" />
              Mission Calendar
            </Link>
            <Link to="/mission-artifacts" className="btn-outline w-full justify-start">
              <FileText className="h-5 w-5 mr-2" />
              Mission Artifacts
            </Link>
            <Link to="/mission-gallery" className="btn-outline w-full justify-start">
              <Image className="h-5 w-5 mr-2" />
              Mission Gallery
            </Link>
            <Link to="/join-mission" className="btn-primary w-full justify-start">
              <AlertCircle className="h-5 w-5 mr-2" />
              Join a Mission
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
