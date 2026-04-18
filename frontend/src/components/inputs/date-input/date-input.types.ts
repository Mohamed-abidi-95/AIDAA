// ============================================================================
// DATE INPUT TYPES
// ============================================================================
import React from 'react';

export interface DateInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  theme?: 'orange' | 'green';
  className?: string;
}

