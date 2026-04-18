// ============================================================================
// FOOTER — Pied de page légal commun à toutes les pages d'auth
// ============================================================================
import React from 'react';
import { FooterProps } from './footer.types';

export const Footer: React.FC<FooterProps> = ({
  text      = 'AIDAA — Application de suivi pour enfants autistes',
  year      = 2026,
  className = '',
}) => (
  <p className={`text-center text-xs text-slate-400 ${className}`}>
    © {year} {text}
  </p>
);

export default Footer;

