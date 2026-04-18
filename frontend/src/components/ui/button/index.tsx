// ============================================================================
// BUTTON — Bouton polyvalent (primary / secondary / danger / ghost / outline)
// Unifie tous les boutons répétés dans AdminPanel, ParentDashboard, etc.
// ============================================================================
import React from 'react';
import { ButtonProps, ButtonVariant, ButtonSize, ButtonColor } from './button.types';

type VariantMap = Record<ButtonColor, Record<ButtonVariant, string>>;

const VARIANT_MAP: VariantMap = {
  orange: {
    primary:   'bg-brand-orange hover:bg-orange-700 text-white shadow-md shadow-brand-orange/20',
    secondary: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200',
    danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20',
    ghost:     'text-brand-orange hover:bg-orange-50',
    outline:   'bg-white border border-brand-orange text-brand-orange hover:bg-orange-50',
  },
  green: {
    primary:   'bg-brand-green hover:bg-emerald-700 text-white shadow-md shadow-brand-green/20',
    secondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    ghost:     'text-brand-green hover:bg-emerald-50',
    outline:   'bg-white border border-brand-green text-brand-green hover:bg-emerald-50',
  },
  red: {
    primary:   'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20',
    secondary: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
    ghost:     'text-red-500 hover:bg-red-50',
    outline:   'bg-white border border-red-200 text-red-500 hover:bg-red-50',
  },
  slate: {
    primary:   'bg-slate-800 hover:bg-slate-900 text-white',
    secondary: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    ghost:     'text-slate-600 hover:bg-slate-50',
    outline:   'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
  },
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-[15px] rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant   = 'primary',
  size      = 'md',
  color     = 'orange',
  disabled  = false,
  isLoading = false,
  loadingText,
  type      = 'button',
  leftIcon,
  rightIcon,
  onClick,
  className = '',
}) => {
  const colorVariant = VARIANT_MAP[color]?.[variant] ?? VARIANT_MAP.orange.primary;
  const sizeClass    = SIZE_MAP[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-200',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'hover:-translate-y-0.5',
        colorVariant,
        sizeClass,
        className,
      ].join(' ')}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {leftIcon  && <i className={leftIcon}  />}
          {children}
          {rightIcon && <i className={rightIcon} />}
        </>
      )}
    </button>
  );
};




