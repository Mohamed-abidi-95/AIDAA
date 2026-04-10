// ============================================================================
// AIDAA PROJECT - TYPE DEFINITIONS
// ============================================================================
// Central type definitions for all frontend models and API responses

// User role types
export type UserRole = 'admin' | 'parent' | 'professional';

// Activity status types
export type ActivityStatus = 'started' | 'completed';

// Content type categories
export type ContentType = 'video' | 'activity';

// ============================================================================
// USER TYPE
// ============================================================================
// Represents an authenticated user in the system
export interface User {
  // Unique user identifier from database
  id: number;
  // User's full name
  name: string;
  // User's email address (unique)
  email: string;
  // User's role in the system
  role: UserRole;
  // Account status (pending / approved / rejected)
  status?: 'pending' | 'approved' | 'rejected';
  // Account active flag
  is_active?: number;
  // ISO date string of when the user was created
  created_at?: string;
}

// ============================================================================
// CHILD TYPE
// ============================================================================
// Represents a child profile (associated with a parent user)
export interface Child {
  // Unique child identifier
  id: number;
  // Parent user ID (foreign key)
  parent_id: number;
  // Child's name
  name: string;
  // Child's age in years
  age: number;
}

// ============================================================================
// CONTENT TYPE
// ============================================================================
// Represents educational content (videos or activities)
export interface Content {
  // Unique content identifier
  id: number;
  // Content title/name
  title: string;
  // Type of content
  type: ContentType;
  // Content category (e.g., "Speech", "Motor Skills")
  category: string;
  // Target age group (e.g., "3-5", "6-8")
  age_group: string;
  // Difficulty level (1-5)
  level: number;
  // URL to content resource
  url: string;
  // Content description/summary
  description: string;
}

// ============================================================================
// ACTIVITY LOG TYPE
// ============================================================================
// Tracks child's progress on content activities
export interface ActivityLog {
  // Unique activity log entry identifier
  id: number;
  // Child who performed the activity
  child_id: number;
  // Content that was accessed
  content_id: number;
  // Current status of the activity
  status: ActivityStatus;
  // ISO date string of when activity was recorded
  date: string;
}

// ============================================================================
// NOTE TYPE
// ============================================================================
// Professional observations about a child
export interface Note {
  // Unique note identifier
  id: number;
  // Professional who created the note
  professional_id: number;
  // Child the note is about
  child_id: number;
  // Note text content
  content: string;
  // ISO date string of when note was created
  date: string;
}

// ============================================================================
// TELECONSULTATION TYPE
// ============================================================================
// Virtual meeting between parent and professional
export interface Teleconsultation {
  // Unique consultation identifier
  id: number;
  // Parent participant
  parent_id: number;
  // Professional participant
  professional_id: number;
  // ISO date/time of consultation
  date_time: string;
  // URL or link to join the meeting
  meeting_link: string;
  // Notes from the consultation
  notes: string;
}

// ============================================================================
// AUTH RESPONSE TYPES
// ============================================================================

// Unified login response — covers all cases:
//   1. First-time login  → mustSetPassword=true, userId set
//   2. Pending approval  → pendingApproval=true
//   3. Normal success    → data.token + data.user set
export interface LoginResponse {
  success: boolean;
  mustSetPassword?: boolean;
  pendingApproval?: boolean;
  userId?: number;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

// ============================================================================
// GENERIC API RESPONSE TYPE
// ============================================================================
// Standard API response wrapper for all endpoints
export interface ApiResponse<T> {
  // Indicates whether request was successful
  success: boolean;
  // Response data payload (generic type T)
  data: T;
  // Human-readable message
  message: string;
}

// ============================================================================
// SET PASSWORD REQUEST TYPE
// ============================================================================
// Request body for setting password on first-time account
export interface SetPasswordRequest {
  // User ID from login response
  userId: number;
  // New password to set
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  pendingApproval?: boolean;
  message: string;
  data?: {
    token?: string;
    user?: User;
    pendingApproval?: boolean;
  };
}

// ============================================================================
// AUTH CONTEXT TYPE
// ============================================================================
// Type for authentication context value
export interface AuthContextType {
  // Current authenticated user (null if not logged in)
  user: User | null;
  // JWT token (null if not logged in)
  token: string | null;
  // Whether user is currently authenticated
  isAuthenticated: boolean;
  // Login function
  login: (email: string, password: string) => Promise<LoginResponse>;
  // Set password function for first-time users
  setPassword: (userId: number, password: string) => Promise<void>;
  // Logout function
  logout: () => void;
}
