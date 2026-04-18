// ============================================================================
// BADGE — Étiquette colorée (statut, rôle, catégorie…)
// Unifie les dizaines de span inline répétés dans AdminPanel, ParentDashboard…
// ============================================================================
import React from 'react';
import { BadgeProps, BadgeVariant } from './badge.types';

const VARIANT_MAP: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100   text-amber-700',
  danger:  'bg-red-100     text-red-700',
  info:    'bg-blue-100    text-blue-700',
  neutral: 'bg-slate-100   text-slate-600',
  orange:  'bg-orange-100  text-orange-700',
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant   = 'neutral',
  size      = 'md',
  icon,
  className = '',
}) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 rounded-full font-semibold',
      VARIANT_MAP[variant],
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
      className,
    ].join(' ')}
  >
    {icon && <i className={`${icon} text-[10px]`} />}
    {label}
  </span>
);




