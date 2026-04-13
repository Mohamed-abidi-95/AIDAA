// ============================================================================
// USE TOAST — Hook de notifications toast réutilisable
// ============================================================================
// Remplace les 4 copies identiques dans AdminPanel, ParentDashboard,
// ProfessionalPage, TeleconsultationList.

import { useState, useCallback } from 'react';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  msg: string;
}

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, add, remove };
};

export default useToast;

