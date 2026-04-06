// ============================================================================
// SET PASSWORD PAGE
// ============================================================================
// Page for first-time users to set their password

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/SetPasswordPage.css';

// ============================================================================
// LOCATION STATE TYPE
// ============================================================================
// Type for the state passed through navigation
interface LocationState {
  userId: number;
}

// ============================================================================
// SET PASSWORD PAGE COMPONENT
// ============================================================================
// Handles password creation for first-time users
// Validates password requirements and redirects after successful setup
export const SetPasswordPage = (): JSX.Element => {
  // Get navigation hook for redirects
  const navigate = useNavigate();

  // Get location to read userId from navigation state
  const location = useLocation();

  // Get auth functions from useAuth hook
  const { setPassword, isLoading } = useAuth();

  // ========================================================================
  // GET USER ID FROM NAVIGATION STATE
  // ========================================================================
  // Extract userId from the state passed during navigation
  const state = location.state as LocationState | null;
  const userId = state?.userId;

  // If no userId in state, user shouldn't be on this page
  // Redirect to login
  if (!userId) {
    navigate('/login', { replace: true });
    return <div>Redirecting...</div>;
  }

  // ========================================================================
  // FORM STATE
  // ========================================================================

  // State for new password input
  const [password, setPasswordInput] = useState<string>('');

  // State for confirm password input
  const [confirmPassword, setConfirmPasswordInput] = useState<string>('');

  // State for error message display
  const [error, setError] = useState<string>('');

  // ========================================================================
  // VALIDATE PASSWORD FUNCTION
  // ========================================================================
  // Validates password against requirements
  const validatePassword = (pwd: string): string | null => {
    // Check minimum length (6 characters)
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    // Password is valid if it meets all requirements
    return null;
  };

  // ========================================================================
  // HANDLE SET PASSWORD SUBMIT
  // ========================================================================
  // Called when user submits the set password form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    // Prevent form default submission behavior
    e.preventDefault();

    // Clear any previous error messages
    setError('');

    // ====================================================================
    // VALIDATION
    // ====================================================================

    // Validate password is not empty
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    // Validate confirm password is not empty
    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    // Validate password meets minimum requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Call setPassword function from auth service
      const user = await setPassword(userId, password);

      // ====================================================================
      // REDIRECT BASED ON USER ROLE TO ROLE-SPECIFIC DASHBOARD
      // ====================================================================
      // Get user role to determine redirect destination
      console.log('[SetPassword] Password set successfully for user:', user.email, 'Role:', user.role);
      console.log(`[SetPassword] Redirecting to /${user.role}/dashboard`);

      // Redirect based on role to role-specific dashboard
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'parent':
          navigate('/parent/dashboard');
          break;
        case 'professional':
          navigate('/professional/dashboard');
          break;
        default:
          console.warn('[SetPassword] Unknown role:', user.role, '- defaulting to parent/dashboard');
          navigate('/parent/dashboard');
      }

      // Set token in environment
      // Token is automatically stored by auth.service.ts interceptor
      console.log('[SetPassword] Password set successfully, redirecting to dashboard');
    } catch (err) {
      // Handle password setup error
      if (err instanceof Error) {
        setError(err.message || 'Failed to set password');
      } else {
        setError('Failed to set password. Please try again.');
      }
    }
  };

  // ========================================================================
  // RENDER SET PASSWORD FORM
  // ========================================================================
  return (
    <div className="set-password-container">
      <div className="set-password-card">
        {/* Page Title */}
        <h1 className="set-password-title">Set Your Password</h1>

        {/* Explanation Text */}
        <p className="set-password-subtitle">
          Please set a secure password for your account
        </p>

        {/* Error Message Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Set Password Form */}
        <form onSubmit={handleSubmit} className="set-password-form">
          {/* New Password Input Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter new password (minimum 6 characters)"
              className="form-input"
              disabled={isLoading}
              required
            />
            <p className="password-hint">Minimum 6 characters</p>
          </div>

          {/* Confirm Password Input Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              placeholder="Confirm your password"
              className="form-input"
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        {/* Help Text */}
        <div className="help-text">
          <p>After setting your password, you will be automatically logged in.</p>
        </div>
      </div>
    </div>
  );
};
