// ============================================================================
// AUTH FORM TYPES
// ============================================================================
import React from 'react';

export interface AuthFormProps {
  onSubmit:   (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  /** Message d'erreur global (affiché en haut du formulaire) */
  error?:     string;
  children:   React.ReactNode;
  className?: string;
}

