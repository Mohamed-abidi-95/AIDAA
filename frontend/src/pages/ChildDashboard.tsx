// ============================================================================
// CHILD DASHBOARD — Espace enfant AIDAA
// ============================================================================
// 4 Modules : A-Bibliothèque | B-Séquences | C-AAC | D-Jeux
// Filtrage par participant_category + activity logging médical

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Video, Activity } from '../features/content/types/content.types';
import { MemoryGame } from '../features/games/MemoryGame';
import { ColorMatchGame } from '../features/games/ColorMatchGame';
import api from '../lib/api';

const BACKEND_BASE = 'http://localhost:5000';

// ── Helpers ─────────────────────────────────────────────────────────────────
const buildMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ── Types ────────────────────────────────────────────────────────────────────
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

// ============================================================================
// SEQUENCE VIEWER MODAL — Module B
// ============================================================================
function SequenceViewer({ sequence, onClose, onComplete }: {
  sequence: Sequence;
  onClose: () => void;
  onComplete: (score: number, dur: number) => void;
}): JSX.Element {
  const [step, setStep]   = useState(0);
  const [done, setDone]   = useState(false);
  const startRef          = useRef(Date.now());
  const steps             = sequence.steps ?? [];
  const totalSteps        = steps.length;
  const current           = steps[step];
  const progressPct       = totalSteps > 0 ? (step / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setDone(true);
      onComplete(totalSteps * 10, Math.round((Date.now() - startRef.current) / 1000));
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(15,35,24,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '28px 28px 32px', maxWidth: 500, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>{sequence.emoji} {sequence.title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{totalSteps} étapes • {sequence.duration_minutes} min</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: 8, height: 10, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', width: `${progressPct}%`, borderRadius: 8, transition: 'width 0.4s' }} />
        </div>
        {!done && current ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#065f46', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                Étape {step + 1} / {totalSteps}
              </div>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}>
                {current.emoji}
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{current.title}</h3>
              <p style={{ margin: 0, fontSize: 15, color: '#475569', lineHeight: 1.6 }}>{current.description}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '2px solid #e2e8f0', background: '#fff', color: '#1e3a5f', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  ← Précédent
                </button>
              )}
              <button onClick={handleNext} style={{ flex: 2, padding: '13px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                {step < totalSteps - 1 ? 'Suivant →' : '✅ Terminer !'}
              </button>
            </div>
          </>
        ) : done ? (
          <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <h3 style={{ margin: '12px 0 8px', fontSize: 22, fontWeight: 800, color: '#065f46' }}>Bravo ! Séquence terminée !</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#059669' }}>Tu as gagné {totalSteps * 10} points !</p>
            <button onClick={onClose} style={{ padding: '13px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Retour 🏠
            </button>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Aucune étape disponible</p>
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

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'library' | 'sequences' | 'aac' | 'games'>('library');
  const [videos,     setVideos]     = useState<Video[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const [sequences,      setSequences]      = useState<Sequence[]>([]);
  const [loadingSeq,     setLoadingSeq]     = useState(false);
  const [activeSequence, setActiveSequence] = useState<Sequence | null>(null);
  const [aacSymbols,     setAACSymbols]     = useState<AACSymbol[]>([]);
  const [aacCategories,  setAACCategories]  = useState<string[]>([]);
  const [activeAACCat,   setActiveAACCat]   = useState<string>('Besoins');
  const [aacPhrase,      setAACPhrase]      = useState<AACSymbol[]>([]);
  const [loadingAAC,     setLoadingAAC]     = useState(false);
  const [activeGame,     setActiveGame]     = useState<'memory' | 'color' | null>(null);
  const [stats,  setStats]  = useState<Stats>({ total_points: 0, total_activities: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!childId) return;
    try {
      const [s, b] = await Promise.all([
        api.get(`/api/gamification/${childId}/stats`),
        api.get(`/api/gamification/${childId}/badges`),
      ]);
      if (s.data.success) setStats(s.data.data);
      if (b.data.success) setBadges(b.data.data);
    } catch { /* silently ignore */ }
  }, [childId]);

  useEffect(() => {
    const loadLib = async () => {
      setLoadingLib(true);
      try {
        const [vRes, aRes] = await Promise.all([
          api.get(`/api/content?type=video&participant_category=${childCat}`),
          api.get(`/api/content?type=activity&participant_category=${childCat}`),
        ]);
        if (vRes.data.success) setVideos(vRes.data.data ?? []);
        if (aRes.data.success) setActivities(aRes.data.data ?? []);
      } catch (e) { console.error('Library load error', e); }
      finally { setLoadingLib(false); }
    };
    loadLib();
    fetchStats();
  }, [childCat, fetchStats]);

  useEffect(() => {
    if (activeTab !== 'sequences' || sequences.length > 0) return;
    const load = async () => {
      setLoadingSeq(true);
      try {
        const res = await api.get(`/api/sequences?category=${childCat}`);
        if (res.data.success) setSequences(res.data.data ?? []);
      } catch (e) { console.error('Sequences error', e); }
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
      } catch (e) { console.error('AAC error', e); }
      finally { setLoadingAAC(false); }
    };
    load();
  }, [activeTab, childCat, aacSymbols.length]);

  // ── Logging helpers ───────────────────────────────────────────────────────
  const logActivity = useCallback(async (contentId: number, action: string, score = 0, duration = 0) => {
    if (!childId) return;
    try {
      await api.post('/api/activity-log', { childId, contentId, status: score > 0 ? 'completed' : 'started', score, duration_seconds: duration, action });
      setStats((p) => ({ total_points: p.total_points + score, total_activities: p.total_activities + 1 }));
    } catch (e) { console.error('Log activity error', e); }
  }, [childId]);

  const logGameScore = useCallback(async (gameId: number | string, score: number, duration: number) => {
    if (!childId) return;
    try {
      const res = await api.post(`/api/gamification/${childId}/score`, { gameId, score, duration_seconds: duration });
      if (res.data.newBadges?.length > 0) setBadges((p) => [...p, ...res.data.newBadges]);
      setStats((p) => ({ total_points: p.total_points + score, total_activities: p.total_activities + 1 }));
    } catch (e) { console.error('Log game error', e); }
  }, [childId]);

  // ── Sequence handling ─────────────────────────────────────────────────────
  const openSequence = async (seq: Sequence) => {
    if (seq.steps) { setActiveSequence(seq); return; }
    try {
      const res = await api.get(`/api/sequences/${seq.id}`);
      if (res.data.success) setActiveSequence(res.data.data);
    } catch (e) { console.error('Sequence fetch error', e); }
  };

  // ── AAC speech synthesis ──────────────────────────────────────────────────
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR'; utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  };

  // ── Tab button style ──────────────────────────────────────────────────────
  const tabStyle = (tab: string): React.CSSProperties => ({
    flex: 1, padding: '11px 4px', border: 'none', cursor: 'pointer',
    borderRadius: 10, fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
    background: activeTab === tab ? catCfg.color : '#fff',
    color: activeTab === tab ? '#fff' : '#64748b',
    boxShadow: activeTab === tab ? `0 4px 14px ${catCfg.color}44` : 'none',
  });

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#eef6fb 0%,#e8f4f8 60%,#ede9f6 100%)', fontFamily: "'Nunito','Quicksand','Segoe UI',sans-serif", paddingBottom: 48 }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: `linear-gradient(135deg,${catCfg.color},${catCfg.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: `0 4px 14px ${catCfg.color}44` }}>
            {catCfg.emoji}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#1e3a5f' }}>Bonjour {childName} 👋</h1>
            <span style={{ background: `${catCfg.color}18`, color: catCfg.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {catCfg.emoji} {catCfg.label}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff7ed', borderRadius: 20, padding: '7px 14px', fontWeight: 700, color: '#f97316', fontSize: 13 }}>⭐ {stats.total_points} pts</div>
          <div style={{ background: '#f0f9ff', borderRadius: 20, padding: '7px 14px', fontWeight: 700, color: '#0284c7', fontSize: 13 }}>🏅 {badges.length} badges</div>
          <button onClick={() => navigate('/child-selection')} style={{ padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: 18, fontWeight: 700, fontSize: 12, cursor: 'pointer', color: '#1e3a5f' }}>← Retour</button>
          <button onClick={logout} style={{ padding: '8px 14px', background: 'linear-gradient(90deg,#ef4444,#dc2626)', color: '#fff', border: 'none', borderRadius: 18, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </header>

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: '18px 28px 0' }}>
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 14, padding: 5, maxWidth: 640 }}>
          {([['library','📚','Bibliothèque'],['sequences','📋','Séquences'],['aac','💬','AAC'],['games','🎮','Jeux']] as const).map(([tab, icon, label]) => (
            <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <main style={{ padding: '22px 28px' }}>

        {/* ══ MODULE A — BIBLIOTHÈQUE ════════════════════════════════════════ */}
        {activeTab === 'library' && (
          <div>
            {loadingLib ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <div style={{ width: 40, height: 40, border: `4px solid #e2e8f0`, borderTopColor: catCfg.color, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 700 }}>Chargement…</p>
              </div>
            ) : (
              <>
                {/* Videos */}
                {videos.length > 0 && (
                  <section style={{ marginBottom: 36 }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#1e3a5f', display: 'flex', gap: 8, alignItems: 'center' }}>
                      📺 Vidéos <span style={{ fontSize: 12, background: '#f1f5f9', borderRadius: 20, padding: '2px 10px', color: '#64748b', fontWeight: 600 }}>{videos.length}</span>
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 16 }}>
                      {videos.map((v) => {
                        const vUrl = buildMediaUrl(v.url);
                        return (
                          <div key={v.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', transition: 'transform .2s,box-shadow .2s', cursor: 'pointer' }}
                            onMouseEnter={(e) => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-4px)'; d.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                            onMouseLeave={(e) => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'none'; d.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
                          >
                            <div style={{ height: 130, background: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, overflow: 'hidden' }}>
                              {vUrl ? <video src={vUrl} preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{v.emoji || '📹'}</span>}
                            </div>
                            <div style={{ padding: '12px 14px 14px' }}>
                              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 13, color: '#1e3a5f', lineHeight: 1.3 }}>{v.title}</p>
                              <p style={{ margin: '0 0 10px', fontSize: 11, color: '#64748b' }}>🎯 {v.category} • ⏱ {v.duration}</p>
                              <button onClick={() => { const u = buildMediaUrl(v.url); if (u) window.open(u,'_blank','noopener,noreferrer'); logActivity(v.id,'video_watched'); }} style={{ width: '100%', padding: '9px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(90deg,#38b2ac,#2dd4bf)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                {vUrl ? '▶ Regarder' : '⏳ Indisponible'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Activities */}
                {activities.length > 0 && (
                  <section>
                    <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#1e3a5f', display: 'flex', gap: 8, alignItems: 'center' }}>
                      🎯 Activités <span style={{ fontSize: 12, background: '#f1f5f9', borderRadius: 20, padding: '2px 10px', color: '#64748b', fontWeight: 600 }}>{activities.length}</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {activities.map((a) => (
                        <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform .2s', cursor: 'pointer' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
                        >
                          <div style={{ width: 50, height: 50, borderRadius: 13, background: a.emojiColor || '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{a.emoji || '🎯'}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 14, color: '#1e3a5f' }}>{a.title}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{a.steps} étapes • {a.minutes} min</p>
                          </div>
                          <button onClick={() => logActivity(a.id, 'activity_started')} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(90deg,#38b2ac,#2dd4bf)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Commencer
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {videos.length === 0 && activities.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 52, marginBottom: 14 }}>📭</div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>Aucun contenu pour cette catégorie.</p>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>Demandez à votre accompagnateur d'ajouter du contenu.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ MODULE B — SÉQUENCES ══════════════════════════════════════════ */}
        {activeTab === 'sequences' && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>📋 Séquences guidées</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Des activités étape par étape pour apprendre à ton rythme</p>
            {loadingSeq ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>⏳ Chargement…</div>
            ) : sequences.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ fontWeight: 700, color: '#64748b' }}>Aucune séquence disponible</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 16 }}>
                {sequences.map((seq) => {
                  const diffColor = seq.difficulty === 'facile' ? '#10b981' : seq.difficulty === 'moyen' ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={seq.id} style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', transition: 'transform .2s,box-shadow .2s,border-color .2s', cursor: 'pointer', border: '2px solid transparent' }}
                      onMouseEnter={(e) => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-4px)'; d.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)'; d.style.borderColor = catCfg.color; }}
                      onMouseLeave={(e) => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'none'; d.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; d.style.borderColor = 'transparent'; }}
                    >
                      <div style={{ fontSize: 38, marginBottom: 10 }}>{seq.emoji}</div>
                      <h3 style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>{seq.title}</h3>
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{seq.description}</p>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, background: '#f1f5f9', borderRadius: 20, padding: '2px 8px', color: '#64748b', fontWeight: 600 }}>⏱ {seq.duration_minutes} min</span>
                        <span style={{ fontSize: 10, background: `${diffColor}18`, borderRadius: 20, padding: '2px 8px', color: diffColor, fontWeight: 700 }}>{seq.difficulty}</span>
                      </div>
                      <button onClick={() => openSequence(seq)} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${catCfg.color},${catCfg.color}cc)`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Commencer →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ MODULE C — AAC ════════════════════════════════════════════════ */}
        {activeTab === 'aac' && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>💬 Communication alternative</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748b' }}>Clique sur les pictogrammes pour t'exprimer</p>

            {/* Phrase builder */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', marginBottom: 14, minHeight: 62, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '2px dashed #e2e8f0' }}>
              {aacPhrase.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>👆 Clique sur un pictogramme pour construire ta phrase…</p>
              ) : (
                aacPhrase.map((s, i) => (
                  <span key={i} onClick={() => setAACPhrase((p) => p.filter((_, idx) => idx !== i))} style={{ background: `${s.color}18`, border: `2px solid ${s.color}44`, borderRadius: 10, padding: '5px 10px', fontSize: 14, fontWeight: 700, color: '#1e3a5f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }} title="Cliquer pour retirer">
                    {s.emoji} {s.label}
                  </span>
                ))
              )}
            </div>

            {aacPhrase.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <button onClick={() => speak(aacPhrase.map((s) => s.label).join('. '))} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🔊 Parler</button>
                <button onClick={() => setAACPhrase([])} style={{ padding: '10px 18px', borderRadius: 10, border: '2px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🗑 Effacer</button>
              </div>
            )}

            {loadingAAC ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>⏳ Chargement…</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {aacCategories.map((cat) => (
                    <button key={cat} onClick={() => setActiveAACCat(cat)} style={{ padding: '7px 16px', borderRadius: 18, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: activeAACCat === cat ? '#1e3a5f' : '#f1f5f9', color: activeAACCat === cat ? '#fff' : '#64748b', transition: 'all .2s' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 10 }}>
                  {aacSymbols.filter((s) => s.category === activeAACCat).map((sym) => (
                    <button key={sym.id} onClick={() => { setAACPhrase((p) => [...p, sym]); speak(sym.label); }} style={{ background: '#fff', border: `2px solid ${sym.color}44`, borderRadius: 14, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', transition: 'transform .15s,border-color .15s,box-shadow .15s' }}
                      onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'scale(1.06)'; b.style.borderColor = sym.color; b.style.boxShadow = `0 6px 18px ${sym.color}33`; }}
                      onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'scale(1)'; b.style.borderColor = `${sym.color}44`; b.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)'; }}
                    >
                      <span style={{ fontSize: 30 }}>{sym.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', textAlign: 'center', lineHeight: 1.3 }}>{sym.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ MODULE D — JEUX ══════════════════════════════════════════════ */}
        {activeTab === 'games' && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>🎮 Mini-jeux</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Joue et gagne des points !</p>

            {/* Stats banner */}
            <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2d5a8e)', borderRadius: 18, padding: '18px 24px', marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, marginBottom: 3 }}>POINTS TOTAUX</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>⭐ {stats.total_points}</div>
              </div>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, marginBottom: 3 }}>ACTIVITÉS</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>🎯 {stats.total_activities}</div>
              </div>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, marginBottom: 3 }}>BADGES</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>🏅 {badges.length}</div>
              </div>
            </div>

            {/* Game cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 18, marginBottom: 28 }}>
              {[
                { key: 'memory' as const, emoji: '🧠', title: 'Jeu de mémoire', desc: 'Retourne les cartes et trouve les paires. Entraîne ta mémoire !', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', btnBg: 'linear-gradient(135deg,#10b981,#34d399)', borderHover: '#10b981', tags: ['🃏 16 cartes', '⭐ Jusqu\'à 100 pts'] },
                { key: 'color'  as const, emoji: '🎨', title: 'Jeu des couleurs', desc: 'Lis le mot et clique sur la bonne couleur. Réfléchis vite !', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', btnBg: 'linear-gradient(135deg,#f59e0b,#fcd34d)', borderHover: '#f59e0b', tags: ['🎯 10 tours', '⭐ Jusqu\'à 100 pts'] },
              ].map(({ key, emoji, title, desc, bg, btnBg, borderHover, tags }) => (
                <div key={key} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', border: '2px solid transparent', transition: 'all .25s' }}
                  onMouseEnter={(e) => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'translateY(-4px)'; d.style.borderColor = borderHover; d.style.boxShadow = `0 10px 28px ${borderHover}33`; }}
                  onMouseLeave={(e) => { const d = e.currentTarget as HTMLDivElement; d.style.transform = 'none'; d.style.borderColor = 'transparent'; d.style.boxShadow = '0 2px 14px rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ height: 110, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 }}>{emoji}</div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>{title}</h3>
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{desc}</p>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                      {tags.map((t) => <span key={t} style={{ fontSize: 10, background: '#f1f5f9', borderRadius: 20, padding: '2px 8px', color: '#64748b', fontWeight: 700 }}>{t}</span>)}
                    </div>
                    <button onClick={() => setActiveGame(key)} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: btnBg, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 14px ${borderHover}44` }}>
                      🎮 Jouer !
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>🏅 Mes badges</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {badges.map((b) => (
                    <div key={b.id} style={{ background: `${b.color}18`, border: `2px solid ${b.color}44`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{b.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── GAME MODALS ──────────────────────────────────────────────────────── */}
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

      {/* ── SEQUENCE MODAL ───────────────────────────────────────────────────── */}
      {activeSequence && (
        <SequenceViewer
          sequence={activeSequence}
          onClose={() => setActiveSequence(null)}
          onComplete={(score, dur) => { logGameScore(`seq_${activeSequence.id}`, score, dur); setTimeout(() => setActiveSequence(null), 1800); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

