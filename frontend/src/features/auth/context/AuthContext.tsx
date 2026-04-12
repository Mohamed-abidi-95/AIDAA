// ============================================================================
// AUTH CONTEXT — Single shared auth state for the entire app
// ============================================================================
// Fixes the "reload without access" bug caused by:
//   1. Each useAuth() call creating an independent state instance
//   2. window.location.assign() causing hard reloads on logout

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, LoginResponse, SignupRequest, SignupResponse } from '../../../types';
import * as authService from '../services/auth.service';

// ── Context shape ────────────────────────────────────────────────────────────
export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** true once localStorage has been read on first mount — prevents premature redirects */
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  setPassword: (userId: number, password: string) => Promise<User>;
  signup: (payload: SignupRequest) => Promise<SignupResponse>;
  logout: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
// Must live INSIDE <BrowserRouter> so useNavigate is available
export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const navigate = useNavigate();

  const [user,          setUser]          = useState<User | null>(null);
  const [token,         setToken]         = useState<string | null>(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Read persisted auth on first mount ─────────────────────────────────────
  useEffect(() => {
    const storedUser  = authService.getCurrentUser();
    const storedToken = authService.getCurrentToken();
    if (storedUser)  setUser(storedUser);
    if (storedToken) setToken(storedToken);
    setIsInitialized(true);   // guards now know we're ready
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (r.mustSetPassword || r.pendingApproval) return response;
      if (r.data?.token && r.data?.user) {
        setToken(r.data.token);
        setUser(r.data.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Set password (first-time users) ────────────────────────────────────────
  const handleSetPassword = useCallback(async (userId: number, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const u = await authService.setPassword(userId, password);
      setUser(u);
      const t = authService.getCurrentToken();
      if (t) setToken(t);
      return u;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Signup ──────────────────────────────────────────────────────────────────
  const handleSignup = useCallback(async (payload: SignupRequest): Promise<SignupResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.signup(payload);
      if (response.pendingApproval) return response;
      if (response.data?.token && response.data?.user) {
        setToken(response.data.token!);
        setUser(response.data.user!);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout — client-side navigation, NO hard reload ────────────────────────
  const handleLogout = useCallback((): void => {
    authService.logout(false);   // clears localStorage only
    setUser(null);
    setToken(null);
    navigate('/login');          // soft navigation — keeps React state clean
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      isInitialized,
      login:       handleLogin,
      setPassword: handleSetPassword,
      signup:      handleSignup,
      logout:      handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── useAuthContext hook ───────────────────────────────────────────────────────
export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
};

