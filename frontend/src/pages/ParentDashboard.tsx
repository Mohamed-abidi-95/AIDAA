// ============================================================================
// PARENT DASHBOARD PAGE
// ============================================================================
// Dashboard for parent users to manage their children and content

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/DashboardEnhanced.css';
import '../styles/ProgressDashboard.css';

// Chart.js library (must be loaded in index.html)
declare global {
  interface Window {
    Chart: any;
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface Child {
  id: number;
  name: string;
  age: number;
}

interface Activity {
  id: number;
  child_id: number;
  content_title: string;
  score: number;
  duration_seconds: number;
  date: string;
}

interface Note {
  id: number;
  child_id: number;
  content: string;
  professional_name: string;
  date: string;
}

interface SkillProgress {
  label: string;
  value: number;
  color: string;
}

export const ParentDashboard = (): JSX.Element => {
  const { logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState('summary'); // 'summary', 'activities', 'notes', 'messages', 'analytics'
  const [chartsInitialized, setChartsInitialized] = useState(false);

  // Sample skills data
  const skills: SkillProgress[] = [
    { label: 'Emotion recognition', value: 82, color: '#6366f1' },
    { label: 'Language & vocab', value: 74, color: '#0d9488' },
    { label: 'Social interaction', value: 68, color: '#d97706' },
    { label: 'Fine motor skills', value: 71, color: '#2563eb' },
    { label: 'Sensory tolerance', value: 60, color: '#16a34a' },
    { label: 'Memory & focus', value: 78, color: '#ea580c' },
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

  // Initialize charts when analytics tab is selected
  useEffect(() => {
    if (view === 'analytics' && !chartsInitialized && window.Chart) {
      initializeCharts();
      setChartsInitialized(true);
    }
  }, [view, chartsInitialized]);

  const initializeCharts = () => {
    const gridOpts = { color: 'rgba(100,116,139,.08)', borderColor: 'rgba(100,116,139,.12)' };
    const fontOpts = { family: 'var(--font-sans,sans-serif)', size: 11, color: '#64748b' };

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
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: gridOpts, ticks: { ...fontOpts, maxRotation: 0 } },
            y: { grid: gridOpts, ticks: { ...fontOpts }, min: 0, max: 40 },
          },
        },
      });
    }

    const donutCtx = document.getElementById('donutChart') as HTMLCanvasElement;
    if (donutCtx) {
      new window.Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Emotions', 'Language', 'Social', 'Motor', 'Sensory', 'Cognition', 'Creativity'],
          datasets: [{
            data: [26, 21, 18, 14, 10, 7, 4],
            backgroundColor: ['#6366f1', '#0d9488', '#d97706', '#2563eb', '#16a34a', '#ea580c', '#e11d48'],
            borderWidth: 2,
            borderColor: '#ffffff',
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '64%', plugins: { legend: { display: false } } },
      });
    }
  };

  // Fetch children on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('aidaa_token');
        const res = await fetch('http://localhost:5000/api/child/mychildren', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setChildren(data.data);
          setSelectedChild(data.data[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
      }
    };
    fetchChildren();
  }, []);

  // Fetch activities and notes when child changes
  useEffect(() => {
    if (!selectedChild) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('aidaa_token');

        // Fetch activities
        const activitiesRes = await fetch(
          `http://localhost:5000/api/activity-log/child/${selectedChild.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const activitiesData = await activitiesRes.json();
        if (activitiesData.success) setActivities(activitiesData.data);

        // Fetch notes
        const notesRes = await fetch(
          `http://localhost:5000/api/note/child/${selectedChild.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const notesData = await notesRes.json();
        if (notesData.success) setNotes(notesData.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [selectedChild]);

  const getActivityStats = () => {
    if (activities.length === 0) return { games: 0, time: 0, avgScore: 0 };
    const totalTime = activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    const avgScore = activities.reduce((sum, a) => sum + (a.score || 0), 0) / activities.length;
    return {
      games: activities.length,
      time: Math.round(totalTime / 60), // Convert to minutes
      avgScore: Math.round(avgScore)
    };
  };

  const stats = getActivityStats();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👨‍👩‍👧‍👦 Parent Dashboard</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Child Selector */}
        <div className="child-selector">
          <label>Select Child:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find(c => c.id === parseInt(e.target.value));
              setSelectedChild(child || null);
            }}
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} (Age {child.age})
              </option>
            ))}
          </select>
        </div>

        {selectedChild && (
          <>
            {/* Navigation Tabs */}
            <div className="tabs">
              <button
                className={view === 'summary' ? 'tab active' : 'tab'}
                onClick={() => setView('summary')}
              >
                📊 Summary
              </button>
              <button
                className={view === 'activities' ? 'tab active' : 'tab'}
                onClick={() => setView('activities')}
              >
                🎮 Activities
              </button>
              <button
                className={view === 'analytics' ? 'tab active' : 'tab'}
                onClick={() => setView('analytics')}
              >
                📈 Analytics
              </button>
              <button
                className={view === 'notes' ? 'tab active' : 'tab'}
                onClick={() => setView('notes')}
              >
                📝 Medical Notes
              </button>
              <button
                className={view === 'messages' ? 'tab active' : 'tab'}
                onClick={() => setView('messages')}
              >
                💬 Messages
              </button>
            </div>

            {/* Summary View */}
            {view === 'summary' && (
              <div className="summary-view">
                <h2>Progress Summary - {selectedChild.name}</h2>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🎮</div>
                    <div className="stat-label">Activities</div>
                    <div className="stat-value">{stats.games}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-label">Time (minutes)</div>
                    <div className="stat-value">{stats.time}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-label">Avg Score</div>
                    <div className="stat-value">{stats.avgScore}</div>
                  </div>
                </div>

                <div className="recent-activities">
                  <h3>Recent Activities</h3>
                  {activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-content">
                        <div className="activity-title">{activity.content_title}</div>
                        <div className="activity-time">
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="activity-stats">
                        <span className="badge">Score: {activity.score}</span>
                        <span className="badge">Time: {Math.round(activity.duration_seconds / 60)}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities View */}
            {view === 'activities' && (
              <div className="activities-view">
                <h2>All Activities - {selectedChild.name}</h2>
                <div className="activities-list">
                  {activities.map(activity => (
                    <div key={activity.id} className="activity-card">
                      <h3>{activity.content_title}</h3>
                      <p>Date: {new Date(activity.date).toLocaleDateString()}</p>
                      <p>Score: {activity.score} | Duration: {Math.round(activity.duration_seconds / 60)} minutes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics View */}
            {view === 'analytics' && (
              <div className="section">
                {/* KPI Grid */}
                <div className="kpi-grid">
                  <div className="kpi">
                    <div className="kpi-icon" style={{ background: 'var(--purple-light)' }}>🎮</div>
                    <div className="kpi-val">47</div>
                    <div className="kpi-label">Sessions played</div>
                    <div className="kpi-change up">↑ 12% vs last month</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-icon" style={{ background: 'var(--teal-light)' }}>⏱</div>
                    <div className="kpi-val">8.4 h</div>
                    <div className="kpi-label">Total time</div>
                    <div className="kpi-change up">↑ 6% vs last month</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-icon" style={{ background: 'var(--amber-light)' }}>⭐</div>
                    <div className="kpi-val">78</div>
                    <div className="kpi-label">Avg score / 100</div>
                    <div className="kpi-change up">↑ 5 pts vs last month</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-icon" style={{ background: 'var(--rose-light)' }}>🔥</div>
                    <div className="kpi-val">14</div>
                    <div className="kpi-label">Day streak</div>
                    <div className="kpi-change up">Personal best!</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="charts-row" style={{ marginTop: '20px' }}>
                  <div className="chart-card">
                    <h3>Daily session time (minutes)</h3>
                    <div className="chart-wrap" style={{ height: '180px' }}>
                      <canvas id="lineChart"></canvas>
                    </div>
                  </div>
                  <div className="chart-card">
                    <h3>Activity type breakdown</h3>
                    <div className="chart-wrap" style={{ height: '180px' }}>
                      <canvas id="donutChart"></canvas>
                    </div>
                  </div>
                </div>

                {/* Skills Progress */}
                <div className="chart-card" style={{ marginTop: '20px' }}>
                  <h3>Skill progress</h3>
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

            {/* Medical Notes View */}
            {view === 'notes' && (
              <div className="notes-view">
                <h2>Medical Notes - {selectedChild.name}</h2>
                <div className="notes-list">
                  {notes.map(note => (
                    <div key={note.id} className="note-card">
                      <div className="note-header">
                        <h3>Dr. {note.professional_name}</h3>
                        <small>{new Date(note.date).toLocaleDateString()}</small>
                      </div>
                      <p className="note-content">{note.content}</p>
                    </div>
                  ))}
                  {notes.length === 0 && <p>No medical notes yet.</p>}
                </div>
              </div>
            )}

            {/* Messages View */}
            {view === 'messages' && (
              <div className="messages-view">
                <h2>Messages - {selectedChild.name}</h2>
                <p>💬 Messaging feature coming soon</p>
              </div>
            )}
          </>
        )}

        {children.length === 0 && (
          <div className="empty-state">
            <p>No children registered yet. Contact an administrator to add your child.</p>
          </div>
        )}
      </div>
    </div>
  );
};
