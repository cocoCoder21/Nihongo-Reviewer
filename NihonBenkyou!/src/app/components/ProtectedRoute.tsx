import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized, checkAuth, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  // Show loading while checking auth status
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-brand-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-md">
            <span className="text-2xl font-bold leading-none mt-0.5">日</span>
          </div>
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
