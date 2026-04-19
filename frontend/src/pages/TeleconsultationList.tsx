// ============================================================================
// TELECONSULTATION LIST — Design identique à ProfessionalPage (Tailwind + FA)
// ============================================================================
// Données chargées depuis GET /api/teleconsult/my (plus de mock)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import { useToast, ToastStack } from '../components';

// ── Types ──────────────────────────────────────────────────────────────────
interface Child {
  id: number; name: string; age: number;
  parent_id: number; parent_name?: string; participant_category?: string;
}

/** Shape returned by GET /api/teleconsult/my */
interface Teleconsult {
  id: number;
  parent_id: number;
  professional_id: number;
  date_time: string;        // ISO datetime
  meeting_link: string | null;
  notes: string | null;
  room_id?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  parent_name?: string;
  parent_email?: string;
  professional_name?: string;
  professional_email?: string;
  created_at?: string;
}

type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface ApiResult<T> { success: boolean; data: T; message?: string; }

/** Si status DB absent → dériver depuis date_time */
const getEffectiveStatus = (t: Teleconsult): SessionStatus => {
  if (t.status && t.status !== 'scheduled') return t.status;
  const diffMin = (new Date(t.date_time).getTime() - Date.now()) / 60000;
  if (diffMin < -90) return 'completed';
  if (diffMin <= 30) return 'in_progress';
  return 'scheduled';
};

const STATUS_CFG: Record<SessionStatus, { label: string; bg: string; text: string; icon: string }> = {
  scheduled:   { label: 'Planifiée',  bg: 'bg-blue-50',    text: 'text-blue-700',   icon: 'fa-calendar' },
  in_progress: { label: 'En cours',   bg: 'bg-green-50',   text: 'text-green-700',  icon: 'fa-video' },
  completed:   { label: 'Terminée',   bg: 'bg-slate-100',  text: 'text-slate-600',  icon: 'fa-check' },
  cancelled:   { label: 'Annulée',    bg: 'bg-red-50',     text: 'text-red-700',    icon: 'fa-xmark' },
};

// ── Nav config (mirrors ProfessionalPage) ──────────────────────────────────
const NAV = [
  { id: 'patients',    fa: 'fa-solid fa-hospital-user',     label: 'Mes patients'    },
  { id: 'activities',  fa: 'fa-solid fa-chart-column',       label: 'Activités'       },
  { id: 'notes',       fa: 'fa-solid fa-notes-medical',      label: 'Notes cliniques' },
  { id: 'analytics',   fa: 'fa-solid fa-chart-line',         label: 'Analytiques'     },
  { id: 'invitations', fa: 'fa-solid fa-envelope-open-text', label: 'Invitations'     },
] as const;

// ── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: SessionStatus }) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG['scheduled'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      {status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      <i className={`fa-solid ${cfg.icon} text-[10px]`} />
      {cfg.label}
    </span>
  );
};

// ── Component ──────────────────────────────────────────────────────────────
export const TeleconsultationList = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [patients, setPatients]               = useState<Child[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Child | null>(null);
  const [sessions, setSessions]               = useState<Teleconsult[]>([]);
  const [search, setSearch]                   = useState('');
  const [loading, setLoading]                 = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const profInitial = user?.name?.charAt(0).toUpperCase() ?? 'P';

  // ── Fetch patients ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        try {
          const { data } = await api.get<ApiResult<Child[]>>('/api/professional/my-children');
          if (data.success && data.data.length > 0) {
            setPatients(data.data); setSelectedPatient(data.data[0]); return;
          }
        } catch { /* fallback */ }
        const { data } = await api.get<ApiResult<Child[]>>('/api/child/all');
        if (data.success) { setPatients(data.data); if (data.data.length > 0) setSelectedPatient(data.data[0]); }
      } catch { toast('Erreur lors du chargement des patients', 'error'); }
      finally { setLoading(false); }
    };
    fetchPatients();
  }, []);

  // ── Fetch teleconsultations from real API ────────────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        const { data } = await api.get<ApiResult<Teleconsult[]>>('/api/teleconsult/my');
        if (data.success) {
          setSessions(data.data);
        }
      } catch {
        toast('Erreur lors du chargement des téléconsultations', 'error');
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Derived stats using new status logic
  const sessionsWithStatus = sessions.map(s => ({ ...s, _eff: getEffectiveStatus(s) }));
  const totalCount     = sessionsWithStatus.length;
  const plannedCount   = sessionsWithStatus.filter(s => s._eff === 'scheduled').length;
  const ongoingCount   = sessionsWithStatus.filter(s => s._eff === 'in_progress').length;
  const doneCount      = sessionsWithStatus.filter(s => s._eff === 'completed').length;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="font-sans antialiased flex h-screen overflow-hidden bg-slate-50 animate-page-in">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className="w-[280px] flex flex-col z-10 shrink-0 overflow-y-auto"
        style={{
          background: '#F97316',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)',
          backgroundSize: '20px 20px',
          boxShadow: '4px 0 15px rgba(249,115,22,0.2)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-4 px-6 py-8 shrink-0">
          <div className="w-12 h-12 bg-white text-brand-orange rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
            <i className="fa-solid fa-stethoscope" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none">AIDAA</h2>
            <span className="text-[11px] text-white/80 font-medium uppercase tracking-widest">Espace Professionnel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 flex flex-col gap-2">
          {NAV.map(n => (
            <button key={n.id}
              className="flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border text-white border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
              onClick={() => navigate('/professional/dashboard')}
            >
              <i className={`${n.fa} w-6 mr-3 text-lg opacity-80`} />
              {n.label}
            </button>
          ))}
          {/* Téléconsultation — active */}
          <button className="flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border bg-white text-brand-orange shadow-md border-transparent">
            <i className="fa-solid fa-video w-6 mr-3 text-lg text-brand-orange" />
            Téléconsultation
          </button>
        </nav>

        {/* Patients list */}
        <div className="px-5 pb-4 flex flex-col gap-2 shrink-0">
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest px-1 pt-3 pb-1">
            Patients ({patients.length})
          </p>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 transition"
            />
          </div>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
            {loading
              ? <p className="text-white/40 text-xs text-center py-3">Chargement…</p>
              : filteredPatients.map(p => (
                <button key={p.id} onClick={() => setSelectedPatient(p)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-sm transition-all border
                    ${selectedPatient?.id === p.id ? 'bg-white/20 border-white/30 text-white' : 'bg-white/06 border-transparent text-white/70 hover:bg-white/12 hover:text-white'}`}
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate leading-tight">{p.name}</p>
                    <p className="text-[11px] text-white/50 truncate">{p.age} ans{p.parent_name ? ` · ${p.parent_name}` : ''}</p>
                  </div>
                </button>
              ))
            }
            {!loading && filteredPatients.length === 0 && (
              <p className="text-white/40 text-xs text-center py-3">Aucun résultat</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-brand-orange text-base shrink-0">
              {profInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Professionnel'}</p>
              <p className="text-xs text-white/70">Professionnel de santé</p>
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
            <span className="text-sm text-slate-500 font-medium">Professionnel /</span>
            <span className="text-xl font-bold text-slate-900">Téléconsultations</span>
          </div>
          <button
            onClick={() => navigate('/professionnel/teleconsultation/planifier')}
            className="flex items-center gap-2 bg-brand-orange hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-brand-orange/20 transition-all"
          >
            <i className="fa-solid fa-plus" /> Planifier une session
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-10">

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {[
              { icon: 'fa-solid fa-calendar-check', value: totalCount,   label: 'Sessions totales' },
              { icon: 'fa-solid fa-circle-play',    value: plannedCount, label: 'Planifiées'      },
              { icon: 'fa-solid fa-circle-dot',     value: ongoingCount, label: 'En cours'        },
              { icon: 'fa-solid fa-circle-check',   value: doneCount,    label: 'Terminées'       },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 rounded-[14px] bg-orange-100 text-brand-orange flex items-center justify-center text-xl shrink-0">
                  <i className={s.icon} />
                </div>
                <div>
                  <p className="text-[28px] font-bold leading-none text-slate-900 mb-1">{s.value}</p>
                  <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Session table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                <i className="fa-solid fa-calendar-days mr-2 text-brand-orange" /> Mes sessions
              </h3>
              <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                {totalCount} session(s)
              </span>
            </div>

            {sessionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 p-7">
                <div className="w-10 h-10 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Chargement des sessions…</p>
              </div>
            ) : totalCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 p-7">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl text-brand-orange">
                  <i className="fa-solid fa-video" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-600 mb-1">Aucune téléconsultation planifiée</p>
                  <p className="text-sm">Planifiez votre première session avec un patient.</p>
                </div>
                <button
                  onClick={() => navigate('/professionnel/teleconsultation/planifier')}
                  className="flex items-center gap-2 bg-brand-orange hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-brand-orange/20 transition-all text-sm mt-2"
                >
                  <i className="fa-solid fa-plus" /> Planifier une session
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Parent', 'Date', 'Heure', 'Statut', 'Notes', 'Action'].map(h => (
                        <th key={h} className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsWithStatus.map(session => {
                      const eff = session._eff;
                      const roomOrId = session.room_id || session.id;
                      return (
                      <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-7 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-brand-orange flex items-center justify-center font-bold text-white text-sm shrink-0">
                              {(session.parent_name || 'P').charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{session.parent_name || `Parent #${session.parent_id}`}</p>
                              {session.parent_email && <p className="text-xs text-slate-400">{session.parent_email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-7 py-4 text-slate-600 text-sm">{fmtDate(session.date_time)}</td>
                        <td className="px-7 py-4 font-semibold text-slate-800 text-sm">{fmtTime(session.date_time)}</td>
                        <td className="px-7 py-4"><StatusBadge status={eff} /></td>
                        <td className="px-7 py-4 text-slate-500 text-sm max-w-[200px] truncate">{session.notes || '—'}</td>
                        <td className="px-7 py-4">
                          <button
                            onClick={() => navigate(`/professionnel/teleconsultation/${roomOrId}`)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border
                              ${eff === 'in_progress'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : eff === 'scheduled'
                                  ? 'bg-orange-50 text-brand-orange border-orange-200 hover:bg-orange-100'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {eff === 'scheduled'
                              ? <><i className="fa-solid fa-play mr-1.5" />Démarrer</>
                              : eff === 'in_progress'
                                ? <><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />Rejoindre</>
                                : <><i className="fa-solid fa-eye mr-1.5" />Voir</>
                            }
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toasts ── */}
      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

