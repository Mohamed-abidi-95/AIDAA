// ============================================================================
// AVATAR — Cercle avec initiale de l'utilisateur
// Remplace les dizaines de div d'initiales codées en dur dans le projet.
// ============================================================================
import React from 'react';
import { AvatarProps, AvatarSize, AvatarColor } from './avatar.types';

const SIZE_MAP: Record<AvatarSize, string> = {
  sm: 'w-7  h-7  text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const COLOR_MAP: Record<AvatarColor, string> = {
  orange: 'bg-brand-orange text-white',
  green:  'bg-brand-green  text-white',
  blue:   'bg-blue-500     text-white',
  slate:  'bg-slate-300    text-slate-700',
  white:  'bg-white        text-brand-green',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size      = 'md',
  color     = 'orange',
  className = '',
}) => (
  <div
    className={[
      'rounded-full flex items-center justify-center font-bold shrink-0',
      SIZE_MAP[size],
      COLOR_MAP[color],
      className,
    ].join(' ')}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

export default Avatar;

