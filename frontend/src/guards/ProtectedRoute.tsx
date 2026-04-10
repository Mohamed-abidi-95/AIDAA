// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
// Route guard that redirects unauthenticated users to login page

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
// Wraps routes that require authentication
// If user is not authenticated, redirects to login page
// If user is authenticated, renders the route normally
export const ProtectedRoute = (): JSX.Element => {
  // Get authentication state from useAuth hook
  const { isAuthenticated } = useAuth();

  // ========================================================================
  // CHECK BOTH REACT STATE AND LOCALSTORAGE (fallback)
  // ========================================================================
  // Use localStorage as fallback because React state updates are async
  // localStorage is updated immediately by authService, so use it as source of truth
  const hasValidToken = !!localStorage.getItem('aidaa_token');
  const hasValidUser = !!localStorage.getItem('aidaa_user');
  const isAuthenticatedFallback = hasValidToken && hasValidUser;

  // ========================================================================
  // FINAL AUTHENTICATION CHECK
  // ========================================================================
  // isAuthenticated from hook (may be delayed) OR fallback to localStorage (immediate)
  const isFullyAuthenticated = isAuthenticated || isAuthenticatedFallback;

  // ========================================================================
  // REDIRECT IF NOT AUTHENTICATED
  // ========================================================================
  // If user is not logged in (neither hook state nor localStorage), redirect to login page
  if (!isFullyAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login', {
      isAuthenticated,
      isAuthenticatedFallback,
      token: !!localStorage.getItem('aidaa_token'),
      user: !!localStorage.getItem('aidaa_user'),
    });
    // Navigate to login page
    // The 'replace' flag prevents adding to browser history
    // So user can't navigate back to protected route
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Authenticated, rendering child routes');

  // ========================================================================
  // RENDER CHILD ROUTES
  // ========================================================================
  // If user is authenticated, render child routes
  // Outlet represents the matched child route component
  return <Outlet />;
};


