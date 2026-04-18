// ============================================================================
// BUTTON TYPES
// ============================================================================
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize    = 'sm' | 'md' | 'lg';
export type ButtonColor   = 'orange' | 'green' | 'red' | 'slate';

export interface ButtonProps {
  children: React.ReactNode;
  variant?:     ButtonVariant;
  size?:        ButtonSize;
  color?:       ButtonColor;
  disabled?:    boolean;
  isLoading?:   boolean;
  loadingText?: string;
  type?:        'button' | 'submit' | 'reset';
  /** Classe FontAwesome, ex. 'fa-solid fa-check' */
  leftIcon?:    string;
  rightIcon?:   string;
  onClick?:     () => void;
  className?:   string;
}

