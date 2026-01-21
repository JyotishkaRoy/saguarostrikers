import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  FileSearch,
  Calendar,
  Bell,
  Image,
  Folder,
  UsersRound,
  Shield,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const mainNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Missions', path: '/admin/missions', icon: <Trophy className="h-5 w-5" /> },
    { label: 'Applications', path: '/admin/applications', icon: <FileText className="h-5 w-5" /> },
    { label: 'Messages', path: '/admin/contact-messages', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Settings', path: '/admin/site-content', icon: <Settings className="h-5 w-5" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FileSearch className="h-5 w-5" /> },
  ];

  const contentNavItems: NavItem[] = [
    { label: 'Teams', path: '/admin/teams', icon: <UsersRound className="h-5 w-5" /> },
    { label: 'Notices', path: '/admin/notices', icon: <Bell className="h-5 w-5" /> },
    { label: 'Calendar Events', path: '/admin/calendar-events', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Board Members', path: '/admin/board-members', icon: <Shield className="h-5 w-5" /> },
    { label: 'Mission Artifacts', path: '/admin/artifacts', icon: <Folder className="h-5 w-5" /> },
    { label: 'Mission Gallery', path: '/admin/gallery', icon: <Image className="h-5 w-5" /> },
    { label: 'Discussions', path: '/admin/discussions', icon: <MessageCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Admin Portal</h2>
              <p className="text-xs text-gray-500">Management Console</p>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Content Management */}
          <nav className="space-y-1 mt-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Content Management
            </p>
            {contentNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
