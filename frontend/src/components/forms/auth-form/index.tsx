// ============================================================================
// AUTH FORM — Formulaire d'authentification (login, signup, reset)
// Gère l'affichage de l'erreur globale et le disabled pendant le chargement.
// ============================================================================
import React from 'react';
import { AuthFormProps } from './auth-form.types';

export const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  children,
  className = '',
}) => (
  <form onSubmit={onSubmit} className={`space-y-6 ${className}`} noValidate>
    {error && (
      <div
        className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl px-4 py-3 text-sm font-medium animate-[slideDown_0.25s_ease]"
        role="alert"
      >
        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          ✕
        </span>
        {error}
      </div>
    )}
    <fieldset disabled={isLoading} className="contents">
      {children}
    </fieldset>
  </form>
);
