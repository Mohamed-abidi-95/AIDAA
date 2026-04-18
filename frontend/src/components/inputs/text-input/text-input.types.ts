// ============================================================================
// TEXT INPUT TYPES
// ============================================================================
import React from 'react';

export type TextInputTheme = 'orange' | 'green';
export type TextInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'textarea';

export interface TextInputProps {
  id?: string;
  name?: string;
  type?: TextInputType;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  rows?: number;
  leftIcon?: string;
  rightElement?: React.ReactNode;
  theme?: TextInputTheme;
  className?: string;
  /** Affiche un ✓ quand le champ est valide */
  isValid?: boolean;
}

