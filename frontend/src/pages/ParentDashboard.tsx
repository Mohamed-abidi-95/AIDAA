// ============================================================================
// PARENT DASHBOARD — Fixed sidebar layout (same pattern as AdminPanel)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import '../styles/ParentDashboard.css';

declare global { interface Window { Chart: any; } }

// ── Interfaces ─────────────────────────────────────────────────────────────
interface Child { id: number; name: string; age: number; participant_category?: 'enfant' | 'jeune' | 'adulte'; }
interface Activity { id: number; child_id: number; content_title: string; score: number; duration_seconds: number; date: string; }
interface Note { id: number; child_id: number; content: string; professional_name: string; date: string; }
interface ApiResult<T> { success: boolean; data: T; message?: string; }
interface InviteResult { id: number; name: string; email: string; inviteLink: string; previewUrl?: string; }
interface ProfessionalRecord {
  id: number; name: string; email: string;
  status: 'pending' | 'active' | 'revoked';
  invited_at: string;
}

// ── Analytics interfaces ─────────────────────────────────────────────────────
interface AnalyticsOverview { totalSessions: number; totalMinutes: number; avgScore: number; streakDays: number; }
interface TimelinePoint    { date: string; minutes: number; }
interface BreakdownItem    { category: string; count: number; pct: number; }
interface ScoreByCategory  { category: string; avgScore: number; }

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV = [
  { key: 'summary',      icon: '📊', label: 'Résumé' },
  { key: 'activities',   icon: '🎮', label: 'Activités' },
  { key: 'analytics',    icon: '📈', label: 'Analytiques' },
  { key: 'notes',        icon: '📝', label: 'Notes médicales' },
  { key: 'professional', icon: '🩺', label: 'Mon professionnel' },
  { key: 'messages',     icon: '💬', label: 'Messages' },
] as const;

type ViewKey = typeof NAV[number]['key'];

// ── Component ───────────────────────────────────────────────────────────────
export const ParentDashboard = (): JSX.Element => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [children, setChildren]             = useState<Child[]>([]);
  const [selectedChild, setSelectedChild]   = useState<Child | null>(null);
  const [activities, setActivities]         = useState<Activity[]>([]);
  const [notes, setNotes]                   = useState<Note[]>([]);
  const [view, setView]                     = useState<ViewKey>('summary');

  // Analytics state
  const [analyticsOverview,  setAnalyticsOverview]  = useState<AnalyticsOverview | null>(null);
  const [analyticsTimeline,  setAnalyticsTimeline]  = useState<TimelinePoint[]>([]);
  const [analyticsBreakdown, setAnalyticsBreakdown] = useState<BreakdownItem[]>([]);
  const [analyticsScores,    setAnalyticsScores]    = useState<ScoreByCategory[]>([]);
  const [analyticsLoading,   setAnalyticsLoading]   = useState(false);
  const [analyticsError,     setAnalyticsError]     = useState('');

  // Chart refs (avoid "canvas already in use" on child change)
  const lineChartRef  = useRef<any>(null);
  const donutChartRef = useRef<any>(null);

  // Create child form
  const [newChildName, setNewChildName]                   = useState('');
  const [newChildAge, setNewChildAge]                     = useState<number>(5);
  const [newParticipantCategory, setNewParticipantCategory] = useState<'enfant' | 'jeune' | 'adulte'>('enfant');
  const [creatingChild, setCreatingChild]                 = useState(false);

  // Edit child
  const [editingChildId, setEditingChildId]               = useState<number | null>(null);
  const [editChildName, setEditChildName]                 = useState('');
  const [editChildAge, setEditChildAge]                   = useState<number>(5);
  const [editParticipantCategory, setEditParticipantCategory] = useState<'enfant' | 'jeune' | 'adulte'>('enfant');
  const [childActionLoading, setChildActionLoading]       = useState(false);

  // Invite professional
  const [inviteName,    setInviteName]    = useState('');
  const [inviteEmail,   setInviteEmail]   = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult,  setInviteResult]  = useState<InviteResult | null>(null);
  const [inviteError,   setInviteError]   = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  // My professionals list
  const [myProfessionals,        setMyProfessionals]        = useState<ProfessionalRecord[]>([]);
  const [myProfessionalsLoading, setMyProfessionalsLoading] = useState(false);
  const [profActionLoading,      setProfActionLoading]      = useState(false);
  const [profActionMsg,          setProfActionMsg]          = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ── Analytics data fetch ─────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'analytics' || !selectedChild) return;
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError('');
        const [ovRes, tlRes, bdRes, scRes] = await Promise.all([
          api.get(`/api/analytics/child/${selectedChild.id}/overview`),
          api.get(`/api/analytics/child/${selectedChild.id}/sessions-timeline`),
          api.get(`/api/analytics/child/${selectedChild.id}/activity-breakdown`),
          api.get(`/api/analytics/child/${selectedChild.id}/scores-by-category`),
        ]);
        if (ovRes.data.success) setAnalyticsOverview(ovRes.data.data);
        if (tlRes.data.success) setAnalyticsTimeline(tlRes.data.data);
        if (bdRes.data.success) setAnalyticsBreakdown(bdRes.data.data);
        if (scRes.data.success) setAnalyticsScores(scRes.data.data);
      } catch (err: any) {
        setAnalyticsError(err?.response?.data?.message || 'Erreur lors du chargement des analytiques.');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [view, selectedChild]);

  // ── Chart rendering (re-runs whenever timeline/breakdown data changes) ────
  useEffect(() => {
    if (view !== 'analytics' || analyticsLoading || !window.Chart) return;
    const timer = setTimeout(() => {
      const gridOpts = { color: 'rgba(100,116,139,.08)', borderColor: 'rgba(100,116,139,.12)' };
      const fontOpts = { family: 'Inter,sans-serif', size: 11, color: '#64748b' };

      // ── Line chart: sessions timeline ─────────────────────────────────────
      const lineCtx = document.getElementById('lineChart') as HTMLCanvasElement | null;
      if (lineCtx) {
        if (lineChartRef.current) { lineChartRef.current.destroy(); lineChartRef.current = null; }
        const labels = analyticsTimeline.map(p =>
          new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        );
        const minutesData = analyticsTimeline.map(p => p.minutes);
        const avgMin = minutesData.length ? Math.round(minutesData.reduce((a, b) => a + b, 0) / minutesData.length) : 20;
        lineChartRef.current = new window.Chart(lineCtx, {
          type: 'line',
          data: {
            labels: labels.length ? labels : ['Aucune donnée'],
            datasets: [
              {
                label: 'Temps (min)',
                data: minutesData.length ? minutesData : [0],
                borderColor: '#00A651', backgroundColor: 'rgba(0,166,81,.08)',
                fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#00A651', borderWidth: 2,
              },
              {
                label: 'Objectif',
                data: labels.length ? labels.map(() => avgMin) : [avgMin],
                borderColor: '#007A3A', borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false,
              },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: gridOpts, ticks: { ...fontOpts, maxRotation: 0 } },
              y: { grid: gridOpts, ticks: { ...fontOpts }, min: 0 },
            },
          },
        });
      }

      // ── Donut chart: activity breakdown ───────────────────────────────────
      const donutCtx = document.getElementById('donutChart') as HTMLCanvasElement | null;
      if (donutCtx) {
        if (donutChartRef.current) { donutChartRef.current.destroy(); donutChartRef.current = null; }
        const PALETTE = ['#00A651','#007A3A','#00C853','#00572A','#33CC77','#009944','#C2EAD4','#00E676'];
        const bdLabels = analyticsBreakdown.map(b => b.category);
        const bdData   = analyticsBreakdown.map(b => b.count);
        donutChartRef.current = new window.Chart(donutCtx, {
          type: 'doughnut',
          data: {
            labels: bdLabels.length ? bdLabels : ['Aucune activité'],
            datasets: [{
              data: bdData.length ? bdData : [1],
              backgroundColor: bdLabels.length ? PALETTE.slice(0, bdLabels.length) : ['#e2e8f0'],
              borderWidth: 2, borderColor: '#fff',
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '64%',
            plugins: { legend: { display: false } },
          },
        });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [view, analyticsTimeline, analyticsBreakdown, analyticsLoading]);

  // ── Data fetching ────────────────────────────────────────────────────────
  const refreshChildren = async (): Promise<void> => {
    const { data } = await api.get<ApiResult<Child[]>>('/api/child/mychildren');
    if (data.success && data.data.length > 0) {
      setChildren(data.data);
      setSelectedChild(prev => prev ?? data.data[0]);
    }
  };

  useEffect(() => { refreshChildren().catch(console.error); }, []);

  useEffect(() => {
    if (!selectedChild) return;
    const fetchData = async () => {
      try {
        const [{ data: act }, { data: not }] = await Promise.all([
          api.get<ApiResult<Activity[]>>(`/api/activity-log/child/${selectedChild.id}`),
          api.get<ApiResult<Note[]>>(`/api/note/child/${selectedChild.id}`),
        ]);
        if (act.success) setActivities(act.data);
        if (not.success) setNotes(not.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [selectedChild]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = (() => {
    if (!activities.length) return { games: 0, time: 0, avgScore: 0 };
    const totalTime = activities.reduce((s, a) => s + (a.duration_seconds || 0), 0);
    const avgScore  = activities.reduce((s, a) => s + (a.score || 0), 0) / activities.length;
    return { games: activities.length, time: Math.round(totalTime / 60), avgScore: Math.round(avgScore) };
  })();

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleCreateChild = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newChildName.trim()) { alert('Le nom du participant est obligatoire.'); return; }
    try {
      setCreatingChild(true);
      const { data } = await api.post<ApiResult<Child>>('/api/child', { name: newChildName.trim(), age: Number(newChildAge), participantCategory: newParticipantCategory });
      if (!data.success) { alert(data.message || 'Impossible de créer le profil.'); return; }
      await refreshChildren();
      setSelectedChild(data.data);
      setNewChildName(''); setNewChildAge(5); setNewParticipantCategory('enfant');
    } catch (err: any) {
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      alert(`Erreur lors de la création du profil.\n\n${serverMsg}`);
    }
    finally { setCreatingChild(false); }
  };

  const handleStartEdit = (child: Child) => { setEditingChildId(child.id); setEditChildName(child.name); setEditChildAge(child.age); setEditParticipantCategory(child.participant_category || 'enfant'); };

  const handleSaveEdit = async (childId: number) => {
    if (!editChildName.trim()) { alert('Le nom du participant est obligatoire.'); return; }
    try {
      setChildActionLoading(true);
      const { data } = await api.put<ApiResult<Child>>(`/api/child/${childId}`, { name: editChildName.trim(), age: Number(editChildAge), participantCategory: editParticipantCategory });
      if (!data.success) { alert(data.message || 'Impossible de modifier.'); return; }
      await refreshChildren(); setEditingChildId(null);
    } catch { alert('Erreur lors de la modification.'); }
    finally { setChildActionLoading(false); }
  };

  const handleDeleteChild = async (child: Child) => {
    if (!window.confirm(`Supprimer le profil de ${child.name} ? Cette action est irréversible.`)) return;
    try {
      setChildActionLoading(true);
      const { data } = await api.delete<ApiResult<null>>(`/api/child/${child.id}`);
      if (!data.success) { alert(data.message || 'Impossible de supprimer.'); return; }
      const remaining = children.filter(c => c.id !== child.id);
      setChildren(remaining);
      if (selectedChild?.id === child.id) setSelectedChild(remaining[0] ?? null);
    } catch { alert('Erreur lors de la suppression.'); }
    finally { setChildActionLoading(false); }
  };

  const fetchMyProfessionals = async () => {
    try {
      setMyProfessionalsLoading(true);
      const { data } = await api.get<ApiResult<ProfessionalRecord[]>>('/api/parent/my-professionals');
      if (data.success) setMyProfessionals(data.data);
    } catch { /* silent */ }
    finally { setMyProfessionalsLoading(false); }
  };

  useEffect(() => {
    if (view === 'professional') fetchMyProfessionals();
  }, [view]);

  const handleInviteProfessional = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteError('');
    setInviteResult(null);
    if (!inviteName.trim() || !inviteEmail.trim()) { setInviteError('Nom et email sont obligatoires.'); return; }
    try {
      setInviteLoading(true);
      const { data } = await api.post<ApiResult<InviteResult>>('/api/parent/invite-professional', {
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
      });
      if (!data.success) { setInviteError(data.message || 'Erreur lors de l\'invitation.'); return; }
      setInviteResult(data.data);
      setInviteName(''); setInviteEmail('');
      setShowInviteForm(false);
      await fetchMyProfessionals();
    } catch (err: any) {
      setInviteError(err?.response?.data?.message || 'Erreur réseau. Veuillez réessayer.');
    } finally {
      setInviteLoading(false);
    }
  };

  const showProfMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setProfActionMsg({ text, type });
    setTimeout(() => setProfActionMsg(null), 4000);
  };

  const handleRevokeInvitation = async (profId: number) => {
    if (!window.confirm('Révoquer l\'accès de ce professionnel ? Il ne pourra plus voir vos données.')) return;
    try {
      setProfActionLoading(true);
      const { data } = await api.delete<ApiResult<null>>(`/api/parent/invitation/${profId}`);
      if (!data.success) { showProfMsg(data.message || 'Erreur', 'error'); return; }
      showProfMsg('Accès révoqué avec succès.');
      await fetchMyProfessionals();
    } catch { showProfMsg('Erreur réseau.', 'error'); }
    finally { setProfActionLoading(false); }
  };

  const handleResendInvitation = async (profId: number) => {
    try {
      setProfActionLoading(true);
      const { data } = await api.post<ApiResult<{ inviteLink: string; previewUrl?: string }>>(`/api/parent/resend-invitation/${profId}`);
      if (!data.success) { showProfMsg(data.message || 'Erreur', 'error'); return; }
      showProfMsg(data.message || 'Invitation renvoyée ✓');
      await fetchMyProfessionals();
    } catch { showProfMsg('Erreur réseau.', 'error'); }
    finally { setProfActionLoading(false); }
  };

  const currentNav = NAV.find(n => n.key === view);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="pd-layout">

      {/* ══ SIDEBAR (fixed full-height) ══ */}
      <aside className="pd-sidebar">

        {/* Brand */}
        <div className="pd-sidebar__brand">
          <div className="pd-sidebar__logo">🧩</div>
          <div className="pd-sidebar__brand-text">
            <h2>AIDAA</h2>
            <span>Espace famille</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="pd-sidebar__nav">
          <div className="pd-nav__label">Navigation</div>
          {NAV.map(n => (
            <button
              key={n.key}
              className={`pd-nav__item ${view === n.key ? 'active' : ''}`}
              onClick={() => setView(n.key)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
          <button className="pd-nav__item" onClick={() => navigate('/child-selection')}>
            <span className="nav-icon">🧒</span>
            Espace enfant
          </button>
        </nav>

        {/* Children list + create form */}
        <div className="pd-sidebar__children">
          <div className="pd-section-title">Participants</div>

          {children.map(child => (
            <div key={child.id} className={`pd-child-item ${selectedChild?.id === child.id ? 'active' : ''}`}>
              <button type="button" className="pd-child-main" onClick={() => setSelectedChild(child)}>
                <span className="pd-child-avatar">{child.name.charAt(0).toUpperCase()}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {child.name}, {child.age} ans
                  {child.participant_category ? ` · ${child.participant_category}` : ''}
                </span>
              </button>

              <div className="pd-child-row-actions">
                <button type="button" className="pd-child-action-btn" onClick={() => handleStartEdit(child)} disabled={childActionLoading} aria-label="Modifier">✏️ Modifier</button>
                <button type="button" className="pd-child-action-btn pd-child-action-btn--danger" onClick={() => handleDeleteChild(child)} disabled={childActionLoading} aria-label="Supprimer">🗑️</button>
              </div>

              {editingChildId === child.id && (
                <div className="pd-child-edit-form">
                  <input type="text" value={editChildName} onChange={e => setEditChildName(e.target.value)} maxLength={60} placeholder="Nom" />
                  <input type="number" value={editChildAge} onChange={e => setEditChildAge(Number(e.target.value))} min={2} max={99} />
                  <select value={editParticipantCategory} onChange={e => setEditParticipantCategory(e.target.value as any)}>
                    <option value="enfant">Enfant</option>
                    <option value="jeune">Jeune</option>
                    <option value="adulte">Adulte</option>
                  </select>
                  <div className="pd-child-edit-actions">
                    <button type="button" onClick={() => handleSaveEdit(child.id)} disabled={childActionLoading}>✓ Enregistrer</button>
                    <button type="button" onClick={() => setEditingChildId(null)} disabled={childActionLoading}>✕ Annuler</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <form className="pd-create-form" onSubmit={handleCreateChild}>
            <h5>Créer un participant</h5>
            <input type="text" value={newChildName} onChange={e => setNewChildName(e.target.value)} placeholder="Nom du participant" maxLength={60} />
            <input type="number" value={newChildAge} onChange={e => setNewChildAge(Number(e.target.value))} min={2} max={99} />
            <select value={newParticipantCategory} onChange={e => setNewParticipantCategory(e.target.value as any)}>
              <option value="enfant">Enfant</option>
              <option value="jeune">Jeune</option>
              <option value="adulte">Adulte</option>
            </select>
            <button type="submit" disabled={creatingChild}>{creatingChild ? 'Création…' : '+ Ajouter participant'}</button>
          </form>
        </div>

        {/* Footer / logout */}
        <div className="pd-sidebar__footer">
          <button className="pd-logout-btn" onClick={logout}>
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="pd-main">

        {/* Sticky topbar */}
        <header className="pd-topbar">
          <div className="pd-topbar__left">
            <div className="pd-topbar__breadcrumb">Espace Famille / {currentNav?.label}</div>
            <h1 className="pd-topbar__title">{currentNav?.icon} {currentNav?.label}</h1>
          </div>
          <div className="pd-topbar__right">
            {children.length > 0 && (
              <div className="pd-child-select">
                <label>Participant :</label>
                <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id === +e.target.value) || null)}>
                  {children.map(c => <option key={c.id} value={c.id}>{c.name} ({c.age} ans)</option>)}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <div className="pd-content">

          {/* No children */}
          {children.length === 0 && (
            <div className="pd-empty-state">
              🔍 Aucun participant enregistré pour le moment.<br />
              Utilisez le formulaire dans la barre latérale pour créer un profil.
            </div>
          )}

          {selectedChild && (
            <>
              {/* Hero */}
              <div className="pd-hero">
                <h2>📈 Suivi de progression — {selectedChild.name}</h2>
                <p>Visualisez les activités, les performances et les notes de suivi au même endroit.</p>
              </div>

              {/* ── Summary ── */}
              {view === 'summary' && (
                <>
                  <p className="pd-section-h2">Résumé — {selectedChild.name}</p>
                  <div className="pd-stats-grid">
                    <div className="pd-stat-card"><div className="pd-stat-icon">🎮</div><div className="pd-stat-label">Activités jouées</div><div className="pd-stat-value">{stats.games}</div></div>
                    <div className="pd-stat-card"><div className="pd-stat-icon">⏱️</div><div className="pd-stat-label">Temps total (min)</div><div className="pd-stat-value">{stats.time}</div></div>
                    <div className="pd-stat-card"><div className="pd-stat-icon">⭐</div><div className="pd-stat-label">Score moyen</div><div className="pd-stat-value">{stats.avgScore}</div></div>
                  </div>
                  <div className="pd-panel"><h3>Activités récentes</h3><p className="pd-empty-inline">Aucune activité enregistrée pour le moment. Les données apparaîtront ici au fil des sessions.</p></div>
                </>
              )}

              {/* ── Activities ── */}
              {view === 'activities' && (
                <>
                  <p className="pd-section-h2">Activités — {selectedChild.name}</p>
                  <div className="pd-panel"><p className="pd-empty-inline">Aucune activité enregistrée pour l'instant.</p></div>
                </>
              )}

              {/* ── Analytics ── */}
              {view === 'analytics' && (
                <>
                  {analyticsError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                      ❌ {analyticsError}
                    </div>
                  )}

                  {analyticsLoading ? (
                    <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,.6)', fontSize: 15 }}>
                      ⏳ Chargement des analytiques…
                    </div>
                  ) : (
                    <>
                      {/* KPI cards */}
                      <div className="pd-kpi-grid">
                        <div className="pd-kpi">
                          <div className="pd-kpi-icon">🎮</div>
                          <div className="pd-kpi-val">{analyticsOverview?.totalSessions ?? '—'}</div>
                          <div className="pd-kpi-label">Sessions jouées</div>
                        </div>
                        <div className="pd-kpi">
                          <div className="pd-kpi-icon">⏱</div>
                          <div className="pd-kpi-val">
                            {analyticsOverview != null
                              ? `${(analyticsOverview.totalMinutes / 60).toFixed(1)} h`
                              : '—'}
                          </div>
                          <div className="pd-kpi-label">Temps total</div>
                        </div>
                        <div className="pd-kpi">
                          <div className="pd-kpi-icon">⭐</div>
                          <div className="pd-kpi-val">{analyticsOverview?.avgScore ?? '—'}</div>
                          <div className="pd-kpi-label">Score moy. / 100</div>
                        </div>
                        <div className="pd-kpi">
                          <div className="pd-kpi-icon">🔥</div>
                          <div className="pd-kpi-val">{analyticsOverview?.streakDays ?? '—'}</div>
                          <div className="pd-kpi-label">Jours consécutifs</div>
                        </div>
                      </div>

                      {/* Charts row */}
                      <div className="pd-charts-row">
                        <div className="pd-chart-card">
                          <h3>Temps de session quotidien (minutes)</h3>
                          <div className="pd-chart-wrap" style={{ height: 180 }}>
                            {analyticsTimeline.length === 0
                              ? <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, paddingTop: 60, textAlign: 'center' }}>Aucune session enregistrée</p>
                              : <canvas id="lineChart" />
                            }
                          </div>
                        </div>
                        <div className="pd-chart-card">
                          <h3>Répartition par type d'activité</h3>
                          <div className="pd-chart-wrap" style={{ height: 180 }}>
                            {analyticsBreakdown.length === 0
                              ? <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, paddingTop: 60, textAlign: 'center' }}>Aucune activité catégorisée</p>
                              : <canvas id="donutChart" />
                            }
                          </div>
                        </div>
                      </div>

                      {/* Scores by category */}
                      <div className="pd-chart-card">
                        <h3>Scores moyens par catégorie</h3>
                        {analyticsScores.length === 0 ? (
                          <p className="pd-empty-inline">Aucune donnée de score disponible pour l'instant.</p>
                        ) : (
                          <div className="pd-progress-list">
                            {analyticsScores.map((s, i) => {
                              const COLORS = ['#00A651','#007A3A','#00C853','#00572A','#33CC77','#009944'];
                              const color  = COLORS[i % COLORS.length];
                              return (
                                <div key={i} className="pd-prog-row">
                                  <div className="pd-prog-label" style={{ textTransform: 'capitalize' }}>{s.category}</div>
                                  <div className="pd-prog-bar-bg">
                                    <div className="pd-prog-bar" style={{ width: `${s.avgScore}%`, background: color }} />
                                  </div>
                                  <div className="pd-prog-val">{s.avgScore} / 100</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Notes ── */}
              {view === 'notes' && (
                <>
                  <p className="pd-section-h2">Notes médicales — {selectedChild.name}</p>
                  <div className="pd-panel">
                    <div className="pd-notes-list">
                      {notes.map(note => (
                        <div key={note.id} className="pd-note-card">
                          <div className="pd-note-header">
                            <h3>Dr. {note.professional_name}</h3>
                            <small>{new Date(note.date).toLocaleDateString('fr-FR')}</small>
                          </div>
                          <p className="pd-note-content">{note.content}</p>
                        </div>
                      ))}
                      {notes.length === 0 && <p className="pd-empty-inline">Aucune note médicale pour le moment.</p>}
                    </div>
                  </div>
                </>
              )}

              {/* ── Mon Professionnel ── */}
              {view === 'professional' && (
                <>
                  <p className="pd-section-h2">🩺 Mes professionnels de santé</p>

                  {/* Message d'action inline */}
                  {profActionMsg && (
                    <div className={`pd-action-msg pd-action-msg--${profActionMsg.type}`}>
                      {profActionMsg.type === 'success' ? '✅' : '❌'} {profActionMsg.text}
                    </div>
                  )}

                  {/* ── En-tête avec bouton inviter ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', fontWeight: 500 }}>
                      {myProfessionals.length} professionnel{myProfessionals.length !== 1 ? 's' : ''} invité{myProfessionals.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      className="pd-invite-btn"
                      style={{ fontSize: 13, padding: '8px 18px' }}
                      onClick={() => { setShowInviteForm(f => !f); setInviteResult(null); setInviteError(''); }}
                    >
                      {showInviteForm ? '✕ Annuler' : '➕ Inviter un professionnel'}
                    </button>
                  </div>

                  {/* ── Formulaire d'invitation ── */}
                  {(showInviteForm || myProfessionals.length === 0) && !inviteResult && (
                    <div className="pd-panel" style={{ marginBottom: 20 }}>
                      <h3>➕ Inviter un professionnel</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--pd-text-light)', marginBottom: 16, lineHeight: 1.6 }}>
                        Invitez un médecin, orthophoniste ou psychologue à suivre l'évolution de vos enfants.
                        Il recevra un email avec un lien pour créer son compte.
                      </p>
                      <form onSubmit={handleInviteProfessional} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--pd-text-light)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' }}>Nom complet *</label>
                            <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Dr. Prénom Nom" maxLength={100} className="pd-invite-input" required />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--pd-text-light)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' }}>Adresse email *</label>
                            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="docteur@exemple.com" className="pd-invite-input" required />
                          </div>
                        </div>
                        {inviteError && <div className="pd-invite-error">❌ {inviteError}</div>}
                        <div>
                          <button type="submit" className="pd-invite-btn" disabled={inviteLoading}>
                            {inviteLoading ? '⏳ Envoi en cours…' : '📨 Envoyer l\'invitation'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ── Résultat d'invitation ── */}
                  {inviteResult && (
                    <div className="pd-invite-success" style={{ marginBottom: 20 }}>
                      <div className="pd-invite-success__icon">✅</div>
                      <div className="pd-invite-success__body">
                        <h4>Invitation envoyée à <strong>{inviteResult.name}</strong></h4>
                        <p>Email envoyé à <strong>{inviteResult.email}</strong>. Le professionnel créera son mot de passe via le lien reçu.</p>
                        <div className="pd-invite-link-box">
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pd-green-dark)', display: 'block', marginBottom: 4 }}>🔗 Lien de configuration</span>
                          <a href={inviteResult.inviteLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--pd-green-dark)', wordBreak: 'break-all' }}>{inviteResult.inviteLink}</a>
                        </div>
                        {inviteResult.previewUrl && (
                          <div className="pd-invite-link-box" style={{ marginTop: 8, background: '#fef9c3', borderColor: '#fde68a' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#854d0e', display: 'block', marginBottom: 4 }}>📧 Aperçu email Ethereal</span>
                            <a href={inviteResult.previewUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#854d0e', wordBreak: 'break-all' }}>{inviteResult.previewUrl}</a>
                          </div>
                        )}
                        <button type="button" className="pd-invite-new-btn" onClick={() => { setInviteResult(null); setShowInviteForm(true); }}>➕ Inviter un autre</button>
                      </div>
                    </div>
                  )}

                  {/* ── Cartes professionnels avec étapes ── */}
                  {myProfessionalsLoading ? (
                    <div className="pd-panel" style={{ textAlign: 'center', padding: 32, color: 'var(--pd-text-light)' }}>⏳ Chargement…</div>
                  ) : (
                    <div className="pd-inv-list">
                      {myProfessionals.map(prof => {
                        const isPending = prof.status === 'pending';
                        const isActive  = prof.status === 'active';
                        const isRevoked = prof.status === 'revoked';
                        return (
                          <div key={prof.id} className={`pd-inv-card pd-inv-card--${prof.status}`}>

                            {/* En-tête carte */}
                            <div className="pd-inv-card__head">
                              <div className="pd-inv-card__avatar">{prof.name.charAt(0).toUpperCase()}</div>
                              <div className="pd-inv-card__info">
                                <strong>{prof.name}</strong>
                                <span>{prof.email}</span>
                              </div>
                              <span className="pd-inv-card__date">
                                Invité le {new Date(prof.invited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                            </div>

                            {/* Étapes */}
                            <div className="pd-inv-steps">

                              {/* Étape 1 : Invitation envoyée — toujours ✓ */}
                              <div className="pd-inv-step pd-inv-step--done">
                                <div className="pd-inv-step__circle">✓</div>
                                <div className="pd-inv-step__text">
                                  <div className="pd-inv-step__label">Invitation envoyée</div>
                                  <div className="pd-inv-step__desc">Le professionnel a reçu un lien d'activation par email</div>
                                </div>
                              </div>

                              {/* Étape 2 : Configuration du compte */}
                              <div className={`pd-inv-step ${isActive || isRevoked ? 'pd-inv-step--done' : 'pd-inv-step--active'}`}>
                                <div className={`pd-inv-step__circle${isActive || isRevoked ? '' : ' pd-inv-step__circle--pulse'}`}>
                                  {isActive || isRevoked ? '✓' : '2'}
                                </div>
                                <div className="pd-inv-step__text">
                                  <div className="pd-inv-step__label">
                                    {isActive || isRevoked ? 'Compte configuré' : 'En attente de configuration'}
                                  </div>
                                  <div className="pd-inv-step__desc">
                                    {isActive || isRevoked
                                      ? 'Le professionnel a créé son mot de passe'
                                      : 'Le professionnel n\'a pas encore défini son mot de passe'}
                                  </div>
                                </div>
                              </div>

                              {/* Étape 3 : Suivi actif / Révoqué */}
                              <div className={`pd-inv-step ${isActive ? 'pd-inv-step--done' : isRevoked ? 'pd-inv-step--revoked' : ''}`}>
                                <div className={`pd-inv-step__circle${isPending ? ' pd-inv-step__circle--muted' : isRevoked ? ' pd-inv-step__circle--danger' : ''}`}>
                                  {isActive ? '✓' : isRevoked ? '✕' : '3'}
                                </div>
                                <div className="pd-inv-step__text">
                                  <div className="pd-inv-step__label">
                                    {isActive ? 'Suivi actif' : isRevoked ? 'Accès révoqué' : 'Suivi en attente'}
                                  </div>
                                  <div className="pd-inv-step__desc">
                                    {isActive
                                      ? 'Ce professionnel suit l\'évolution de vos enfants'
                                      : isRevoked
                                        ? 'Vous avez révoqué l\'accès à ce professionnel'
                                        : 'En attente que le professionnel configure son compte'}
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Actions */}
                            <div className="pd-inv-card__actions">
                              {isPending && (
                                <button className="pd-inv-btn" onClick={() => handleResendInvitation(prof.id)} disabled={profActionLoading}>
                                  📨 Renvoyer l'invitation
                                </button>
                              )}
                              {!isRevoked && (
                                <button className="pd-inv-btn pd-inv-btn--danger" onClick={() => handleRevokeInvitation(prof.id)} disabled={profActionLoading}>
                                  🚫 Révoquer l'accès
                                </button>
                              )}
                              {isRevoked && (
                                <button className="pd-inv-btn pd-inv-btn--restore" onClick={() => handleResendInvitation(prof.id)} disabled={profActionLoading}>
                                  🔄 Réactiver l'accès
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── Messages ── */}
              {view === 'messages' && (
                <div className="pd-coming-soon">
                  <h2>💬 Messages</h2>
                  <p>La messagerie parent-professionnel arrive bientôt.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
