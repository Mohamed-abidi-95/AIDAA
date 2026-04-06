// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
// Main application component with React Router configuration
// Defines all routes and route protection logic

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ============================================================================
// IMPORT ROUTE GUARDS
// ============================================================================
// Components that protect routes based on authentication and role
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';

// ============================================================================
// IMPORT PAGES
// ============================================================================
// Authentication pages
import { LoginPage } from './pages/LoginPage';
import { SetPasswordPage } from './pages/SetPasswordPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';

// Dashboard pages
import { ChildDashboard } from './pages/ChildDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ProfessionalPage } from './pages/ProfessionalPage';
import { ProgressDashboard } from './pages/ProgressDashboard';

// ============================================================================
// APP COMPONENT
// ============================================================================
// Main application with all routes configured
export const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================================ */}
        {/* PUBLIC ROUTES - NO AUTHENTICATION REQUIRED */}
        {/* ================================================================ */}

        {/* Login Page Route */}
        {/* Path: /login */}
        {/* Anyone can access this route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Set Password Page Route */}
        {/* Path: /set-password */}
        {/* First-time users access this after login returns mustSetPassword */}
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Role Selection Page Route */}
        {/* Path: /role-selection */}
        {/* Parents access this after login to choose between parent/child mode */}
        <Route path="/role-selection" element={<RoleSelectionPage />} />

        {/* ================================================================ */}
        {/* PROTECTED ROUTES - REQUIRE AUTHENTICATION */}
        {/* ================================================================ */}

        {/* Protected Route Wrapper */}
        {/* All nested routes require authentication */}
        {/* If not authenticated, redirects to /login */}
        <Route element={<ProtectedRoute />}>
          {/* ============================================================ */}
          {/* ROOT REDIRECT - Route user to their role-specific dashboard */}
          {/* ============================================================ */}
          {/* Redirect root path based on user's role */}
          <Route path="/" element={<Navigate to="/parent/dashboard" replace />} />

          {/* ============================================================ */}
          {/* CHILD ROUTES - /child */}
          {/* ============================================================ */}
          {/* Accessible by: anyone authenticated (parents viewing child mode) */}
          <Route path="child" element={<ChildDashboard />} />

          {/* ============================================================ */}
          {/* PROGRESS DASHBOARD - /progress */}
          {/* ============================================================ */}
          {/* Analytics and progress tracking dashboard */}
          <Route path="progress" element={<ProgressDashboard />} />

          {/* ============================================================ */}
          {/* ADMIN ROUTES - /admin/dashboard */}
          {/* ============================================================ */}
          {/* Accessible by: admin users only */}
          {/* Protected by: RoleRoute with ['admin'] role */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="admin/dashboard" element={<AdminPanel />} />
          </Route>

          {/* ============================================================ */}
          {/* PARENT ROUTES - /parent/dashboard */}
          {/* ============================================================ */}
          {/* Accessible by: parent users only */}
          {/* Protected by: RoleRoute with ['parent'] role */}
          <Route element={<RoleRoute allowedRoles={['parent']} />}>
            <Route path="parent/dashboard" element={<ParentDashboard />} />
          </Route>

          {/* ============================================================ */}
          {/* PROFESSIONAL ROUTES - /professional/dashboard */}
          {/* ============================================================ */}
          {/* Accessible by: professional users only */}
          {/* Protected by: RoleRoute with ['professional'] role */}
          <Route element={<RoleRoute allowedRoles={['professional']} />}>
            <Route path="professional/dashboard" element={<ProfessionalPage />} />
          </Route>
        </Route>

        {/* ================================================================ */}
        {/* CATCH-ALL ROUTE */}
        {/* ================================================================ */}
        {/* Any undefined routes redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;