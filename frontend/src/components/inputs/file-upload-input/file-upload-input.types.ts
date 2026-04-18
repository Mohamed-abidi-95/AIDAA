// ============================================================================
// FILE UPLOAD INPUT TYPES
// ============================================================================

export interface FileUploadInputProps {
  accept?: string;
  maxSizeMb?: number;
  fileName?: string;
  onChange: (file: File) => void;
  label?: string;
  hint?: string;
  required?: boolean;
  theme?: 'orange' | 'green';
}

