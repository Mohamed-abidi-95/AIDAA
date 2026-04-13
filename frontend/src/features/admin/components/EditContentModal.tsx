// ============================================================================
// EDIT CONTENT MODAL — Tailwind CSS (cohérent avec AdminPanel)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { ContentItem, ContentFormData } from '../../content/types/content.types';
import { inputCls, labelCls } from '../../../components';

interface EditContentModalProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contentId: number, data: ContentFormData) => void;
  isLoading: boolean;
}


export const EditContentModal: React.FC<EditContentModalProps> = ({
  content, isOpen, onClose, onSave, isLoading,
}) => {
  const [formData, setFormData] = useState<ContentFormData>({
    title: '', type: 'video', description: '', category: '',
    categoryColor: '#f97316', emoji: '', duration: '',
    steps: 5, minutes: 15, emojiColor: '#d1fae5', ageGroup: '4-6', level: '1', file: null,
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title:         content.title,
        type:          content.type as any,
        description:   content.description || '',
        category:      (content as any).category || '',
        categoryColor: (content as any).categoryColor || '#f97316',
        emoji:         (content as any).emoji || '',
        duration:      (content as any).duration || '',
        steps:         (content as any).steps || 5,
        minutes:       (content as any).minutes || 15,
        emojiColor:    (content as any).emojiColor || '#d1fae5',
        ageGroup:      (content as any).age_group || '4-6',
        level:         (content as any).level?.toString() || '1',
        file: null,
      });
    }
  }, [content, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(p => ({ ...p, [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content) onSave(content.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-brand-orange">
              <i className="fa-solid fa-pen" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Modifier le contenu</h2>
              <p className="text-xs text-slate-400">{content?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">

          <div>
            <label className={labelCls}>Titre *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputCls} placeholder="Titre du contenu" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Catégorie</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className={inputCls} placeholder="Ex: Langage" />
            </div>
            <div>
              <label className={labelCls}>Emoji</label>
              <input type="text" name="emoji" value={formData.emoji || ''} onChange={handleChange} maxLength={2} className={inputCls} placeholder="🎬" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Groupe d'âge</label>
              <select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className={inputCls}>
                <option value="3-5">3-5 ans</option>
                <option value="4-6">4-6 ans</option>
                <option value="5-8">5-8 ans</option>
                <option value="6-8">6-8 ans</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Niveau</label>
              <select name="level" value={formData.level} onChange={handleChange} className={inputCls}>
                <option value="1">1 — Facile</option>
                <option value="2">2 — Moyen</option>
                <option value="3">3 — Difficile</option>
              </select>
            </div>
          </div>

          {formData.type === 'video' && (
            <div>
              <label className={labelCls}>Durée</label>
              <input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} className={inputCls} placeholder="Ex: 5 min" />
            </div>
          )}

          {formData.type === 'activity' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Étapes</label>
                <input type="number" name="steps" value={formData.steps || 5} onChange={handleChange} min="1" max="20" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Minutes</label>
                <input type="number" name="minutes" value={formData.minutes || 15} onChange={handleChange} min="1" max="120" className={inputCls} />
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Couleur catégorie</label>
            <input type="color" name="categoryColor" value={formData.categoryColor || '#f97316'} onChange={handleChange} className="h-12 w-full rounded-xl border border-slate-200 cursor-pointer p-1.5" />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputCls} placeholder="Description du contenu…" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-md shadow-brand-orange/20 transition-all">
              {isLoading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Enregistrement…</>
                : <><i className="fa-solid fa-check" /> Sauvegarder</>
              }
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition">
              <i className="fa-solid fa-xmark" /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

