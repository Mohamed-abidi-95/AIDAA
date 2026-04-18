// ============================================================================
// HEADER TYPES
// ============================================================================
import React from 'react';

export interface HeaderProps {
  /** Section breadcrumb gauche (ex. 'Administration') */
  sectionLabel: string;
  /** Titre de la vue courante (ex. 'Bibliothèque') */
  title:        string;
  /** Slot droit — sélecteur, cloche notifs, etc. */
  children?:    React.ReactNode;
}

