import { useState, useEffect } from 'react';
import { 
  Users, FileText, Image, Calendar, Mail, Trophy, 
  TrendingUp, Eye, Download, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  users: { total: number; active: number; new: number };
  missions: { total: number; active: number; upcoming: number };
  applications: { total: number; pending: number; approved: number };
  files: { total: number; public: number; downloads: number };
  gallery: { total: number; public: number; views: number };
  calendarEvents: { total: number; upcoming: number };
  notices: { total: number; published: number };
  contactMessages: { total: number; unread: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<DashboardStats>('/admin/dashboard/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your Saguaro Strikers platform</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <Link to="/admin/users" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.users.total}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success-600 font-medium">+{stats?.users.new} new</span>
                <span className="text-gray-500">in last 30 days</span>
              </div>
            </div>
            <Users className="h-12 w-12 text-primary-600" />
          </div>
        </Link>

        {/* Missions */}
        <Link to="/admin/missions" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Missions</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.missions.total}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary-600 font-medium">{stats?.missions.active} active</span>
                <span className="text-gray-500">• {stats?.missions.upcoming} upcoming</span>
              </div>
            </div>
            <Trophy className="h-12 w-12 text-primary-600" />
          </div>
        </Link>

        {/* Applications */}
        <Link to="/admin/applications" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Applications</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.applications.total}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-warning-600 font-medium">{stats?.applications.pending} pending</span>
                <span className="text-gray-500">• {stats?.applications.approved} approved</span>
              </div>
            </div>
            <Mail className="h-12 w-12 text-primary-600" />
          </div>
        </Link>

        {/* Contact Messages */}
        <Link to="/admin/contact-messages" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Messages</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.contactMessages.total}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-danger-600 font-medium">{stats?.contactMessages.unread} unread</span>
                <span className="text-gray-500">messages</span>
              </div>
            </div>
            <Mail className="h-12 w-12 text-primary-600" />
          </div>
        </Link>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Files */}
        <Link to="/admin/artifacts" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Mission Artifacts</h3>
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Files</span>
              <span className="font-semibold text-gray-900">{stats?.files.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Public</span>
              <span className="font-semibold text-success-600">{stats?.files.public}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <Download className="h-4 w-4" />
                <span>Downloads</span>
              </div>
              <span className="font-semibold text-primary-600">{stats?.files.downloads}</span>
            </div>
          </div>
        </Link>

        {/* Gallery */}
        <Link to="/admin/gallery" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Mission Gallery</h3>
            <Image className="h-8 w-8 text-primary-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Images</span>
              <span className="font-semibold text-gray-900">{stats?.gallery.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Public</span>
              <span className="font-semibold text-success-600">{stats?.gallery.public}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="h-4 w-4" />
                <span>Views</span>
              </div>
              <span className="font-semibold text-primary-600">{stats?.gallery.views}</span>
            </div>
          </div>
        </Link>

        {/* Calendar Events */}
        <Link to="/admin/calendar-events" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Calendar Events</h3>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Events</span>
              <span className="font-semibold text-gray-900">{stats?.calendarEvents.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-semibold text-primary-600">{stats?.calendarEvents.upcoming}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>This Month</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.calendarEvents.upcoming}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/users" className="btn-outline text-center py-4">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Manage Users</span>
          </Link>
          <Link to="/admin/missions" className="btn-outline text-center py-4">
            <Trophy className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Missions</span>
          </Link>
          <Link to="/admin/applications" className="btn-outline text-center py-4">
            <Mail className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Applications</span>
          </Link>
          <Link to="/admin/notices" className="btn-outline text-center py-4">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Notices</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
