// ============================================================================
// HEADER — Barre de titre en haut des dashboards
// Extrait de AdminPanel.tsx, ParentDashboard.tsx, ProfessionalPage.tsx
// ============================================================================
import React from 'react';
import { HeaderProps } from './header.types';

export const Header: React.FC<HeaderProps> = ({ sectionLabel, title, children }) => (
  <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
    <div className="flex items-baseline gap-2">
      <span className="text-sm text-slate-500 font-medium">{sectionLabel} /</span>
      <span className="text-xl font-bold text-slate-900">{title}</span>
    </div>
    {children && (
      <div className="flex items-center gap-3">{children}</div>
    )}
  </header>
);

export default Header;

