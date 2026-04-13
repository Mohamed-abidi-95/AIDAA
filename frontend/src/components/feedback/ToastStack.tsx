// ============================================================================
// TOAST STACK — Pile de toasts (rendu réutilisable)
// ============================================================================
// Remplace les 4 blocs « toasts.map(t => …) » dupliqués dans le projet.
//
// Usage :
//   const { toasts, add: toast, remove: removeToast } = useToast();
//   <ToastStack toasts={toasts} onRemove={removeToast} />

import React from 'react';
import type { Toast } from './useToast';

export interface ToastStackProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-slide-in ${
            t.type === 'success'
              ? 'bg-emerald-600'
              : 'bg-red-600'
          }`}
        >
          <i
            className={
              t.type === 'success'
                ? 'fa-solid fa-circle-check'
                : 'fa-solid fa-circle-xmark'
            }
          />
          <span className="flex-1">{t.msg}</span>
          <button
            onClick={() => onRemove(t.id)}
            className="opacity-70 hover:opacity-100 transition"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastStack;

