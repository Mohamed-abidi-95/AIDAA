// ============================================================================
// PARENT DASHBOARD PAGE
// ============================================================================
// Dashboard for parent users to manage their children and content

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/DashboardEnhanced.css';

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

export const ParentDashboard = (): JSX.Element => {
  const { logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState('summary'); // 'summary', 'activities', 'notes', 'messages'

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
