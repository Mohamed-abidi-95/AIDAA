// ============================================================================
// CONTENT CARD COMPONENT
// ============================================================================
// Displays a single content item with edit/delete buttons

import React from 'react';
import { ContentItem } from '../../content/types/content.types';

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
  const mediaUrl = getMediaUrl((content as any).url);
  const isVideo = content.type === 'video' && !!mediaUrl;

  const typeEmoji = content.type === 'video' ? '🎬' : content.type === 'audio' ? '🎵' : '🎮';
  const typeLabel = content.type === 'video' ? 'Vidéo' : content.type === 'audio' ? 'Audio' : 'Activité';

  return (
    <div className="admin-content-card">
      {/* Bande type en haut */}
      <div className="admin-content-card__icon" data-type={typeLabel}>
        <span style={{ fontSize: 24 }}>{typeEmoji}</span>
      </div>

      {/* Corps */}
      <div className="admin-content-card__body">
        {isVideo && (
          <video
            className="admin-content-card__preview"
            src={mediaUrl!}
            controls
            preload="metadata"
          />
        )}
        <h3 className="admin-content-card__title">{content.title}</h3>
        <p className="admin-content-card__desc">{content.description || 'Sans description'}</p>
        <div className="admin-content-card__meta">
          {(content as any).category && <span className="admin-content-card__chip">🏷️ {(content as any).category}</span>}
          {(content as any).duration && <span className="admin-content-card__chip">⏱️ {(content as any).duration}</span>}
          {(content as any).steps && <span className="admin-content-card__chip">📋 {(content as any).steps} étapes</span>}
          {(content as any).minutes && <span className="admin-content-card__chip">⏰ {(content as any).minutes} min</span>}
          {(content as any).age_group && <span className="admin-content-card__chip">👦 {(content as any).age_group} ans</span>}
        </div>

        <div className="admin-content-card__actions">
          <button
            className="admin-content-card__btn admin-content-card__btn--edit"
            onClick={() => onEdit(content)}
          >
            ✏️ Modifier
          </button>
          <button
            className="admin-content-card__btn admin-content-card__btn--delete"
            onClick={() => onDelete(content)}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

