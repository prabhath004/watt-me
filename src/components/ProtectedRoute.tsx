import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: Role;
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on required role
    const loginPath = requireRole === 'admin' ? '/login/admin' : '/login/user';
    return <Navigate to={loginPath} replace />;
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
