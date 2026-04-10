// ============================================================================
// AXIOS API SERVICE
// ============================================================================
// Centralized API client with interceptors for authentication and error handling

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// CREATE AXIOS INSTANCE
// ============================================================================
// Initialize axios with base configuration
const api: AxiosInstance = axios.create({
  // In development: use relative paths to leverage Vite proxy
  // In production: use the full URL from environment
  baseURL: import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL || 'http://localhost:5000',
  // Include credentials in requests (for cookies if needed)
  withCredentials: false,
  // Default request timeout
  timeout: 30000,
  // Always set content type
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================
// Adds JWT token to every request that requires authentication
api.interceptors.request.use(
  (config) => {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('aidaa_token');

    // If token exists, add to Authorization header
    if (token) {
      // Set Bearer token in Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    // If request setup fails, reject with error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================
// Handles global error responses, especially 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }

    // If response is successful, pass through unchanged
    return response;
  },
  (error) => {
    // Log error details
    console.error('[API Error]', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
    });

    // Check if error response exists and status is 401 Unauthorized
    // IMPORTANT: Don't redirect on /login endpoint (it's a public endpoint)
    if (error.response?.status === 401) {
      // Only redirect if we're NOT on the login page already
      // and NOT calling the login endpoint
      const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
      const isSetPasswordEndpoint = error.config?.url?.includes('/api/auth/set-password');

      if (!isLoginEndpoint && !isSetPasswordEndpoint) {
        // Clear authentication data from localStorage
        localStorage.removeItem('aidaa_token');
        localStorage.removeItem('aidaa_user');

        // Redirect to login page using window.location only for expired tokens
        // on protected routes, not during login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Reject with the error for handling in the calling code
    return Promise.reject(error);
  }
);

// Export the configured axios instance for use throughout the app
export default api;

