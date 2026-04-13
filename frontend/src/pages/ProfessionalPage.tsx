// ============================================================================
// PROFESSIONAL DASHBOARD — Design identique à AdminPanel (Tailwind + FA icons)
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import api from '../lib/api';
import AnalytiquesProfessionnel from './AnalytiquesProfessionnel';
import { MessagerieView } from './MessagerieView';
import { StatCard, Section, ScoreBadge, useToast, ToastStack, inputCls } from '../components';

// ── Types ──────────────────────────────────────────────────────────────────
type ViewType = 'patients' | 'activities' | 'notes' | 'invitations' | 'analytics' | 'messages';

interface Child {
  id: number; name: string; age: number;
  parent_id: number; parent_name?: string; participant_category?: string;
}
interface ParentRecord {
  id: number; name: string; email: string; child_count: number; invited_at: string;
}
interface Activity {
  id: number; content_title: string; score: number; duration_seconds: number; date: string;
}
interface Note {
  id: number; content: string; date: string; professional_name: string;
}
interface ApiResult<T> { success: boolean; data: T; message?: string; }

// ── Nav config ─────────────────────────────────────────────────────────────
const NAV = [
  { id: 'patients',    fa: 'fa-solid fa-hospital-user',      label: 'Mes patients'    },
  { id: 'activities',  fa: 'fa-solid fa-chart-column',        label: 'Activités'       },
  { id: 'notes',       fa: 'fa-solid fa-notes-medical',       label: 'Notes cliniques' },
  { id: 'analytics',   fa: 'fa-solid fa-chart-line',          label: 'Analytiques'     },
  { id: 'invitations', fa: 'fa-solid fa-envelope-open-text',  label: 'Invitations'     },
  { id: 'messages',    fa: 'fa-solid fa-comments',            label: 'Messagerie'      },
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

  // ── Fetch patients ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ApiResult<Child[]>>('/api/professional/my-children');
        if (data.success) {
          setPatients(data.data);
          if (data.data.length > 0) setSelectedPatient(data.data[0]);
        }
      } catch { toast('Erreur lors du chargement des patients', 'error'); }
      finally { setLoading(false); }
    };
    fetchPatients();
  }, []);

  // ── Fetch invitations ────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'invitations') return;
    const fetch = async () => {
      try {
        setInvitationsLoading(true);
        const { data } = await api.get<ApiResult<ParentRecord[]>>('/api/professional/my-parents');
        if (data.success) setInvitations(data.data);
      } catch { /* silent */ }
      finally { setInvitationsLoading(false); }
    };
    fetch();
  }, [view]);

  // ── Fetch activities + notes ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedPatient) return;
    const fetch = async () => {
      try {
        const [{ data: a }, { data: n }] = await Promise.all([
          api.get<ApiResult<Activity[]>>(`/api/activity-log/child/${selectedPatient.id}`),
          api.get<ApiResult<Note[]>>(`/api/note/child/${selectedPatient.id}`),
        ]);
        if (a.success) setActivities(a.data);
        if (n.success) setNotes(n.data);
      } catch { /* silent */ }
    };
    fetch();
  }, [selectedPatient]);

  // ── Add note ─────────────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!selectedPatient || !newNote.trim()) { toast('Saisissez une note avant de valider', 'error'); return; }
    try {
      setNoteLoading(true);
      const { data } = await api.post<ApiResult<Note>>('/api/note', { childId: selectedPatient.id, content: newNote.trim() });
      if (data.success) {
        setNewNote('');
        toast('Note clinique ajoutée ✓');
        const { data: nd } = await api.get<ApiResult<Note[]>>(`/api/note/child/${selectedPatient.id}`);
        if (nd.success) setNotes(nd.data);
      } else toast(data.message || "Erreur lors de l'ajout", 'error');
    } catch { toast("Erreur lors de l'ajout de la note", 'error'); }
    finally { setNoteLoading(false); }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = (() => {
    if (!activities.length) return { sessions: 0, time: 0, avgScore: 0 };
    const totalTime = activities.reduce((s, a) => s + (a.duration_seconds || 0), 0);
    const avgScore  = activities.reduce((s, a) => s + (a.score || 0), 0) / activities.length;
    return { sessions: activities.length, time: Math.round(totalTime / 60), avgScore: Math.round(avgScore) };
  })();

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const profInitial      = user?.name?.charAt(0).toUpperCase() || 'P';
  const currentNav       = NAV.find(n => n.id === view);

  // ── Render ─────────────────────────────────────────────────────────────
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
              className={`flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border transition-all
                ${view === n.id
                  ? 'bg-white text-brand-orange shadow-md border-transparent'
                  : 'text-white border-transparent hover:bg-white/15 hover:border-white/20'}`}
              onClick={() => setView(n.id as ViewType)}
            >
              <i className={`${n.fa} w-6 mr-3 text-lg ${view === n.id ? 'text-brand-orange' : 'opacity-80'}`} />
              {n.label}
            </button>
          ))}
          {/* Téléconsultation link */}
          <button
            className="flex items-center w-full px-5 py-3.5 rounded-xl font-semibold text-[15px] border text-white border-transparent hover:bg-white/15 hover:border-white/20 transition-all"
            onClick={() => navigate('/professionnel/teleconsultation')}
          >
            <i className="fa-solid fa-video w-6 mr-3 text-lg opacity-80" />
            Téléconsultation
          </button>
        </nav>

        {/* Patients list */}
        <div className="px-5 pb-4 flex flex-col gap-2 shrink-0">
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest px-1 pt-3 pb-1">
            Patients ({patients.length})
          </p>
          {/* Search */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 transition"
            />
          </div>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
            {filteredPatients.map(p => (
              <button key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-sm transition-all border
                  ${selectedPatient?.id === p.id
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/06 border-transparent text-white/70 hover:bg-white/12 hover:text-white'}`}
              >
                <div className="w-7 h-7 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate leading-tight">{p.name}</p>
                  <p className="text-[11px] text-white/50 truncate">{p.age} ans{p.parent_name ? ` · ${p.parent_name}` : ''}</p>
                </div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
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
            <span className="text-xl font-bold text-slate-900">{currentNav?.label ?? 'Téléconsultation'}</span>
          </div>
          {patients.length > 0 && view !== 'messages' && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-500 font-medium">Patient :</label>
              <select
                value={selectedPatient?.id || ''}
                onChange={e => setSelectedPatient(patients.find(p => p.id === +e.target.value) || null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.age} ans)</option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-10">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <span className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin" />
              <p>Chargement des patients…</p>
            </div>
          )}

          {/* No patients (except analytics + messages) */}
          {!loading && patients.length === 0 && view !== 'analytics' && view !== 'messages' && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 gap-4">
              <i className="fa-solid fa-hospital-user text-5xl" />
              <div className="text-center">
                <p className="font-semibold text-slate-600">Aucun patient assigné</p>
                <p className="text-sm mt-1">Contactez l'administrateur pour obtenir l'accès aux dossiers patients.</p>
              </div>
            </div>
          )}

          {/* ── VUE : ANALYTIQUES ── */}
          {view === 'analytics' && !loading && user?.id && (
            <AnalytiquesProfessionnel doctorId={user.id} patients={patients} />
          )}

          {/* ── VUE : MESSAGERIE ── */}
          {view === 'messages' && !loading && user?.id && (
            <MessagerieView role="professional" myId={user.id} accent="orange" />
          )}

          {selectedPatient && !loading && view !== 'analytics' && view !== 'messages' && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
                <StatCard icon="fa-solid fa-user" value={selectedPatient.age} label="Âge (ans)" />
                <StatCard icon="fa-solid fa-gamepad" value={stats.sessions} label="Sessions" />
                <StatCard icon="fa-regular fa-clock" value={stats.time} label="Minutes total" />
                <StatCard icon="fa-solid fa-star" value={stats.avgScore} label="Score moyen" />
                <StatCard icon="fa-solid fa-notes-medical" value={notes.length} label="Notes cliniques" />
              </div>

              {/* ── Fiche patient ── */}
              {view === 'patients' && (
                <Section
                  title={`Fiche patient — ${selectedPatient.name}`}
                  badge={
                    selectedPatient.parent_name ? (
                      <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                        <i className="fa-solid fa-house-user text-xs" /> {selectedPatient.parent_name}
                      </span>
                    ) : undefined
                  }
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-white text-2xl font-bold shrink-0">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedPatient.name}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Identifiant',     val: `#${selectedPatient.id}` },
                          { label: 'Âge',             val: `${selectedPatient.age} ans` },
                          { label: 'Catégorie',       val: selectedPatient.participant_category || 'Enfant' },
                          { label: 'Famille',         val: selectedPatient.parent_name || '—' },
                          { label: 'Sessions',        val: String(stats.sessions) },
                          { label: 'Temps total',     val: `${stats.time} min` },
                          { label: 'Score moyen',     val: `${stats.avgScore} / 100` },
                          { label: 'Notes cliniques', val: String(notes.length) },
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
                <Section
                  title={`Journal d'activités — ${selectedPatient.name}`}
                  badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold">{activities.length} session(s)</span>}
                >
                  {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                      <i className="fa-solid fa-inbox text-5xl" />
                      <p className="font-medium">Aucune activité enregistrée pour ce patient.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-7 -mb-7">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">#</th>
                            <th className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Activité</th>
                            <th className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Score</th>
                            <th className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Durée</th>
                            <th className="text-left px-7 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map((act, i) => (
                            <tr key={act.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-7 py-4 text-brand-orange font-bold text-sm">{i + 1}</td>
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

              {/* ── Notes cliniques ── */}
              {view === 'notes' && (
                <>
                  {/* Formulaire */}
                  <Section title="Nouvelle note clinique">
                    <div className="flex flex-col gap-4">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder={`Saisissez vos observations cliniques pour ${selectedPatient.name}…`}
                        rows={4}
                        className={inputCls}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={noteLoading || !newNote.trim()}
                        className="self-start flex items-center gap-2 bg-brand-orange hover:bg-orange-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-brand-orange/20 transition-all"
                      >
                        {noteLoading
                          ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Enregistrement…</>
                          : <><i className="fa-solid fa-floppy-disk" /> Enregistrer la note</>
                        }
                      </button>
                    </div>
                  </Section>

                  {/* Historique */}
                  <Section
                    title={`Historique — ${selectedPatient.name}`}
                    badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold">{notes.length} note(s)</span>}
                  >
                    {notes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                        <i className="fa-solid fa-notes-medical text-4xl" />
                        <p className="font-medium">Aucune note clinique pour ce patient.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {notes.map(note => (
                          <div key={note.id} className="bg-slate-50 border border-slate-100 border-l-4 border-l-brand-orange rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <i className="fa-solid fa-stethoscope text-brand-orange text-sm" />
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
                </>
              )}

              {/* ── Invitations ── */}
              {view === 'invitations' && (
                <Section
                  title="Mes invitations reçues"
                  badge={<span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold">{invitations.length} parent(s)</span>}
                >
                  {invitationsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                      <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin" />
                      <p>Chargement…</p>
                    </div>
                  ) : invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                      <i className="fa-solid fa-envelope text-4xl" />
                      <p className="font-medium">Aucun parent ne vous a encore invité.</p>
                      <p className="text-sm text-center max-w-sm">Les parents peuvent vous inviter depuis leur tableau de bord → "Mon professionnel".</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {invitations.map(inv => (
                        <div key={inv.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          {/* Header */}
                          <div className="flex items-center gap-4 p-5 bg-slate-50 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center font-bold text-white text-lg shrink-0">
                              {inv.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900">{inv.name}</p>
                              <p className="text-sm text-slate-500">{inv.email}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                <i className="fa-solid fa-baby" /> {inv.child_count} enfant{inv.child_count !== 1 ? 's' : ''}
                              </span>
                              <p className="text-xs text-slate-400 mt-1">
                                depuis le {new Date(inv.invited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          {/* Steps */}
                          <div className="p-5 flex flex-col gap-2">
                            {[
                              { label: 'Invitation reçue', desc: `${inv.name} vous a invité à suivre ses enfants` },
                              { label: 'Compte configuré',  desc: 'Vous êtes connecté et actif sur la plateforme' },
                              { label: 'Suivi actif ✅',    desc: `Vous suivez ${inv.child_count} enfant${inv.child_count !== 1 ? 's' : ''} de cette famille` },
                            ].map(step => (
                              <div key={step.label} className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                                  <i className="fa-solid fa-check text-[10px]" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{step.label}</p>
                                  <p className="text-xs text-slate-500">{step.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Action */}
                          <div className="px-5 pb-5">
                            <button
                              onClick={() => {
                                const firstChild = patients.find(p => p.parent_id === inv.id);
                                if (firstChild) { setSelectedPatient(firstChild); setView('patients'); }
                              }}
                              className="flex items-center gap-2 bg-brand-orange hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-brand-orange/20 transition-all"
                            >
                              <i className="fa-solid fa-eye" /> Voir les patients de cette famille
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Toasts ── */}
      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
