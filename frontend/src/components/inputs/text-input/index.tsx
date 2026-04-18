// ============================================================================
// TEXT INPUT — Champ texte générique (input + textarea) avec icône et validation
// ============================================================================
import React from 'react';
import { TextInputProps } from './text-input.types';

const THEME_CLS: Record<string, string> = {
  orange: 'focus:ring-brand-orange/10 focus:border-brand-orange',
  green:  'focus:ring-brand-green/10  focus:border-brand-green',
};

export const TextInput: React.FC<TextInputProps> = ({
  id, name, type = 'text', value, onChange,
  placeholder, label, error,
  disabled = false, required = false,
  autoComplete, maxLength, min, max, rows = 3,
  leftIcon, rightElement, theme = 'orange',
  className = '', isValid,
}) => {
  const base = [
    'block w-full border rounded-xl text-slate-900 placeholder-slate-400 bg-white',
    'transition-all duration-200 focus:outline-none focus:ring-4',
    THEME_CLS[theme],
    error  ? 'border-red-400' : 'border-slate-200',
    disabled ? 'opacity-55 cursor-not-allowed' : '',
  ].join(' ');

  const padX = leftIcon ? 'pl-10 pr-9' : 'px-4';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className={leftIcon} />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={id} name={name}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            placeholder={placeholder} disabled={disabled} required={required}
            rows={rows} maxLength={maxLength}
            className={`${base} py-3 px-4 resize-none`}
          />
        ) : (
          <input
            id={id} name={name} type={type}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            placeholder={placeholder} disabled={disabled} required={required}
            autoComplete={autoComplete} maxLength={maxLength} min={min} max={max}
            className={`${base} py-3 ${padX}`}
          />
        )}

        {isValid && !error && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm pointer-events-none ${theme === 'green' ? 'text-brand-green' : 'text-brand-orange'}`}>
            ✓
          </span>
        )}

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default TextInput;

