// ============================================================================
// FEEDBACK COMPONENTS — barrel export
// ============================================================================

// ── Existants (rétrocompatibilité) ────────────────────────────────────────
export { useToast } from './useToast';
export type { Toast } from './useToast';

export { ToastStack } from './ToastStack';
export type { ToastStackProps } from './ToastStack';

// ── Nouveaux sous-dossiers ────────────────────────────────────────────────
export { Alert } from './alert';
export type { AlertProps, AlertVariant } from './alert/alert.types';

export { Loader } from './loader';
export type { LoaderProps, LoaderSize } from './loader/loader.types';
