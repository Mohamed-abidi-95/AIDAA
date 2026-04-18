// ============================================================================
// ALERT — Message d'erreur / succès / avertissement / info
// Remplace les blocs d'alerte inline répétés dans LoginPage, SignupPage…
// ============================================================================
import React from 'react';
import { AlertProps, AlertVariant } from './alert.types';

type AlertConfig = { wrapper: string; dotCls: string; icon: string };

const VARIANT_MAP: Record<AlertVariant, AlertConfig> = {
  error:   { wrapper: 'bg-red-50 border-l-4 border-red-500 text-red-700',         dotCls: 'bg-red-500',     icon: '✕' },
  success: { wrapper: 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700', dotCls: 'bg-emerald-500', icon: '✓' },
  warning: { wrapper: 'bg-amber-50 border-l-4 border-amber-400 text-amber-700',    dotCls: 'bg-amber-400',   icon: '!' },
  info:    { wrapper: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700',       dotCls: 'bg-blue-400',    icon: 'i' },
};

export const Alert: React.FC<AlertProps> = ({
  variant   = 'error',
  message,
  className = '',
}) => {
  const cfg = VARIANT_MAP[variant];
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium animate-[slideDown_0.25s_ease] ${cfg.wrapper} ${className}`}
      role="alert"
    >
      <span className={`w-5 h-5 rounded-full ${cfg.dotCls} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
        {cfg.icon}
      </span>
      {message}
    </div>
  );
};
