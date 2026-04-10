// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================
// Service for handling auth-related API calls and localStorage management

import api from '../../../lib/api';
import type { User, LoginResponse, SetPasswordRequest, ApiResponse, SignupResponse, SignupRequest } from '../../../types';

// ============================================================================
// LOGIN FUNCTION
// ============================================================================
// Handles user login with email and password
// Returns either mustSetPassword flag or user token
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Send POST request to backend login endpoint
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    console.log('[auth.service] Login response:', response.data);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = response.data as any;

    // Handle first-time password setup case
    if (data.mustSetPassword) {
      console.log('[auth.service] First-time login, mustSetPassword = true');
      return data;
    }

    // Handle pending approval (shouldn't reach here — backend returns 403 which axios throws)
    // But handle it just in case
    if (data.pendingApproval) {
      return { success: false, pendingApproval: true, message: data.message || 'Pending approval' };
    }

    // Handle successful login with existing password
    if (data.success && data.data?.token && data.data?.user) {
      console.log('[auth.service] Login successful, saving token and user');
      console.log('[auth.service] User role:', data.data.user.role);

      // Save JWT token to localStorage for future requests
      localStorage.setItem('aidaa_token', data.data.token);

      // Save user info to localStorage (without password for security)
      localStorage.setItem('aidaa_user', JSON.stringify(data.data.user));

      console.log('[auth.service] User saved to localStorage:', {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
      });

      // Return login response
      return data;
    }

    // If response doesn't match expected format, throw error
    console.error('[auth.service] Invalid response format:', data);
    throw new Error('Invalid login response format from server');
  } catch (error) {
    // Log the error for debugging
    console.error('[auth.service] Login error:', error);

    // Handle 403 pending approval (axios throws on 403)
    if ((error as any).response?.status === 403) {
      const respData = (error as any).response?.data;
      if (respData?.pendingApproval) {
        return { success: false, pendingApproval: true, message: respData.message };
      }
      throw new Error(respData?.message || 'Account inactive. Contact administrator.');
    }

    // If API request fails, enhance error message
    if (error instanceof Error) {
      // Check for network errors
      if (error.message.includes('Network') || error.message.includes('ECONNREFUSED')) {
        const msg = 'Network error: Cannot connect to backend. Make sure backend is running on port 5000';
        console.error('[auth.service]', msg);
        throw new Error(msg);
      }
      // Check for timeout
      if (error.message.includes('timeout')) {
        const msg = 'Request timeout: Backend is not responding. Please check backend server';
        console.error('[auth.service]', msg);
        throw new Error(msg);
      }
      // Check for 401 unauthorized
      if (error.message.includes('401')) {
        const msg = 'Invalid email or password';
        console.error('[auth.service]', msg);
        throw new Error(msg);
      }
    }

    // Throw error for caller to handle
    throw error;
  }
};

// ============================================================================
// SET PASSWORD FUNCTION
// ============================================================================
// Sets password for first-time users (parents with no password set)
// Called after user receives email and clicks set-password link
export const setPassword = async (userId: number, password: string): Promise<User> => {
  // Send POST request to backend set-password endpoint
  const response = await api.post<ApiResponse<{ token: string; user: User }>>(
    '/api/auth/set-password',
    {
      userId,
      password,
    } as SetPasswordRequest
  );

  // Get response data
  const data = response.data;

  // Verify request was successful
  if (!data.success || !data.data?.token || !data.data?.user) {
    throw new Error('Failed to set password');
  }

  // Save JWT token to localStorage
  localStorage.setItem('aidaa_token', data.data.token);

  // Save user info to localStorage
  localStorage.setItem('aidaa_user', JSON.stringify(data.data.user));

  // Return user object (caller will handle redirect)
  return data.data.user;
};

// ============================================================================
// SIGNUP FUNCTION
// ============================================================================
export const signup = async (payload: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await api.post<SignupResponse>('/api/auth/signup', payload);
    const data = response.data;

    // Parent pending approval — no token issued
    if (data.pendingApproval || data.data?.pendingApproval) {
      return { success: true, pendingApproval: true, message: data.message };
    }

    if (!data.success || !data.data?.token || !data.data?.user) {
      throw new Error(data.message || 'Signup failed');
    }

    localStorage.setItem('aidaa_token', data.data.token!);
    localStorage.setItem('aidaa_user', JSON.stringify(data.data.user));
    return data;
  } catch (error: any) {
    // If the error has a response (e.g. 409 conflict), extract message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// ============================================================================
// LOGOUT FUNCTION
// ============================================================================
// Clears authentication data from localStorage
// Should be called when user logs out
export const logout = (redirectToLogin = true): void => {
  // Remove JWT token from localStorage
  localStorage.removeItem('aidaa_token');

  // Remove user information from localStorage
  localStorage.removeItem('aidaa_user');
  localStorage.removeItem('selected_child_id');

  if (redirectToLogin) {
    window.location.assign('/login');
  }
};

// ============================================================================
// GET CURRENT USER FUNCTION
// ============================================================================
// Retrieves the currently authenticated user from localStorage
// Returns null if no user is logged in
export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('aidaa_user');
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch {
    localStorage.removeItem('aidaa_user');
    return null;
  }
};

// ============================================================================
// GET CURRENT TOKEN FUNCTION
// ============================================================================
// Retrieves the JWT token from localStorage
// Returns null if no token exists
export const getCurrentToken = (): string | null => {
  // Get and return token from localStorage
  return localStorage.getItem('aidaa_token');
};
