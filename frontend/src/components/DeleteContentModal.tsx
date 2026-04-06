// ============================================================================
// DELETE CONTENT MODAL
// ============================================================================
// Confirmation modal for deleting content

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
  contentId,
  contentTitle,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !contentId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 16px', color: '#1e3a5f' }}>Delete Content?</h2>
          <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>
            Are you sure you want to delete <strong>{contentTitle}</strong>?
          </p>
          <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>
            This action cannot be undone.
          </p>
        </div>

        <div className="admin-premium__modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            className="admin-premium__small-btn admin-premium__small-btn--danger admin-premium__btn-block"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="admin-premium__small-btn admin-premium__btn-block"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

