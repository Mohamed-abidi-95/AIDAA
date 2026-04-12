// ============================================================================
// DELETE CONTENT MODAL — Tailwind CSS (cohérent avec AdminPanel)
// ============================================================================

import React from 'react';

interface DeleteContentModalProps {
  contentId: number | null;
  contentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteContentModal: React.FC<DeleteContentModalProps> = ({
  contentId, contentTitle, isOpen, onClose, onConfirm, isLoading,
}) => {
  if (!isOpen || !contentId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1001] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + header */}
        <div className="flex flex-col items-center text-center px-8 pt-8 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 text-3xl mb-4">
            <i className="fa-regular fa-trash-can" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Supprimer le contenu ?</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Êtes-vous sûr de vouloir supprimer{' '}
            <strong className="text-slate-700">{contentTitle}</strong> ?
          </p>
          <p className="text-slate-400 text-xs mt-2">Cette action est irréversible.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-8 pb-7">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {isLoading
              ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Suppression…</>
              : <><i className="fa-solid fa-trash" /> Supprimer</>
            }
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition"
          >
            <i className="fa-solid fa-xmark" /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

