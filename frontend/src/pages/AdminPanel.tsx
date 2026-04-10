// ============================================================================
// ADMIN PANEL — Redesigned with sidebar + pharmacy green theme
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import { ContentItem, ContentFormData, User } from '../features/content/types/content.types';
import { ContentCard } from '../features/admin/components/ContentCard';
import { EditContentModal } from '../features/admin/components/EditContentModal';
import { DeleteContentModal } from '../features/admin/components/DeleteContentModal';
import '../styles/AdminPanel.css';

// ── Types ──────────────────────────────────────────────────────────────────
type ViewType = 'content' | 'upload' | 'users' | 'registrations';
type UserRole = 'admin' | 'parent' | 'professional';

interface UserFormState { name: string; email: string; password: string; role: UserRole; }
interface ApiResult<T> { success: boolean; data: T; message?: string; }
interface Toast { id: number; type: 'success' | 'error'; msg: string; }

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

// ── Nav items config ───────────────────────────────────────────────────────
const NAV = [
  { id: 'content',       icon: '📚', label: 'Bibliothèque' },
  { id: 'upload',        icon: '⬆️',  label: 'Importer contenu' },
  { id: 'users',         icon: '👥',  label: 'Utilisateurs' },
  { id: 'registrations', icon: '🔔',  label: 'Demandes' },
] as const;

const ROLE_ICONS: Record<string, string> = { admin: '🛡️', parent: '👨‍👩‍👧', professional: '🩺' };

// ── Component ──────────────────────────────────────────────────────────────
export const AdminPanel = (): JSX.Element => {
  const { logout, user } = useAuth();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [view, setView]         = useState<ViewType>('content');
  const [content, setContent]   = useState<ContentItem[]>([]);
  const [users, setUsers]       = useState<User[]>([]);
  const [pending, setPending]   = useState<User[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [actLoading, setActLoading] = useState(false);

  const [createForm, setCreateForm] = useState<UserFormState>({ name: '', email: '', password: '', role: 'parent' });
  const [editId, setEditId]         = useState<number | null>(null);
  const [editForm, setEditForm]     = useState<Omit<UserFormState, 'password'> | null>(null);

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
  const fetchContent = async () => {
    const { data } = await api.get<ApiResult<ContentItem[]>>('/api/content');
    if (data.success) setContent(data.data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get<ApiResult<User[]>>('/api/users');
    if (data.success) setUsers(data.data);
  };

  const fetchPending = async () => {
    try {
      const { data } = await api.get<ApiResult<User[]>>('/api/admin/pending-registrations');
      if (data.success) { setPending(data.data); setNotifCount(data.data.length); }
    } catch { /* silent */ }
  };

  useEffect(() => { setLoading(true); Promise.all([fetchContent(), fetchUsers()]).finally(() => setLoading(false)); }, []);
  useEffect(() => { fetchPending(); const t = setInterval(fetchPending, 30000); return () => clearInterval(t); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    try { setActLoading(true); await api.post(`/api/admin/approve-registration/${id}`); await Promise.all([fetchPending(), fetchUsers()]); toast('Inscription acceptée ✓'); }
    catch { toast('Erreur lors de l\'acceptation', 'error'); }
    finally { setActLoading(false); }
  };

  const handleReject = async (id: number) => {
    try { setActLoading(true); await api.post(`/api/admin/reject-registration/${id}`); await fetchPending(); toast('Demande refusée'); }
    catch { toast('Erreur lors du refus', 'error'); }
    finally { setActLoading(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) { toast('Tous les champs sont requis', 'error'); return; }
    try {
      setActLoading(true);
      const { data } = await api.post<ApiResult<User>>('/api/users', { name: createForm.name.trim(), email: createForm.email.trim().toLowerCase(), password: createForm.password, role: createForm.role });
      if (!data.success) { toast(data.message || 'Erreur création', 'error'); return; }
      setCreateForm({ name: '', email: '', password: '', role: 'parent' });
      await fetchUsers();
      toast('Utilisateur créé avec succès ✓');
    } catch { toast('Erreur lors de la création', 'error'); }
    finally { setActLoading(false); }
  };

  const handleEditSaveUser = async (u: User) => {
    if (!editForm) return;
    try {
      setActLoading(true);
      const { data } = await api.put<ApiResult<User>>(`/api/users/${u.id}`, { name: editForm.name.trim(), email: editForm.email.trim().toLowerCase(), role: editForm.role, is_active: u.is_active });
      if (!data.success) { toast(data.message || 'Erreur mise à jour', 'error'); return; }
      setEditId(null); setEditForm(null);
      await fetchUsers();
      toast('Utilisateur mis à jour ✓');
    } catch { toast('Erreur lors de la mise à jour', 'error'); }
    finally { setActLoading(false); }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Supprimer définitivement ${u.name} ? Cette action est irréversible.`)) return;
    try {
      setActLoading(true);
      const { data } = await api.delete<ApiResult<null>>(`/api/users/${u.id}`);
      if (!data.success) { toast(data.message || 'Erreur', 'error'); return; }
      await fetchUsers(); toast(`${u.name} supprimé définitivement`);
    } catch { toast('Erreur suppression', 'error'); }
    finally { setActLoading(false); }
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
      if (data.success) { toast('Contenu uploadé avec succès ✓'); setUploadForm({ title: '', type: 'video', description: '', category: '', categoryColor: '#f97316', emoji: '📹', duration: '', steps: 5, minutes: 15, emojiColor: '#d1fae5', ageGroup: '4-6', level: '1', file: null }); await fetchContent(); }
      else toast(data.message || 'Erreur upload', 'error');
    } catch (err) { toast(err instanceof Error ? err.message : 'Erreur upload', 'error'); }
    finally { setLoading(false); }
  };

  const handleEditSave = async (contentId: number, formData: ContentFormData) => {
    try {
      setLoading(true);
      const { data } = await api.put<ApiResult<ContentItem>>(`/api/content/${contentId}`, { title: formData.title, type: formData.type, category: formData.category, category_color: formData.categoryColor, emoji: formData.emoji, duration: formData.duration, steps: formData.steps, minutes: formData.minutes, emoji_color: formData.emojiColor, description: formData.description, age_group: formData.ageGroup, level: formData.level });
      if (data.success) { toast('Contenu mis à jour ✓'); setEditingContent(null); await fetchContent(); }
      else toast('Erreur mise à jour: ' + data.message, 'error');
    } catch { toast('Erreur mise à jour', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContentId) return;
    try {
      setLoading(true);
      const { data } = await api.delete<ApiResult<null>>(`/api/content/${deletingContentId}`);
      if (data.success) { toast('Contenu supprimé'); setDeletingContentId(null); setDeletingTitle(''); await fetchContent(); }
      else toast('Erreur suppression: ' + data.message, 'error');
    } catch { toast('Erreur suppression', 'error'); }
    finally { setLoading(false); }
  };

  const activeUsers = users.filter(u => !!u.is_active).length;
  const adminInitial = user?.name?.charAt(0).toUpperCase() || 'A';

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="adm-layout">

      {/* ── SIDEBAR ── */}
      <aside className="adm-sidebar">
        {/* Brand */}
        <div className="adm-sidebar__brand">
          <div className="adm-sidebar__logo">✚</div>
          <div className="adm-sidebar__brand-text">
            <h2>AIDAA</h2>
            <span>Administration</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="adm-sidebar__nav">
          <div className="adm-nav__label">Menu</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`adm-nav__item ${view === n.id ? 'active' : ''}`}
              onClick={() => setView(n.id as ViewType)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.id === 'registrations' && notifCount > 0 && (
                <span className="adm-nav__badge">{notifCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="adm-sidebar__footer">
          <div className="adm-sidebar__user">
            <div className="adm-sidebar__avatar">{adminInitial}</div>
            <div className="adm-sidebar__user-info">
              <div className="adm-sidebar__user-name">{user?.name || 'Admin'}</div>
              <div className="adm-sidebar__user-role">Administrateur</div>
            </div>
          </div>
          <button className="adm-logout-btn" onClick={logout}>
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="adm-main">

        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar__left">
            <div className="adm-topbar__breadcrumb">Administration / {NAV.find(n => n.id === view)?.label}</div>
            <h1>{NAV.find(n => n.id === view)?.icon} {NAV.find(n => n.id === view)?.label}</h1>
          </div>
          <div className="adm-topbar__right">
            <button
              className={`adm-notif-btn ${notifCount > 0 ? 'adm-notif-btn--active' : ''}`}
              onClick={() => setView('registrations')}
              title="Demandes en attente"
            >
              🔔
              {notifCount > 0 && <span className="adm-notif-dot">{notifCount}</span>}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="adm-content">

          {/* KPIs */}
          <div className="adm-kpis">
            <div className="adm-kpi">
              <div className="adm-kpi__icon">📚</div>
              <div>
                <span className="adm-kpi__val">{content.length}</span>
                <span className="adm-kpi__lbl">Contenus</span>
              </div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi__icon">👥</div>
              <div>
                <span className="adm-kpi__val">{users.length}</span>
                <span className="adm-kpi__lbl">Utilisateurs</span>
              </div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi__icon">✅</div>
              <div>
                <span className="adm-kpi__val">{activeUsers}</span>
                <span className="adm-kpi__lbl">Actifs</span>
              </div>
            </div>
            <div className="adm-kpi adm-kpi--warn" onClick={() => setView('registrations')}>
              <div className="adm-kpi__icon">⏳</div>
              <div>
                <span className="adm-kpi__val">{notifCount}</span>
                <span className="adm-kpi__lbl">En attente</span>
              </div>
            </div>
          </div>

          {/* ── VIEW: CONTENT ── */}
          {view === 'content' && (
            <div className="adm-section">
              <div className="adm-section__head">
                <h2>Bibliothèque de contenus</h2>
                <span className="adm-section__count">{content.length} éléments</span>
              </div>
              <div className="adm-section__body">
                {loading ? (
                  <div className="adm-empty"><div className="adm-empty__icon">⏳</div><p>Chargement…</p></div>
                ) : content.length === 0 ? (
                  <div className="adm-empty"><div className="adm-empty__icon">📭</div><p>Aucun contenu uploadé.</p></div>
                ) : (
                  <div className="adm-content-grid">
                    {content.map(item => (
                      <ContentCard key={item.id} content={item} onEdit={setEditingContent} onDelete={c => { setDeletingContentId(c.id); setDeletingTitle(c.title); }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── VIEW: UPLOAD ── */}
          {view === 'upload' && (
            <div className="adm-section">
              <div className="adm-section__head"><h2>Importer un contenu</h2></div>
              <div className="adm-section__body">
                <form onSubmit={handleUploadSubmit} className="adm-form">
                  {/* Type tabs */}
                  <div className="adm-type-tabs">
                    {(['video', 'audio', 'activity'] as const).map(t => (
                      <button key={t} type="button"
                        className={`adm-type-tab ${uploadForm.type === t ? 'active' : ''}`}
                        onClick={() => setUploadForm(p => ({ ...p, type: t }))}
                      >
                        {t === 'video' ? '🎬 Vidéo' : t === 'audio' ? '🎵 Audio' : '🎮 Activité'}
                      </button>
                    ))}
                  </div>

                  <div className="adm-form__grid">
                    <div className="adm-form-group" style={{ gridColumn: '1/-1' }}>
                      <label>Fichier * <span style={{ color: '#7A9485', fontWeight: 400 }}>(vidéo, audio, image)</span></label>
                      <input type="file" onChange={e => { if (e.target.files?.[0]) setUploadForm(p => ({ ...p, file: e.target.files![0] })); }} accept="video/*,audio/*,image/*" required />
                    </div>
                    <div className="adm-form-group" style={{ gridColumn: '1/-1' }}>
                      <label>Titre *</label>
                      <input type="text" name="title" value={uploadForm.title} onChange={handleUploadChange} placeholder="Titre du contenu" required />
                    </div>
                    <div className="adm-form-group">
                      <label>Catégorie</label>
                      <input type="text" name="category" value={uploadForm.category} onChange={handleUploadChange} placeholder="ex: Langage, Motricité" />
                    </div>
                    <div className="adm-form-group">
                      <label>Emoji</label>
                      <input type="text" name="emoji" value={uploadForm.emoji || ''} onChange={handleUploadChange} placeholder="🎬" maxLength={2} />
                    </div>
                    <div className="adm-form-group">
                      <label>Couleur catégorie</label>
                      <input type="color" name="categoryColor" value={uploadForm.categoryColor || '#f97316'} onChange={handleUploadChange} />
                    </div>
                    <div className="adm-form-group">
                      <label>Groupe d'âge</label>
                      <select name="ageGroup" value={uploadForm.ageGroup} onChange={handleUploadChange}>
                        <option value="3-5">3-5 ans</option>
                        <option value="4-6">4-6 ans</option>
                        <option value="5-8">5-8 ans</option>
                        <option value="6-8">6-8 ans</option>
                      </select>
                    </div>
                    <div className="adm-form-group">
                      <label>Niveau de difficulté</label>
                      <select name="level" value={uploadForm.level} onChange={handleUploadChange}>
                        <option value="1">1 — Facile</option>
                        <option value="2">2 — Moyen</option>
                        <option value="3">3 — Difficile</option>
                      </select>
                    </div>
                    {uploadForm.type === 'video' && (
                      <div className="adm-form-group">
                        <label>Durée</label>
                        <input type="text" name="duration" value={uploadForm.duration || ''} onChange={handleUploadChange} placeholder="ex: 5 min" />
                      </div>
                    )}
                    {uploadForm.type === 'activity' && (<>
                      <div className="adm-form-group">
                        <label>Nombre d'étapes</label>
                        <input type="number" name="steps" value={uploadForm.steps || 5} onChange={handleUploadChange} min="1" max="20" />
                      </div>
                      <div className="adm-form-group">
                        <label>Durée (minutes)</label>
                        <input type="number" name="minutes" value={uploadForm.minutes || 15} onChange={handleUploadChange} min="1" max="120" />
                      </div>
                      <div className="adm-form-group">
                        <label>Couleur emoji</label>
                        <input type="color" name="emojiColor" value={uploadForm.emojiColor || '#d1fae5'} onChange={handleUploadChange} />
                      </div>
                    </>)}
                    <div className="adm-form-group" style={{ gridColumn: '1/-1' }}>
                      <label>Description</label>
                      <textarea name="description" value={uploadForm.description} onChange={handleUploadChange} placeholder="Description du contenu…" rows={3} />
                    </div>
                  </div>

                  <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
                    {loading ? '⏳ Upload en cours…' : '⬆️ Importer le contenu'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── VIEW: USERS ── */}
          {view === 'users' && (
            <>
              {/* Create form */}
              <div className="adm-section" style={{ marginBottom: 20 }}>
                <div className="adm-section__head"><h2>➕ Créer un utilisateur</h2></div>
                <div className="adm-section__body">
                  <form onSubmit={handleCreateUser} className="adm-form">
                    <div className="adm-form__grid">
                      <div className="adm-form-group">
                        <label>Nom complet *</label>
                        <input type="text" name="name" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} placeholder="Prénom Nom" required />
                      </div>
                      <div className="adm-form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemple.com" required />
                      </div>
                      <div className="adm-form-group">
                        <label>Mot de passe *</label>
                        <input type="password" name="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 caractères" minLength={6} required />
                      </div>
                      <div className="adm-form-group">
                        <label>Rôle</label>
                        <select name="role" value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value as UserRole }))}>
                          <option value="parent">👨‍👩‍👧 Parent</option>
                          <option value="professional">🩺 Professionnel</option>
                          <option value="admin">🛡️ Admin</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="adm-btn adm-btn--primary" disabled={actLoading}>
                      {actLoading ? 'Création…' : '✓ Créer l\'utilisateur'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Users table */}
              <div className="adm-section">
                <div className="adm-section__head">
                  <h2>Liste des utilisateurs</h2>
                  <span className="adm-section__count">{users.length} utilisateurs</span>
                </div>
                <div className="adm-section__body" style={{ padding: 0 }}>
                  {users.length === 0 ? (
                    <div className="adm-empty"><div className="adm-empty__icon">👤</div><p>Aucun utilisateur</p></div>
                  ) : (
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id}>
                              <td>
                                {editId === u.id && editForm ? (
                                  <input type="text" name="name" value={editForm.name} onChange={e => setEditForm(p => p ? { ...p, name: e.target.value } : p)} />
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #007A3A, #00A651)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                                  </div>
                                )}
                              </td>
                              <td>
                                {editId === u.id && editForm ? (
                                  <input type="email" name="email" value={editForm.email} onChange={e => setEditForm(p => p ? { ...p, email: e.target.value } : p)} />
                                ) : u.email}
                              </td>
                              <td>
                                {editId === u.id && editForm ? (
                                  <select name="role" value={editForm.role} onChange={e => setEditForm(p => p ? { ...p, role: e.target.value as UserRole } : p)}>
                                    <option value="parent">Parent</option>
                                    <option value="professional">Professionnel</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                ) : (
                                  <span className={`adm-role-badge adm-role-badge--${u.role}`}>
                                    {ROLE_ICONS[u.role]} {u.role}
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="adm-td-actions">
                                  {editId === u.id ? (<>
                                    <button className="adm-btn adm-btn--primary adm-btn--sm" type="button" onClick={() => handleEditSaveUser(u)} disabled={actLoading}>Sauvegarder</button>
                                    <button className="adm-btn adm-btn--secondary adm-btn--sm" type="button" onClick={() => { setEditId(null); setEditForm(null); }}>Annuler</button>
                                  </>) : (<>
                                    <button className="adm-btn adm-btn--secondary adm-btn--sm" type="button" onClick={() => { setEditId(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }); }} disabled={actLoading}>✏️ Modifier</button>
                                    <button className="adm-btn adm-btn--danger adm-btn--sm" type="button" onClick={() => handleDeleteUser(u)} disabled={actLoading}>🗑️ Supprimer</button>
                                  </>)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── VIEW: REGISTRATIONS ── */}
          {view === 'registrations' && (
            <div className="adm-section">
              <div className="adm-section__head">
                <h2>🔔 Demandes d'inscription</h2>
                <span className="adm-section__count">{pending.length} en attente</span>
              </div>
              <div className="adm-section__body">
                {pending.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty__icon">✅</div>
                    <p>Aucune demande en attente</p>
                  </div>
                ) : (
                  <div className="adm-reg-list">
                    {pending.map(reg => (
                      <div key={reg.id} className="adm-reg-card">
                        <div className="adm-reg-avatar">{reg.name.charAt(0).toUpperCase()}</div>
                        <div className="adm-reg-info">
                          <strong>{reg.name}</strong>
                          <span>{reg.email}</span>
                          <span className="adm-reg-date">
                            {reg.created_at ? new Date(reg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <span className="adm-reg-badge">👨‍👩‍👧 Parent</span>
                        <div className="adm-reg-actions">
                          <button className="adm-approve-btn" onClick={() => handleApprove(reg.id)} disabled={actLoading}>✓ Accepter</button>
                          <button className="adm-reject-btn" onClick={() => handleReject(reg.id)} disabled={actLoading}>✕ Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── MODALS ── */}
      <EditContentModal content={editingContent} isOpen={!!editingContent} onClose={() => setEditingContent(null)} onSave={handleEditSave} isLoading={loading} />
      <DeleteContentModal contentId={deletingContentId} contentTitle={deletingTitle} isOpen={!!deletingContentId} onClose={() => { setDeletingContentId(null); setDeletingTitle(''); }} onConfirm={handleDeleteConfirm} isLoading={loading} />

      {/* ── TOASTS ── */}
      <div className="adm-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
            <span className="adm-toast__icon">{t.type === 'success' ? '✅' : '❌'}</span>
            <span className="adm-toast__msg">{t.msg}</span>
            <button className="adm-toast__close" onClick={() => removeToast(t.id)}>×</button>
          </div>
        ))}
      </div>

    </div>
  );
};
