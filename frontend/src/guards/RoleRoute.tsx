// ============================================================================
// ROLE ROUTE COMPONENT
// ============================================================================
// Route guard that restricts access based on user role

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { UserRole, User } from '../types';

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
  // Get current user from useAuth hook
  const { user } = useAuth();

  // ========================================================================
  // GET USER FROM LOCALSTORAGE IF HOOK STATE NOT YET UPDATED
  // ========================================================================
  // React state updates are async - localStorage is immediate
  // Use localStorage as fallback if hook state is null
  let currentUser = user;
  if (!currentUser) {
    const storedUserJson = localStorage.getItem('aidaa_user');
    if (storedUserJson) {
      try {
        currentUser = JSON.parse(storedUserJson) as User;
        console.log('[RoleRoute] Using user from localStorage fallback:', currentUser);
      } catch (err) {
        console.error('[RoleRoute] Failed to parse user from localStorage:', err);
      }
    }
  }

  // ========================================================================
  // CHECK IF USER'S ROLE IS ALLOWED
  // ========================================================================
  // If user exists and their role is in the allowedRoles array
  if (currentUser && allowedRoles.includes(currentUser.role)) {
    console.log('[RoleRoute] User role allowed, rendering route:', currentUser.role);
    // Render the child route normally
    // Outlet represents the matched child route component
    return <Outlet />;
  }

  // ========================================================================
  // REDIRECT IF ROLE NOT ALLOWED
  // ========================================================================
  // If user's role is not allowed for this route:
  // Redirect to the user's appropriate dashboard based on their role
  // This prevents users from accessing dashboards they don't have permission for
  if (currentUser) {
    console.warn(
      `[RoleRoute] User role "${currentUser.role}" not in allowed roles [${allowedRoles.join(', ')}]. Redirecting to ${currentUser.role}/dashboard`
    );
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }

  // If user is null (shouldn't happen if ProtectedRoute is working), redirect to login
  console.log('[RoleRoute] No user found, redirecting to /login');
  return <Navigate to="/login" replace />;
};


