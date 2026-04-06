// ============================================================================
// CONTENT CARD COMPONENT
// ============================================================================
// Displays a single content item with edit/delete buttons

import React from 'react';
import { ContentItem } from '../types/content.types';

const BACKEND_BASE_URL = 'http://localhost:5000';

const getMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface ContentCardProps {
  content: ContentItem;
  onEdit: (content: ContentItem) => void;
  onDelete: (content: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onEdit,
  onDelete,
}) => {
  console.log('[ContentCard] Rendering with content:', content);
  const mediaUrl = getMediaUrl((content as any).url);
  const isVideo = content.type === 'video' && !!mediaUrl;

  return (
    <div className="admin-content-card">
      {/* Icon */}
      <div className="admin-content-card__icon" style={{ fontSize: '32px' }}>
        {content.type === 'video' && '🎬'}
        {content.type === 'audio' && '🎵'}
        {content.type === 'activity' && '🎮'}
      </div>

      {/* Content Info */}
      <div className="admin-content-card__body">
        {isVideo && (
          <video
            className="admin-content-card__preview"
            src={mediaUrl}
            controls
            preload="metadata"
          />
        )}
        <h3 className="admin-content-card__title">{content.title}</h3>
        <p className="admin-content-card__desc">{content.description || 'Sans description'}</p>
        <div className="admin-content-card__meta">
          <span className="admin-content-card__chip">📁 {content.type}</span>
          {(content as any).category && <span className="admin-content-card__chip">🏷️ {(content as any).category}</span>}
          {(content as any).duration && <span className="admin-content-card__chip">⏱️ {(content as any).duration}</span>}
          {(content as any).steps && <span className="admin-content-card__chip">📋 {(content as any).steps} étapes</span>}
          {(content as any).minutes && <span className="admin-content-card__chip">⏰ {(content as any).minutes} min</span>}
        </div>

        {/* Action Buttons */}
        <div className="admin-content-card__actions">
          <button
            className="admin-content-card__btn admin-content-card__btn--edit"
            onClick={() => {
              console.log('[ContentCard] Edit clicked for content:', content.id);
              onEdit(content);
            }}
          >
            ✏️ Edit
          </button>
          <button
            className="admin-content-card__btn admin-content-card__btn--delete"
            onClick={() => {
              console.log('[ContentCard] Delete clicked for content:', content.id);
              onDelete(content);
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};
