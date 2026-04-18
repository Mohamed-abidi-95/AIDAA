// ============================================================================
// CARD TYPES
// ============================================================================
import React from 'react';

export interface CardProps {
  title?:     string;
  badge?:     React.ReactNode;
  children:   React.ReactNode;
  className?: string;
  /** Padding interne du corps (défaut: p-7) */
  padding?:   string;
}

