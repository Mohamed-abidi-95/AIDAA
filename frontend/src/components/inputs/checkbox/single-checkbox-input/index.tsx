// ============================================================================
// SINGLE CHECKBOX INPUT
// ============================================================================
import React from 'react';
import { SingleCheckboxInputProps } from './single-checkbox-input.types';

export const SingleCheckboxInput: React.FC<SingleCheckboxInputProps> = ({
  id, name, checked, onChange, label,
  description, disabled = false, theme = 'orange',
}) => {
  const accent = theme === 'green' ? 'accent-emerald-600' : 'accent-orange-500';
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-55 cursor-not-allowed' : ''}`}
    >
      <input
        id={id} name={name}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className={`mt-0.5 w-4 h-4 rounded border-slate-300 ${accent}`}
      />
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
    </label>
  );
};
