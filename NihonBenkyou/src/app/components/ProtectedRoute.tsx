import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { useFamiliarityStore } from '../store/useFamiliarityStore';

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized, checkAuth, isLoading } = useAuthStore();
  const syncFamiliarity = useFamiliarityStore((s) => s.syncFromBackend);
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  // Once authenticated, pull the canonical familiarity list from the backend
  // so any stale localStorage entries (e.g. from a previous DB seed where ids
  // differ) are overwritten. Without this, FamiliarityButton can render as
  // green for items the server has never seen, and clicks become no-ops.
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      syncFamiliarity().catch(() => {});
    }
  }, [isAuthenticated, isInitialized, syncFamiliarity]);

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
