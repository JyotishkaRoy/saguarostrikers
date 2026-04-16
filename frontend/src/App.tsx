import { useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { initAnalytics, setupAutoAnalyticsTracking, trackPageView } from './lib/analytics';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_THROTTLE_MS = 60 * 1000; // only reset timer at most once per minute

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import MissionsPage from './pages/public/MissionsPage';
import MissionDetailPage from './pages/public/MissionDetailPage';
import MissionLeaders from './pages/public/MissionLeaders';
import MissionStatement from './pages/public/MissionStatement';
import CalendarPage from './pages/public/CalendarPage';
import JoinMission from './pages/public/JoinMission';
import FutureExplorers from './pages/public/FutureExplorers';
import OutreachDetailPage from './pages/public/OutreachDetailPage';
import MissionArtifacts from './pages/public/MissionArtifacts';
import MissionScientists from './pages/public/MissionScientists';
import PublicMissionGallery from './pages/public/MissionGallery';
import DiscussionBoard from './pages/public/DiscussionBoard';
import DiscussionThread from './pages/public/DiscussionThread';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import UserMissions from './pages/user/UserMissions';
import UserTeams from './pages/user/UserTeams';
import UserFiles from './pages/user/UserFiles';
import MissionGallery from './pages/user/MissionGallery';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMissions from './pages/admin/AdminMissions';
import AdminScientists from './pages/admin/AdminScientists';
import AdminTeams from './pages/admin/AdminTeams';
import AdminNotices from './pages/admin/AdminNotices';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminBoardMembers from './pages/admin/AdminBoardMembers';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import AdminFiles from './pages/admin/AdminFiles';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminCalendarEvents from './pages/admin/AdminCalendarEvents';
import AdminApplications from './pages/admin/AdminApplications';
import AdminArtifacts from './pages/admin/AdminArtifacts';
import AdminGallery from './pages/admin/AdminGallery';
import AdminDiscussions from './pages/admin/AdminDiscussions';
import AdminFutureExplorers from './pages/admin/AdminFutureExplorers';
import AdminOutreaches from './pages/admin/AdminOutreaches';
import AdminOutreachPlaceholder from './pages/admin/AdminOutreachPlaceholder';
import AdminOutreachApplications from './pages/admin/AdminOutreachApplications';
import AdminOutreachParticipants from './pages/admin/AdminOutreachParticipants';
import AdminOutreachArtifacts from './pages/admin/AdminOutreachArtifacts';
import AdminOutreachGalleries from './pages/admin/AdminOutreachGalleries';

/** Redirects /dashboard: admins → /admin, non-admins → /my-missions (no dashboard for non-admins). */
function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/my-missions'} replace />;
}

function App() {
  const location = useLocation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(0);

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    initAnalytics();
    const cleanup = setupAutoAnalyticsTracking();
    return cleanup;
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path);
  }, [location.pathname, location.search, location.hash]);

  // Log out after 30 minutes of inactivity (only when logged in)
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;
    const now = Date.now();
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      logout();
      inactivityTimerRef.current = null;
    }, INACTIVITY_MS);
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }
    lastActivityRef.current = Date.now();
    resetInactivityTimer();
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();
    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isAuthenticated, resetInactivityTimer]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/mission-statement" element={<MissionStatement />} />
          <Route path="/mission-leaders" element={<MissionLeaders />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/mission-calendar" element={<Navigate to="/calendar" replace />} />
          <Route path="/join-mission" element={<JoinMission />} />
          <Route path="/outreach-events" element={<FutureExplorers />} />
          <Route path="/future-explorers" element={<Navigate to="/outreach-events" replace />} />
          <Route path="/outreach/:slug" element={<OutreachDetailPage />} />
          <Route path="/mission-artifacts" element={<MissionArtifacts />} />
          <Route path="/discussions" element={<DiscussionBoard />} />
          <Route path="/discussions/:id" element={<DiscussionThread />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/:missionSlug/scientists" element={<MissionScientists />} />
          <Route path="/missions/:missionSlug/artifacts" element={<MissionArtifacts />} />
          <Route path="/missions/:missionSlug/gallery" element={<PublicMissionGallery />} />
          <Route path="/missions/:slug" element={<MissionDetailPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes (Protected) */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />
          <Route path="/my-missions" element={<PrivateRoute><UserMissions /></PrivateRoute>} />
          <Route path="/my-teams" element={<PrivateRoute><UserTeams /></PrivateRoute>} />
          <Route path="/my-files" element={<PrivateRoute><UserFiles /></PrivateRoute>} />
          <Route path="/mission-gallery" element={<PrivateRoute><MissionGallery /></PrivateRoute>} />

          {/* Admin Routes (Protected - Admin Only) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/missions" element={<AdminRoute><AdminMissions /></AdminRoute>} />
          <Route path="/admin/scientists" element={<AdminRoute><AdminScientists /></AdminRoute>} />
          <Route path="/admin/teams" element={<AdminRoute><AdminTeams /></AdminRoute>} />
          <Route path="/admin/notices" element={<AdminRoute><AdminNotices /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSiteContent /></AdminRoute>} />
          <Route path="/admin/board-members" element={<AdminRoute><AdminBoardMembers /></AdminRoute>} />
          <Route path="/admin/contact-messages" element={<AdminRoute><AdminContactMessages /></AdminRoute>} />
          <Route path="/admin/files" element={<AdminRoute><AdminFiles /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
          <Route path="/admin/calendar-events" element={<AdminRoute><AdminCalendarEvents /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
          <Route path="/admin/artifacts" element={<AdminRoute><AdminArtifacts /></AdminRoute>} />
          <Route path="/admin/gallery" element={<AdminRoute><AdminGallery /></AdminRoute>} />
          <Route path="/admin/discussions" element={<AdminRoute><AdminDiscussions /></AdminRoute>} />
          <Route path="/admin/outreaches" element={<AdminRoute><AdminOutreaches /></AdminRoute>} />
          <Route path="/admin/future-explorers" element={<AdminRoute><AdminFutureExplorers /></AdminRoute>} />
          <Route path="/admin/outreach-applications" element={<AdminRoute><AdminOutreachApplications /></AdminRoute>} />
          <Route path="/admin/outreach-participants" element={<AdminRoute><AdminOutreachParticipants /></AdminRoute>} />
          <Route path="/admin/outreach-artifacts" element={<AdminRoute><AdminOutreachArtifacts /></AdminRoute>} />
          <Route path="/admin/outreach-galleries" element={<AdminRoute><AdminOutreachGalleries /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
              <Link to="/" className="text-primary-600 font-medium hover:underline">Return to Home</Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
