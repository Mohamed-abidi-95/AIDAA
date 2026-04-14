// ============================================================================
// PROGRESS & ACTIVITY ANALYSIS DASHBOARD
// ============================================================================
// Modern child progress dashboard — real API data from analytics endpoints
// Theme: Green (parent view) — Tailwind CSS, FontAwesome icons

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useToast, ToastStack } from '../components';
import api from '../lib/api';

declare global { interface Window { Chart: any; } }

// ── Types ──────────────────────────────────────────────────────────────────
interface Child { id: number; name: string; age: number; participant_category?: string; }
interface AnalyticsOverview { totalSessions: number; totalMinutes: number; avgScore: number; streakDays: number; }
interface TimelinePoint    { date: string; minutes: number; }
interface BreakdownItem    { category: string; count: number; pct: number; }
interface ScoreByCategory  { category: string; avgScore: number; }
interface ActivityLog {
  id: number; child_id: number; content_title?: string; action?: string;
  score: number; duration_seconds: number; date: string; status?: string;
}
interface ApiResult<T> { success: boolean; data: T; message?: string; }

type TabKey = 'overview' | 'activities' | 'progress';

const CATEGORY_COLORS: Record<string, string> = {
  Emotions:   '#6366f1',
  Language:   '#0d9488',
  Social:     '#d97706',
  Motor:      '#2563eb',
  Sensory:    '#16a34a',
  Cognition:  '#ea580c',
  Creativity: '#e11d48',
  video:      '#8b5cf6',
  activity:   '#14b8a6',
  game:       '#f59e0b',
};

const getCatColor = (cat: string) => CATEGORY_COLORS[cat] || '#64748b';

// ============================================================================
export const ProgressDashboard = (): JSX.Element => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [activeTab, setActiveTab]   = useState<TabKey>('overview');
  const [children, setChildren]     = useState<Child[]>([]);
  const [child, setChild]           = useState<Child | null>(null);
  const [loading, setLoading]       = useState(true);

  // Analytics data
  const [overview, setOverview]     = useState<AnalyticsOverview | null>(null);
  const [timeline, setTimeline]     = useState<TimelinePoint[]>([]);
  const [breakdown, setBreakdown]   = useState<BreakdownItem[]>([]);
  const [scores, setScores]         = useState<ScoreByCategory[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Chart refs
  const lineChartRef  = useRef<any>(null);
  const donutChartRef = useRef<any>(null);
  const barChartRef   = useRef<any>(null);

  // ── Fetch children ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data } = await api.get<ApiResult<Child[]>>('/api/child/mychildren');
        if (data.success && data.data.length > 0) {
          setChildren(data.data);
          setChild(data.data[0]);
        }
      } catch {
        toast('Erreur lors du chargement des enfants', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  // ── Fetch analytics when child changes ────────────────────────────────────
  useEffect(() => {
    if (!child) return;
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const [ovRes, tlRes, bdRes, scRes, actRes] = await Promise.all([
          api.get(`/api/analytics/child/${child.id}/overview`),
          api.get(`/api/analytics/child/${child.id}/sessions-timeline`),
          api.get(`/api/analytics/child/${child.id}/activity-breakdown`),
          api.get(`/api/analytics/child/${child.id}/scores-by-category`),
          api.get(`/api/activity-log/child/${child.id}`),
        ]);
        if (ovRes.data.success) setOverview(ovRes.data.data);
        if (tlRes.data.success) setTimeline(tlRes.data.data);
        if (bdRes.data.success) setBreakdown(bdRes.data.data);
        if (scRes.data.success) setScores(scRes.data.data);
        if (actRes.data.success) setActivities(actRes.data.data);
      } catch (err: any) {
        toast(err?.response?.data?.message || 'Erreur analytics', 'error');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [child]);

  // ── Charts (re-runs when analytics data changes) ──────────────────────────
  useEffect(() => {
    if (analyticsLoading || !window.Chart) return;
    const timer = setTimeout(() => {
      const gridOpts = { color: 'rgba(100,116,139,.08)', borderColor: 'rgba(100,116,139,.12)' };
      const fontOpts = { family: 'Inter,sans-serif', size: 11, color: '#64748b' };

      // Line chart: session timeline
      const lineCtx = document.getElementById('pd-lineChart') as HTMLCanvasElement | null;
      if (lineCtx) {
        if (lineChartRef.current) lineChartRef.current.destroy();
        const labels = timeline.map(p => new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
        const minutes = timeline.map(p => p.minutes);
        lineChartRef.current = new window.Chart(lineCtx, {
          type: 'line',
          data: {
            labels: labels.length ? labels : ['Aucune donnée'],
            datasets: [{
              label: 'Minutes',
              data: minutes.length ? minutes : [0],
              borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)',
              fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#10b981', borderWidth: 2,
            }, {
              label: 'Objectif',
              data: Array(labels.length || 1).fill(20),
              borderColor: '#94a3b8', borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, fill: false,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: gridOpts, ticks: { ...fontOpts, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
              y: { grid: gridOpts, ticks: fontOpts, min: 0 },
            },
          },
        });
      }

      // Donut chart: activity breakdown
      const donutCtx = document.getElementById('pd-donutChart') as HTMLCanvasElement | null;
      if (donutCtx) {
        if (donutChartRef.current) donutChartRef.current.destroy();
        donutChartRef.current = new window.Chart(donutCtx, {
          type: 'doughnut',
          data: {
            labels: breakdown.length ? breakdown.map(b => b.category) : ['Aucune donnée'],
            datasets: [{
              data: breakdown.length ? breakdown.map(b => b.pct) : [100],
              backgroundColor: breakdown.length ? breakdown.map(b => getCatColor(b.category)) : ['#e2e8f0'],
              borderWidth: 2, borderColor: '#fff', hoverOffset: 4,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '64%',
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.raw}%` } } },
          },
        });
      }

      // Bar chart: scores by category
      const barCtx = document.getElementById('pd-barChart') as HTMLCanvasElement | null;
      if (barCtx) {
        if (barChartRef.current) barChartRef.current.destroy();
        barChartRef.current = new window.Chart(barCtx, {
          type: 'bar',
          data: {
            labels: scores.length ? scores.map(s => s.category) : ['Aucune donnée'],
            datasets: [{
              data: scores.length ? scores.map(s => s.avgScore) : [0],
              backgroundColor: scores.length ? scores.map(s => getCatColor(s.category) + '20') : ['#e2e8f0'],
              borderColor: scores.length ? scores.map(s => getCatColor(s.category)) : ['#cbd5e1'],
              borderWidth: 1.5, borderRadius: 5,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` Score: ${c.raw}/100` } } },
            scales: {
              x: { grid: gridOpts, ticks: fontOpts, min: 0, max: 100 },
              y: { grid: { display: false }, ticks: { ...fontOpts, font: { size: 10 } } },
            },
          },
        });
      }
      }, 100);
    return () => clearTimeout(timer);
  }, [analyticsLoading, timeline, breakdown, scores, activeTab]);

  // Cleanup on unmount
  useEffect(() => () => {
    lineChartRef.current?.destroy();
    donutChartRef.current?.destroy();
    barChartRef.current?.destroy();
  }, []);

  const getScoreCls = (score: number) =>
    score >= 70 ? 'bg-emerald-100 text-emerald-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = [
    { icon: 'fa-solid fa-gamepad',       label: 'Sessions jouées',   value: overview?.totalSessions ?? '—', color: 'bg-emerald-50 text-emerald-600' },
    { icon: 'fa-solid fa-clock',          label: 'Temps total',       value: overview ? `${(overview.totalMinutes / 60).toFixed(1)} h` : '—', color: 'bg-teal-50 text-teal-600' },
    { icon: 'fa-solid fa-star',           label: 'Score moyen / 100', value: overview?.avgScore ?? '—', color: 'bg-amber-50 text-amber-600' },
    { icon: 'fa-solid fa-fire',           label: 'Jours consécutifs', value: overview?.streakDays ?? '—', color: 'bg-rose-50 text-rose-600' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-emerald-500" /> Progression & Activités
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Tableau de bord d'analyse thérapeutique</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Child selector */}
          {children.length > 1 && (
            <select
              value={child?.id ?? ''}
              onChange={e => setChild(children.find(c => c.id === Number(e.target.value)) || null)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:border-emerald-400 outline-none"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name} · {c.age} ans</option>
              ))}
            </select>
          )}
          {child && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              {child.name} · {child.age} ans
            </span>
          )}
          <button onClick={() => navigate('/parent/dashboard')}
            className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors">
            Retour
          </button>
          <button onClick={logout}
            className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">
            <i className="fa-solid fa-right-from-bracket mr-1" /> Déconnexion
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 px-6 py-3 bg-slate-100 border-b border-slate-200">
        {([
          { key: 'overview',   label: 'Vue d\'ensemble', fa: 'fa-solid fa-chart-pie' },
          { key: 'activities', label: 'Activités',       fa: 'fa-solid fa-list-check' },
          { key: 'progress',   label: 'Progression',     fa: 'fa-solid fa-chart-bar' },
        ] as { key: TabKey; label: string; fa: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activeTab === t.key
                ? 'bg-white text-emerald-700 border-emerald-200 shadow-sm'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-white/60'
            }`}
          >
            <i className={t.fa} /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">

        {/* Loading / empty state */}
        {loading || analyticsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Chargement des données…</p>
          </div>
        ) : !child ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <i className="fa-solid fa-child text-4xl" />
            <p className="font-semibold text-slate-600">Aucun enfant trouvé</p>
            <p className="text-sm">Ajoutez un enfant depuis votre tableau de bord parent.</p>
          </div>
        ) : (
          <>
            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => (
                <div key={k.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${k.color}`}>
                    <i className={k.icon} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none text-slate-900 mb-1">{k.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{k.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Overview tab ── */}
            {activeTab === 'overview' && (
              <>
                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                  {/* Line chart */}
                  <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      <i className="fa-solid fa-chart-area text-emerald-500 mr-1.5" /> Temps par session (minutes)
                    </h3>
                    <div style={{ height: 200 }}><canvas id="pd-lineChart" /></div>
                    <div className="flex gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Temps joué</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-0.5 bg-slate-400 rounded inline-block border-dashed" /> Objectif (20 min)</span>
                    </div>
                  </div>

                  {/* Donut chart */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      <i className="fa-solid fa-chart-pie text-emerald-500 mr-1.5" /> Répartition des activités
                    </h3>
                    <div style={{ height: 200 }}><canvas id="pd-donutChart" /></div>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                      {breakdown.map(b => (
                        <span key={b.category} className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: getCatColor(b.category) }} />
                          {b.category} ({b.pct}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar + Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Bar chart */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      <i className="fa-solid fa-ranking-star text-emerald-500 mr-1.5" /> Score par catégorie
                    </h3>
                    <div style={{ height: 200 }}><canvas id="pd-barChart" /></div>
                  </div>

                  {/* Skill progress bars */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                      <i className="fa-solid fa-list-check text-emerald-500 mr-1.5" /> Compétences
                    </h3>
                    {scores.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Aucune donnée disponible</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {scores.map(s => (
                          <div key={s.category} className="flex items-center gap-3">
                            <span className="text-xs text-slate-600 w-28 truncate shrink-0 font-medium">{s.category}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(s.avgScore, 100)}%`, background: getCatColor(s.category) }} />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right font-semibold">{Math.round(s.avgScore)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Activities tab ── */}
            {activeTab === 'activities' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">
                    <i className="fa-solid fa-list text-emerald-500 mr-1.5" /> Sessions récentes
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {activities.length} session(s)
                  </span>
                </div>
                {activities.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <i className="fa-solid fa-inbox text-3xl mb-2 block" />
                    <p className="text-sm">Aucune activité enregistrée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Activité', 'Date', 'Durée', 'Score', 'Statut'].map(h => (
                            <th key={h} className="text-left px-6 py-3 text-xs uppercase tracking-wider text-slate-500 font-bold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activities.slice(0, 20).map(a => (
                          <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-700">
                              {a.content_title || a.action || 'Session'}
                            </td>
                            <td className="px-6 py-3 text-slate-500">{fmtDate(a.date)}</td>
                            <td className="px-6 py-3 text-slate-500">{Math.round(a.duration_seconds / 60)} min</td>
                            <td className="px-6 py-3">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreCls(a.score)}`}>
                                {a.score} / 100
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                a.score >= 70 ? 'bg-emerald-50 text-emerald-700' : a.score >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {a.score >= 70 ? 'Excellent' : a.score >= 40 ? 'Bien' : 'À améliorer'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Progress tab ── */}
            {activeTab === 'progress' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-5">
                  <i className="fa-solid fa-chart-bar text-emerald-500 mr-1.5" /> Progression détaillée par compétence
                </h3>
                {scores.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <i className="fa-solid fa-chart-simple text-3xl mb-2 block" />
                    <p className="text-sm">Aucune donnée de progression disponible</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {scores.map(s => {
                      const pct = Math.min(Math.round(s.avgScore), 100);
                      return (
                        <div key={s.category} className="flex items-center gap-4">
                          <span className="text-sm text-slate-700 w-32 truncate shrink-0 font-semibold">{s.category}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: getCatColor(s.category) }} />
                          </div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold min-w-[56px] text-center ${getScoreCls(pct)}`}>
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

