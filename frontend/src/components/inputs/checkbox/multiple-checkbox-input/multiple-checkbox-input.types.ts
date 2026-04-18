// ============================================================================
// MULTIPLE CHECKBOX INPUT TYPES
// ============================================================================
import { CheckboxOption } from '../checkbox.types';

export interface MultipleCheckboxInputProps {
  options: CheckboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  disabled?: boolean;
  theme?: 'orange' | 'green';
  className?: string;
}

