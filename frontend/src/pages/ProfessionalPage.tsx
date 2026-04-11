// ============================================================================
// PROFESSIONAL DASHBOARD — Redesigned with sidebar + pharmacy green theme
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import '../styles/ProfessionalDashboard.css';
import AnalytiquesProfessionnel from './AnalytiquesProfessionnel';

// ── Types ──────────────────────────────────────────────────────────────────
type ViewType = 'patients' | 'activities' | 'notes' | 'invitations' | 'teleconsult' | 'analytics';

interface Child {
  id: number;
  name: string;
  age: number;
  parent_id: number;
  parent_name?: string;
  participant_category?: string;
}

interface ParentRecord {
  id: number; name: string; email: string;
  child_count: number; invited_at: string;
}

interface Activity {
  id: number;
  content_title: string;
  score: number;
  duration_seconds: number;
  date: string;
}

interface Note {
  id: number;
  content: string;
  date: string;
  professional_name: string;
}

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

// ── Nav config ─────────────────────────────────────────────────────────────
const NAV = [
  { id: 'patients',     icon: '👥', label: 'Mes patients' },
  { id: 'activities',   icon: '📊', label: 'Activités' },
  { id: 'notes',        icon: '📝', label: 'Notes cliniques' },
  { id: 'analytics',    icon: '📈', label: 'Analytiques' },
  { id: 'invitations',  icon: '📨', label: 'Mes invitations' },
  { id: 'teleconsult',  icon: '🎥', label: 'Téléconsultation' },
] as const;

// ── Component ──────────────────────────────────────────────────────────────
export const ProfessionalPage = (): JSX.Element => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [view, setView]                         = useState<ViewType>('patients');
  const [patients, setPatients]                 = useState<Child[]>([]);
  const [selectedPatient, setSelectedPatient]   = useState<Child | null>(null);
  const [activities, setActivities]             = useState<Activity[]>([]);
  const [notes, setNotes]                       = useState<Note[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [noteLoading, setNoteLoading]           = useState(false);
  const [newNote, setNewNote]                   = useState('');
  const [search, setSearch]                     = useState('');
  const [invitations, setInvitations]           = useState<ParentRecord[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  // ── Fetch patients (enfants des parents qui ont invité ce professionnel) ──
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Essai endpoint filtré → fallback /all
        try {
          const { data } = await api.get<ApiResult<Child[]>>('/api/professional/my-children');
          if (data.success && data.data.length > 0) {
            setPatients(data.data);
            setSelectedPatient(data.data[0]);
            return;
          }
        } catch { /* fallback */ }
        const { data } = await api.get<ApiResult<Child[]>>('/api/child/all');
        if (data.success) {
          setPatients(data.data);
          if (data.data.length > 0) setSelectedPatient(data.data[0]);
        }
      } catch {
        toast('Erreur lors du chargement des patients', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // ── Fetch invitations (parents qui ont invité ce professionnel) ─────────
  useEffect(() => {
    if (view !== 'invitations') return;
    const fetchInvitations = async () => {
      try {
        setInvitationsLoading(true);
        const { data } = await api.get<ApiResult<ParentRecord[]>>('/api/professional/my-parents');
        if (data.success) setInvitations(data.data);
      } catch { /* silent */ }
      finally { setInvitationsLoading(false); }
    };
    fetchInvitations();
  }, [view]);

  // ── Fetch activities + notes when patient changes ────────────────────────
  useEffect(() => {
    if (!selectedPatient) return;
    const fetchData = async () => {
      try {
        const [{ data: actData }, { data: noteData }] = await Promise.all([
          api.get<ApiResult<Activity[]>>(`/api/activity-log/child/${selectedPatient.id}`),
          api.get<ApiResult<Note[]>>(`/api/note/child/${selectedPatient.id}`),
        ]);
        if (actData.success) setActivities(actData.data);
        if (noteData.success) setNotes(noteData.data);
      } catch { /* silent */ }
    };
    fetchData();
  }, [selectedPatient]);

  // ── Add clinical note ────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!selectedPatient || !newNote.trim()) { toast('Saisissez une note avant de valider', 'error'); return; }
    try {
      setNoteLoading(true);
      const { data } = await api.post<ApiResult<Note>>('/api/note', {
        childId: selectedPatient.id,
        content: newNote.trim(),
      });
      if (data.success) {
        setNewNote('');
        toast('Note clinique ajoutée ✓');
        const { data: nd } = await api.get<ApiResult<Note[]>>(`/api/note/child/${selectedPatient.id}`);
        if (nd.success) setNotes(nd.data);
      } else {
        toast(data.message || 'Erreur lors de l\'ajout', 'error');
      }
    } catch {
      toast('Erreur lors de l\'ajout de la note', 'error');
    } finally {
      setNoteLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = (() => {
    if (!activities.length) return { sessions: 0, time: 0, avgScore: 0 };
    const totalTime = activities.reduce((s, a) => s + (a.duration_seconds || 0), 0);
    const avgScore  = activities.reduce((s, a) => s + (a.score || 0), 0) / activities.length;
    return { sessions: activities.length, time: Math.round(totalTime / 60), avgScore: Math.round(avgScore) };
  })();

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const profInitial  = user?.name?.charAt(0).toUpperCase() || 'P';
  const currentNav   = NAV.find(n => n.id === view);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="prof-layout">

      {/* ── SIDEBAR ── */}
      <aside className="prof-sidebar">

        {/* Brand */}
        <div className="prof-sidebar__brand">
          <div className="prof-sidebar__logo">🩺</div>
          <div className="prof-sidebar__brand-text">
            <h2>AIDAA</h2>
            <span>Espace Professionnel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="prof-sidebar__nav">
          <div className="prof-nav__label">Menu</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`prof-nav__item ${view === n.id ? 'active' : ''}`}
              onClick={() => {
                if (n.id === 'teleconsult') {
                  navigate('/professionnel/teleconsultation');
                } else {
                  setView(n.id as ViewType);
                }
              }}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.id === 'invitations' && patients.length > 0 && (
                <span className="prof-nav__badge">{patients.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Patients list */}
        <div className="prof-sidebar__patients">
          <div className="prof-section-title">Patients ({patients.length})</div>
          <div className="prof-search-wrap">
            <input
              type="text"
              className="prof-search"
              placeholder="🔍 Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {filteredPatients.map(p => (
            <button
              key={p.id}
              type="button"
              className={`prof-patient-item ${selectedPatient?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(p)}
            >
              <span className="prof-patient-avatar">{p.name.charAt(0).toUpperCase()}</span>
              <span className="prof-patient-name">
                {p.name}
                <small>
                  {p.age} ans
                  {p.participant_category ? ` · ${p.participant_category}` : ''}
                  {p.parent_name ? ` · ${p.parent_name}` : ''}
                </small>
              </span>
            </button>
          ))}
          {filteredPatients.length === 0 && (
            <div className="prof-no-patients">Aucun résultat</div>
          )}
        </div>

        {/* Footer */}
        <div className="prof-sidebar__footer">
          <div className="prof-sidebar__user">
            <div className="prof-sidebar__avatar">{profInitial}</div>
            <div className="prof-sidebar__user-info">
              <div className="prof-sidebar__user-name">{user?.name || 'Professionnel'}</div>
              <div className="prof-sidebar__user-role">Professionnel de santé</div>
            </div>
          </div>
          <button className="prof-logout-btn" onClick={logout}>
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="prof-main">

        {/* Topbar */}
        <header className="prof-topbar">
          <div className="prof-topbar__left">
            <div className="prof-topbar__breadcrumb">Professionnel / {currentNav?.label}</div>
            <h1>{currentNav?.icon} {currentNav?.label}</h1>
          </div>
          <div className="prof-topbar__right">
            {patients.length > 0 && (
              <div className="prof-patient-select">
                <label>Patient :</label>
                <select
                  value={selectedPatient?.id || ''}
                  onChange={e => setSelectedPatient(patients.find(p => p.id === +e.target.value) || null)}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.age} ans)</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prof-content">

          {/* Chargement */}
          {loading && (
            <div className="prof-loading">
              <div className="prof-loading__spinner" />
              <p>Chargement des patients…</p>
            </div>
          )}

          {/* Aucun patient (masqué sur l'onglet analytics) */}
          {!loading && patients.length === 0 && view !== 'analytics' && (
            <div className="prof-empty-state">
              👥 Aucun patient assigné pour le moment.<br />
              Contactez l'administrateur pour obtenir l'accès aux dossiers patients.
            </div>
          )}

          {/* ── VUE ANALYTIQUES (niveau docteur, indépendante du patient sélectionné) ── */}
          {view === 'analytics' && !loading && user?.id && (
            <AnalytiquesProfessionnel
              doctorId={user.id}
              patients={patients}
            />
          )}

          {selectedPatient && !loading && view !== 'analytics' && (
            <>
              {/* KPIs */}
              <div className="prof-kpis">
                <div className="prof-kpi">
                  <div className="prof-kpi__icon">👤</div>
                  <div>
                    <span className="prof-kpi__val">{selectedPatient.age}</span>
                    <span className="prof-kpi__lbl">Âge (ans)</span>
                  </div>
                </div>
                <div className="prof-kpi">
                  <div className="prof-kpi__icon">🎮</div>
                  <div>
                    <span className="prof-kpi__val">{stats.sessions}</span>
                    <span className="prof-kpi__lbl">Sessions</span>
                  </div>
                </div>
                <div className="prof-kpi">
                  <div className="prof-kpi__icon">⏱️</div>
                  <div>
                    <span className="prof-kpi__val">{stats.time}</span>
                    <span className="prof-kpi__lbl">Minutes total</span>
                  </div>
                </div>
                <div className="prof-kpi">
                  <div className="prof-kpi__icon">⭐</div>
                  <div>
                    <span className="prof-kpi__val">{stats.avgScore}</span>
                    <span className="prof-kpi__lbl">Score moyen</span>
                  </div>
                </div>
                <div className="prof-kpi">
                  <div className="prof-kpi__icon">📝</div>
                  <div>
                    <span className="prof-kpi__val">{notes.length}</span>
                    <span className="prof-kpi__lbl">Notes</span>
                  </div>
                </div>
              </div>

              {/* ── VIEW: PATIENTS (fiche) ── */}
              {view === 'patients' && (
                <div className="prof-section">
                  <div className="prof-section__head">
                    <h2>👤 Fiche patient — {selectedPatient.name}</h2>
                    {selectedPatient.parent_name && (
                      <span className="prof-section__count">👨‍👩‍👧 Parent : {selectedPatient.parent_name}</span>
                    )}
                  </div>
                  <div className="prof-section__body">
                    <div className="prof-patient-card">
                      <div className="prof-patient-card__avatar">
                        {selectedPatient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="prof-patient-card__details">
                        <h3>{selectedPatient.name}</h3>
                        <div className="prof-patient-card__grid">
                          <div className="prof-patient-card__item">
                            <label>Identifiant</label>
                            <span>#{selectedPatient.id}</span>
                          </div>
                          <div className="prof-patient-card__item">
                            <label>Âge</label>
                            <span>{selectedPatient.age} ans</span>
                          </div>
                          <div className="prof-patient-card__item">
                            <label>Catégorie</label>
                            <span style={{ textTransform: 'capitalize' }}>{selectedPatient.participant_category || 'Enfant'}</span>
                          </div>
                          {selectedPatient.parent_name && (
                            <div className="prof-patient-card__item">
                              <label>Famille</label>
                              <span>{selectedPatient.parent_name}</span>
                            </div>
                          )}
                          <div className="prof-patient-card__item">
                            <label>Sessions jouées</label>
                            <span>{stats.sessions}</span>
                          </div>
                          <div className="prof-patient-card__item">
                            <label>Temps total</label>
                            <span>{stats.time} min</span>
                          </div>
                          <div className="prof-patient-card__item">
                            <label>Score moyen</label>
                            <span>{stats.avgScore} / 100</span>
                          </div>
                          <div className="prof-patient-card__item">
                            <label>Notes cliniques</label>
                            <span>{notes.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── VIEW: ACTIVITIES ── */}
              {view === 'activities' && (
                <div className="prof-section">
                  <div className="prof-section__head">
                    <h2>📊 Journal d'activités — {selectedPatient.name}</h2>
                    <span className="prof-section__count">{activities.length} session(s)</span>
                  </div>
                  <div className="prof-section__body" style={{ padding: 0 }}>
                    {activities.length === 0 ? (
                      <div className="prof-empty">
                        <div className="prof-empty__icon">📭</div>
                        <p>Aucune activité enregistrée pour ce patient.</p>
                      </div>
                    ) : (
                      <div className="prof-table-wrap">
                        <table className="prof-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Activité</th>
                              <th>Score</th>
                              <th>Durée</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities.map((act, i) => (
                              <tr key={act.id}>
                                <td style={{ color: '#7A9485', fontWeight: 600 }}>{i + 1}</td>
                                <td><strong>{act.content_title}</strong></td>
                                <td>
                                  <span className={`prof-score-badge ${
                                    act.score >= 70 ? 'prof-score-badge--good'
                                    : act.score >= 40 ? 'prof-score-badge--mid'
                                    : 'prof-score-badge--low'
                                  }`}>
                                    {act.score} / 100
                                  </span>
                                </td>
                                <td>{Math.round((act.duration_seconds || 0) / 60)} min</td>
                                <td>{new Date(act.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── VIEW: NOTES ── */}
              {view === 'notes' && (
                <>
                  {/* Formulaire nouvelle note */}
                  <div className="prof-section" style={{ marginBottom: 20 }}>
                    <div className="prof-section__head">
                      <h2>✏️ Nouvelle note clinique</h2>
                    </div>
                    <div className="prof-section__body">
                      <div className="prof-note-form">
                        <textarea
                          className="prof-note-textarea"
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder={`Saisissez vos observations cliniques pour ${selectedPatient.name}…`}
                          rows={5}
                        />
                        <button
                          className="prof-btn prof-btn--primary"
                          onClick={handleAddNote}
                          disabled={noteLoading || !newNote.trim()}
                        >
                          {noteLoading ? '⏳ Enregistrement…' : '💾 Enregistrer la note'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Historique des notes */}
                  <div className="prof-section">
                    <div className="prof-section__head">
                      <h2>📋 Historique des notes — {selectedPatient.name}</h2>
                      <span className="prof-section__count">{notes.length} note(s)</span>
                    </div>
                    <div className="prof-section__body">
                      {notes.length === 0 ? (
                        <div className="prof-empty">
                          <div className="prof-empty__icon">📭</div>
                          <p>Aucune note clinique pour ce patient.</p>
                        </div>
                      ) : (
                        <div className="prof-notes-list">
                          {notes.map(note => (
                            <div key={note.id} className="prof-note-card">
                              <div className="prof-note-card__header">
                                <span className="prof-note-card__author">🩺 Dr. {note.professional_name}</span>
                                <span className="prof-note-card__date">
                                  {new Date(note.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="prof-note-card__content">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}


              {/* ── VIEW: MES INVITATIONS ── */}
              {view === 'invitations' && (
                <div className="prof-section">
                  <div className="prof-section__head">
                    <h2>📨 Mes invitations reçues</h2>
                    <span className="prof-section__count">{invitations.length} parent{invitations.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="prof-section__body">
                    {invitationsLoading ? (
                      <div className="prof-empty">
                        <div className="prof-loading__spinner" style={{ margin: '24px auto 10px' }} />
                        <p>Chargement…</p>
                      </div>
                    ) : invitations.length === 0 ? (
                      <div className="prof-empty">
                        <div className="prof-empty__icon">📭</div>
                        <p>Aucun parent ne vous a encore invité.<br />
                          <small style={{ color: 'var(--prof-text-light)' }}>
                            Les parents peuvent vous inviter depuis leur tableau de bord → "Mon professionnel".
                          </small>
                        </p>
                      </div>
                    ) : (
                      <div className="prof-inv-list">
                        {invitations.map(inv => (
                          <div key={inv.id} className="prof-inv-card">

                            {/* En-tête */}
                            <div className="prof-inv-card__head">
                              <div className="prof-inv-card__avatar">{inv.name.charAt(0).toUpperCase()}</div>
                              <div className="prof-inv-card__info">
                                <strong>{inv.name}</strong>
                                <span>{inv.email}</span>
                              </div>
                              <div className="prof-inv-card__meta">
                                <span className="prof-inv-card__children">
                                  👶 {inv.child_count} enfant{inv.child_count !== 1 ? 's' : ''}
                                </span>
                                <span className="prof-inv-card__date">
                                  Depuis le {new Date(inv.invited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            {/* Étapes */}
                            <div className="prof-inv-steps">
                              <div className="prof-inv-step prof-inv-step--done">
                                <div className="prof-inv-step__circle">✓</div>
                                <div className="prof-inv-step__text">
                                  <div className="prof-inv-step__label">Invitation reçue</div>
                                  <div className="prof-inv-step__desc">{inv.name} vous a invité à suivre ses enfants</div>
                                </div>
                              </div>
                              <div className="prof-inv-step prof-inv-step--done">
                                <div className="prof-inv-step__circle">✓</div>
                                <div className="prof-inv-step__text">
                                  <div className="prof-inv-step__label">Compte configuré</div>
                                  <div className="prof-inv-step__desc">Vous êtes connecté et actif sur la plateforme</div>
                                </div>
                              </div>
                              <div className="prof-inv-step prof-inv-step--done">
                                <div className="prof-inv-step__circle">✓</div>
                                <div className="prof-inv-step__text">
                                  <div className="prof-inv-step__label">Suivi actif ✅</div>
                                  <div className="prof-inv-step__desc">
                                    Vous suivez {inv.child_count} enfant{inv.child_count !== 1 ? 's' : ''} de cette famille
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="prof-inv-card__actions">
                              <button
                                className="prof-btn prof-btn--primary"
                                style={{ fontSize: 13, padding: '8px 16px', alignSelf: 'auto' }}
                                onClick={() => {
                                  const firstChild = patients.find(p => p.parent_id === inv.id);
                                  if (firstChild) { setSelectedPatient(firstChild); setView('patients'); }
                                }}
                              >
                                👁️ Voir les patients de cette famille
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── VIEW: TELECONSULT ── */}
              {view === 'teleconsult' && (
                <div className="prof-coming-soon">
                  <div className="prof-coming-soon__icon">🎥</div>
                  <h2>Téléconsultation</h2>
                  <p>
                    La fonctionnalité de téléconsultation est en cours de développement.<br />
                    Elle sera disponible dans une prochaine version.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── TOASTS ── */}
      <div className="prof-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`prof-toast prof-toast--${t.type}`}>
            <span className="prof-toast__icon">{t.type === 'success' ? '✅' : '❌'}</span>
            <span className="prof-toast__msg">{t.msg}</span>
            <button className="prof-toast__close" onClick={() => removeToast(t.id)}>×</button>
          </div>
        ))}
      </div>

    </div>
  );
};
