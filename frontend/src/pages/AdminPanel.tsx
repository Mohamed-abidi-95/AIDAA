// ============================================================================
// ADMIN PANEL — Design matching adminIndex.html (orange theme + FontAwesome)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import { ContentItem, ContentFormData, User } from '../features/content/types/content.types';
import { ContentCard } from '../features/admin/components/ContentCard';
import { EditContentModal } from '../features/admin/components/EditContentModal';
import { DeleteContentModal } from '../features/admin/components/DeleteContentModal';

// ── Types ──────────────────────────────────────────────────────────────────
type ViewType = 'content' | 'upload' | 'users' | 'registrations' | 'relations' | 'messages' | 'notes';
type UserRole = 'admin' | 'parent' | 'professional';
interface UserFormState { name: string; email: string; password: string; role: UserRole; }
interface ApiResult<T> { success: boolean; data: T; message?: string; }
interface Toast { id: number; type: 'success' | 'error'; msg: string; }

interface RelationRow {
  id: number; status: string; invited_at: string;
  parent_name: string; parent_email: string;
  professional_name: string; professional_email: string;
}
interface MessageRow {
  id: number; content: string; created_at: string; is_read: number;
  sender_name: string; sender_role: string;
  receiver_name: string; receiver_role: string;
  child_name: string;
}
interface NoteRow {
  id: number; content: string; date: string;
  professional_name: string; professional_email: string;
  child_name: string;
}

// ── Toast hook ─────────────────────────────────────────────────────────────
let toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId;
    setToasts(p => [...p, { id, type, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, add, remove };
};

// ── Nav config ─────────────────────────────────────────────────────────────
const NAV = [
  { id: 'content',       fa: 'fa-solid fa-swatchbook',          label: 'Bibliothèque'     },
  { id: 'upload',        fa: 'fa-solid fa-cloud-arrow-up',       label: 'Importer contenu' },
  { id: 'users',         fa: 'fa-solid fa-users',                label: 'Utilisateurs'     },
  { id: 'registrations', fa: 'fa-solid fa-bell',                 label: 'Demandes'         },
  { id: 'relations',     fa: 'fa-solid fa-link',                 label: 'Relations'        },
  { id: 'messages',      fa: 'fa-solid fa-comments',             label: 'Messages'         },
  { id: 'notes',         fa: 'fa-solid fa-notes-medical',        label: 'Notes cliniques'  },
] as const;

const ROLE_FA: Record<string, string> = {
  admin:        'fa-solid fa-shield-halved',
  parent:       'fa-solid fa-house-user',
  professional: 'fa-solid fa-stethoscope',
};
const ROLE_COLOR: Record<string, string> = {
  admin:        'bg-purple-100 text-purple-700',
  parent:       'bg-orange-100 text-orange-700',
  professional: 'bg-blue-100 text-blue-700',
};

// ── StatCard sub-component ─────────────────────────────────────────────────
const StatCard = ({ icon, color, value, label, onClick }: {
  icon: string; color: 'orange' | 'blue' | 'green' | 'gray';
  value: number; label: string; onClick?: () => void;
}) => {
  const bg = { orange: 'bg-orange-100 text-brand-orange', blue: 'bg-blue-100 text-blue-600', green: 'bg-emerald-100 text-emerald-600', gray: 'bg-slate-100 text-slate-500' }[color];
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl p-6 flex items-center gap-5 border border-slate-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}>
      <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-2xl shrink-0 ${bg}`}>
        <i className={icon} />
      </div>
      <div>
        <p className="text-[32px] font-bold leading-none text-slate-900 mb-1">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
};

// ── Section wrapper ────────────────────────────────────────────────────────
const Section = ({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-8">
    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {badge}
    </div>
    <div className="p-8">{children}</div>
  </div>
);

// ── Input / Select helpers ─────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange transition-all';
const labelCls = 'block text-sm font-semibold text-slate-800 mb-2';

// ── Main Component ─────────────────────────────────────────────────────────
export const AdminPanel = (): JSX.Element => {
  const { logout, user } = useAuth();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [view,     setView]     = useState<ViewType>('content');
  const [content,  setContent]  = useState<ContentItem[]>([]);
  const [users,    setUsers]    = useState<User[]>([]);
  const [pending,  setPending]  = useState<User[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [actLoading, setActLoading] = useState(false);

  // ── Admin monitoring state ─────────────────────────────────────────────
  const [relations,     setRelations]     = useState<RelationRow[]>([]);
  const [adminMessages, setAdminMessages] = useState<MessageRow[]>([]);
  const [adminNotes,    setAdminNotes]    = useState<NoteRow[]>([]);
  const [monitorLoading, setMonitorLoading] = useState(false);

  const [createForm, setCreateForm] = useState<UserFormState>({ name: '', email: '', password: '', role: 'parent' });
  const [editId,     setEditId]     = useState<number | null>(null);
  const [editForm,   setEditForm]   = useState<Omit<UserFormState, 'password'> | null>(null);

  const [editingContent,    setEditingContent]    = useState<ContentItem | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<number | null>(null);
  const [deletingTitle,     setDeletingTitle]     = useState('');

  const [uploadForm, setUploadForm] = useState<ContentFormData>({
    title: '', type: 'video', description: '', category: '',
    categoryColor: '#f97316', emoji: '📹', duration: '',
    steps: 5, minutes: 15, emojiColor: '#d1fae5',
    ageGroup: '4-6', level: '1', file: null,
  });

  // ── Data fetchers ──────────────────────────────────────────────────────
  const fetchContent = async () => { const { data } = await api.get<ApiResult<ContentItem[]>>('/api/content'); if (data.success) setContent(data.data); };
  const fetchUsers   = async () => { const { data } = await api.get<ApiResult<User[]>>('/api/users'); if (data.success) setUsers(data.data); };
  const fetchPending = async () => { try { const { data } = await api.get<ApiResult<User[]>>('/api/admin/pending-registrations'); if (data.success) { setPending(data.data); setNotifCount(data.data.length); } } catch { /* silent */ } };

  const fetchRelations = async () => { try { setMonitorLoading(true); const { data } = await api.get<ApiResult<RelationRow[]>>('/api/admin/relations'); if (data.success) setRelations(data.data); } catch { /* silent */ } finally { setMonitorLoading(false); } };
  const fetchAdminMessages = async () => { try { setMonitorLoading(true); const { data } = await api.get<ApiResult<MessageRow[]>>('/api/admin/messages'); if (data.success) setAdminMessages(data.data); } catch { /* silent */ } finally { setMonitorLoading(false); } };
  const fetchAdminNotes    = async () => { try { setMonitorLoading(true); const { data } = await api.get<ApiResult<NoteRow[]>>('/api/admin/notes'); if (data.success) setAdminNotes(data.data); } catch { /* silent */ } finally { setMonitorLoading(false); } };

  const handleDeleteRelation = async (id: number) => {
    if (!window.confirm('Supprimer définitivement cette relation ? Le professionnel n\'aura plus accès aux données de ce parent.')) return;
    try {
      const { data } = await api.delete<ApiResult<null>>(`/api/admin/relations/${id}`);
      if (data.success) { toast('Relation supprimée ✓'); await fetchRelations(); }
      else toast(data.message || 'Erreur', 'error');
    } catch { toast('Erreur réseau.', 'error'); }
  };

  useEffect(() => { setLoading(true); Promise.all([fetchContent(), fetchUsers()]).finally(() => setLoading(false)); }, []);
  useEffect(() => { fetchPending(); const t = setInterval(fetchPending, 30000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (view === 'relations') fetchRelations();
    else if (view === 'messages') fetchAdminMessages();
    else if (view === 'notes') fetchAdminNotes();
  }, [view]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleApprove = async (id: number) => { try { setActLoading(true); await api.post(`/api/admin/approve-registration/${id}`); await Promise.all([fetchPending(), fetchUsers()]); toast('Inscription acceptée ✓'); } catch { toast("Erreur lors de l'acceptation", 'error'); } finally { setActLoading(false); } };
  const handleReject  = async (id: number) => { try { setActLoading(true); await api.post(`/api/admin/reject-registration/${id}`); await fetchPending(); toast('Demande refusée'); } catch { toast('Erreur lors du refus', 'error'); } finally { setActLoading(false); } };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) { toast('Tous les champs sont requis', 'error'); return; }
    try {
      setActLoading(true);
      const { data } = await api.post<ApiResult<User>>('/api/users', { name: createForm.name.trim(), email: createForm.email.trim().toLowerCase(), password: createForm.password, role: createForm.role });
      if (!data.success) { toast(data.message || 'Erreur création', 'error'); return; }
      setCreateForm({ name: '', email: '', password: '', role: 'parent' });
      await fetchUsers(); toast('Utilisateur créé ✓');
    } catch { toast('Erreur lors de la création', 'error'); } finally { setActLoading(false); }
  };

  const handleEditSaveUser = async (u: User) => {
    if (!editForm) return;
    try {
      setActLoading(true);
      const { data } = await api.put<ApiResult<User>>(`/api/users/${u.id}`, { name: editForm.name.trim(), email: editForm.email.trim().toLowerCase(), role: editForm.role, is_active: u.is_active });
      if (!data.success) { toast(data.message || 'Erreur mise à jour', 'error'); return; }
      setEditId(null); setEditForm(null); await fetchUsers(); toast('Utilisateur mis à jour ✓');
    } catch { toast('Erreur mise à jour', 'error'); } finally { setActLoading(false); }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Supprimer définitivement ${u.name} ?`)) return;
    try { setActLoading(true); const { data } = await api.delete<ApiResult<null>>(`/api/users/${u.id}`); if (!data.success) { toast(data.message || 'Erreur', 'error'); return; } await fetchUsers(); toast(`${u.name} supprimé`); } catch { toast('Erreur suppression', 'error'); } finally { setActLoading(false); }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setUploadForm(p => ({ ...p, [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value }));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) { toast('Fichier et titre requis', 'error'); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('file', uploadForm.file); fd.append('title', uploadForm.title); fd.append('type', uploadForm.type);
      fd.append('description', uploadForm.description || ''); fd.append('category', uploadForm.category || '');
      fd.append('category_color', uploadForm.categoryColor || '#f97316'); fd.append('emoji', uploadForm.emoji || '');
      fd.append('age_group', uploadForm.ageGroup || '4-6'); fd.append('level', uploadForm.level?.toString() || '1');
      if (uploadForm.type === 'video' && uploadForm.duration) fd.append('duration', uploadForm.duration);
      if (uploadForm.type === 'activity') { fd.append('steps', (uploadForm.steps || 5).toString()); fd.append('minutes', (uploadForm.minutes || 15).toString()); fd.append('emoji_color', uploadForm.emojiColor || '#d1fae5'); }
      const { data } = await api.post<ApiResult<ContentItem>>('/api/content/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) { toast('Contenu uploadé ✓'); setUploadForm({ title: '', type: 'video', description: '', category: '', categoryColor: '#f97316', emoji: '📹', duration: '', steps: 5, minutes: 15, emojiColor: '#d1fae5', ageGroup: '4-6', level: '1', file: null }); await fetchContent(); }
      else toast(data.message || 'Erreur upload', 'error');
    } catch (err) { toast(err instanceof Error ? err.message : 'Erreur upload', 'error'); } finally { setLoading(false); }
  };

  const handleEditSave = async (contentId: number, formData: ContentFormData) => {
    try { setLoading(true); const { data } = await api.put<ApiResult<ContentItem>>(`/api/content/${contentId}`, { title: formData.title, type: formData.type, category: formData.category, category_color: formData.categoryColor, emoji: formData.emoji, duration: formData.duration, steps: formData.steps, minutes: formData.minutes, emoji_color: formData.emojiColor, description: formData.description, age_group: formData.ageGroup, level: formData.level }); if (data.success) { toast('Contenu mis à jour ✓'); setEditingContent(null); await fetchContent(); } else toast('Erreur: ' + data.message, 'error'); } catch { toast('Erreur mise à jour', 'error'); } finally { setLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContentId) return;
    try { setLoading(true); const { data } = await api.delete<ApiResult<null>>(`/api/content/${deletingContentId}`); if (data.success) { toast('Contenu supprimé'); setDeletingContentId(null); setDeletingTitle(''); await fetchContent(); } else toast('Erreur: ' + data.message, 'error'); } catch { toast('Erreur suppression', 'error'); } finally { setLoading(false); }
  };

  const activeUsers    = users.filter(u => !!u.is_active).length;
  const adminInitial   = user?.name?.charAt(0).toUpperCase() || 'A';
  const currentNavItem = NAV.find(n => n.id === view);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="font-sans antialiased flex h-screen overflow-hidden bg-slate-50 animate-page-in">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className="w-[280px] relative flex flex-col z-10 shrink-0"
        style={{
          background: '#F97316',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)',
          backgroundSize: '20px 20px',
          boxShadow: '4px 0 15px rgba(249,115,22,0.2)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-4 px-6 py-8">
          <div className="w-12 h-12 bg-white text-brand-orange rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
            <i className="fa-solid fa-puzzle-piece" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none">AIDAA</h2>
            <span className="text-[11px] text-white/80 font-medium uppercase tracking-widest">Administration</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 flex flex-col gap-2">
          {NAV.map(n => (
            <button key={n.id}
              className={`flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border transition-all
                ${view === n.id
                  ? 'bg-white text-brand-orange shadow-md border-transparent'
                  : 'text-white border-transparent hover:bg-white/15 hover:border-white/20'}`}
              onClick={() => setView(n.id as ViewType)}
            >
              <i className={`${n.fa} w-6 mr-3 text-lg ${view === n.id ? 'text-brand-orange opacity-100' : 'opacity-80'}`} />
              {n.label}
              {n.id === 'registrations' && notifCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-white text-brand-orange text-[11px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-brand-orange text-base shrink-0">
              {adminInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/80">Administrateur</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-black/15 hover:bg-black/25 text-white font-semibold py-3 rounded-lg transition-all text-sm">
            Se déconnecter <i className="fa-solid fa-arrow-right-from-bracket" />
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-slate-500 font-medium">Administration /</span>
            <span className="text-xl font-bold text-slate-900">{currentNavItem?.label}</span>
          </div>
          <button
            className="relative w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition text-lg"
            onClick={() => setView('registrations')}
            title="Demandes en attente"
          >
            <i className="fa-regular fa-bell" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {notifCount}
              </span>
            )}
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-10">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatCard icon="fa-solid fa-layer-group"      color="orange" value={content.length} label="Contenus publiés" />
            <StatCard icon="fa-solid fa-user-group"       color="blue"   value={users.length}   label="Utilisateurs inscrits" />
            <StatCard icon="fa-solid fa-circle-check"     color="green"  value={activeUsers}    label="Comptes actifs" />
            <StatCard icon="fa-regular fa-hourglass-half" color="gray"   value={notifCount}     label="Demandes en attente" onClick={() => setView('registrations')} />
          </div>

          {/* ══ VIEW : BIBLIOTHÈQUE ══ */}
          {view === 'content' && (
            <Section
              title="Bibliothèque de contenus"
              badge={
                <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <i className="fa-solid fa-chart-pie text-xs" /> {content.length} éléments
                </span>
              }
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin" />
                  <p>Chargement…</p>
                </div>
              ) : content.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <i className="fa-solid fa-inbox text-5xl" />
                  <p className="font-medium">Aucun contenu uploadé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {content.map(item => (
                    <ContentCard key={item.id} content={item}
                      onEdit={setEditingContent}
                      onDelete={c => { setDeletingContentId(c.id); setDeletingTitle(c.title); }} />
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* ══ VIEW : IMPORTER ══ */}
          {view === 'upload' && (
            <Section
              title="Nouveau contenu"
              badge={
                <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <i className="fa-solid fa-lock text-xs" /> Espace sécurisé
                </span>
              }
            >
              {/* Type tabs */}
              <div className="flex gap-4 mb-8">
                {([['video', 'fa-solid fa-video', 'Vidéo'], ['audio', 'fa-solid fa-music', 'Audio'], ['activity', 'fa-solid fa-gamepad', 'Activité']] as const).map(([t, fa, label]) => (
                  <button key={t} type="button"
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm border transition-all
                      ${uploadForm.type === t
                        ? 'bg-orange-50 border-brand-orange text-orange-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    onClick={() => setUploadForm(p => ({ ...p, type: t }))}
                  >
                    <i className={fa} /> {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Drop zone */}
                <div>
                  <label className={labelCls}>Fichier source *</label>
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50 cursor-pointer hover:border-brand-orange hover:bg-orange-50/30 transition-all">
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-brand-orange" />
                    <span className="font-semibold text-slate-700">Cliquez pour uploader un fichier</span>
                    <span className="text-sm text-slate-400">MP4, MP3, PNG ou ZIP — Max 50 MB</span>
                    {uploadForm.file && <span className="text-sm font-medium text-emerald-600"><i className="fa-solid fa-circle-check mr-1" />{uploadForm.file.name}</span>}
                    <input type="file" className="hidden" accept="video/*,audio/*,image/*" onChange={e => { if (e.target.files?.[0]) setUploadForm(p => ({ ...p, file: e.target.files![0] })); }} required />
                  </label>
                </div>

                <div>
                  <label className={labelCls}>Titre du contenu *</label>
                  <input type="text" name="title" value={uploadForm.title} onChange={handleUploadChange} placeholder="Ex: Apprentissage des couleurs" className={inputCls} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Catégorie</label>
                    <input type="text" name="category" value={uploadForm.category} onChange={handleUploadChange} placeholder="Ex: Langage, Motricité" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Groupe d'âge</label>
                    <select name="ageGroup" value={uploadForm.ageGroup} onChange={handleUploadChange} className={inputCls}>
                      <option value="3-5">3-5 ans</option>
                      <option value="4-6">4-6 ans</option>
                      <option value="5-8">5-8 ans</option>
                      <option value="6-8">6-8 ans</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Niveau de difficulté</label>
                    <select name="level" value={uploadForm.level} onChange={handleUploadChange} className={inputCls}>
                      <option value="1">1 — Facile</option>
                      <option value="2">2 — Moyen</option>
                      <option value="3">3 — Difficile</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Emoji</label>
                    <input type="text" name="emoji" value={uploadForm.emoji || ''} onChange={handleUploadChange} placeholder="🎬" maxLength={2} className={inputCls} />
                  </div>
                  {uploadForm.type === 'video' && (
                    <div>
                      <label className={labelCls}>Durée estimée</label>
                      <input type="text" name="duration" value={uploadForm.duration || ''} onChange={handleUploadChange} placeholder="Ex: 5 min" className={inputCls} />
                    </div>
                  )}
                  {uploadForm.type === 'activity' && (<>
                    <div>
                      <label className={labelCls}>Nombre d'étapes</label>
                      <input type="number" name="steps" value={uploadForm.steps || 5} onChange={handleUploadChange} min="1" max="20" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Durée (minutes)</label>
                      <input type="number" name="minutes" value={uploadForm.minutes || 15} onChange={handleUploadChange} min="1" max="120" className={inputCls} />
                    </div>
                  </>)}
                  <div>
                    <label className={labelCls}>Couleur catégorie</label>
                    <input type="color" name="categoryColor" value={uploadForm.categoryColor || '#f97316'} onChange={handleUploadChange} className="h-[46px] w-full rounded-xl border border-slate-200 cursor-pointer p-1" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description (optionnelle)</label>
                  <textarea name="description" value={uploadForm.description} onChange={handleUploadChange} placeholder="Décrivez le but de ce contenu…" rows={4} className={inputCls} />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-60 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-orange/20 transition-all hover:-translate-y-0.5">
                    {loading
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Upload en cours…</>
                      : <>Publier le contenu <i className="fa-solid fa-arrow-right ml-1" /></>
                    }
                  </button>
                </div>
              </form>
            </Section>
          )}

          {/* ══ VIEW : UTILISATEURS ══ */}
          {view === 'users' && (<>
            <Section title="Ajouter un utilisateur">
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Adresse e-mail *</label>
                    <input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="exemple@email.com" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Nom d'utilisateur *</label>
                    <input type="text" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} placeholder="Prénom Nom" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Mot de passe temporaire *</label>
                    <input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 caractères" minLength={6} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Rôle attribué</label>
                    <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value as UserRole }))} className={inputCls}>
                      <option value="parent">Compte Parent</option>
                      <option value="professional">Professionnel de santé</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={actLoading}
                  className="flex items-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-brand-orange/20 transition-all">
                  {actLoading ? 'Création…' : <><i className="fa-solid fa-user-plus" /> Créer le compte</>}
                </button>
              </form>
            </Section>

            <Section
              title="Annuaire des membres"
              badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">{users.length} inscrits</span>}
            >
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <i className="fa-solid fa-users text-4xl" />
                  <p className="font-medium">Aucun utilisateur</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-8 -mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Utilisateur</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Contact</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Rôle</th>
                        <th className="text-right px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5">
                            {editId === u.id && editForm
                              ? <input type="text" value={editForm.name} onChange={e => setEditForm(p => p ? { ...p, name: e.target.value } : p)} className={`${inputCls} py-2`} />
                              : (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center font-bold text-white text-sm shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-slate-800">{u.name}</span>
                                </div>
                              )
                            }
                          </td>
                          <td className="px-8 py-5 text-slate-500">
                            {editId === u.id && editForm
                              ? <input type="email" value={editForm.email} onChange={e => setEditForm(p => p ? { ...p, email: e.target.value } : p)} className={`${inputCls} py-2`} />
                              : u.email
                            }
                          </td>
                          <td className="px-8 py-5">
                            {editId === u.id && editForm
                              ? (
                                <select value={editForm.role} onChange={e => setEditForm(p => p ? { ...p, role: e.target.value as UserRole } : p)} className={`${inputCls} py-2`}>
                                  <option value="parent">Parent</option>
                                  <option value="professional">Professionnel</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold ${ROLE_COLOR[u.role] || 'bg-slate-100 text-slate-500'}`}>
                                  <i className={ROLE_FA[u.role]} /> {u.role}
                                </span>
                              )
                            }
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {editId === u.id ? (<>
                                <button onClick={() => handleEditSaveUser(u)} disabled={actLoading}
                                  className="px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition">
                                  <i className="fa-solid fa-check mr-1" />Sauvegarder
                                </button>
                                <button onClick={() => { setEditId(null); setEditForm(null); }}
                                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition">
                                  Annuler
                                </button>
                              </>) : (<>
                                <button onClick={() => { setEditId(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }); }} disabled={actLoading}
                                  className="w-9 h-9 border border-slate-200 bg-white rounded-lg text-slate-600 flex items-center justify-center hover:bg-slate-50 transition">
                                  <i className="fa-solid fa-pen text-sm" />
                                </button>
                                <button onClick={() => handleDeleteUser(u)} disabled={actLoading}
                                  className="w-9 h-9 border border-red-100 bg-white rounded-lg text-red-500 flex items-center justify-center hover:bg-red-50 transition">
                                  <i className="fa-regular fa-trash-can text-sm" />
                                </button>
                              </>)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </>)}

          {/* ══ VIEW : RELATIONS ══ */}
          {view === 'relations' && (
            <Section
              title="Relations Parent ↔ Professionnel"
              badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">{relations.length} liaison(s)</span>}
            >
              {monitorLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin" />
                  <p>Chargement…</p>
                </div>
              ) : relations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <i className="fa-solid fa-link text-5xl" />
                  <p className="font-medium">Aucune relation enregistrée.</p>
                </div>
              ) : (
                  <div className="overflow-x-auto -mx-8 -mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Parent</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Professionnel</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Statut</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Date</th>
                        <th className="text-right px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relations.map(r => (
                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-4">
                            <p className="font-semibold text-slate-800">{r.parent_name}</p>
                            <p className="text-xs text-slate-400">{r.parent_email}</p>
                          </td>
                          <td className="px-8 py-4">
                            <p className="font-semibold text-slate-800">{r.professional_name}</p>
                            <p className="text-xs text-slate-400">{r.professional_email}</p>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              r.status === 'active'  ? 'bg-emerald-100 text-emerald-700' :
                              r.status === 'pending' ? 'bg-amber-100 text-amber-700'    :
                                                       'bg-red-100 text-red-600'
                            }`}>{r.status}</span>
                          </td>
                          <td className="px-8 py-4 text-slate-500 text-sm">
                            {new Date(r.invited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <button onClick={() => handleDeleteRelation(r.id)}
                              className="w-9 h-9 border border-red-100 bg-white rounded-lg text-red-500 flex items-center justify-center hover:bg-red-50 transition ml-auto"
                              title="Supprimer cette relation">
                              <i className="fa-regular fa-trash-can text-sm" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          )}

          {/* ══ VIEW : MESSAGES ══ */}
          {view === 'messages' && (
            <Section
              title="Tous les messages"
              badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">{adminMessages.length} message(s)</span>}
            >
              {monitorLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin" />
                  <p>Chargement…</p>
                </div>
              ) : adminMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <i className="fa-solid fa-comments text-5xl" />
                  <p className="font-medium">Aucun message enregistré.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-8 -mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Expéditeur</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Destinataire</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Enfant</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Contenu</th>
                        <th className="text-left px-8 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminMessages.map(m => (
                        <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-4">
                            <p className="font-semibold text-slate-800">{m.sender_name}</p>
                            <p className="text-xs text-slate-400 capitalize">{m.sender_role}</p>
                          </td>
                          <td className="px-8 py-4">
                            <p className="font-semibold text-slate-800">{m.receiver_name}</p>
                            <p className="text-xs text-slate-400 capitalize">{m.receiver_role}</p>
                          </td>
                          <td className="px-8 py-4 text-slate-600 text-sm">{m.child_name}</td>
                          <td className="px-8 py-4 text-slate-600 text-sm max-w-xs truncate">{m.content}</td>
                          <td className="px-8 py-4 text-slate-500 text-sm whitespace-nowrap">
                            {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          )}

          {/* ══ VIEW : NOTES CLINIQUES ══ */}
          {view === 'notes' && (
            <Section
              title="Toutes les notes cliniques"
              badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">{adminNotes.length} note(s)</span>}
            >
              {monitorLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin" />
                  <p>Chargement…</p>
                </div>
              ) : adminNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <i className="fa-solid fa-notes-medical text-5xl" />
                  <p className="font-medium">Aucune note clinique enregistrée.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {adminNotes.map(n => (
                    <div key={n.id} className="bg-slate-50 border border-slate-100 border-l-4 border-l-brand-orange rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-stethoscope text-brand-orange text-sm" />
                          <span className="font-bold text-slate-800 text-sm">Dr. {n.professional_name}</span>
                          <span className="text-xs text-slate-400">{n.professional_email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <i className="fa-solid fa-baby text-[10px]" /> {n.child_name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(n.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* ══ VIEW : DEMANDES ══ */}
          {view === 'registrations' && (            <Section
              title="Demandes d'inscription"
              badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold">{pending.length} en attente</span>}
            >
              {pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl">
                    <i className="fa-solid fa-check" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Tout est à jour !</h3>
                    <p className="text-slate-500">Vous n'avez aucune demande d'inscription en attente.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map(reg => (
                    <div key={reg.id} className="flex items-center gap-5 p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center font-bold text-white text-lg shrink-0">
                        {reg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{reg.name}</p>
                        <p className="text-sm text-slate-500">{reg.email}</p>
                        {reg.created_at && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(reg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0">
                        <i className="fa-solid fa-house-user" /> Parent
                      </span>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleApprove(reg.id)} disabled={actLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition">
                          <i className="fa-solid fa-check" /> Accepter
                        </button>
                        <button onClick={() => handleReject(reg.id)} disabled={actLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-lg transition">
                          <i className="fa-solid fa-xmark" /> Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      <EditContentModal content={editingContent} isOpen={!!editingContent} onClose={() => setEditingContent(null)} onSave={handleEditSave} isLoading={loading} />
      <DeleteContentModal contentId={deletingContentId} contentTitle={deletingTitle} isOpen={!!deletingContentId} onClose={() => { setDeletingContentId(null); setDeletingTitle(''); }} onConfirm={handleDeleteConfirm} isLoading={loading} />

      {/* ── Toasts ── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[200]">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-semibold animate-page-in
              ${t.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            <i className={t.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'} />
            <span>{t.msg}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
          </div>
        ))}
      </div>

    </div>
  );
};
