// ============================================================================
// CONTENT CARD — Tailwind CSS + FontAwesome (cohérent avec AdminPanel)
// ============================================================================

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

const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  video:    { icon: 'fa-solid fa-video',   label: 'Vidéo'    },
  audio:    { icon: 'fa-solid fa-music',   label: 'Audio'    },
  activity: { icon: 'fa-solid fa-gamepad', label: 'Activité' },
};

export const ContentCard: React.FC<ContentCardProps> = ({ content, onEdit, onDelete }) => {
  const mediaUrl  = getMediaUrl((content as any).url);
  const isVideo   = content.type === 'video' && !!mediaUrl;
  const cfg       = TYPE_CONFIG[content.type] ?? TYPE_CONFIG.video;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

      {/* ── Bande type ── */}
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{ background: 'linear-gradient(135deg,#9E4000,#f97316)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <i className={`${cfg.icon} text-white text-sm`} />
        </div>
        <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest">{cfg.label}</span>
        {(content as any).emoji && (
          <span className="ml-auto text-lg leading-none">{(content as any).emoji}</span>
        )}
      </div>

      {/* ── Corps ── */}
      <div className="flex flex-col gap-3 p-5 flex-1">

        {/* Aperçu vidéo */}
        {isVideo && (
          <video
            className="w-full rounded-xl bg-slate-900 max-h-44 object-cover"
            src={mediaUrl!}
            controls
            preload="metadata"
          />
        )}

        {/* Titre */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{content.title}</h3>

        {/* Description */}
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
          {content.description || 'Sans description'}
        </p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          {(content as any).category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11.5px] font-semibold">
              <i className="fa-solid fa-tag text-[10px]" /> {(content as any).category}
            </span>
          )}
          {(content as any).duration && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11.5px] font-semibold">
              <i className="fa-regular fa-clock text-[10px]" /> {(content as any).duration}
            </span>
          )}
          {(content as any).steps && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11.5px] font-semibold">
              <i className="fa-solid fa-list-ol text-[10px]" /> {(content as any).steps} étapes
            </span>
          )}
          {(content as any).minutes && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11.5px] font-semibold">
              <i className="fa-regular fa-hourglass-half text-[10px]" /> {(content as any).minutes} min
            </span>
          )}
          {(content as any).age_group && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11.5px] font-semibold">
              <i className="fa-solid fa-child text-[10px]" /> {(content as any).age_group} ans
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={() => onEdit(content)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white text-[12.5px] font-bold shadow-sm shadow-brand-orange/20 transition-all hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-pen text-xs" /> Modifier
          </button>
          <button
            onClick={() => onDelete(content)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[12.5px] font-bold shadow-sm shadow-red-500/20 transition-all hover:-translate-y-0.5"
          >
            <i className="fa-regular fa-trash-can text-xs" /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
