// ============================================================================
// BADGE TYPES
// ============================================================================

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'orange';
export type BadgeSize    = 'sm' | 'md';

export interface BadgeProps {
  label:       string;
  variant?:    BadgeVariant;
  size?:       BadgeSize;
  /** Classe FontAwesome, ex. 'fa-solid fa-check' */
  icon?:       string;
  className?:  string;
}

