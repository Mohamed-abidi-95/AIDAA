import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { RoleRoute } from '../guards/RoleRoute';
import { ChildModeRoute } from '../guards/ChildModeRoute';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { SetPasswordPage } from '../pages/SetPasswordPage';
import { RoleSelectionPage } from '../pages/RoleSelectionPage';
import { ChildSelectionPage } from '../pages/ChildSelectionPage';
import { ChildDashboard } from '../pages/ChildDashboard';
import { ParentDashboard } from '../pages/ParentDashboard';
import { AdminPanel } from '../pages/AdminPanel';
import { ProfessionalPage } from '../pages/ProfessionalPage';
import { TeleconsultationList } from '../pages/TeleconsultationList';
import { TeleconsultationRoom } from '../pages/TeleconsultationRoom';
import { TeleconsultationSchedule } from '../pages/TeleconsultationSchedule';
import { ProgressDashboard } from '../pages/ProgressDashboard';
import { PendingApprovalPage } from '../pages/PendingApprovalPage';
import { ProfessionalSignupPage } from '../pages/ProfessionalSignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

export const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/professional" element={<ProfessionalSignupPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="progress" element={<ProgressDashboard />} />

        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="admin/dashboard" element={<AdminPanel />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['parent']} />}>
          <Route path="parent/dashboard" element={<ParentDashboard />} />
          <Route path="child-selection" element={<ChildSelectionPage />} />
          <Route element={<ChildModeRoute />}>
            <Route path="child" element={<ChildDashboard />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['professional']} />}>
          <Route path="professional/dashboard" element={<ProfessionalPage />} />
          <Route path="professionnel/teleconsultation" element={<TeleconsultationList />} />
          <Route path="professionnel/teleconsultation/planifier" element={<TeleconsultationSchedule />} />
          <Route path="professionnel/teleconsultation/:sessionId" element={<TeleconsultationRoom />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};




