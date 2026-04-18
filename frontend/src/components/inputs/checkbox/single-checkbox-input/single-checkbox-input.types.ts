// ============================================================================
// SINGLE CHECKBOX INPUT TYPES
// ============================================================================

export interface SingleCheckboxInputProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  theme?: 'orange' | 'green';
}

