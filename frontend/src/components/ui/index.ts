// ============================================================================
// UI COMPONENTS — barrel export
// ============================================================================

// ── Existants (fichiers plats — rétrocompatibilité) ──────────────────────
export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';

export { StatCard } from './StatCard';
export type { StatCardProps, StatCardColor } from './StatCard';

export { ScoreBadge } from './ScoreBadge';
export type { ScoreBadgeProps } from './ScoreBadge';

export { ModalOverlay } from './ModalOverlay';
export type { ModalOverlayProps } from './ModalOverlay';

// ── Nouveaux sous-dossiers ────────────────────────────────────────────────
export { Button } from './button';
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonColor } from './button/button.types';

export { Card } from './card';
export type { CardProps } from './card/card.types';

export { Modal } from './modal';
export type { ModalProps } from './modal/modal.types';

export { Badge } from './badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './badge/badge.types';

export { Avatar } from './avatar';
export type { AvatarProps, AvatarSize, AvatarColor } from './avatar/avatar.types';
