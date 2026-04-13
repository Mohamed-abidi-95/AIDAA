// ============================================================================
// SECTION — Conteneur de section (carte blanche avec titre + badge)
// ============================================================================
// Unifie les 3 copies dans AdminPanel, ParentDashboard, ProfessionalPage.

import React from 'react';

export interface SectionProps {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, badge, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 ${className}`}>
    <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {badge}
    </div>
    <div className="p-7">{children}</div>
  </div>
);

export default Section;

