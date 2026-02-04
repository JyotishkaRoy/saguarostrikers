import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from './AdminLayout';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  // Wait for store to rehydrate from sessionStorage
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/my-missions" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
