// ============================================================================
// MODAL — Fond noir + conteneur centré (version enrichie de ModalOverlay)
// ============================================================================
import React from 'react';
import { ModalProps } from './modal.types';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  zIndex   = 1000,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};




