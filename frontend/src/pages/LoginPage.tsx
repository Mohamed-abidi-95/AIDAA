// ============================================================================
// LOGIN PAGE
// ============================================================================
// Page for user authentication with email and password

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css';

// ============================================================================
// LOGIN PAGE COMPONENT
// ============================================================================
// Simple and clean login form component
export const LoginPage = (): JSX.Element => {
  // ========================================================================
  // HOOKS
  // ========================================================================
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // ========================================================================
  // STATE
  // ========================================================================
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ========================================================================
  // HANDLE FORM SUBMIT
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Login] Attempting login with email:', email);

      // Call useAuth hook's login function - this updates both localStorage AND the hook state
      const response = await authLogin(email, password);

      console.log('[Login] Response:', response);

      // Handle first-time password setup
      if (response.mustSetPassword) {
        console.log('[Login] First-time login, redirecting to set-password');
        navigate('/set-password', { state: { userId: response.userId } });
        return;
      }

      // For successful login, get user from localStorage (auth.service saves it)
      const storedUserJson = localStorage.getItem('aidaa_user');
      if (!storedUserJson) {
        console.error('[Login] User not found in localStorage after login');
        setError('Login failed: User data not saved');
        return;
      }

      const user = JSON.parse(storedUserJson);
      console.log('[Login] User from localStorage:', user);
      console.log('[Login] User role:', user.role);

      // Small delay to ensure React state updates are applied
      // This ensures ProtectedRoute sees the updated auth state
      console.log('[Login] Waiting for state update...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect to role selection page for parents
      if (user.role === 'parent') {
        console.log('[Login] Parent login, redirecting to role selection');
        navigate('/role-selection');
      } else if (user.role === 'admin') {
        console.log('[Login] Admin login, redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else if (user.role === 'professional') {
        console.log('[Login] Professional login, redirecting to professional dashboard');
        navigate('/professional/dashboard');
      } else {
        console.warn('[Login] Unknown role:', user.role);
        navigate('/role-selection');
      }
    } catch (err) {
      console.error('[Login] Error:', err);

      // Extract error message
      let errorMessage = 'Login failed. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('Invalid')) {
          errorMessage = 'Invalid email or password';
        } else if (err.message.includes('Network') || err.message.includes('Cannot connect')) {
          errorMessage = 'Network error: Cannot connect to backend';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout: Backend not responding';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">AIDAA Login</h1>

        {/* Show error message if exists */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

       
      </div>
    </div>
  );
};
