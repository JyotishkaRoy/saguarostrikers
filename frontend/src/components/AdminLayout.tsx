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
  UsersRound,
  Shield,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Package,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';

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
  const [missionsExpanded, setMissionsExpanded] = useState(true);
  const [outreachExpanded, setOutreachExpanded] = useState(true);

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
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
    { label: 'Board Members', path: '/admin/board-members', icon: <Shield className="h-5 w-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Messages', path: '/admin/contact-messages', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Notices', path: '/admin/notices', icon: <Bell className="h-5 w-5" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FileSearch className="h-5 w-5" /> },
  ];

  const missionSubItems: NavItem[] = [
    { label: 'Applications', path: '/admin/applications', icon: <FileText className="h-4 w-4" /> },
    { label: 'Mission Scientists', path: '/admin/scientists', icon: <UsersRound className="h-4 w-4" /> },
    { label: 'Mission Artifacts', path: '/admin/artifacts', icon: <Package className="h-4 w-4" /> },
    { label: 'Mission Galleries', path: '/admin/gallery', icon: <Image className="h-4 w-4" /> },
    { label: 'Discussions', path: '/admin/discussions', icon: <MessageCircle className="h-4 w-4" /> },
  ];

  const outreachSubItems: NavItem[] = [
    { label: 'Applications', path: '/admin/outreach-applications', icon: <FileText className="h-4 w-4" /> },
  ];

  const contentNavItems: NavItem[] = [
    { label: 'Calendar Events', path: '/admin/calendar-events', icon: <Calendar className="h-5 w-5" /> },
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

            {/* Calendar Events (above Missions) */}
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
            
            {/* Missions with Submenu */}
            <div>
              <button
                onClick={() => setMissionsExpanded(!missionsExpanded)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  (isActive('/admin/missions') || location.pathname.includes('/admin/applications') || 
                   location.pathname.includes('/admin/scientists') || location.pathname.includes('/admin/artifacts') || 
                   location.pathname.includes('/admin/gallery') || location.pathname.includes('/admin/discussions'))
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5" />
                  <span>Missions</span>
                </div>
                {missionsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {/* Mission Submenu */}
              {missionsExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    to="/admin/missions"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive('/admin/missions')
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>All Missions</span>
                  </Link>
                  {missionSubItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.path)
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Outreach Events with Submenu (same structure as Missions) */}
            <div>
              <button
                onClick={() => setOutreachExpanded(!outreachExpanded)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  (isActive('/admin/outreaches') || location.pathname.includes('/admin/outreach-applications') ||
                   location.pathname.includes('/admin/outreach-participants') || location.pathname.includes('/admin/outreach-artifacts') ||
                   location.pathname.includes('/admin/outreach-galleries') || location.pathname.includes('/admin/future-explorers'))
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Rocket className="h-5 w-5" />
                  <span>Outreach Events</span>
                </div>
                {outreachExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {outreachExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    to="/admin/outreaches"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive('/admin/outreaches')
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Rocket className="h-4 w-4" />
                    <span>All Outreaches</span>
                  </Link>
                  {outreachSubItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.path)
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
