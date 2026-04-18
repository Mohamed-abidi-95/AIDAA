// ============================================================================
// MULTIPLE CHECKBOX INPUT — Groupe de cases à cocher
// ============================================================================
import React from 'react';
import { MultipleCheckboxInputProps } from './multiple-checkbox-input.types';

export const MultipleCheckboxInput: React.FC<MultipleCheckboxInputProps> = ({
  options, selected, onChange, label,
  disabled = false, theme = 'orange', className = '',
}) => {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };
  const accent = theme === 'green' ? 'accent-emerald-600' : 'accent-orange-500';

  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      )}
      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-55' : ''}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              disabled={disabled}
              className={`mt-0.5 w-4 h-4 rounded border-slate-300 ${accent}`}
            />
            <div>
              <p className="text-sm font-medium text-slate-700">{opt.label}</p>
              {opt.description && (
                <p className="text-xs text-slate-400">{opt.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
