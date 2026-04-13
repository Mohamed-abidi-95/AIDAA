// ============================================================================
// SPINNER — Composant de chargement réutilisable
// ============================================================================
// Remplace les 20+ occurrences inline de « animate-spin border-* » dans le projet.
//
// Variantes :
//   sm   → bouton (w-4 h-4,  border-2) — ex. « Envoi en cours… »
//   md   → section (w-8 h-8, border-4)
//   lg   → pleine page (w-10/12 h-10/12, border-4)

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Taille du spinner */
  size?: SpinnerSize;
  /** Couleur de l'arc animé — classe Tailwind complète, ex. 'border-t-brand-orange' */
  color?: string;
  /** Texte optionnel affiché sous le spinner */
  label?: string;
  /** Classes supplémentaires sur le conteneur */
  className?: string;
}

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-10 h-10 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'lg',
  color = 'border-t-brand-orange',
  label,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
    <span
      className={`rounded-full border-slate-200 ${color} animate-spin ${SIZE_MAP[size]}`}
    />
    {label && <p className="text-sm text-slate-500 font-medium">{label}</p>}
  </div>
);

export default Spinner;

