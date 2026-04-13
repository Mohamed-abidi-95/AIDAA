// ============================================================================
// MODAL OVERLAY — Fond de modale réutilisable (backdrop + centrage)
// ============================================================================
// Remplace le pattern « fixed inset-0 bg-black/50 backdrop-blur-sm » dupliqué.
//
// Usage :
//   <ModalOverlay onClose={close} zIndex={1000}>
//     <div className="bg-white rounded-2xl ...">contenu</div>
//   </ModalOverlay>

import React from 'react';

export interface ModalOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  zIndex?: number;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  children,
  onClose,
  zIndex = 1000,
}) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    style={{ zIndex }}
    onClick={onClose}
  >
    <div onClick={(e) => e.stopPropagation()}>{children}</div>
  </div>
);

export default ModalOverlay;

