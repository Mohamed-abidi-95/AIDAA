// ============================================================================
// FORMS — barrel export
// ============================================================================

// ── Existant (rétrocompatibilité) ─────────────────────────────────────────
export { inputCls, inputClsGreen, labelCls } from './formStyles';

// ── Nouveaux sous-dossiers ────────────────────────────────────────────────
export { AuthForm } from './auth-form';
export type { AuthFormProps } from './auth-form/auth-form.types';

export { ProfileForm } from './profile-form';
export type { ProfileFormProps } from './profile-form/profile-form.types';
