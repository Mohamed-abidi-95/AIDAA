// ============================================================================
// ANALYTIQUES PROFESSIONNEL — Doctor-level analytics dashboard
// ============================================================================
// Green palette (#22C55E primary, #15803D dark, #EAF7EE backgrounds)
// Charts via window.Chart (Chart.js CDN — no extra install)

import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';

declare global { interface Window { Chart: any; } }

// ── Types ─────────────────────────────────────────────────────────────────────
interface Child {
  id: number;
  name: string;
  age: number;
  parent_id: number;
  parent_name?: string;
  participant_category?: string;
}

interface OverviewData {
  totalPatients: number;
  totalSessions: number;
  avgScore:      number;
  totalHours:    number;
}

interface PatientScore  { name: string; avgScore: number; }
interface ProgPoint     { date: string; score: number; }
interface FreqPoint     { week: string | number; sessions: number; }
interface PatientRow    { name: string; totalSessions: number; avgScore: number; lastSession: string | null; trend: 'up' | 'down' | 'flat'; }

interface Props {
  doctorId: number;
  patients: Child[];
}

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  primary:  '#22C55E',
  dark:     '#15803D',
  mid:      '#4ADE80',
  dim:      '#86EFAC',
  bg:       '#EAF7EE',
  bgDark:   '#dcfce7',
  text:     '#14532d',
  textMid:  '#166534',
  red:      '#ef4444',
  gray:     '#94a3b8',
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = ({ h = 80, r = 10 }: { h?: number; r?: number }) => (
  <div style={{
    height: h, borderRadius: r, background: 'linear-gradient(90deg,#d1fae5 25%,#a7f3d0 50%,#d1fae5 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

// ── Component ─────────────────────────────────────────────────────────────────
const AnalytiquesProfessionnel = ({ doctorId, patients }: Props): JSX.Element => {

  const [overview,       setOverview]       = useState<OverviewData | null>(null);
  const [patientsScores, setPatientsScores] = useState<PatientScore[]>([]);
  const [progression,    setProgression]    = useState<ProgPoint[]>([]);
  const [frequency,      setFrequency]      = useState<FreqPoint[]>([]);
  const [patientsTable,  setPatientsTable]  = useState<PatientRow[]>([]);

  const [mainLoading,  setMainLoading]  = useState(true);
  const [progLoading,  setProgLoading]  = useState(false);
  const [mainError,    setMainError]    = useState('');

  const [selectedPid, setSelectedPid] = useState<number>(patients[0]?.id ?? 0);

  const patScoresRef = useRef<any>(null);
  const progRef      = useRef<any>(null);
  const freqRef      = useRef<any>(null);

  // ── Load overview + patients-scores + session-frequency + patients-table ───
  useEffect(() => {
    if (!doctorId) return;
    const load = async () => {
      try {
        setMainLoading(true);
        setMainError('');
        const [ovR, psR, sfR, ptR] = await Promise.all([
          api.get(`/api/analytics/doctor/${doctorId}/overview`),
          api.get(`/api/analytics/doctor/${doctorId}/patients-scores`),
          api.get(`/api/analytics/doctor/${doctorId}/session-frequency`),
          api.get(`/api/analytics/doctor/${doctorId}/patients-table`),
        ]);
        if (ovR.data.success) setOverview(ovR.data.data);
        if (psR.data.success) setPatientsScores(psR.data.data);
        if (sfR.data.success) setFrequency(sfR.data.data);
        if (ptR.data.success) setPatientsTable(ptR.data.data);
      } catch (err: any) {
        setMainError(err?.response?.data?.message || 'Erreur de chargement des analytiques.');
      } finally {
        setMainLoading(false);
      }
    };
    load();
  }, [doctorId]);

  // ── Load progression when patient dropdown changes ─────────────────────────
  useEffect(() => {
    if (!doctorId || !selectedPid) return;
    const loadProg = async () => {
      try {
        setProgLoading(true);
        const r = await api.get(`/api/analytics/doctor/${doctorId}/patient/${selectedPid}/progression`);
        if (r.data.success) setProgression(r.data.data);
      } catch { /* silent */ }
      finally { setProgLoading(false); }
    };
    loadProg();
  }, [doctorId, selectedPid]);

  // ── Chart: patients scores bar ─────────────────────────────────────────────
  useEffect(() => {
    if (mainLoading || patientsScores.length === 0 || !window.Chart) return;
    const t = setTimeout(() => {
      const ctx = document.getElementById('analPatientsScores') as HTMLCanvasElement | null;
      if (!ctx) return;
      if (patScoresRef.current) { patScoresRef.current.destroy(); }
      patScoresRef.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: patientsScores.map(p => p.name),
          datasets: [{
            label: 'Score moyen',
            data:  patientsScores.map(p => p.avgScore ?? 0),
            backgroundColor: C.primary,
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,.06)' }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        },
      });
    }, 60);
    return () => clearTimeout(t);
  }, [patientsScores, mainLoading]);

  // ── Chart: session-frequency bar ─────────────────────────────────────────
  useEffect(() => {
    if (mainLoading || frequency.length === 0 || !window.Chart) return;
    const t = setTimeout(() => {
      const ctx = document.getElementById('analFrequency') as HTMLCanvasElement | null;
      if (!ctx) return;
      if (freqRef.current) { freqRef.current.destroy(); }
      freqRef.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: frequency.map((_, i) => `S${i + 1}`),
          datasets: [{
            label: 'Sessions',
            data: frequency.map(f => Number(f.sessions)),
            backgroundColor: C.dark,
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, grid: { color: 'rgba(0,0,0,.06)' }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          },
        },
      });
    }, 60);
    return () => clearTimeout(t);
  }, [frequency, mainLoading]);

  // ── Chart: patient progression line ───────────────────────────────────────
  useEffect(() => {
    if (progLoading || progression.length === 0 || !window.Chart) return;
    const t = setTimeout(() => {
      const ctx = document.getElementById('analProgression') as HTMLCanvasElement | null;
      if (!ctx) return;
      if (progRef.current) { progRef.current.destroy(); }
      progRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: progression.map(p =>
            new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
          ),
          datasets: [{
            label: 'Score moyen',
            data: progression.map(p => p.score),
            borderColor: C.primary,
            backgroundColor: 'rgba(34,197,94,.1)',
            fill: true, tension: 0.4,
            pointRadius: 4, pointBackgroundColor: C.primary, borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,.06)' }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0 } },
          },
        },
      });
    }, 60);
    return () => clearTimeout(t);
  }, [progression, progLoading]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const trendIcon  = (t: string) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
  const trendColor = (t: string) => t === 'up' ? C.primary : t === 'down' ? C.red : C.gray;

  // ── Styles helpers ─────────────────────────────────────────────────────────
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: C.bg, borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)', ...extra,
  });

  const kpiCard = (extra?: React.CSSProperties): React.CSSProperties => ({
    ...card(), display: 'flex', flexDirection: 'column', gap: 6, ...extra,
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Shimmer keyframe (injected once) */}
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      {/* Error banner */}
      {mainError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
          ❌ {mainError}
        </div>
      )}

      {/* ── Section 1: KPI cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {mainLoading ? (
          [0,1,2,3].map(i => <Skeleton key={i} h={96} />)
        ) : (
          <>
            <div style={kpiCard()}>
              <span style={{ fontSize: 24 }}>👥</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.textMid }}>{overview?.totalPatients ?? 0}</span>
              <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Patients suivis</span>
            </div>
            <div style={kpiCard()}>
              <span style={{ fontSize: 24 }}>🎮</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.textMid }}>{overview?.totalSessions ?? 0}</span>
              <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Sessions totales</span>
            </div>
            <div style={kpiCard()}>
              <span style={{ fontSize: 24 }}>⭐</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.textMid }}>{overview?.avgScore ?? 0}</span>
              <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Score moyen / 100</span>
            </div>
            <div style={kpiCard()}>
              <span style={{ fontSize: 24 }}>⏱️</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.textMid }}>{overview?.totalHours ?? 0} h</span>
              <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Heures d'activité</span>
            </div>
          </>
        )}
      </div>

      {/* ── Section 2: Scores moyens par patient ──────────────────────────── */}
      <div style={card()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: C.text }}>
          📊 Scores moyens par patient
        </h3>
        {mainLoading ? (
          <Skeleton h={200} r={8} />
        ) : patientsScores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.gray, fontSize: 13 }}>
            📭 Aucune donnée de score disponible pour vos patients.
          </div>
        ) : (
          <div style={{ height: 220 }}>
            <canvas id="analPatientsScores" />
          </div>
        )}
      </div>

      {/* ── Section 3: Progression d'un patient ──────────────────────────── */}
      <div style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>
            📈 Progression d'un patient
          </h3>
          {patients.length > 0 && (
            <select
              value={selectedPid}
              onChange={e => setSelectedPid(Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.dim}`, background: C.bgDark, color: C.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.age} ans)</option>
              ))}
            </select>
          )}
        </div>
        {progLoading ? (
          <Skeleton h={200} r={8} />
        ) : progression.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.gray, fontSize: 13 }}>
            📭 Aucune session enregistrée pour ce patient.
          </div>
        ) : (
          <div style={{ height: 220 }}>
            <canvas id="analProgression" />
          </div>
        )}
      </div>

      {/* ── Section 4: Fréquence des sessions ────────────────────────────── */}
      <div style={card()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: C.text }}>
          📅 Fréquence hebdomadaire des sessions (12 dernières semaines)
        </h3>
        {mainLoading ? (
          <Skeleton h={180} r={8} />
        ) : frequency.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.gray, fontSize: 13 }}>
            📭 Aucune activité enregistrée sur les 12 dernières semaines.
          </div>
        ) : (
          <div style={{ height: 200 }}>
            <canvas id="analFrequency" />
          </div>
        )}
      </div>

      {/* ── Section 5: Tableau récapitulatif patients ─────────────────────── */}
      <div style={card()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: C.text }}>
          👥 Tableau récapitulatif des patients
        </h3>
        {mainLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2].map(i => <Skeleton key={i} h={44} r={6} />)}
          </div>
        ) : patientsTable.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.gray, fontSize: 13 }}>
            📭 Aucun patient actif pour le moment.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bgDark }}>
                  {['Nom', 'Sessions', 'Score moy.', 'Dernière session', 'Tendance'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientsTable.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.dim}`, background: i % 2 === 0 ? '#fff' : C.bg }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: C.textMid }}>{row.name}</td>
                    <td style={{ padding: '10px 14px', color: C.text }}>{row.totalSessions}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: row.avgScore >= 70 ? '#dcfce7' : row.avgScore >= 40 ? '#fef9c3' : '#fee2e2',
                        color:      row.avgScore >= 70 ? C.dark     : row.avgScore >= 40 ? '#854d0e'  : '#dc2626',
                      }}>
                        {row.avgScore} / 100
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: C.gray }}>{fmtDate(row.lastSession)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: trendColor(row.trend) }}>
                        {trendIcon(row.trend)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AnalytiquesProfessionnel;

