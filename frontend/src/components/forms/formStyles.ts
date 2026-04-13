// ============================================================================
// FORM STYLES — Classes Tailwind partagées pour les champs de formulaire
// ============================================================================
// Remplace les 3+ copies de « inputCls » et « labelCls » dans le projet.

/** Classe Tailwind standard pour un champ input/select/textarea — thème orange */
export const inputCls =
  'w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white text-[14px] focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all';

/** Variante verte (parent dashboard) */
export const inputClsGreen =
  'w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white text-[14px] focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green transition-all';

/** Label standard */
export const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

