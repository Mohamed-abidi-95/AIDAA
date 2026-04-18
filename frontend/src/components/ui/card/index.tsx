// ============================================================================
// CARD — Conteneur blanc avec titre + badge (équivalent canonique de Section)
// ============================================================================
import React from 'react';
import { CardProps } from './card.types';

export const Card: React.FC<CardProps> = ({
  title,
  badge,
  children,
  className = '',
  padding   = 'p-7',
}) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {badge}
      </div>
    )}
    <div className={padding}>{children}</div>
  </div>
);




