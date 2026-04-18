// ============================================================================
// MODAL TYPES
// ============================================================================
import React from 'react';

export interface ModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  children:    React.ReactNode;
  zIndex?:     number;
  /** Classe Tailwind de largeur max, ex. 'max-w-lg' */
  maxWidth?:   string;
}

