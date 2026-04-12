// ============================================================================
// ROLE ROUTE COMPONENT
// ============================================================================
// Route guard that restricts access based on user role

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { UserRole } from '../types';

// ============================================================================
// ROLE ROUTE PROPS
// ============================================================================
// Props for the RoleRoute component
interface RoleRouteProps {
  // Array of roles allowed to access this route
  allowedRoles: UserRole[];
}

// ============================================================================
// ROLE ROUTE COMPONENT
// ============================================================================
// Wraps routes that require a specific user role
// If user's role is not in allowedRoles, redirects to default dashboard
// If user's role is allowed, renders the route normally
export const RoleRoute = ({ allowedRoles }: RoleRouteProps): JSX.Element => {
  // user is always up-to-date from shared AuthContext
  const { user } = useAuth();

  if (user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  if (user) {
    console.warn(`[RoleRoute] Role "${user.role}" not allowed → /${user.role}/dashboard`);
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  console.log('[RoleRoute] No user → /login');
  return <Navigate to="/login" replace />;
};

