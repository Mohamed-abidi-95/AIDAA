// ============================================================================
// USE AUTH HOOK
// ============================================================================
// Thin wrapper around the shared AuthContext.
// All components now share ONE auth state instance — fixes the re-login bug.

import { useAuthContext } from '../context/AuthContext';
import type { AuthContextValue } from '../context/AuthContext';

// Re-export the interface so existing imports keep working
export type AuthHookResult = AuthContextValue;

export const useAuth = (): AuthHookResult => useAuthContext();
