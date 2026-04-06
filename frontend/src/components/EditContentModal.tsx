// ============================================================================
// EDIT CONTENT MODAL
// ============================================================================
// Modal for editing existing content

import React, { useState, useEffect } from 'react';
import { ContentItem, ContentFormData } from '../types/content.types';

interface EditContentModalProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contentId: number, data: ContentFormData) => void;
  isLoading: boolean;
}

export const EditContentModal: React.FC<EditContentModalProps> = ({
  content,
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    type: 'video',
    description: '',
    category: '',
    categoryColor: '#f97316',
    emoji: '',
    duration: '',
    steps: 5,
    minutes: 15,
    emojiColor: '#d1fae5',
    ageGroup: '4-6',
    level: '1',
    file: null,
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        type: content.type as any,
        description: content.description || '',
        category: (content as any).category || '',
        categoryColor: (content as any).categoryColor || '#f97316',
        emoji: (content as any).emoji || '',
        duration: (content as any).duration || '',
        steps: (content as any).steps || 5,
        minutes: (content as any).minutes || 15,
        emojiColor: (content as any).emojiColor || '#d1fae5',
        ageGroup: '4-6',
        level: '1',
        file: null,
      });
    }
  }, [content, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    let finalValue: any = value;
    if (type === 'number') {
      finalValue = value ? parseInt(value) : undefined;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content) {
      onSave(content.id, formData);
    }
  };

  if (!isOpen) return null;

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
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 24px', color: '#1e3a5f' }}>Edit Content</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Type*
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="activity">Activity</option>
            </select>
            <small style={{ color: '#94a3b8' }}>Cannot change type</small>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Category Color
            </label>
            <input
              type="color"
              name="categoryColor"
              value={formData.categoryColor || '#f97316'}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Emoji
            </label>
            <input
              type="text"
              name="emoji"
              value={formData.emoji || ''}
              onChange={handleChange}
              maxLength={2}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {formData.type === 'video' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ''}
                onChange={handleChange}
                placeholder="e.g., 5 min"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {formData.type === 'activity' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Emoji Color
                </label>
                <input
                  type="color"
                  name="emojiColor"
                  value={formData.emojiColor || '#d1fae5'}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Steps
                </label>
                <input
                  type="number"
                  name="steps"
                  value={formData.steps || 5}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Minutes
                </label>
                <input
                  type="number"
                  name="minutes"
                  value={formData.minutes || 15}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div className="admin-premium__modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="admin-premium__primary-btn admin-premium__btn-block"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="admin-premium__small-btn admin-premium__btn-block"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

