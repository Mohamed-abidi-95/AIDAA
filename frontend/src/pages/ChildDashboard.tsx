// ============================================================================
// CHILD DASHBOARD — Espace enfant AIDAA
// ============================================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Video, Activity } from '../features/content/types/content.types';
import { MemoryGame } from '../features/games/MemoryGame';
import { ColorMatchGame } from '../features/games/ColorMatchGame';
import api from '../lib/api';

const BACKEND_BASE = 'http://localhost:5000';

const buildMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface Stats   { total_points: number; total_activities: number }
interface Badge   { id: number; name: string; emoji: string; color: string }
interface Sequence {
  id: number; title: string; description: string; emoji: string;
  duration_minutes: number; difficulty: string; steps?: SeqStep[];
}
interface SeqStep {
  id: number; step_number: number; title: string; description: string;
  emoji: string; duration_seconds: number;
}
interface AACSymbol { id: number; label: string; emoji: string; category: string; color: string }

const CAT_CONFIG = {
  enfant: { label: 'Enfant', emoji: '🧒', color: '#10b981' },
  jeune:  { label: 'Jeune',  emoji: '👦', color: '#3b82f6' },
  adulte: { label: 'Adulte', emoji: '🧑', color: '#8b5cf6' },
};

// Video thumbnail gradient colors — cycle through them
const VIDEO_GRADIENTS = [
  'from-orange-300 to-red-400',
  'from-green-300 to-emerald-500',
  'from-blue-300 to-indigo-500',
  'from-purple-300 to-fuchsia-500',
  'from-yellow-300 to-amber-500',
  'from-teal-300 to-cyan-500',
];

// ============================================================================
// SEQUENCE VIEWER MODAL
// ============================================================================
function SequenceViewer({ sequence, onClose, onComplete }: {
  sequence: Sequence;
  onClose: () => void;
  onComplete: (score: number, dur: number) => void;
}): JSX.Element {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const steps = sequence.steps ?? [];
  const totalSteps = steps.length;
  const current = steps[step];
  const progressPct = totalSteps > 0 ? ((step) / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (step < totalSteps - 1) { setStep(s => s + 1); }
    else { setDone(true); onComplete(totalSteps * 10, Math.round((Date.now() - startRef.current) / 1000)); }
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-5" style={{ background: 'rgba(15,35,24,0.88)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{sequence.emoji} {sequence.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{totalSteps} étapes • {sequence.duration_minutes} min</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">✕</button>
        </div>
        {/* Progress */}
        <div className="h-2.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-green to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        {!done && current ? (
          <>
            <div className="text-center mb-5">
              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full px-4 py-1 mb-4">Étape {step + 1} / {totalSteps}</span>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">{current.emoji}</div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{current.title}</h3>
              <p className="text-slate-500 leading-relaxed">{current.description}</p>
            </div>
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition">← Précédent</button>
              )}
              <button onClick={handleNext} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-brand-green to-emerald-400 text-white font-bold shadow-lg hover:opacity-90 transition">
                {step < totalSteps - 1 ? 'Suivant →' : '✅ Terminer !'}
              </button>
            </div>
          </>
        ) : done ? (
          <div className="text-center py-4">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-2xl font-extrabold text-emerald-700 mb-2">Bravo ! Séquence terminée !</h3>
            <p className="text-emerald-600 mb-5">Tu as gagné {totalSteps * 10} points !</p>
            <button onClick={onClose} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-green to-emerald-400 text-white font-bold hover:opacity-90 transition">Retour 🏠</button>
          </div>
        ) : (
          <p className="text-center text-slate-400">Aucune étape disponible</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CHILD DASHBOARD
// ============================================================================
export const ChildDashboard = (): JSX.Element => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const childId   = parseInt(localStorage.getItem('selected_child_id') ?? '0', 10);
  const childName = localStorage.getItem('selected_child_name') ?? 'Participant';
  const childCat  = (localStorage.getItem('selected_child_category') ?? 'enfant') as 'enfant' | 'jeune' | 'adulte';
  const catCfg    = CAT_CONFIG[childCat] ?? CAT_CONFIG.enfant;

  const [activeTab, setActiveTab]         = useState<'library' | 'sequences' | 'aac' | 'games'>('library');
  const [videos,     setVideos]           = useState<Video[]>([]);
  const [activities, setActivities]       = useState<Activity[]>([]);
  const [loadingLib, setLoadingLib]       = useState(true);
  const [sequences,  setSequences]        = useState<Sequence[]>([]);
  const [loadingSeq, setLoadingSeq]       = useState(false);
  const [activeSequence, setActiveSequence] = useState<Sequence | null>(null);
  const [aacSymbols,    setAACSymbols]    = useState<AACSymbol[]>([]);
  const [aacCategories, setAACCategories] = useState<string[]>([]);
  const [activeAACCat,  setActiveAACCat]  = useState<string>('Besoins');
  const [aacPhrase,     setAACPhrase]     = useState<AACSymbol[]>([]);
  const [loadingAAC,    setLoadingAAC]    = useState(false);
  const [activeGame, setActiveGame]       = useState<'memory' | 'color' | null>(null);
  const [stats,  setStats]  = useState<Stats>({ total_points: 0, total_activities: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);

  const fetchStats = useCallback(async () => {
    if (!childId) return;
    try {
      const [s, b] = await Promise.all([
        api.get(`/api/gamification/${childId}/stats`),
        api.get(`/api/gamification/${childId}/badges`),
      ]);
      if (s.data.success) setStats(s.data.data);
      if (b.data.success) setBadges(b.data.data);
    } catch { /* ignore */ }
  }, [childId]);

  useEffect(() => {
    const load = async () => {
      setLoadingLib(true);
      try {
        const [vRes, aRes] = await Promise.all([
          api.get(`/api/content?type=video&participant_category=${childCat}`),
          api.get(`/api/content?type=activity&participant_category=${childCat}`),
        ]);
        if (vRes.data.success) setVideos(vRes.data.data ?? []);
        if (aRes.data.success) setActivities(aRes.data.data ?? []);
      } catch (e) { console.error(e); }
      finally { setLoadingLib(false); }
    };
    load(); fetchStats();
  }, [childCat, fetchStats]);

  useEffect(() => {
    if (activeTab !== 'sequences' || sequences.length > 0) return;
    const load = async () => {
      setLoadingSeq(true);
      try {
        const res = await api.get(`/api/sequences?category=${childCat}`);
        if (res.data.success) setSequences(res.data.data ?? []);
      } catch (e) { console.error(e); }
      finally { setLoadingSeq(false); }
    };
    load();
  }, [activeTab, childCat, sequences.length]);

  useEffect(() => {
    if (activeTab !== 'aac' || aacSymbols.length > 0) return;
    const load = async () => {
      setLoadingAAC(true);
      try {
        const [symRes, catRes] = await Promise.all([
          api.get(`/api/aac/symbols?participant_category=${childCat}`),
          api.get('/api/aac/categories'),
        ]);
        if (symRes.data.success) setAACSymbols(symRes.data.data ?? []);
        if (catRes.data.success) {
          const cats: string[] = catRes.data.data ?? [];
          setAACCategories(cats);
          if (cats.length > 0) setActiveAACCat(cats[0]);
        }
      } catch (e) { console.error(e); }
      finally { setLoadingAAC(false); }
    };
    load();
  }, [activeTab, childCat, aacSymbols.length]);

  const logActivity = useCallback(async (contentId: number, action: string, score = 0, duration = 0) => {
    if (!childId) return;
    try {
      await api.post('/api/activity-log', { childId, contentId, status: score > 0 ? 'completed' : 'started', score, duration_seconds: duration, action });
      setStats(p => ({ total_points: p.total_points + score, total_activities: p.total_activities + 1 }));
    } catch (e) { console.error(e); }
  }, [childId]);

  const logGameScore = useCallback(async (gameId: number | string, score: number, duration: number) => {
    if (!childId) return;
    try {
      const res = await api.post(`/api/gamification/${childId}/score`, { gameId, score, duration_seconds: duration });
      if (res.data.newBadges?.length > 0) setBadges(p => [...p, ...res.data.newBadges]);
      setStats(p => ({ total_points: p.total_points + score, total_activities: p.total_activities + 1 }));
    } catch (e) { console.error(e); }
  }, [childId]);

  const openSequence = async (seq: Sequence) => {
    if (seq.steps) { setActiveSequence(seq); return; }
    try {
      const res = await api.get(`/api/sequences/${seq.id}`);
      if (res.data.success) setActiveSequence(res.data.data);
    } catch (e) { console.error(e); }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR'; utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  };

  // Active tab classes — exact match with child.html
  const tabCls = (t: string) => t === activeTab
    ? 'flex items-center gap-3 px-6 h-full bg-orange-100 text-brand-orange font-semibold border-b-2 border-brand-orange rounded-t-xl transition'
    : 'flex items-center gap-3 px-6 h-full text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 rounded-t-xl transition';

  // Difficulty badge
  const diffCls = (d: string) => d === 'facile'
    ? 'bg-emerald-100 text-emerald-700 py-1.5 px-3 rounded-lg capitalize'
    : d === 'moyen'
    ? 'bg-amber-100 text-amber-700 py-1.5 px-3 rounded-lg capitalize'
    : 'bg-red-100 text-red-700 py-1.5 px-3 rounded-lg capitalize';

  return (
    <div className="bg-brand-bg text-brand-blue font-sans antialiased h-screen flex flex-col overflow-hidden">

      {/* ═══════════════════════════════ HEADER ═══════════════════════════════ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-8 shadow-sm shrink-0 z-20 relative">
        {/* Left: avatar + greeting */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-400 p-1 flex items-center justify-center bg-emerald-50 shadow-inner overflow-hidden text-3xl">
            {catCfg.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bonjour <span className="text-brand-green">{childName}</span> ! 👋
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
              Espace {catCfg.label} <i className="fa-solid fa-child-reaching" style={{ color: catCfg.color }}></i>
            </p>
          </div>
        </div>

        {/* Right: stats + buttons */}
        <div className="flex items-center gap-4">
          {/* Points */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-inner">
              <i className="fa-solid fa-star text-lg"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total_points} <span className="text-sm text-slate-400">pts</span></p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total</p>
            </div>
          </div>
          {/* Badges */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shadow-inner">
              <i className="fa-solid fa-medal text-lg"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{badges.length} <span className="text-sm text-slate-400">badges</span></p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Gagnés</p>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 ml-4">
            <button onClick={() => navigate('/child-selection')} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl px-5 py-2.5 flex items-center gap-2.5 shadow-sm transition">
              <i className="fa-solid fa-arrow-left text-xs"></i> Retour
            </button>
            <button onClick={logout} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl px-5 py-2.5 flex items-center gap-2.5 shadow-sm transition">
              <i className="fa-solid fa-power-off text-sm"></i> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════ NAV TABS ═════════════════════════════ */}
      <nav className="bg-white border-b border-slate-200 h-16 flex items-center px-10 shrink-0 z-10 relative">
        <div className="flex gap-2 h-full pt-2">
          <button onClick={() => setActiveTab('library')} className={tabCls('library')}>
            <i className="fa-solid fa-book-open w-5 text-center"></i> Bibliothèque
          </button>
          <button onClick={() => setActiveTab('sequences')} className={tabCls('sequences')}>
            <i className="fa-solid fa-list-ol w-5 text-center"></i> Séquences
          </button>
          <button onClick={() => setActiveTab('aac')} className={tabCls('aac')}>
            <i className="fa-regular fa-comment-dots w-5 text-center"></i> AAC
          </button>
          <button onClick={() => setActiveTab('games')} className={tabCls('games')}>
            <i className="fa-solid fa-gamepad w-5 text-center"></i> Jeux
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════ MAIN CONTENT ════════════════════════ */}
      <main className="flex-1 overflow-y-auto p-10 pb-20 relative">

        {/* ══════════════ MODULE A — BIBLIOTHÈQUE ══════════════════════════ */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            {loadingLib ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-orange animate-spin mb-4"></div>
                <p className="font-semibold">Chargement…</p>
              </div>
            ) : (
              <>
                {/* ─── Vidéos ─── */}
                {videos.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        <i className="fa-solid fa-tv mr-2 text-brand-orange"></i> Vidéos
                      </h2>
                      <span className="bg-slate-200 text-slate-600 py-1 px-3 rounded-full text-sm font-bold">{videos.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {videos.map((v, idx) => {
                        const vUrl = buildMediaUrl(v.url);
                        const grad = VIDEO_GRADIENTS[idx % VIDEO_GRADIENTS.length];
                        return (
                          <div key={v.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                            onClick={() => { if (vUrl) { window.open(vUrl, '_blank', 'noopener,noreferrer'); logActivity(v.id, 'video_watched'); } }}>
                            {/* Thumbnail */}
                            <div className={`w-full h-48 bg-gradient-to-br ${grad} relative flex items-center justify-center overflow-hidden`}>
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                              {vUrl
                                ? <video src={vUrl} preload="metadata" className="w-full h-full object-cover" />
                                : <div className="absolute inset-0 opacity-20 bg-radial-white"></div>
                              }
                              <i className="fa-solid fa-play text-white text-4xl opacity-80 group-hover:scale-125 group-hover:opacity-100 transition-all drop-shadow-lg z-20 absolute"></i>
                            </div>
                            {/* Info */}
                            <div className="p-6 space-y-4">
                              <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{v.title}</h3>
                              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <i className="fa-solid fa-tag text-slate-400"></i> {v.category || 'Général'}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                  <i className="fa-solid fa-stopwatch"></i> {v.duration || '–'}
                                </span>
                              </div>
                              <button className="w-full bg-brand-orange hover:bg-orange-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 shadow-md transition">
                                <i className="fa-solid fa-play text-xs"></i> Regarder
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ─── Activités ─── */}
                {activities.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        <i className="fa-solid fa-bullseye mr-2 text-brand-green"></i> Activités
                      </h2>
                      <span className="bg-slate-200 text-slate-600 py-1 px-3 rounded-full text-sm font-bold">{activities.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {activities.map((a) => (
                        <div key={a.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                          onClick={() => logActivity(a.id, 'activity_started')}>
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform"
                            style={{ background: a.emojiColor || '#d1fae5' }}>
                            {a.emoji || '🎯'}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{a.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{a.description || ''}</p>
                          </div>
                          <div className="flex gap-2 text-xs font-bold">
                            <span className="bg-slate-100 text-slate-600 py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                              <i className="fa-solid fa-clock"></i> {a.minutes || '–'} min
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 py-1.5 px-3 rounded-lg">{a.steps || '–'} étapes</span>
                          </div>
                          <button className="w-full bg-brand-green hover:bg-emerald-600 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg transition mt-2">
                            Commencer <i className="fa-solid fa-arrow-right text-sm"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {videos.length === 0 && activities.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-7xl mb-5">📭</div>
                    <p className="text-xl font-bold text-slate-600">Aucun contenu disponible</p>
                    <p className="text-sm text-slate-400 mt-2">Demande à ton accompagnateur d'ajouter du contenu.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════ MODULE B — SÉQUENCES ═════════════════════════════ */}
        {activeTab === 'sequences' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                <i className="fa-solid fa-clipboard-list mr-2 text-slate-700"></i> Séquences guidées
              </h2>
              <p className="text-slate-500 mt-1">Des activités étape par étape pour apprendre à ton rythme</p>
            </div>

            {loadingSeq ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-700 animate-spin"></div>
              </div>
            ) : sequences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-7xl mb-5">📭</div>
                <p className="text-xl font-bold text-slate-600">Aucune séquence disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sequences.map((seq) => (
                  <div key={seq.id} className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                    onClick={() => openSequence(seq)}>
                    <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-4xl">
                      {seq.emoji}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-slate-800">{seq.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{seq.description}</p>
                    </div>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="bg-slate-100 text-slate-600 py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                        <i className="fa-solid fa-clock"></i> {seq.duration_minutes} min
                      </span>
                      <span className={diffCls(seq.difficulty)}>{seq.difficulty}</span>
                    </div>
                    <button className="w-full bg-brand-green hover:bg-emerald-600 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20 transition mt-2">
                      Commencer <i className="fa-solid fa-arrow-right text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ MODULE C — AAC ════════════════════════════════════ */}
        {activeTab === 'aac' && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  <i className="fa-regular fa-comment-dots mr-2 text-blue-500"></i> Communication alternative
                </h2>
                <p className="text-slate-500 mt-1">Clique sur les pictogrammes pour t'exprimer</p>
              </div>

              {/* Phrase builder */}
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex items-start gap-6 shadow-sm min-h-[110px]">
                <div className="flex-1">
                  {aacPhrase.length === 0 ? (
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <i className="fa-solid fa-hand-point-right text-brand-green"></i>
                      Clique sur un pictogramme pour construire ta phrase…
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {aacPhrase.map((s, i) => (
                        <span key={i} onClick={() => setAACPhrase(p => p.filter((_, idx) => idx !== i))}
                          className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2 text-sm font-bold cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                          <span className="text-xl">{s.emoji}</span> {s.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {aacPhrase.length > 0 && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => speak(aacPhrase.map(s => s.label).join('. '))}
                      className="bg-brand-green hover:bg-emerald-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg transition font-bold">
                      <i className="fa-solid fa-paper-plane text-sm"></i> Parler !
                    </button>
                    <button onClick={() => setAACPhrase([])}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-6 py-2.5 flex items-center gap-2 transition text-sm font-semibold">
                      <i className="fa-solid fa-trash-can text-xs"></i> Effacer
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              {loadingAAC ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Category pills */}
                  <div className="flex gap-2 flex-wrap">
                    {aacCategories.map(cat => (
                      <button key={cat} onClick={() => setActiveAACCat(cat)}
                        className={`rounded-full px-5 py-2 text-sm font-medium shadow-md transition ${activeAACCat === cat ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Symbol grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    {aacSymbols.filter(s => s.category === activeAACCat).map(sym => (
                      <div key={sym.id} onClick={() => { setAACPhrase(p => [...p, sym]); speak(sym.label); }}
                        className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition group cursor-pointer">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${sym.color}20` }}>
                          {sym.emoji}
                        </div>
                        <p className="text-sm font-bold text-slate-800">{sym.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* ══════════════ MODULE D — JEUX ══════════════════════════════════ */}
        {activeTab === 'games' && (
          <div className="space-y-10">
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  <i className="fa-solid fa-gamepad mr-2 text-brand-orange"></i> Mini-jeux
                </h2>
                <p className="text-slate-500 mt-1">Joue et gagne des points !</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Memory game */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-full h-32 flex items-center justify-center text-8xl">
                    <span className="group-hover:scale-110 transition-transform block">🧠</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-slate-800">Jeu de mémoire</h3>
                    <p className="text-sm text-slate-600">Retourne les cartes et trouve les paires.</p>
                    <div className="flex gap-4 text-xs font-semibold text-brand-green bg-white p-3 rounded-xl shadow-inner">
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-clone"></i> 16 cartes</span>
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-star"></i> 100 pts</span>
                    </div>
                  </div>
                  <button onClick={() => setActiveGame('memory')}
                    className="w-full bg-brand-green hover:bg-emerald-600 text-white rounded-xl py-3.5 flex items-center justify-center gap-3 shadow-lg shadow-brand-green/20 transition">
                    <i className="fa-solid fa-play text-sm"></i> Jouer !
                  </button>
                </div>

                {/* Color match game */}
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-full h-32 flex items-center justify-center text-8xl">
                    <span className="group-hover:scale-110 transition-transform block">🎨</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-slate-800">Jeu des couleurs</h3>
                    <p className="text-sm text-slate-600">Lis le mot et clique sur la bonne couleur.</p>
                    <div className="flex gap-4 text-xs font-semibold text-brand-orange bg-white p-3 rounded-xl shadow-inner">
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-redo"></i> 10 tours</span>
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-star"></i> 100 pts</span>
                    </div>
                  </div>
                  <button onClick={() => setActiveGame('color')}
                    className="w-full bg-brand-orange hover:bg-orange-600 text-white rounded-xl py-3.5 flex items-center justify-center gap-3 shadow-lg shadow-brand-orange/20 transition">
                    <i className="fa-solid fa-play text-sm"></i> Jouer !
                  </button>
                </div>
              </div>

              {/* Badges showcase */}
              {badges.length > 0 && (
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4">🏅 Mes badges</h3>
                  <div className="flex flex-wrap gap-3">
                    {badges.map(b => (
                      <div key={b.id} className="flex items-center gap-2 rounded-xl px-4 py-2 border-2"
                        style={{ background: `${b.color}15`, borderColor: `${b.color}44` }}>
                        <span className="text-xl">{b.emoji}</span>
                        <span className="text-sm font-bold text-slate-700">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════ MODALS ══════════════════════════════ */}
      {activeGame === 'memory' && (
        <MemoryGame
          onComplete={(score, dur) => { logGameScore('memory', score, dur); setTimeout(() => setActiveGame(null), 2000); }}
          onClose={() => setActiveGame(null)}
        />
      )}
      {activeGame === 'color' && (
        <ColorMatchGame
          onComplete={(score, dur) => { logGameScore('color_match', score, dur); setTimeout(() => setActiveGame(null), 2000); }}
          onClose={() => setActiveGame(null)}
        />
      )}
      {activeSequence && (
        <SequenceViewer
          sequence={activeSequence}
          onClose={() => setActiveSequence(null)}
          onComplete={(score, dur) => { logGameScore(`seq_${activeSequence.id}`, score, dur); setTimeout(() => setActiveSequence(null), 1800); }}
        />
      )}
    </div>
  );
};

