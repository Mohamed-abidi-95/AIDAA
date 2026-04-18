// ============================================================================
// AVATAR TYPES
// ============================================================================

export type AvatarSize  = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarColor = 'orange' | 'green' | 'blue' | 'slate' | 'white';

export interface AvatarProps {
  /** Texte source pour l'initiale (ex. nom de l'utilisateur) */
  name:        string;
  size?:       AvatarSize;
  color?:      AvatarColor;
  className?:  string;
}

