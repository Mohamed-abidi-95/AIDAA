// ============================================================================
// STAT CARD — Carte de statistique réutilisable
// ============================================================================
// Unifie les 3 variantes (AdminPanel, ParentDashboard, ProfessionalPage).
//
// Usage :
//   <StatCard icon="fa-solid fa-gamepad" value={12} label="Sessions" />
//   <StatCard icon="fa-solid fa-users" value={5} label="Utilisateurs" color="blue" onClick={...} />

import React from 'react';

export type StatCardColor = 'orange' | 'blue' | 'green' | 'gray';

export interface StatCardProps {
  /** FontAwesome icon class, ex. 'fa-solid fa-gamepad' */
  icon: string;
  /** Valeur affichée (nombre ou texte) */
  value: number | string;
  /** Libellé sous la valeur */
  label: string;
  /** Sous-texte optionnel (ex. détail) */
  sub?: string;
  /** Couleur d'accent — thème du fond icône */
  color?: StatCardColor;
  /** Si fourni, la carte devient cliquable */
  onClick?: () => void;
}

const COLOR_MAP: Record<StatCardColor, string> = {
  orange: 'bg-orange-100 text-brand-orange',
  blue:   'bg-blue-100 text-blue-600',
  green:  'bg-emerald-100 text-emerald-600',
  gray:   'bg-slate-100 text-slate-500',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  sub,
  color = 'orange',
  onClick,
}) => {
  const bg = COLOR_MAP[color];
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-xl shrink-0 ${bg}`}>
        <i className={icon} />
      </div>
      <div>
        <p className="text-[28px] font-bold leading-none text-slate-900 mb-1">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;

