// ============================================================================
// PROFILE FORM TYPES
// ============================================================================
import React from 'react';

export interface ProfileFormProps {
  onSubmit:      (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?:    boolean;
  submitLabel?:  string;
  /** Couleur du bouton submit */
  color?:        'orange' | 'green';
  children:      React.ReactNode;
  className?:    string;
}

