import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

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
import MissionCalendar from './pages/public/MissionCalendar';
import JoinMission from './pages/public/JoinMission';
import FutureExplorers from './pages/public/FutureExplorers';
import MissionArtifacts from './pages/public/MissionArtifacts';
import DiscussionBoard from './pages/public/DiscussionBoard';
import DiscussionThread from './pages/public/DiscussionThread';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserMissions from './pages/user/UserMissions';
import UserTeams from './pages/user/UserTeams';
import UserFiles from './pages/user/UserFiles';
import MissionGallery from './pages/user/MissionGallery';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMissions from './pages/admin/AdminMissions';
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

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

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
          <Route path="/mission-calendar" element={<MissionCalendar />} />
          <Route path="/join-mission" element={<JoinMission />} />
          <Route path="/future-explorers" element={<FutureExplorers />} />
          <Route path="/mission-artifacts" element={<MissionArtifacts />} />
          <Route path="/discussions" element={<DiscussionBoard />} />
          <Route path="/discussions/:id" element={<DiscussionThread />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/:slug" element={<MissionDetailPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes (Protected) */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/my-missions" element={<PrivateRoute><UserMissions /></PrivateRoute>} />
          <Route path="/my-teams" element={<PrivateRoute><UserTeams /></PrivateRoute>} />
          <Route path="/my-files" element={<PrivateRoute><UserFiles /></PrivateRoute>} />
          <Route path="/mission-gallery" element={<PrivateRoute><MissionGallery /></PrivateRoute>} />

          {/* Admin Routes (Protected - Admin Only) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/missions" element={<AdminRoute><AdminMissions /></AdminRoute>} />
          <Route path="/admin/teams" element={<AdminRoute><AdminTeams /></AdminRoute>} />
          <Route path="/admin/notices" element={<AdminRoute><AdminNotices /></AdminRoute>} />
          <Route path="/admin/site-content" element={<AdminRoute><AdminSiteContent /></AdminRoute>} />
          <Route path="/admin/board-members" element={<AdminRoute><AdminBoardMembers /></AdminRoute>} />
          <Route path="/admin/contact-messages" element={<AdminRoute><AdminContactMessages /></AdminRoute>} />
          <Route path="/admin/files" element={<AdminRoute><AdminFiles /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
          <Route path="/admin/calendar-events" element={<AdminRoute><AdminCalendarEvents /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
          <Route path="/admin/artifacts" element={<AdminRoute><AdminArtifacts /></AdminRoute>} />
          <Route path="/admin/gallery" element={<AdminRoute><AdminGallery /></AdminRoute>} />
          <Route path="/admin/discussions" element={<AdminRoute><AdminDiscussions /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
