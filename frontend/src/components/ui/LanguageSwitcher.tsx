// ============================================================================
// LANGUAGE SWITCHER — i18n dropdown (7 languages)
// ============================================================================
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';
export interface LanguageSwitcherProps {
  compact?: boolean;
  dropDirection?: 'down' | 'up';
  variant?: 'dark' | 'light';
  className?: string;
}

// Helper: flag image from flagcdn.com
const FlagImg = ({ code, label }: { code: string; label: string }) => (
  <img
    src={`https://flagcdn.com/20x15/${code}.png`}
    srcSet={`https://flagcdn.com/40x30/${code}.png 2x`}
    width={20} height={15}
    alt={label}
    className="rounded-sm object-cover shrink-0"
    style={{ display: 'inline-block' }}
  />
);

const LanguageSwitcher = ({
  compact = false,
  dropDirection = 'down',
  variant = 'dark',
  className = '',
}: LanguageSwitcherProps): React.ReactElement => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ??
    SUPPORTED_LANGUAGES[0];
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const btnCls =
    variant === 'light'
      ? 'flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-medium transition-all select-none cursor-pointer'
      : 'flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all select-none cursor-pointer';
  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={btnCls} aria-haspopup="listbox" aria-expanded={open}>
        <FlagImg code={current.countryCode} label={current.label} />
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div role="listbox" className={`absolute z-50 w-44 rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden right-0 ${dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const sel = lang.code === current.code;
            return (
              <button key={lang.code} type="button" role="option" aria-selected={sel} onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${sel ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                <FlagImg code={lang.countryCode} label={lang.label} />
                <span>{lang.label}</span>
                {sel && (
                  <svg className="ml-auto w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LanguageSwitcher;
