// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?:   AlertVariant;
  message:    string;
  className?: string;
}

