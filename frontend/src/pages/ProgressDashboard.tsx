// ============================================================================
// PROGRESS & ACTIVITY ANALYSIS DASHBOARD
// ============================================================================
// Modern child progress dashboard with KPIs, charts, and activity tracking

import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import '../styles/ProgressDashboard.css';

// Chart.js library (must be loaded in index.html)
declare global {
  interface Window {
    Chart: any;
  }
}

interface Activity {
  name: string;
  type: string;
  date: string;
  duration: string;
  score: number;
  status: 'Great' | 'Good' | 'OK';
}

interface SkillProgress {
  label: string;
  value: number;
  color: string;
}

export const ProgressDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [chartsInitialized, setChartsInitialized] = useState(false);

  // Sample data
  const childName = 'Adam';
  const childAge = 7;

  const skills: SkillProgress[] = [
    { label: 'Emotion recognition', value: 82, color: '#6366f1' },
    { label: 'Language & vocab', value: 74, color: '#0d9488' },
    { label: 'Social interaction', value: 68, color: '#d97706' },
    { label: 'Fine motor skills', value: 71, color: '#2563eb' },
    { label: 'Sensory tolerance', value: 60, color: '#16a34a' },
    { label: 'Memory & focus', value: 78, color: '#ea580c' },
  ];

  const activities: Activity[] = [
    { name: 'Emotion Faces', type: 'Emotions', date: 'Apr 05', duration: '18 min', score: 85, status: 'Great' },
    { name: 'Story Builder', type: 'Language', date: 'Apr 05', duration: '12 min', score: 72, status: 'Good' },
    { name: 'Turn Taking', type: 'Social', date: 'Apr 04', duration: '20 min', score: 90, status: 'Great' },
    { name: 'Puzzle Shapes', type: 'Motor', date: 'Apr 04', duration: '15 min', score: 65, status: 'OK' },
    { name: 'Calm Zone', type: 'Sensory', date: 'Apr 03', duration: '10 min', score: 78, status: 'Good' },
    { name: 'Memory Match', type: 'Cognition', date: 'Apr 03', duration: '14 min', score: 80, status: 'Good' },
    { name: 'Draw & Color', type: 'Creativity', date: 'Apr 02', duration: '22 min', score: 55, status: 'OK' },
  ];

  const typeColors: Record<string, string> = {
    Emotions: '#6366f1',
    Language: '#0d9488',
    Social: '#d97706',
    Motor: '#2563eb',
    Sensory: '#16a34a',
    Cognition: '#ea580c',
    Creativity: '#e11d48',
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Great':
        return 'badge-green';
      case 'Good':
        return 'badge-amber';
      default:
        return 'badge-rose';
    }
  };

  // Initialize charts
  useEffect(() => {
    if (!chartsInitialized && window.Chart) {
      initializeCharts();
      setChartsInitialized(true);
    }
  }, [chartsInitialized]);

  const initializeCharts = () => {
    const gridOpts = { color: 'rgba(100,116,139,.08)', borderColor: 'rgba(100,116,139,.12)' };
    const fontOpts = { family: 'var(--font-sans,sans-serif)', size: 11, color: '#64748b' };

    // Line Chart
    const lineCtx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (lineCtx) {
      new window.Chart(lineCtx, {
        type: 'line',
        data: {
          labels: ['Mar 8', 'Mar 11', 'Mar 14', 'Mar 17', 'Mar 20', 'Mar 23', 'Mar 26', 'Mar 29', 'Apr 1', 'Apr 3', 'Apr 5'],
          datasets: [
            {
              label: 'Time',
              data: [12, 18, 22, 15, 25, 28, 20, 30, 24, 18, 26],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99,102,241,.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: '#6366f1',
              borderWidth: 2,
            },
            {
              label: 'Goal',
              data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
              borderColor: '#0d9488',
              borderDash: [4, 4],
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
          scales: {
            x: { grid: gridOpts, ticks: { ...fontOpts, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 } },
            y: { grid: gridOpts, ticks: { ...fontOpts }, min: 0, max: 40 },
          },
        },
      });
    }

    // Donut Chart
    const donutCtx = document.getElementById('donutChart') as HTMLCanvasElement;
    if (donutCtx) {
      new window.Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Emotions', 'Language', 'Social', 'Motor', 'Sensory', 'Cognition', 'Creativity'],
          datasets: [
            {
              data: [26, 21, 18, 14, 10, 7, 4],
              backgroundColor: ['#6366f1', '#0d9488', '#d97706', '#2563eb', '#16a34a', '#ea580c', '#e11d48'],
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '64%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.raw}%` } },
          },
        },
      });
    }

    // Bar Chart
    const barCtx = document.getElementById('barChart') as HTMLCanvasElement;
    if (barCtx) {
      new window.Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Emotions', 'Language', 'Social', 'Motor', 'Sensory', 'Cognition', 'Creativity'],
          datasets: [
            {
              data: [82, 74, 90, 65, 78, 80, 55],
              backgroundColor: ['#6366f120', '#0d948020', '#d9770620', '#2563eb20', '#16a34a20', '#ea580c20', '#e11d4820'],
              borderColor: ['#6366f1', '#0d9488', '#d97706', '#2563eb', '#16a34a', '#ea580c', '#e11d48'],
              borderWidth: 1.5,
              borderRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y' as const,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: any) => ` Score: ${c.raw}/100` } },
          },
          scales: {
            x: { grid: gridOpts, ticks: { ...fontOpts }, min: 0, max: 100 },
            y: { grid: { display: false }, ticks: { ...fontOpts, font: { size: 10 } } },
          },
        },
      });
    }
  };

  return (
    <div className="dash">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>Progress &amp; Activity Analysis</h1>
          <p>Therapeutic learning dashboard — April 2026</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="child-pill">{childName} · Age {childAge}</span>
          <select style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)', color: 'var(--sub)', background: 'var(--white)' }}>
            <option>Last 30 days</option>
            <option>Last 14 days</option>
            <option>Last 7 days</option>
          </select>
          <button onClick={logout} style={{ padding: '4px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
          Activities
        </button>
        <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
          Progress
        </button>
        <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
          Notes
        </button>
      </div>

      {/* KPI Section */}
      <div className="section">
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-icon" style={{ background: 'var(--purple-light)' }}>
              🎮
            </div>
            <div className="kpi-val">47</div>
            <div className="kpi-label">Sessions played</div>
            <div className="kpi-change up">↑ 12% vs last month</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon" style={{ background: 'var(--teal-light)' }}>
              ⏱
            </div>
            <div className="kpi-val">8.4 h</div>
            <div className="kpi-label">Total time</div>
            <div className="kpi-change up">↑ 6% vs last month</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon" style={{ background: 'var(--amber-light)' }}>
              ⭐
            </div>
            <div className="kpi-val">78</div>
            <div className="kpi-label">Avg score / 100</div>
            <div className="kpi-change up">↑ 5 pts vs last month</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon" style={{ background: 'var(--rose-light)' }}>
              🔥
            </div>
            <div className="kpi-val">14</div>
            <div className="kpi-label">Day streak</div>
            <div className="kpi-change up">Personal best!</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {activeTab === 'overview' && (
        <>
          <div className="section" style={{ paddingTop: 0 }}>
            <div className="charts-row">
              <div className="chart-card">
                <h3>Daily session time (minutes)</h3>
                <div className="chart-wrap" style={{ height: '180px' }}>
                  <canvas id="lineChart"></canvas>
                </div>
                <div className="legend">
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#6366f1' }}></div>
                    Time played
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#0d9488' }}></div>
                    Recommended (20 min)
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <h3>Activity type breakdown</h3>
                <div className="chart-wrap" style={{ height: '180px' }}>
                  <canvas id="donutChart"></canvas>
                </div>
                <div className="legend" style={{ justifyContent: 'center' }}>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#6366f1' }}></div>
                    Emotions (26%)
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#0d9488' }}></div>
                    Language (21%)
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#d97706' }}></div>
                    Social (18%)
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#2563eb' }}></div>
                    Motor (14%)
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#16a34a' }}></div>
                    Sensory (10%)
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#ea580c' }}></div>
                    Cognition (7%)
                  </div>
                  <div className="leg-item">
                    <div className="leg-dot" style={{ background: '#e11d48' }}></div>
                    Creativity (4%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Column Section */}
          <div className="section" style={{ paddingTop: 0 }}>
            <div className="three-col">
              <div className="chart-card">
                <h3>Score per activity type</h3>
                <div className="chart-wrap" style={{ height: '170px' }}>
                  <canvas id="barChart"></canvas>
                </div>
              </div>
              <div className="chart-card">
                <h3>Skill progress</h3>
                <div className="progress-list">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="prog-row">
                      <div className="prog-label">{skill.label}</div>
                      <div className="prog-bar-bg">
                        <div className="prog-bar" style={{ width: `${skill.value}%`, background: skill.color }}></div>
                      </div>
                      <div className="prog-val">{skill.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Activities Section */}
      {activeTab === 'activities' && (
        <div className="section">
          <div className="chart-card">
            <h3>Recent sessions</h3>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500, color: 'var(--sub)' }}>{activity.name}</td>
                    <td>
                      <span className="badge" style={{ background: `${typeColors[activity.type]}18`, color: typeColors[activity.type] }}>
                        {activity.type}
                      </span>
                    </td>
                    <td>{activity.date}</td>
                    <td>{activity.duration}</td>
                    <td style={{ fontWeight: 500 }}>{activity.score}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(activity.status)}`}>{activity.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress Section */}
      {activeTab === 'progress' && (
        <div className="section">
          <div className="chart-card">
            <h3>Detailed skill progress</h3>
            <div className="progress-list">
              {skills.map((skill, idx) => (
                <div key={idx} className="prog-row">
                  <div className="prog-label">{skill.label}</div>
                  <div className="prog-bar-bg">
                    <div className="prog-bar" style={{ width: `${skill.value}%`, background: skill.color }}></div>
                  </div>
                  <div className="prog-val">{skill.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {activeTab === 'notes' && (
        <div className="section">
          <div className="chart-card">
            <h3>Professional notes & observations</h3>
            <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>No notes available at this time.</p>
          </div>
        </div>
      )}
    </div>
  );
};

