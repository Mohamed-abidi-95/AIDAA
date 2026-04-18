// ============================================================================
// PROFILE FORM — Formulaire d'édition de profil / données métier
// ============================================================================
import React from 'react';
import { ProfileFormProps } from './profile-form.types';

const COLOR_CLS = {
  orange: 'bg-brand-orange hover:bg-orange-700 shadow-brand-orange/20',
  green:  'bg-brand-green  hover:bg-emerald-700 shadow-brand-green/20',
};

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSubmit,
  isLoading   = false,
  submitLabel = 'Enregistrer',
  color       = 'orange',
  children,
  className   = '',
}) => (
  <form onSubmit={onSubmit} className={`space-y-5 ${className}`}>
    {children}
    <button
      type="submit"
      disabled={isLoading}
      className={[
        'flex items-center gap-2 text-white font-semibold px-6 py-3',
        'rounded-xl shadow-md transition-all disabled:opacity-60',
        COLOR_CLS[color],
      ].join(' ')}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Enregistrement…
        </>
      ) : (
        <>
          <i className="fa-solid fa-check" /> {submitLabel}
        </>
      )}
    </button>
  </form>
);
