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
  const { isAuthenticated, isInitialized } = useAuth();

  // Wait for localStorage to be read before deciding — prevents false redirects
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <span className="w-10 h-10 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin block" />
      </div>
    );
  }

  // ========================================================================
  // REDIRECT IF NOT AUTHENTICATED
  // ========================================================================
  // If user is not logged in (neither hook state nor localStorage), redirect to login page
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated → /login');
    // Navigate to login page
    // The 'replace' flag prevents adding to browser history
    // So user can't navigate back to protected route
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Authenticated ✓');

  // ========================================================================
  // RENDER CHILD ROUTES
  // ========================================================================
  // If user is authenticated, render child routes
  // Outlet represents the matched child route component
  return <Outlet />;
};

