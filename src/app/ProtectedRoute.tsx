import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthProvider';

/** Requires an authenticated session; otherwise sends the visitor to `/login`. */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
