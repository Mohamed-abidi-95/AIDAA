// ============================================================================
// DATE INPUT — Sélecteur de date/heure (datetime-local)
// ============================================================================
import React from 'react';
import { DateInputProps } from './date-input.types';

const THEME_CLS: Record<string, string> = {
  orange: 'focus:ring-brand-orange/10 focus:border-brand-orange',
  green:  'focus:ring-brand-green/10  focus:border-brand-green',
};

export const DateInput: React.FC<DateInputProps> = ({
  id, name, value, onChange, label,
  min, max, required = false, disabled = false,
  theme = 'orange', className = '',
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input
      id={id} name={name}
      type="datetime-local"
      value={value} onChange={onChange}
      min={min} max={max}
      required={required} disabled={disabled}
      className={[
        'w-full px-4 py-3 border border-slate-200 rounded-xl',
        'text-slate-900 bg-white transition-all',
        'focus:outline-none focus:ring-4',
        THEME_CLS[theme],
        disabled ? 'opacity-55 cursor-not-allowed' : '',
      ].join(' ')}
    />
  </div>
);

export default DateInput;

