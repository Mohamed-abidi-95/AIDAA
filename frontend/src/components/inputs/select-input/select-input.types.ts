// ============================================================================
// SELECT INPUT TYPES
// ============================================================================
import React from 'react';

export type SelectTheme = 'orange' | 'green';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectInputProps {
  id?: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  theme?: SelectTheme;
  className?: string;
}

