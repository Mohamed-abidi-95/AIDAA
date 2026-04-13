// ============================================================================
// PARENT DASHBOARD — Design identique à ProfessionalPage (Tailwind + FA icons)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import { MessagerieView } from './MessagerieView';
import { ChatbotWidget } from '../features/chatbot/ChatbotWidget';
import { StatCard, Section, ScoreBadge, useToast, ToastStack, inputClsGreen as inputCls } from '../components';

declare global { interface Window { Chart: any; } }

// ── Interfaces ─────────────────────────────────────────────────────────────
interface Child { id: number; name: string; age: number; participant_category?: 'enfant' | 'jeune' | 'adulte'; }
interface Activity { id: number; child_id: number; content_title: string; score: number; duration_seconds: number; date: string; }
interface Note { id: number; child_id: number; content: string; professional_name: string; date: string; }
interface ApiResult<T> { success: boolean; data: T; message?: string; }
interface InviteResult { id: number; name: string; email: string; inviteLink: string; previewUrl?: string; emailSent?: boolean; emailError?: string; }
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
  { key: 'summary',      fa: 'fa-solid fa-chart-pie',          label: 'Résumé'              },
  { key: 'activities',   fa: 'fa-solid fa-gamepad',             label: 'Activités'           },
  { key: 'analytics',    fa: 'fa-solid fa-chart-line',          label: 'Analytiques'         },
  { key: 'notes',        fa: 'fa-solid fa-notes-medical',       label: 'Notes médicales'     },
  { key: 'professional', fa: 'fa-solid fa-stethoscope',         label: 'Mon professionnel'   },
  { key: 'messages',     fa: 'fa-solid fa-comments',            label: 'Messages'            },
] as const;

type ViewKey = typeof NAV[number]['key'];


// ── Component ───────────────────────────────────────────────────────────────
export const ParentDashboard = (): JSX.Element => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toasts, remove: removeToast } = useToast();

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

  const handleCancelInvitation = async (profId: number, profName: string) => {
    if (!window.confirm(`Annuler l'invitation envoyée à ${profName} ?`)) return;
    try {
      setProfActionLoading(true);
      const { data } = await api.delete<ApiResult<null>>(`/api/parent/invitation/${profId}`);
      if (!data.success) { showProfMsg(data.message || 'Erreur', 'error'); return; }
      showProfMsg('Invitation annulée.');
      await fetchMyProfessionals();
    } catch { showProfMsg('Erreur réseau.', 'error'); }
    finally { setProfActionLoading(false); }
  };

  const handleDeleteInvitation = async (profId: number, profName: string) => {
    if (!window.confirm(`Supprimer définitivement l'invitation de ${profName} ? Cette action est irréversible.`)) return;
    try {
      setProfActionLoading(true);
      const { data } = await api.delete<ApiResult<null>>(`/api/parent/invitation/${profId}/delete`);
      if (!data.success) { showProfMsg(data.message || 'Erreur', 'error'); return; }
      showProfMsg(`Invitation de ${profName} supprimée.`);
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
  const parentInit = user?.name?.charAt(0).toUpperCase() || 'P';

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="font-sans antialiased flex h-screen overflow-hidden bg-slate-50 animate-page-in">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className="w-[280px] flex flex-col z-10 shrink-0 overflow-y-auto"
        style={{
          background: '#10b981',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)',
          backgroundSize: '20px 20px',
          boxShadow: '4px 0 15px rgba(16,185,129,0.2)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-4 px-6 py-8 shrink-0">
          <div className="w-12 h-12 bg-white text-brand-green rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
            <i className="fa-solid fa-puzzle-piece" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none">AIDAA</h2>
            <span className="text-[11px] text-white/80 font-medium uppercase tracking-widest">Espace Famille</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 flex flex-col gap-2">
          {NAV.map(n => (
            <button key={n.key}
              className={`flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border transition-all
                ${view === n.key
                  ? 'bg-white text-brand-green shadow-md border-transparent'
                  : 'text-white border-transparent hover:bg-white/15 hover:border-white/20'}`}
              onClick={() => setView(n.key)}
            >
              <i className={`${n.fa} w-6 mr-3 text-lg ${view === n.key ? 'text-brand-green' : 'opacity-80'}`} />
              {n.label}
            </button>
          ))}
          <button
            className="flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border text-white border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
            onClick={() => navigate('/child-selection')}
          >
            <i className="fa-solid fa-child w-6 mr-3 text-lg opacity-80" />
            Espace enfant
          </button>
        </nav>

        {/* Participants list */}
        <div className="px-5 pb-4 flex flex-col gap-2 shrink-0">
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest px-1 pt-3 pb-1">
            Participants ({children.length})
          </p>

          <div className="max-h-44 overflow-y-auto flex flex-col gap-1">
            {children.map(child => (
              <div key={child.id}>
                <div className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all border
                  ${selectedChild?.id === child.id ? 'bg-white/20 border-white/30' : 'bg-white/06 border-transparent hover:bg-white/12'}`}
                >
                  <button type="button" className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => setSelectedChild(child)}>
                    <div className="w-7 h-7 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate leading-tight text-xs">{child.name}</p>
                      <p className="text-[10px] text-white/50 truncate">{child.age} ans{child.participant_category ? ` · ${child.participant_category}` : ''}</p>
                    </div>
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => handleStartEdit(child)} disabled={childActionLoading}
                      className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all" aria-label="Modifier">
                      <i className="fa-solid fa-pen text-[9px]" />
                    </button>
                    <button type="button" onClick={() => handleDeleteChild(child)} disabled={childActionLoading}
                      className="w-6 h-6 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white flex items-center justify-center transition-all" aria-label="Supprimer">
                      <i className="fa-solid fa-trash text-[9px]" />
                    </button>
                  </div>
                </div>
                {editingChildId === child.id && (
                  <div className="mt-1 p-3 bg-white/10 border border-white/20 rounded-xl flex flex-col gap-2">
                    <input type="text" value={editChildName} onChange={e => setEditChildName(e.target.value)} maxLength={60} placeholder="Nom"
                      className="w-full px-2 py-1.5 rounded-lg bg-white/20 text-white placeholder-white/40 text-xs border border-white/20 focus:outline-none" />
                    <input type="number" value={editChildAge} onChange={e => setEditChildAge(Number(e.target.value))} min={2} max={99}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/20 text-white text-xs border border-white/20 focus:outline-none" />
                    <select value={editParticipantCategory} onChange={e => setEditParticipantCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/20 text-white text-xs border border-white/20 focus:outline-none">
                      <option value="enfant">Enfant</option><option value="jeune">Jeune</option><option value="adulte">Adulte</option>
                    </select>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleSaveEdit(child.id)} disabled={childActionLoading}
                        className="flex-1 py-1 rounded-lg bg-white text-brand-green font-bold text-xs hover:bg-emerald-50 transition">✓ Enregistrer</button>
                      <button type="button" onClick={() => setEditingChildId(null)} disabled={childActionLoading}
                        className="flex-1 py-1 rounded-lg bg-white/20 text-white font-bold text-xs hover:bg-white/30 transition">✕ Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add child mini form */}
          <form onSubmit={handleCreateChild} className="mt-1 p-3 bg-white/10 border border-white/20 rounded-xl flex flex-col gap-2">
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Ajouter un participant</p>
            <input type="text" value={newChildName} onChange={e => setNewChildName(e.target.value)} placeholder="Nom" maxLength={60}
              className="w-full px-2 py-1.5 rounded-lg bg-white/20 text-white placeholder-white/40 text-xs border border-white/20 focus:outline-none" />
            <div className="flex gap-2">
              <input type="number" value={newChildAge} onChange={e => setNewChildAge(Number(e.target.value))} min={2} max={99}
                className="w-16 px-2 py-1.5 rounded-lg bg-white/20 text-white text-xs border border-white/20 focus:outline-none" />
              <select value={newParticipantCategory} onChange={e => setNewParticipantCategory(e.target.value as any)}
                className="flex-1 px-2 py-1.5 rounded-lg bg-white/20 text-white text-xs border border-white/20 focus:outline-none">
                <option value="enfant">Enfant</option><option value="jeune">Jeune</option><option value="adulte">Adulte</option>
              </select>
            </div>
            <button type="submit" disabled={creatingChild}
              className="w-full py-2 rounded-xl bg-white text-brand-green font-bold text-xs hover:bg-emerald-50 transition disabled:opacity-60">
              <i className="fa-solid fa-plus mr-1" />{creatingChild ? 'Création…' : 'Ajouter'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-brand-green text-base shrink-0">
              {parentInit}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Parent'}</p>
              <p className="text-xs text-white/70">Espace famille</p>
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
            <span className="text-sm text-slate-500 font-medium">Espace Famille /</span>
            <span className="text-xl font-bold text-slate-900">{currentNav?.label}</span>
          </div>
          {children.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-500 font-medium">Participant :</label>
              <select
                value={selectedChild?.id || ''}
                onChange={e => setSelectedChild(children.find(c => c.id === +e.target.value) || null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition"
              >
                {children.map(c => <option key={c.id} value={c.id}>{c.name} ({c.age} ans)</option>)}
              </select>
            </div>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-10">

          {/* No children */}
          {children.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 gap-4">
              <i className="fa-solid fa-magnifying-glass text-5xl" />
              <div className="text-center">
                <p className="font-semibold text-slate-600">Aucun participant enregistré</p>
                <p className="text-sm mt-1">Utilisez le formulaire dans la barre latérale pour créer un profil.</p>
              </div>
            </div>
          )}

          {selectedChild && (
            <>
              {/* KPIs */}
              {(view === 'summary' || view === 'activities' || view === 'notes') && (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                  <StatCard icon="fa-solid fa-gamepad"   value={stats.games}    label="Activités jouées"  color="green" />
                  <StatCard icon="fa-regular fa-clock"   value={stats.time}     label="Minutes total"     color="green" />
                  <StatCard icon="fa-solid fa-star"      value={stats.avgScore} label="Score moyen"       color="green" />
                </div>
              )}

              {/* ── Résumé ── */}
              {view === 'summary' && (
                <Section title={`Résumé — ${selectedChild.name}`}
                  badge={<span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold capitalize">{selectedChild.participant_category || 'enfant'}</span>}
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-16 h-16 rounded-2xl bg-brand-green flex items-center justify-center text-white text-2xl font-bold shrink-0">
                      {selectedChild.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedChild.name}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Âge',             val: `${selectedChild.age} ans` },
                          { label: 'Catégorie',       val: selectedChild.participant_category || 'Enfant' },
                          { label: 'Activités',       val: String(stats.games) },
                          { label: 'Temps total',     val: `${stats.time} min` },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-base font-bold text-slate-800 capitalize">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── Activités ── */}
              {view === 'activities' && (
                <Section title={`Journal d'activités — ${selectedChild.name}`}
                  badge={<span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold">{activities.length} activité(s)</span>}
                >
                  {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                      <i className="fa-solid fa-inbox text-5xl" />
                      <p className="font-medium">Aucune activité enregistrée pour ce participant.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-7 -mb-7">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {['#', 'Activité', 'Score', 'Durée', 'Date'].map(h => (
                              <th key={h} className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map((act, i) => (
                            <tr key={act.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-7 py-4 text-brand-green font-bold text-sm">{i + 1}</td>
                              <td className="px-7 py-4 font-semibold text-slate-800">{act.content_title}</td>
                              <td className="px-7 py-4"><ScoreBadge score={act.score} /></td>
                              <td className="px-7 py-4 text-slate-500 text-sm">{Math.round((act.duration_seconds || 0) / 60)} min</td>
                              <td className="px-7 py-4 text-slate-500 text-sm">{new Date(act.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              )}

              {/* ── Analytiques ── */}
              {view === 'analytics' && (
                <>
                  {analyticsError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-600 text-sm font-medium">
                      <i className="fa-solid fa-circle-xmark mr-2" />{analyticsError}
                    </div>
                  )}
                  {analyticsLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                      <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin" />
                      <p>Chargement des analytiques…</p>
                    </div>
                  ) : (
                    <>
                      {/* KPI cards */}
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                        {[
                          { icon: 'fa-solid fa-gamepad',      value: analyticsOverview?.totalSessions ?? '—',                                                             label: 'Sessions jouées'   },
                          { icon: 'fa-regular fa-clock',      value: analyticsOverview != null ? `${(analyticsOverview.totalMinutes / 60).toFixed(1)} h` : '—',          label: 'Temps total'       },
                          { icon: 'fa-solid fa-star',         value: analyticsOverview?.avgScore ?? '—',                                                                  label: 'Score moy. / 100'  },
                          { icon: 'fa-solid fa-fire',         value: analyticsOverview?.streakDays ?? '—',                                                                label: 'Jours consécutifs' },
                        ].map(s => (
                          <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 rounded-[14px] bg-emerald-100 text-brand-green flex items-center justify-center text-xl shrink-0">
                              <i className={s.icon} />
                            </div>
                            <div>
                              <p className="text-[28px] font-bold leading-none text-slate-900 mb-1">{s.value}</p>
                              <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Charts row */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        <Section title="Temps de session quotidien (min)">
                          <div style={{ height: 200 }}>
                            {analyticsTimeline.length === 0
                              ? <div className="flex items-center justify-center h-full text-slate-400 text-sm">Aucune session enregistrée</div>
                              : <canvas id="lineChart" />
                            }
                          </div>
                        </Section>
                        <Section title="Répartition par type d'activité">
                          <div style={{ height: 200 }}>
                            {analyticsBreakdown.length === 0
                              ? <div className="flex items-center justify-center h-full text-slate-400 text-sm">Aucune activité catégorisée</div>
                              : <canvas id="donutChart" />
                            }
                          </div>
                        </Section>
                      </div>

                      {/* Scores by category */}
                      <Section title="Scores moyens par catégorie">
                        {analyticsScores.length === 0 ? (
                          <p className="text-slate-400 text-sm">Aucune donnée de score disponible.</p>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {analyticsScores.map((s, i) => {
                              const COLORS = ['#10b981','#059669','#34d399','#065f46','#6ee7b7','#047857'];
                              const color = COLORS[i % COLORS.length];
                              return (
                                <div key={i} className="flex items-center gap-4">
                                  <div className="w-32 text-sm font-medium text-slate-700 capitalize shrink-0">{s.category}</div>
                                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${s.avgScore}%`, background: color }} />
                                  </div>
                                  <div className="w-16 text-right text-sm font-bold text-slate-700">{s.avgScore} / 100</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Section>
                    </>
                  )}
                </>
              )}

              {/* ── Notes médicales ── */}
              {view === 'notes' && (
                <Section title={`Notes médicales — ${selectedChild.name}`}
                  badge={<span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold">{notes.length} note(s)</span>}
                >
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                      <i className="fa-solid fa-notes-medical text-4xl" />
                      <p className="font-medium">Aucune note médicale pour le moment.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {notes.map(note => (
                        <div key={note.id} className="bg-slate-50 border border-slate-100 border-l-4 border-l-brand-green rounded-xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-stethoscope text-brand-green text-sm" />
                              <span className="font-bold text-slate-800 text-sm">Dr. {note.professional_name}</span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(note.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* ── Mon Professionnel ── */}
              {view === 'professional' && (
                <>
                  {/* Message d'action */}
                  {profActionMsg && (
                    <div className={`mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold border
                      ${profActionMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                      <i className={profActionMsg.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'} />
                      {profActionMsg.text}
                    </div>
                  )}

                  {/* Header + invite button */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-600 text-sm font-medium">
                      {myProfessionals.length} professionnel{myProfessionals.length !== 1 ? 's' : ''} invité{myProfessionals.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => { setShowInviteForm(f => !f); setInviteResult(null); setInviteError(''); }}
                      className="flex items-center gap-2 bg-brand-green hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-brand-green/20 transition-all"
                    >
                      <i className={showInviteForm ? 'fa-solid fa-xmark' : 'fa-solid fa-plus'} />
                      {showInviteForm ? 'Annuler' : 'Inviter un professionnel'}
                    </button>
                  </div>

                  {/* Invite form */}
                  {(showInviteForm || myProfessionals.length === 0) && !inviteResult && (
                    <Section title="Inviter un professionnel de santé">
                      <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                        Invitez un médecin, orthophoniste ou psychologue à suivre l'évolution de vos enfants.
                        Il recevra un email avec un lien pour créer son compte.
                      </p>
                      <form onSubmit={handleInviteProfessional} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom complet *</label>
                            <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Dr. Prénom Nom" maxLength={100} className={inputCls} required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse email *</label>
                            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="docteur@exemple.com" className={inputCls} required />
                          </div>
                        </div>
                        {inviteError && (
                          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                            <i className="fa-solid fa-circle-xmark" />{inviteError}
                          </div>
                        )}
                        <div>
                          <button type="submit" disabled={inviteLoading}
                            className="flex items-center gap-2 bg-brand-green hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-brand-green/20 transition-all">
                            {inviteLoading
                              ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Envoi en cours…</>
                              : <><i className="fa-solid fa-paper-plane" /> Envoyer l'invitation</>
                            }
                          </button>
                        </div>
                      </form>
                    </Section>
                  )}

                  {/* Invite result */}
                  {inviteResult && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0 ${inviteResult.emailSent === false ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                          <i className={`fa-solid ${inviteResult.emailSent === false ? 'fa-triangle-exclamation' : 'fa-circle-check'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-emerald-800 mb-1">
                            {inviteResult.emailSent === false
                              ? <>Compte créé — email non envoyé</>
                              : <>Invitation envoyée à <strong>{inviteResult.name}</strong></>
                            }
                          </h4>

                          {/* Warning si email non envoyé */}
                          {inviteResult.emailSent === false && (
                            <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm">
                              <p className="font-semibold mb-1">⚠️ L'email n'a pas pu être envoyé</p>
                              <p className="text-xs">Configurez un SMTP dans le <code className="bg-amber-100 px-1 rounded">.env</code> du backend, ou partagez le lien ci-dessous manuellement.</p>
                            </div>
                          )}

                          {inviteResult.emailSent !== false && (
                            <p className="text-emerald-700 text-sm mb-3">
                              Email envoyé à <strong>{inviteResult.email}</strong>. Le professionnel créera son mot de passe via le lien reçu.
                            </p>
                          )}

                          {/* Lien toujours visible + bouton copier */}
                          <div className="bg-white border border-emerald-200 rounded-xl p-3 mb-2">
                            <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                              <i className="fa-solid fa-link" /> Lien d'activation
                              <span className="ml-auto">
                                <button
                                  onClick={() => { navigator.clipboard.writeText(inviteResult.inviteLink); }}
                                  className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1"
                                >
                                  <i className="fa-solid fa-copy" /> Copier
                                </button>
                              </span>
                            </p>
                            <p className="text-xs text-emerald-700 break-all font-mono bg-emerald-50 px-2 py-1 rounded-lg">
                              {inviteResult.inviteLink}
                            </p>
                          </div>

                          {inviteResult.previewUrl && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                              <p className="text-xs font-bold text-yellow-700 mb-1"><i className="fa-solid fa-envelope mr-1" /> Aperçu email Ethereal (mode démo)</p>
                              <a href={inviteResult.previewUrl} target="_blank" rel="noreferrer" className="text-xs text-yellow-700 break-all hover:underline">{inviteResult.previewUrl}</a>
                            </div>
                          )}

                          <button type="button" onClick={() => { setInviteResult(null); setShowInviteForm(true); }}
                            className="flex items-center gap-2 bg-brand-green hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                            <i className="fa-solid fa-plus" /> Inviter un autre
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Professionals list */}
                  {myProfessionalsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                      <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin" />
                      <p>Chargement…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myProfessionals.map(prof => {
                        const isPending = prof.status === 'pending';
                        const isActive  = prof.status === 'active';
                        const isRevoked = prof.status === 'revoked';
                        return (
                          <div key={prof.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                            {/* Header */}
                            <div className="flex items-center gap-4 p-5 bg-slate-50 border-b border-slate-100">
                              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center font-bold text-white text-lg shrink-0">
                                {prof.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900">{prof.name}</p>
                                <p className="text-sm text-slate-500">{prof.email}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                                  ${isActive ? 'bg-emerald-100 text-emerald-700' : isPending ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  <i className={`fa-solid ${isActive ? 'fa-circle-check' : isPending ? 'fa-clock' : 'fa-circle-xmark'} text-[10px]`} />
                                  {isActive ? 'Actif' : isPending ? 'En attente' : 'Révoqué'}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">
                                  depuis le {new Date(prof.invited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            {/* Steps */}
                            <div className="p-5 flex flex-col gap-2">
                              {[
                                { label: 'Invitation envoyée',                          desc: 'Le professionnel a reçu un lien d\'activation par email',                                                               done: true,                            },
                                { label: isActive || isRevoked ? 'Compte configuré' : 'En attente de configuration', desc: isActive || isRevoked ? 'Le professionnel a créé son mot de passe' : 'Le professionnel n\'a pas encore défini son mot de passe', done: isActive || isRevoked, },
                                { label: isActive ? 'Suivi actif ✅' : isRevoked ? 'Accès révoqué' : 'Suivi en attente', desc: isActive ? 'Ce professionnel suit l\'évolution de vos enfants' : isRevoked ? 'Vous avez révoqué l\'accès à ce professionnel' : 'En attente de configuration du compte', done: isActive, danger: isRevoked },
                              ].map((step, idx) => (
                                <div key={idx} className={`flex items-start gap-3 rounded-xl px-4 py-3 border
                                  ${step.done ? 'bg-emerald-50 border-emerald-100' : step.danger ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5
                                    ${step.done ? 'bg-brand-green' : step.danger ? 'bg-red-400' : 'bg-slate-300'}`}>
                                    {step.done ? <i className="fa-solid fa-check text-[10px]" /> : step.danger ? <i className="fa-solid fa-xmark text-[10px]" /> : <span className="text-[10px]">{idx + 1}</span>}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{step.label}</p>
                                    <p className="text-xs text-slate-500">{step.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Actions */}
                            <div className="px-5 pb-5 flex gap-3 flex-wrap">
                              {isPending && (
                                <button onClick={() => handleResendInvitation(prof.id)} disabled={profActionLoading}
                                  className="flex items-center gap-2 bg-brand-green hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-60">
                                  <i className="fa-solid fa-paper-plane" /> Renvoyer l'invitation
                                </button>
                              )}
                              {isPending && (
                                <button onClick={() => handleCancelInvitation(prof.id, prof.name)} disabled={profActionLoading}
                                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-60">
                                  <i className="fa-solid fa-ban" /> Annuler l'invitation
                                </button>
                              )}
                              {isActive && (
                                <button onClick={() => handleRevokeInvitation(prof.id)} disabled={profActionLoading}
                                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-60">
                                  <i className="fa-solid fa-ban" /> Révoquer l'accès
                                </button>
                              )}
                              {isRevoked && (
                                <button onClick={() => handleResendInvitation(prof.id)} disabled={profActionLoading}
                                  className="flex items-center gap-2 bg-brand-green hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-60">
                                  <i className="fa-solid fa-rotate-right" /> Réactiver l'accès
                                </button>
                              )}
                              {/* Suppression définitive — visible pour tous les statuts */}
                              <button onClick={() => handleDeleteInvitation(prof.id, prof.name)} disabled={profActionLoading}
                                className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-60">
                                <i className="fa-regular fa-trash-can" /> Supprimer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {myProfessionals.length === 0 && !showInviteForm && (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 bg-white rounded-2xl border border-dashed border-slate-200">
                          <i className="fa-solid fa-stethoscope text-4xl" />
                          <p className="font-medium">Aucun professionnel invité pour le moment.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ── Messages ── */}
              {view === 'messages' && user?.id && (
                <MessagerieView role="parent" myId={user.id} accent="green" />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Chatbot IA flottant ── */}
      <ChatbotWidget
        childId={selectedChild?.id}
        childName={selectedChild?.name}
        lang="fr"
      />

      {/* ── Toasts ── */}
      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
