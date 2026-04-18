// ============================================================================
// SIDEBAR TYPES
// ============================================================================
import React from 'react';

export interface NavItem {
  key:     string;
  fa:      string;
  label:   string;
  /** Badge numérique (ex. nb de demandes en attente) */
  badge?:  number;
}

export type SidebarTheme = 'orange' | 'green';

export interface SidebarProps {
  title:       string;
  subtitle:    string;
  navItems:    NavItem[];
  activeKey:   string;
  onNavigate:  (key: string) => void;
  userInitial: string;
  userName:    string;
  userRole:    string;
  onLogout:    () => void;
  theme?:      SidebarTheme;
  /** Slot libre (ex. liste participants, sous-nav) */
  children?:   React.ReactNode;
}

