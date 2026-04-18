// ============================================================================
// SELECT INPUT — Dropdown générique avec thème orange/green
// ============================================================================
import React from 'react';
import { SelectInputProps } from './select-input.types';

const THEME_CLS: Record<string, string> = {
  orange: 'focus:ring-brand-orange/10 focus:border-brand-orange',
  green:  'focus:ring-brand-green/10  focus:border-brand-green',
};

export const SelectInput: React.FC<SelectInputProps> = ({
  id, name, value, onChange, options,
  label, placeholder, error,
  disabled = false, required = false,
  theme = 'orange', className = '',
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <select
      id={id} name={name} value={value} onChange={onChange}
      disabled={disabled} required={required}
      className={[
        'w-full px-4 py-3 border rounded-xl text-slate-900 bg-white',
        'transition-all focus:outline-none focus:ring-4',
        THEME_CLS[theme],
        error    ? 'border-red-400'   : 'border-slate-200',
        disabled ? 'opacity-55 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

export default SelectInput;

