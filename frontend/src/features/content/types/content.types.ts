// ============================================================================
// CONTENT TYPES - Centralized Type Definitions
// ============================================================================
// Shared types for content management across the app
// Used by: ChildDashboard, AdminPanel, content API

// ============================================================================
// VIDEO TYPE
// ============================================================================
export interface Video {
  id: number;
  emoji: string;
  title: string;
  category: string;
  categoryColor: string;
  duration: string;
  url?: string;
  description?: string;
  type: 'video';
}

// ============================================================================
// ACTIVITY TYPE
// ============================================================================
export interface Activity {
  id: number;
  emoji: string;
  emojiColor: string;
  title: string;
  steps: number;
  minutes: number;
  url?: string;
  description?: string;
  type: 'activity';
}

// ============================================================================
// AUDIO TYPE
// ============================================================================
export interface Audio {
  id: number;
  emoji: string;
  title: string;
  category: string;
  url?: string;
  description?: string;
  type: 'audio';
}

// ============================================================================
// UNIFIED CONTENT ITEM TYPE
// ============================================================================
export type ContentItem = Video | Activity | Audio;

// ============================================================================
// CONTENT FORM DATA
// ============================================================================
export interface ContentFormData {
  title: string;
  type: 'video' | 'activity' | 'audio';
  description?: string;
  category?: string;
  categoryColor?: string;
  emoji?: string;
  duration?: string; // for videos
  steps?: number; // for activities
  minutes?: number; // for activities
  emojiColor?: string; // for activities
  ageGroup?: string;
  level?: string | number;
  language?: string; // fr | ar | tn
  file?: File | null;
  url?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================
export interface ContentResponse {
  success: boolean;
  message: string;
  data: ContentItem | ContentItem[];
}

export interface ContentListResponse {
  success: boolean;
  message: string;
  data: ContentItem[];
  count?: number;
}

// ============================================================================
// USER TYPES
// ============================================================================
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'parent' | 'professional';
  is_active: number;
  created_at?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User | User[];
}

// ============================================================================
// CHILD TYPES
// ============================================================================
export interface Child {
  id: number;
  name: string;
  age: number;
  parent_id: number;
}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================
export interface ActivityLog {
  id: number;
  child_id: number;
  content_id: number;
  score: number;
  duration_seconds: number;
  action: string;
  date: string;
}


